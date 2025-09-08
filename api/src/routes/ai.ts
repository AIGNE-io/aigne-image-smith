import { AIGNEHubChatModel } from '@aigne/aigne-hub';
import payment from '@blocklet/payment-js';
import { auth, user } from '@blocklet/sdk/lib/middlewares';
import { Router } from 'express';
import Joi from 'joi';

import logger from '../libs/logger';
import { ensureCustomer, getUserCreditBalance } from '../libs/payment';
import ImageGeneration from '../store/models/image-generation';

const router = Router();

// Initialize AI model
const model = new AIGNEHubChatModel({
  model: 'google/gemini-2.5-flash-image-preview',
  apiKey: process.env.AIGNE_API_KEY || '', // Add your API key to environment
});

// Validation schemas
const generateImageSchema = Joi.object({
  prompt: Joi.string().min(1).max(1000).required(),
  originalImageUrl: Joi.string().uri().optional(),
  operationType: Joi.string()
    .valid('colorization', 'restoration', 'enhancement', 'style_transfer', 'generation')
    .required(),
  metadata: Joi.object().optional(),
});

const getHistorySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
  operationType: Joi.string()
    .valid('colorization', 'restoration', 'enhancement', 'style_transfer', 'generation')
    .optional(),
});

/**
 * Generate AI processed image using AIGNE Hub
 * POST /api/ai/generate
 */
router.post('/generate', auth(), user(), async (req, res) => {
  const startTime = Date.now();

  try {
    const userDid = req.user?.did;
    if (!userDid) {
      return res.status(401).json({ error: '用户未认证' });
    }

    // Validate request body
    const { error, value } = generateImageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '请求数据无效',
        details: error.details,
      });
    }

    const { prompt, originalImageUrl, operationType, metadata } = value;

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
      originalImageUrl,
      generatedImageUrl: '', // Will be updated when processing completes
      operationType,
      status: 'pending',
      creditsConsumed: requiredCredits,
      metadata: {
        requestIp: req.ip,
        userAgent: req.get('User-Agent'),
        startTime: new Date().toISOString(),
        prompt,
        ...metadata,
      },
    });

    // Update status to processing
    await generation.updateStatus('processing');

    // Consume credits during processing - 直接集成消耗上报逻辑
    let meterEvent: any = null;
    try {
      const sessionId = `gen_${generation.id}_${Date.now()}`;

      // 确保客户存在
      await ensureCustomer(userDid);

      // 直接上报图像处理消耗量
      meterEvent = await payment.meterEvents.create({
        event_name: 'image_processing', // 保持与 meter 名称一致
        timestamp: Math.floor(Date.now() / 1000),
        payload: {
          customer_id: userDid,
          value: String(requiredCredits),
        },
        identifier: `${userDid}_${sessionId}_${Date.now()}`,
        metadata: {
          operation_type: operationType,
          generation_id: generation.id,
          original_image_url: originalImageUrl,
          prompt,
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
        errorMessage: '积分消费失败: ' + (creditError instanceof Error ? creditError.message : '未知错误'),
      });

      return res.status(400).json({
        error: '积分消费失败',
        message: creditError instanceof Error ? creditError.message : '未知错误',
        generationId: generation.id,
      });
    }

    // Prepare AI processing
    let generatedImageUrl = '';
    let processingTime = 0;
    const processingStartTime = Date.now();

    try {
      // Build prompt based on operation type
      const operationPrompts: Record<string, string> = {
        colorization: `请为这张黑白照片上色: ${prompt}`,
        restoration: `请修复这张老照片: ${prompt}`,
        enhancement: `请增强这张图片的质量: ${prompt}`,
        style_transfer: `请对这张图片进行风格转换: ${prompt}`,
        generation: `请生成一张图片: ${prompt}`,
      };

      const fullPrompt = operationPrompts[operationType] || prompt;

      // Prepare message content
      const messageContent: any[] = [{ type: 'text', text: fullPrompt }];

      // Add original image if provided
      if (originalImageUrl) {
        messageContent.push({
          type: 'url',
          url: originalImageUrl,
        });
      }

      // Call AIGNE Hub API
      logger.info('开始调用 AIGNE Hub API', {
        generationId: generation.id,
        operationType,
        prompt: fullPrompt,
        hasOriginalImage: !!originalImageUrl,
      });

      const result = await model.invoke({
        messages: [
          {
            role: 'user',
            content: messageContent,
          },
        ],
      });

      processingTime = Date.now() - processingStartTime;

      // Extract generated image URL from result
      if (result && result.content) {
        // Parse the result to extract image URL
        // Note: Adjust this parsing logic based on actual AIGNE response format
        if (typeof result.content === 'string') {
          // Look for image URLs in the response
          const imageUrlMatch = result.content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
          if (imageUrlMatch) {
            generatedImageUrl = imageUrlMatch[0];
          } else {
            // If no URL found, treat the content as the result
            generatedImageUrl = result.content;
          }
        } else if (typeof result.content === 'object' && result.content !== null) {
          // Handle structured response
          generatedImageUrl = JSON.stringify(result.content);
        } else {
          // Fallback to string conversion
          generatedImageUrl = String(result.content);
        }
      }

      if (!generatedImageUrl) {
        throw new Error('AI 模型未返回有效的图片结果');
      }

      logger.info('AIGNE Hub API 调用成功', {
        generationId: generation.id,
        processingTime,
        resultLength: typeof result.content === 'string' ? result.content.length : 'structured',
      });
    } catch (aiError) {
      logger.error('AI 处理失败', {
        generationId: generation.id,
        error: aiError instanceof Error ? aiError.message : '未知错误',
        processingTime: Date.now() - processingStartTime,
      });

      // Update generation record with failure
      await generation.updateStatus('failed', {
        processingTimeMs: Date.now() - processingStartTime,
        errorMessage: 'AI 处理失败: ' + (aiError instanceof Error ? aiError.message : '未知错误'),
      });

      return res.status(500).json({
        error: 'AI 处理失败',
        message: aiError instanceof Error ? aiError.message : '未知错误',
        generationId: generation.id,
      });
    }

    // Update generation record with results
    await generation.update({
      generatedImageUrl,
      status: 'completed',
      processingTimeMs: processingTime,
    });

    const newBalanceInfo = await getUserCreditBalance(userDid);
    const newBalance = parseFloat(newBalanceInfo.balance);

    res.json({
      success: true,
      data: {
        generationId: generation.id,
        originalImageUrl,
        generatedImageUrl,
        operationType,
        processingTimeMs: processingTime,
        creditsConsumed: requiredCredits,
        newBalance,
        status: 'completed',
        message: `${operationType} 处理完成`,
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

    res.status(500).json({
      error: 'AI 生成失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Get AI generation status
 * GET /api/ai/generation/:id
 */
router.get('/generation/:id', auth(), user(), async (req, res) => {
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

    res.json({
      success: true,
      data: {
        id: generation.id,
        originalImageUrl: generation.originalImageUrl,
        generatedImageUrl: generation.generatedImageUrl,
        operationType: generation.operationType,
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
    res.status(500).json({
      error: '获取生成状态失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Get user's AI generation history
 * GET /api/ai/history
 */
router.get('/history', auth(), user(), async (req, res) => {
  try {
    const userDid = req.user?.did;
    if (!userDid) {
      return res.status(401).json({ error: '用户未认证' });
    }

    // Validate query parameters
    const { error, value } = getHistorySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: '查询参数无效',
        details: error.details,
      });
    }

    const { limit, offset, operationType } = value;

    // Build where clause
    const whereClause: any = { userDid };
    if (operationType) {
      whereClause.operationType = operationType;
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

    res.json({
      success: true,
      data: {
        generations: generations.map((gen) => ({
          id: gen.id,
          originalImageUrl: gen.originalImageUrl,
          generatedImageUrl: gen.generatedImageUrl,
          operationType: gen.operationType,
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
    res.status(500).json({
      error: '获取生成历史失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Delete a generation record
 * DELETE /api/ai/generation/:id
 */
router.delete('/generation/:id', auth(), user(), async (req, res) => {
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

    res.json({
      success: true,
      data: {
        message: '生成记录删除成功',
        deletedId: id,
      },
    });
  } catch (error) {
    logger.error('删除生成记录失败:', error);
    res.status(500).json({
      error: '删除生成记录失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Get AI generation statistics
 * GET /api/ai/stats
 */
router.get('/stats', auth(), user(), async (req, res) => {
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
          [require('sequelize').Op.gte]: thirtyDaysAgo,
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...stats,
        recentActivity,
        period: '30 天',
      },
    });
  } catch (error) {
    logger.error('获取生成统计失败:', error);
    res.status(500).json({
      error: '获取生成统计失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

export default router;
