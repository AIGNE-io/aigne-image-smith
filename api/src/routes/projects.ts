import { auth, user } from '@blocklet/sdk/lib/middlewares';
import { Router } from 'express';
import Joi from 'joi';

import logger from '../libs/logger';
import AIProject from '../store/models/ai-project';
import ProjectI18n from '../store/models/project-i18n';

const router = Router();

// Validation schemas
const createProjectSchema = Joi.object({
  slug: Joi.string()
    .min(1)
    .max(100)
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Slug只能包含小写字母、数字和短横线',
      'string.min': 'Slug至少需要1个字符',
      'string.max': 'Slug不能超过100个字符',
    }),
  name: Joi.object().pattern(Joi.string(), Joi.string()).required(),
  subtitle: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  description: Joi.object().pattern(Joi.string(), Joi.string()).required(),
  seoImageUrl: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  promptTemplate: Joi.string().min(10).required(),
  uiConfig: Joi.object({
    primaryColor: Joi.string().optional(),
    secondaryColor: Joi.string().optional(),
    layout: Joi.string().valid('card', 'full', 'compact').optional(),
    features: Joi.object({
      uploadMultiple: Joi.boolean().optional(),
      showComparisonSlider: Joi.boolean().optional(),
      showHistory: Joi.boolean().optional(),
      allowDownload: Joi.boolean().optional(),
      showCredits: Joi.boolean().optional(),
    }).optional(),
    customStyles: Joi.object().optional(),
  }).optional(),
  logoUrl: Joi.string().uri().optional(),
  metadata: Joi.object().optional(),
});

const createI18nSchema = Joi.object({
  locale: Joi.string().min(2).max(5).required(),
  content: Joi.object({
    ui: Joi.object({
      title: Joi.string().required(),
      subtitle: Joi.string().optional(),
      uploadButton: Joi.string().required(),
      processButton: Joi.string().required(),
      downloadButton: Joi.string().required(),
      uploadPlaceholder: Joi.string().optional(),
      processingText: Joi.string().optional(),
      successText: Joi.string().optional(),
      errorText: Joi.string().optional(),
      tryAgainButton: Joi.string().optional(),
      backButton: Joi.string().optional(),
      historyButton: Joi.string().optional(),
      creditsText: Joi.string().optional(),
    }).required(),
    features: Joi.array().items(Joi.string()).optional(),
    instructions: Joi.array().items(Joi.string()).optional(),
    tips: Joi.array().items(Joi.string()).optional(),
    seo: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      keywords: Joi.array().items(Joi.string()).required(),
    }).optional(),
    custom: Joi.object().optional(),
  }).required(),
});

/**
 * Get all active projects (public endpoint)
 * GET /api/projects
 */
router.get('/', async (req, res): Promise<any> => {
  try {
    const projects = await AIProject.findActiveProjects();

    return res.json({
      success: true,
      data: projects.map((project) => ({
        id: project.id,
        slug: project.slug,
        name: project.name,
        subtitle: project.subtitle,
        description: project.description,
        uiConfig: project.uiConfig,
        metadata: project.metadata,
        createdAt: project.createdAt,
      })),
    });
  } catch (error) {
    logger.error('获取项目列表失败:', error);
    return res.status(500).json({
      error: '获取项目列表失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Get project by slug (public endpoint)
 * GET /api/projects/by-slug/:slug
 */
router.get('/by-slug/:slug', async (req, res): Promise<any> => {
  try {
    const { slug } = req.params;
    const project = await AIProject.findActiveBySlug(slug);

    if (!project) {
      return res.status(404).json({
        error: '项目未找到',
        message: '项目不存在或已被禁用',
      });
    }

    return res.json({
      success: true,
      data: {
        id: project.id,
        slug: project.slug,
        name: project.name,
        subtitle: project.subtitle,
        description: project.description,
        promptTemplate: project.promptTemplate,
        uiConfig: project.uiConfig,
        metadata: project.metadata,
        createdAt: project.createdAt,
      },
    });
  } catch (error) {
    logger.error('通过slug获取项目失败:', error);
    return res.status(500).json({
      error: '获取项目失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Get project i18n content by slug (public endpoint)
 * GET /api/projects/by-slug/:slug/i18n/:locale?
 */
router.get('/by-slug/:slug/i18n/:locale?', async (req, res): Promise<any> => {
  try {
    const { slug, locale = 'en' } = req.params;

    // First check if project exists and is active
    const project = await AIProject.findActiveBySlug(slug);
    if (!project) {
      return res.status(404).json({
        error: '项目未找到',
        message: '项目不存在或已被禁用',
      });
    }

    // Get i18n content with fallback
    const i18nContent = await ProjectI18n.getWithFallback(project.id, locale);

    if (!i18nContent) {
      return res.status(404).json({
        error: '多语言内容未找到',
        message: '该项目暂无多语言内容配置',
      });
    }

    return res.json({
      success: true,
      data: {
        projectId: i18nContent.projectId,
        locale: i18nContent.locale,
        content: i18nContent.content,
        createdAt: i18nContent.createdAt,
        updatedAt: i18nContent.updatedAt,
      },
    });
  } catch (error) {
    logger.error('通过slug获取项目多语言内容失败:', error);
    return res.status(500).json({
      error: '获取多语言内容失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Get project by ID (public endpoint)
 * GET /api/projects/:id
 */
router.get('/:id', async (req, res): Promise<any> => {
  try {
    const { id } = req.params;
    const project = await AIProject.findActiveById(id);

    if (!project) {
      return res.status(404).json({
        error: '项目未找到',
        message: '项目不存在或已被禁用',
      });
    }

    // Get all i18n records for this project to extract seoImageUrl
    const i18nRecords = await ProjectI18n.findByProject(project.id);
    const seoImageUrl: Record<string, string> = {};

    for (const record of i18nRecords) {
      if (record.content?.seo?.imageUrl) {
        seoImageUrl[record.locale] = record.content.seo.imageUrl;
      }
    }

    return res.json({
      success: true,
      data: {
        id: project.id,
        slug: project.slug,
        name: project.name,
        subtitle: project.subtitle,
        description: project.description,
        seoImageUrl,
        promptTemplate: project.promptTemplate,
        uiConfig: project.uiConfig,
        metadata: project.metadata,
        createdAt: project.createdAt,
      },
    });
  } catch (error) {
    logger.error('获取项目详情失败:', error);
    return res.status(500).json({
      error: '获取项目详情失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Get project i18n content (public endpoint)
 * GET /api/projects/:id/i18n/:locale?
 */
router.get('/:id/i18n/:locale?', async (req, res): Promise<any> => {
  try {
    const { id, locale = 'en' } = req.params;

    // First check if project exists and is active
    const project = await AIProject.findActiveById(id);
    if (!project) {
      return res.status(404).json({
        error: '项目未找到',
        message: '项目不存在或已被禁用',
      });
    }

    // Get i18n content with fallback
    const i18nContent = await ProjectI18n.getWithFallback(id, locale);

    if (!i18nContent) {
      return res.status(404).json({
        error: '多语言内容未找到',
        message: '该项目暂无多语言内容配置',
      });
    }

    return res.json({
      success: true,
      data: {
        projectId: i18nContent.projectId,
        locale: i18nContent.locale,
        content: i18nContent.content,
        createdAt: i18nContent.createdAt,
        updatedAt: i18nContent.updatedAt,
      },
    });
  } catch (error) {
    logger.error('获取项目多语言内容失败:', error);
    return res.status(500).json({
      error: '获取多语言内容失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

// === Admin endpoints (require authentication) ===

/**
 * Create new project (admin only)
 * POST /api/projects/admin
 */
router.post('/admin', auth(), user(), async (req, res): Promise<any> => {
  try {
    // Validate request
    const { error, value } = createProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '请求数据无效',
        details: error.details,
      });
    }

    // Extract seoImageUrl for i18n handling
    const { seoImageUrl, ...projectData } = value;

    // Create project
    const project = await AIProject.validateAndCreate(projectData);

    // Create i18n records for seoImageUrl if provided
    if (seoImageUrl && typeof seoImageUrl === 'object') {
      for (const [locale, imageUrl] of Object.entries(seoImageUrl)) {
        if (imageUrl && typeof imageUrl === 'string') {
          await ProjectI18n.upsertI18nContent({
            projectId: project.id,
            locale,
            content: {
              ui: {
                title: `Project ${locale}`,
                uploadButton: 'Upload',
                processButton: 'Process',
                downloadButton: 'Download',
              },
              seo: {
                imageUrl,
              },
            },
          });
        }
      }
    }

    logger.info('项目创建成功', {
      projectId: project.id,
      createdBy: req.user?.did,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: project.id,
        slug: project.slug,
        name: project.name,
        subtitle: project.subtitle,
        description: project.description,
        promptTemplate: project.promptTemplate,
        uiConfig: project.uiConfig,
        status: project.status,
        metadata: project.metadata,
        createdAt: project.createdAt,
      },
    });
  } catch (error) {
    logger.error('创建项目失败:', error);
    return res.status(400).json({
      error: '创建项目失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Update project (admin only)
 * PUT /api/projects/admin/:id
 */
router.put('/admin/:id', auth(), user(), async (req, res): Promise<any> => {
  try {
    const { id } = req.params;

    // Find project (including archived)
    const project = await AIProject.findByPk(id);
    if (!project) {
      return res.status(404).json({
        error: '项目未找到',
        message: '项目不存在',
      });
    }

    // Validate request
    const { error, value } = createProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '请求数据无效',
        details: error.details,
      });
    }

    // Extract seoImageUrl for i18n handling
    const { seoImageUrl, ...projectData } = value;

    // Update project
    await project.update(projectData);

    // Update i18n records for seoImageUrl if provided
    if (seoImageUrl && typeof seoImageUrl === 'object') {
      for (const [locale, imageUrl] of Object.entries(seoImageUrl)) {
        if (imageUrl && typeof imageUrl === 'string') {
          // Get existing i18n content or create minimal structure
          const existingI18n = await ProjectI18n.findByProjectAndLocale(project.id, locale);
          const existingContent = existingI18n?.content || {
            ui: {
              title: `Project ${locale}`,
              uploadButton: 'Upload',
              processButton: 'Process',
              downloadButton: 'Download',
            },
            seo: {},
          };

          // Update the seo.imageUrl
          const updatedContent = {
            ...existingContent,
            seo: {
              ...existingContent.seo,
              imageUrl,
            },
          };

          await ProjectI18n.upsertI18nContent({
            projectId: project.id,
            locale,
            content: updatedContent,
          });
        } else if (imageUrl === '') {
          // Handle deletion - remove imageUrl from existing i18n content
          const existingI18n = await ProjectI18n.findByProjectAndLocale(project.id, locale);
          if (existingI18n?.content?.seo) {
            const updatedContent = {
              ...existingI18n.content,
              seo: {
                ...existingI18n.content.seo,
                imageUrl: undefined,
              },
            };
            // Remove undefined properties
            if (updatedContent.seo.imageUrl === undefined) {
              delete updatedContent.seo.imageUrl;
            }

            await ProjectI18n.upsertI18nContent({
              projectId: project.id,
              locale,
              content: updatedContent,
            });
          }
        }
      }
    }

    logger.info('项目更新成功', {
      projectId: project.id,
      updatedBy: req.user?.did,
    });

    return res.json({
      success: true,
      data: {
        id: project.id,
        slug: project.slug,
        name: project.name,
        subtitle: project.subtitle,
        description: project.description,
        promptTemplate: project.promptTemplate,
        uiConfig: project.uiConfig,
        status: project.status,
        metadata: project.metadata,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    logger.error('更新项目失败:', error);
    return res.status(400).json({
      error: '更新项目失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Update project status (admin only)
 * PATCH /api/projects/admin/:id/status
 */
router.patch('/admin/:id/status', auth(), user(), async (req, res): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({
        error: '无效的状态值',
        message: '状态必须是: active, draft, archived 之一',
      });
    }

    const project = await AIProject.findByPk(id);
    if (!project) {
      return res.status(404).json({
        error: '项目未找到',
        message: '项目不存在',
      });
    }

    await project.updateStatus(status);

    logger.info('项目状态更新成功', {
      projectId: project.id,
      newStatus: status,
      updatedBy: req.user?.did,
    });

    return res.json({
      success: true,
      data: {
        id: project.id,
        status: project.status,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    logger.error('更新项目状态失败:', error);
    return res.status(400).json({
      error: '更新项目状态失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Create or update project i18n content (admin only)
 * POST /api/projects/admin/:id/i18n
 */
router.post('/admin/:id/i18n', auth(), user(), async (req, res): Promise<any> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: '项目ID不能为空',
      });
    }

    // Check if project exists
    const project = await AIProject.findByPk(id);
    if (!project) {
      return res.status(404).json({
        error: '项目未找到',
        message: '项目不存在',
      });
    }

    // Validate request
    const { error, value } = createI18nSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '请求数据无效',
        details: error.details,
      });
    }

    // Create or update i18n content
    const i18nContent = await ProjectI18n.upsertI18nContent({
      projectId: id,
      locale: value.locale,
      content: value.content,
    });

    logger.info('项目多语言内容更新成功', {
      projectId: id,
      locale: value.locale,
      updatedBy: req.user?.did,
    });

    return res.json({
      success: true,
      data: {
        id: i18nContent.id,
        projectId: i18nContent.projectId,
        locale: i18nContent.locale,
        content: i18nContent.content,
        updatedAt: i18nContent.updatedAt,
      },
    });
  } catch (error) {
    logger.error('更新项目多语言内容失败:', error);
    return res.status(400).json({
      error: '更新多语言内容失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Get all projects for admin (including drafts and archived)
 * GET /api/projects/admin
 */
router.get('/admin/all', auth(), user(), async (req, res): Promise<any> => {
  try {
    const projects = await AIProject.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: projects.map((project) => ({
        id: project.id,
        slug: project.slug,
        name: project.name,
        subtitle: project.subtitle,
        description: project.description,
        promptTemplate: project.promptTemplate,
        uiConfig: project.uiConfig,
        status: project.status,
        metadata: project.metadata,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })),
    });
  } catch (error) {
    logger.error('获取管理项目列表失败:', error);
    return res.status(500).json({
      error: '获取项目列表失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * Delete project (admin only) - soft delete by archiving
 * DELETE /api/projects/admin/:id
 */
router.delete('/admin/:id', auth(), user(), async (req, res): Promise<any> => {
  try {
    const { id } = req.params;

    const project = await AIProject.findByPk(id);
    if (!project) {
      return res.status(404).json({
        error: '项目未找到',
        message: '项目不存在',
      });
    }

    // Soft delete by archiving
    await project.updateStatus('archived');

    logger.info('项目删除成功', {
      projectId: project.id,
      deletedBy: req.user?.did,
    });

    return res.json({
      success: true,
      data: {
        message: '项目已归档',
        projectId: id,
      },
    });
  } catch (error) {
    logger.error('删除项目失败:', error);
    return res.status(400).json({
      error: '删除项目失败',
      message: error instanceof Error ? error.message : '未知错误',
    });
  }
});

export default router;
