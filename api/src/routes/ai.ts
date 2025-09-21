import { AIGNEHubChatModel, AIGNEHubImageModel } from '@aigne/aigne-hub';
import { ImageModelOutputImageUrl } from '@aigne/core/agents/image-model';
import { LocalContent } from '@aigne/core/lib/cjs/agents/chat-model';
import payment from '@blocklet/payment-js';
import { auth, user } from '@blocklet/sdk/lib/middlewares';
import { uploadToMediaKit } from '@blocklet/uploader-server';
import axios from 'axios';
import { Router } from 'express';
import fs from 'fs';
import Joi from 'joi';
import path from 'path';
import { Op } from 'sequelize';
import { promisify } from 'util';

import { env } from '../libs/env';
import logger from '../libs/logger';
import { METER_NAME, ensureCustomer, getUserCreditBalance } from '../libs/payment';
import { getImageUrl } from '../libs/utils';
import AIProject from '../store/models/ai-project';
import ImageGeneration from '../store/models/image-generation';

const unlinkAsync = promisify(fs.unlink);

// Dynamic import for prompt utilities since they're TypeScript modules
const promptUtils = {
  replacePromptVariables: (template: string, variables: Record<string, any>) => {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    });
    return result;
  },
  buildPromptVariables: (controlValues: Record<string, any>, images: string[]) => {
    const variables = { ...controlValues };
    images.forEach((image, index) => {
      variables[`image${index + 1}`] = image;
    });
    return variables;
  },
};

const router = Router();

// Validation schemas
const generateImageSchema = Joi.object({
  // Support both old single prompt and new dynamic prompt building
  controlValues: Joi.object().optional(),

  // Support both single image (legacy) and multiple images (new)
  originalImg: Joi.string().optional(),
  originalImages: Joi.array().items(Joi.string()).max(10).optional(),

  // Support text input for text-based projects
  textInput: Joi.string().min(0).max(5000).allow('').optional(),

  clientId: Joi.string().required(),
  modelType: Joi.string().required(),
  metadata: Joi.object().optional(),
}); // At least one prompt method must be provided

const getHistorySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
  clientId: Joi.string().required(),
});

/**
 * Generate AI processed image using AIGNE Hub
 * POST /api/ai/generate
 */
router.post('/generate', auth(), user(), async (req, res): Promise<any> => {
  const startTime = Date.now();

  try {
    const userDid = req.user?.did!!;
    const { modelType } = req.body;
    // Validate request body
    const { error, value } = generateImageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.details,
      });
    }

    const { controlValues, originalImages, textInput, clientId, metadata } = value;

    const aiProject = await AIProject.findByPk(clientId);

    if (!aiProject) {
      return res.status(400).json({
        error: 'Invalid request data',
        message: 'Invalid request data',
      });
    }

    // Build final prompt - support both old and new systems
    let finalPrompt: string;
    const imageUrls = originalImages;

    try {
      const promptVariables = promptUtils.buildPromptVariables(controlValues || {}, imageUrls);
      finalPrompt = promptUtils.replacePromptVariables(aiProject.promptTemplate, promptVariables);
    } catch (promptError) {
      finalPrompt = aiProject.promptTemplate;
    }

    // Check credit balance first
    const balanceInfo = await getUserCreditBalance(userDid);
    const currentBalance = parseFloat(balanceInfo.balance);
    const requiredCredits = 1; // Each generation costs 1 credit

    if (currentBalance < requiredCredits) {
      return res.status(400).json({
        error: 'Insufficient credits',
        message: `Required: ${requiredCredits} credits, Available: ${currentBalance} credits`,
        currentBalance,
      });
    }

    // Create initial record in database
    const generation = await ImageGeneration.validateAndCreate({
      userDid,
      originalImg: imageUrls.length > 0 ? imageUrls[0] : '', // Store first image for backward compatibility
      generatedImg: '', // Will be updated when processing completes
      clientId,
      status: 'pending',
      creditsConsumed: requiredCredits,
      metadata: {
        requestIp: req.ip,
        startTime: new Date().toISOString(),
        prompt: finalPrompt,
        originalImages: imageUrls, // Store all original images
        textInput: textInput || undefined, // Store text input for text-based projects
        promptTemplate: aiProject.promptTemplate || undefined,
        controlValues: controlValues || undefined,
        ...metadata,
      },
    });

    // Update status to processing
    await generation.updateStatus('processing');

    // Consume credits during processing - directly integrate consumption reporting logic
    let meterEvent: any = null;
    const sessionId = `gen_${generation.id}_${Date.now()}`;
    let customer = null;
    try {
      // Ensure customer exists
      customer = await ensureCustomer(userDid);

      // Report image processing consumption directly
      meterEvent = await payment.meterEvents.create({
        event_name: METER_NAME, // Keep consistent with meter name
        timestamp: Math.floor(Date.now() / 1000),
        payload: {
          customer_id: userDid,
          value: String(requiredCredits),
        },
        identifier: `${userDid}_${sessionId}_${Date.now()}`,
        metadata: {
          generation_id: generation.id,
          original_image_url: imageUrls.length > 0 ? imageUrls[0] : '',
          original_images_count: imageUrls.length,
        },
      });

      logger.info('Settled processing session', {
        customerId: userDid,
        billedCredits: requiredCredits,
        sessionId,
        eventId: meterEvent.id,
      });
    } catch (creditError) {
      // If credit consumption fails, mark generation as failed
      await generation.updateStatus('failed', {
        errorMessage: `Credit consumption failed: ${creditError instanceof Error ? creditError.message : 'Unknown error'}`,
      });

      return res.status(400).json({
        error: 'Credit consumption failed',
        message: creditError instanceof Error ? creditError.message : 'Unknown error',
        generationId: generation.id,
      });
    }

    // Prepare AI processing
    let generatedImg = '';
    let processingTime = 0;
    let fileName = '';
    let filePath = '';
    const processingStartTime = Date.now();

    try {
      // Initialize AI model
      if (modelType === 'gemini') {
        logger.info('Start AIGNE Hub API call with gemini');
        const model = new AIGNEHubChatModel({
          model: 'google/gemini-2.5-flash-image-preview',
          // model: 'doubao/doubao-seedream-4-0-250828',
          modelOptions: {
            modalities: ['text', 'image'],
          },
        });

        // Prepare message content with the final prompt
        const messageContent: any[] = [{ type: 'text', text: finalPrompt }];

        if (textInput) {
          messageContent.push({
            type: 'text',
            text: textInput,
          });
        }

        // Add all original images if provided
        if (imageUrls.length > 0) {
          const getMimeType = async (imgUrl: string) => {
            try {
              const { data } = await axios.get(`${imgUrl}.json`);
              return data.metadata.type;
            } catch (error) {
              return 'image/jpeg';
            }
          };

          // Process each image and add to message content
          for (const imageUrl of imageUrls) {
            const imgUrl = getImageUrl(imageUrl);
            const mimeType = await getMimeType(imgUrl);
            messageContent.push({
              type: 'url',
              url: imgUrl,
              mimeType,
            });
          }
        }

        // Call AIGNE Hub API
        logger.info('Starting AIGNE Hub API call', {
          generationId: generation.id,
          prompt: finalPrompt,
          imageCount: imageUrls.length,
          originalImages: imageUrls.map((url: string) => getImageUrl(url)),
          messages: [
            {
              role: 'user',
              content: messageContent,
            },
          ],
        });

        const result = await model.invoke({
          messages: [
            {
              role: 'user',
              content: messageContent,
            },
          ],
        });

        logger.info('Finish AIGNE Hub API call', {
          result,
        });

        if (!result.files || result.files.length === 0) {
          throw new Error('Image generation failed');
        }

        const { path, mimeType } = result.files[0]! as LocalContent;
        filePath = path;

        const getFileExtension = (mimeType: string | undefined): string => {
          if (!mimeType) return '.jpeg';
          const mimeToExtension: Record<string, string> = {
            'image/jpeg': '.jpeg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'image/bmp': '.bmp',
            'image/tiff': '.tiff',
            'image/svg+xml': '.svg',
          };
          return mimeToExtension[mimeType] || '.jpeg';
        };

        const fileExtension = getFileExtension(mimeType);
        fileName = `${userDid}_${sessionId}_${Date.now()}${fileExtension}`;

        generatedImg = await (async () => {
          try {
            const res = (
              await uploadToMediaKit({
                filePath,
                fileName,
              })
            )?.data;
            return (res as any).filename;
          } catch (error) {
            logger.error(`Failed to upload asset ${filePath}:`, error);
            return '';
          }
        })();
      } else if (modelType === 'doubao') {
        logger.info('Start AIGNE Hub API call with doubao');
        const model = new AIGNEHubImageModel({
          model: 'doubao/doubao-seedream-4-0-250828',
        });

        const params: any = {
          prompt: finalPrompt + (textInput ? `user input: ${textInput}` : ''),
          stream: false,
          watermark: false,
          responseFormat: 'url',
        };

        if (imageUrls && imageUrls.length > 0) {
          params.image = imageUrls.map((url: string) => getImageUrl(url));
        }

        // Call AIGNE Hub API
        logger.info('Starting AIGNE Hub API call', {
          generationId: generation.id,
          prompt: finalPrompt,
          imageCount: imageUrls.length,
          originalImages: imageUrls.map((url: string) => getImageUrl(url)),
          params,
        });

        const result = await model.invoke(params);

        logger.info('Finish AIGNE Hub API call', {
          result,
        });

        if (
          !result ||
          !result.images ||
          result.images.length === 0 ||
          !result.images[0] ||
          !(result.images[0] as ImageModelOutputImageUrl).url
        ) {
          throw new Error('Image generation failed');
        }

        const douBaoUrl = (result.images[0] as ImageModelOutputImageUrl).url;

        // Download image from douBaoUrl to local temp file
        const downloadImageFromUrl = async (url: string): Promise<{ filePath: string; fileName: string }> => {
          const response = await axios({
            method: 'GET',
            url,
            responseType: 'stream',
          });

          // Generate temp file name using env.dataDir
          const tempFileName = `doubao_${userDid}_${sessionId}_${Date.now()}.jpeg`;
          const tempFilePath = path.join(env.dataDir, 'temp', tempFileName);

          // Ensure temp directory exists
          const tempDir = path.dirname(tempFilePath);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }

          // Write stream to file
          const writer = fs.createWriteStream(tempFilePath);
          response.data.pipe(writer);

          return new Promise((resolve, reject) => {
            writer.on('finish', () => {
              resolve({ filePath: tempFilePath, fileName: tempFileName });
            });
            writer.on('error', reject);
          });
        };

        const downloadedFile = await downloadImageFromUrl(douBaoUrl);
        filePath = downloadedFile.filePath;
        fileName = downloadedFile.fileName;

        generatedImg = await (async () => {
          try {
            const res = (
              await uploadToMediaKit({
                filePath,
                fileName,
              })
            )?.data;
            return (res as any).filename;
          } catch (error) {
            logger.error(`Failed to upload asset ${filePath}:`, error);
            return '';
          } finally {
            // Clean up downloaded temp file
            if (filePath && fs.existsSync(filePath)) {
              try {
                await unlinkAsync(filePath);
                logger.info(`Cleaned up temp file: ${filePath}`);
              } catch (cleanupError) {
                logger.error(`Failed to clean up temp file ${filePath}:`, cleanupError);
              }
            }
          }
        })();
      }

      processingTime = Date.now() - processingStartTime;

      if (!generatedImg) {
        throw new Error('AI model did not return valid image result');
      }

      logger.info('AIGNE Hub API call successful', {
        generationId: generation.id,
        processingTime,
      });
    } catch (aiError) {
      // Clean up any temp files if they exist
      if (modelType === 'doubao' && filePath && fs.existsSync(filePath)) {
        try {
          await unlinkAsync(filePath);
          logger.info(`Cleaned up temp file after error: ${filePath}`);
        } catch (cleanupError) {
          logger.error(`Failed to clean up temp file after error ${filePath}:`, cleanupError);
        }
      }

      // Create credit grant
      const meter = await payment.meters.retrieve(METER_NAME);
      if (meter && customer) {
        await payment.creditGrants.create({
          customer_id: customer.id,
          amount: `${requiredCredits}`,
          currency_id: meter.currency_id!,
          applicability_config: {
            scope: {
              price_type: 'metered',
            },
          },
          category: 'promotional',
          name: 'Image generation failed, credit refunded',
          metadata: {
            granted_at: new Date().toISOString(),
            service_type: METER_NAME,
            granted_by: 'system',
          },
        });
      }
      console.error(aiError);
      logger.error('AI processing failed', {
        generationId: generation.id,
        error: aiError instanceof Error ? aiError.message : '未知错误',
        processingTime: Date.now() - processingStartTime,
      });

      // Update generation record with failure
      await generation.updateStatus('failed', {
        processingTimeMs: Date.now() - processingStartTime,
        errorMessage: `AI processing failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`,
      });

      return res.status(400).json({
        error: 'AI processing failed',
        message: 'AI processing failed',
        generationId: generation.id,
      });
    }

    // Update generation record with results
    await generation.update({
      generatedImg,
      status: 'completed',
      processingTimeMs: processingTime,
    });

    // Increment usage count for the AI project
    try {
      await aiProject.incrementUsage();
      logger.info('AI project usage count incremented', {
        projectSlug: clientId,
        newUsageCount: aiProject.usageCount,
        generationId: generation.id,
      });
    } catch (usageError) {
      // Log error but don't fail the request
      logger.error('Failed to increment AI project usage count', {
        projectSlug: clientId,
        generationId: generation.id,
        error: usageError instanceof Error ? usageError.message : 'Unknown error',
      });
    }

    const newBalanceInfo = await getUserCreditBalance(userDid);
    const newBalance = parseFloat(newBalanceInfo.balance);

    return res.json({
      success: true,
      data: {
        generationId: generation.id,
        originalImg: imageUrls.length > 0 ? imageUrls[0] : '', // First image for backward compatibility
        originalImages: imageUrls, // All original images
        textInput: textInput || undefined, // Include text input for text-based projects
        generatedImg,
        processingTimeMs: processingTime,
        creditsConsumed: requiredCredits,
        fileName,
        newBalance,
        status: 'completed',
        message: 'Processing completed',
        prompt: finalPrompt,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('AI generation failed:', error);

    // Try to update generation record if it exists
    try {
      const userDid = req.user?.did;
      if (userDid) {
        const failedGeneration = await ImageGeneration.findOne({
          where: { userDid },
          order: [['createdAt', 'DESC']],
        });

        if (failedGeneration && failedGeneration.status !== 'completed') {
          await failedGeneration.updateStatus('failed', {
            processingTimeMs: processingTime,
            errorMessage: error instanceof Error ? error.message : 'Unknown processing error',
          });
        }
      }
    } catch (updateError) {
      logger.error('Failed to update generation status:', updateError);
    }

    return res.status(400).json({
      error: 'AI generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get AI generation status
 * GET /api/ai/generation/:id
 */
router.get('/generation/:id', auth(), user(), async (req, res): Promise<any> => {
  try {
    const userDid = req.user?.did;
    if (!userDid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const generation = await ImageGeneration.findOne({
      where: { id, userDid }, // Ensure user can only access their own generations
    });

    if (!generation) {
      return res.status(404).json({
        error: 'Generation record not found',
        message: 'Generation record not found or access denied',
      });
    }

    return res.json({
      success: true,
      data: {
        id: generation.id,
        originalImageUrl: generation.originalImg,
        generatedImageUrl: generation.generatedImg,
        status: generation.status,
        creditsConsumed: generation.creditsConsumed,
        processingTimeMs: generation.processingTimeMs,
        errorMessage: generation.errorMessage,
        metadata: generation.metadata,
        createdAt: generation.createdAt,
        updatedAt: generation.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Failed to get generation status:', error);
    return res.status(400).json({
      error: 'Failed to get generation status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get user's AI generation history
 * GET /api/ai/history
 */
router.get('/history', auth(), user(), async (req, res): Promise<any> => {
  try {
    const userDid = req.user?.did!!;

    // Validate query parameters
    const { error, value } = getHistorySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.details,
      });
    }

    const { limit, offset, clientId } = value;

    // Build where clause
    const whereClause: any = { userDid, status: 'completed' };
    if (clientId) {
      whereClause.clientId = clientId;
    }

    // Get generations with pagination
    const { rows: generations, count: total } = await ImageGeneration.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Get user statistics
    const stats = await ImageGeneration.getUserStats(userDid);

    return res.json({
      success: true,
      data: {
        generations: generations.map((gen) => ({
          id: gen.id,
          originalImg: gen.originalImg,
          generatedImg: gen.generatedImg,
          status: gen.status,
          creditsConsumed: gen.creditsConsumed,
          processingTimeMs: gen.processingTimeMs,
          createdAt: gen.createdAt,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        statistics: stats,
      },
    });
  } catch (error) {
    logger.error('Failed to get generation history:', error);
    return res.status(400).json({
      error: 'Failed to get generation history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Delete a generation record
 * DELETE /api/ai/generation/:id
 */
router.delete('/generation/:id', auth(), user(), async (req, res): Promise<any> => {
  try {
    const userDid = req.user?.did;

    const { id } = req.params;
    const generation = await ImageGeneration.findOne({
      where: { id, userDid },
    });

    if (!generation) {
      return res.status(404).json({
        error: 'Generation record not found',
        message: 'Generation record not found or access denied',
      });
    }

    if (userDid !== generation.userDid) {
      return res.status(403).json({
        error: 'Generation record not found',
        message: 'Generation record not found or access denied',
      });
    }

    await generation.destroy();

    return res.json({
      success: true,
      data: {
        message: 'Generation record deleted successfully',
        deletedId: id,
      },
    });
  } catch (error) {
    logger.error('Failed to delete generation record:', error);
    return res.status(400).json({
      error: 'Failed to delete generation record',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get AI generation statistics
 * GET /api/ai/stats
 */
router.get('/stats', auth(), user(), async (req, res): Promise<any> => {
  try {
    const userDid = req.user?.did;
    if (!userDid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = await ImageGeneration.getUserStats(userDid);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await ImageGeneration.count({
      where: {
        userDid,
        createdAt: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    return res.json({
      success: true,
      data: {
        ...stats,
        recentActivity,
        period: '30 days',
      },
    });
  } catch (error) {
    logger.error('Failed to get generation statistics:', error);
    return res.status(400).json({
      error: 'Failed to get generation statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
