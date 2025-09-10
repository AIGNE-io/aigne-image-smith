import { AIGNEHubChatModel } from '@aigne/aigne-hub';
import { LocalContent } from '@aigne/core/lib/cjs/agents/chat-model';
import payment from '@blocklet/payment-js';
import { auth, user } from '@blocklet/sdk/lib/middlewares';
import { uploadToMediaKit } from '@blocklet/uploader-server';
import axios from 'axios';
import { Router } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';

import logger from '../libs/logger';
import { METER_NAME, ensureCustomer, getUserCreditBalance } from '../libs/payment';
import { getImageUrl } from '../libs/utils';
import ImageGeneration from '../store/models/image-generation';

const router = Router();

// Initialize AI model
const model = new AIGNEHubChatModel({
  model: 'google/gemini-2.5-flash-image-preview',
  modelOptions: {
    modalities: ['text', 'image'],
  },
});

// Validation schemas
const generateImageSchema = Joi.object({
  prompt: Joi.string().min(1).max(1000).required(),
  originalImg: Joi.string().optional(),
  clientId: Joi.string().required(),
  metadata: Joi.object().optional(),
});

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
    // Validate request body
    const { error, value } = generateImageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '请求数据无效',
        details: error.details,
      });
    }

    const { prompt, originalImg, clientId, metadata } = value;

    // Check credit balance first
    const balanceInfo = await getUserCreditBalance(userDid);
    const currentBalance = parseFloat(balanceInfo.balance);
    const requiredCredits = 1; // Each generation costs 1 credit

    if (currentBalance < requiredCredits) {
      return res.status(400).json({
        error: '积分不足',
        message: `需要: ${requiredCredits} 积分，可用: ${currentBalance} 积分`,
        currentBalance,
      });
    }

    // Create initial record in database
    const generation = await ImageGeneration.validateAndCreate({
      userDid,
      originalImg,
      generatedImg: '', // Will be updated when processing completes
      clientId,
      status: 'pending',
      creditsConsumed: requiredCredits,
      metadata: {
        requestIp: req.ip,
        startTime: new Date().toISOString(),
        prompt,
        ...metadata,
      },
    });

    // Update status to processing
    await generation.updateStatus('processing');

    // Consume credits during processing - 直接集成消耗上报逻辑
    let meterEvent: any = null;
    const sessionId = `gen_${generation.id}_${Date.now()}`;
    let customer = null;
    try {
      // 确保客户存在
      customer = await ensureCustomer(userDid);

      // 直接上报图像处理消耗量
      meterEvent = await payment.meterEvents.create({
        event_name: METER_NAME, // 保持与 meter 名称一致
        timestamp: Math.floor(Date.now() / 1000),
        payload: {
          customer_id: userDid,
          value: String(requiredCredits),
        },
        identifier: `${userDid}_${sessionId}_${Date.now()}`,
        metadata: {
          generation_id: generation.id,
          original_image_url: originalImg,
        },
      });

      logger.info('settled processing session', {
        customerId: userDid,
        billedCredits: requiredCredits,
        sessionId,
        eventId: meterEvent.id,
      });
    } catch (creditError) {
      // If credit consumption fails, mark generation as failed
      await generation.updateStatus('failed', {
        errorMessage: `积分消费失败: ${creditError instanceof Error ? creditError.message : '未知错误'}`,
      });

      return res.status(400).json({
        error: '积分消费失败',
        message: creditError instanceof Error ? creditError.message : '未知错误',
        generationId: generation.id,
      });
    }

    // Prepare AI processing
    let generatedImg = '';
    let processingTime = 0;
    let fileName = '';
    const processingStartTime = Date.now();

    try {
      const fullPrompt = prompt;

      // Prepare message content
      const messageContent: any[] = [{ type: 'text', text: fullPrompt }];

      // Add original image if provided
      if (originalImg) {
        const imgUrl = getImageUrl(originalImg);
        const getMimeType = async (imgUrl: string) => {
          try {
            const { data } = await axios.get(`${imgUrl}.json`);
            return data.metadata.type;
          } catch (error) {
            return 'image/jpeg';
          }
        };
        const mimeType = await getMimeType(imgUrl);
        messageContent.push({
          type: 'url',
          url: imgUrl,
          mimeType,
        });
      }

      // Call AIGNE Hub API
      logger.info('开始调用 AIGNE Hub API', {
        generationId: generation.id,
        prompt: fullPrompt,
        hasOriginalImage: getImageUrl(originalImg),
      });

      const result = await model.invoke({
        messages: [
          {
            role: 'user',
            content: messageContent,
          },
        ],
      });

      if (!result.files || result.files.length === 0) {
        return res.status(400).json({
          error: '图片生成失败',
          message: '图片生成失败',
          generationId: generation.id,
        });
      }

      const { path: filePath, mimeType } = result.files[0]! as LocalContent;

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

      processingTime = Date.now() - processingStartTime;

      if (!generatedImg) {
        throw new Error('AI 模型未返回有效的图片结果');
      }

      logger.info('AIGNE Hub API 调用成功', {
        generationId: generation.id,
        processingTime,
        resultLength: typeof result.content === 'string' ? result.content.length : 'structured',
      });
    } catch (aiError) {
      // 创建信用额度
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
          name: '图片生成失败，Credit 退回',
          metadata: {
            granted_at: new Date().toISOString(),
            service_type: METER_NAME,
            granted_by: 'system',
          },
        });
      }
      console.error(aiError);
      logger.error('AI 处理失败', {
        generationId: generation.id,
        error: aiError instanceof Error ? aiError.message : '未知错误',
        processingTime: Date.now() - processingStartTime,
      });

      // Update generation record with failure
      await generation.updateStatus('failed', {
        processingTimeMs: Date.now() - processingStartTime,
        errorMessage: `AI 处理失败: ${aiError instanceof Error ? aiError.message : '未知错误'}`,
      });

      return res.status(400).json({
        error: 'AI 处理失败',
        message: aiError instanceof Error ? aiError.message : '未知错误',
        generationId: generation.id,
      });
    }

    // Update generation record with results
    await generation.update({
      generatedImg,
      status: 'completed',
      processingTimeMs: processingTime,
    });

    const newBalanceInfo = await getUserCreditBalance(userDid);
    const newBalance = parseFloat(newBalanceInfo.balance);

    return res.json({
      success: true,
      data: {
        generationId: generation.id,
        originalImg,
        generatedImg,
        processingTimeMs: processingTime,
        creditsConsumed: requiredCredits,
        fileName,
        newBalance,
        status: 'completed',
        message: '处理完成',
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('AI 生成失败:', error);

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
            errorMessage: error instanceof Error ? error.message : '未知处理错误',
          });
        }
      }
    } catch (updateError) {
      logger.error('更新生成状态失败:', updateError);
    }

    return res.status(400).json({
      error: 'AI 生成失败',
      message: error instanceof Error ? error.message : '未知错误',
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
      return res.status(401).json({ error: '用户未认证' });
    }

    const { id } = req.params;
    const generation = await ImageGeneration.findOne({
      where: { id, userDid }, // Ensure user can only access their own generations
    });

    if (!generation) {
      return res.status(404).json({
        error: '生成记录未找到',
        message: '生成记录未找到或访问被拒绝',
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
    logger.error('获取生成状态失败:', error);
    return res.status(400).json({
      error: '获取生成状态失败',
      message: error instanceof Error ? error.message : '未知错误',
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
        error: '查询参数无效',
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
    logger.error('获取生成历史失败:', error);
    return res.status(400).json({
      error: '获取生成历史失败',
      message: error instanceof Error ? error.message : '未知错误',
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
    if (!userDid) {
      return res.status(401).json({ error: '用户未认证' });
    }

    const { id } = req.params;
    const generation = await ImageGeneration.findOne({
      where: { id, userDid },
    });

    if (!generation) {
      return res.status(404).json({
        error: '生成记录未找到',
        message: '生成记录未找到或访问被拒绝',
      });
    }

    await generation.destroy();

    return res.json({
      success: true,
      data: {
        message: '生成记录删除成功',
        deletedId: id,
      },
    });
  } catch (error) {
    logger.error('删除生成记录失败:', error);
    return res.status(400).json({
      error: '删除生成记录失败',
      message: error instanceof Error ? error.message : '未知错误',
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
      return res.status(401).json({ error: '用户未认证' });
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
        period: '30 天',
      },
    });
  } catch (error) {
    logger.error('获取生成统计失败:', error);
    return res.status(400).json({
      error: '获取生成统计失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

export default router;
