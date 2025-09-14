import { auth, user } from '@blocklet/sdk/lib/middlewares';
import { Router } from 'express';
import Joi from 'joi';

import logger from '../libs/logger';
import AIProject from '../store/models/ai-project';
import ProjectI18n from '../store/models/project-i18n';

const router = Router();

// Control component validation schemas
const controlOptionSchema = Joi.object({
  value: Joi.string().required(),
  label: Joi.string().required(),
  color: Joi.string().optional(),
  description: Joi.string().optional(),
});

const baseControlConfigSchema = Joi.object({
  type: Joi.string().required(),
  key: Joi.string().required(),
  label: Joi.string().required(),
  description: Joi.string().optional(),
  required: Joi.boolean().optional(),
  defaultValue: Joi.any().optional(),
});

const selectControlSchema = baseControlConfigSchema.keys({
  type: Joi.string().valid('select').required(),
  options: Joi.array().items(controlOptionSchema).required(),
  multiple: Joi.boolean().optional(),
});

const sliderControlSchema = baseControlConfigSchema.keys({
  type: Joi.string().valid('slider').required(),
  min: Joi.number().required(),
  max: Joi.number().required(),
  step: Joi.number().optional(),
  marks: Joi.array()
    .items(
      Joi.object({
        value: Joi.number().required(),
        label: Joi.string().required(),
      }),
    )
    .optional(),
});

const numberControlSchema = baseControlConfigSchema.keys({
  type: Joi.string().valid('number').required(),
  min: Joi.number().optional(),
  max: Joi.number().optional(),
  step: Joi.number().optional(),
  unit: Joi.string().optional(),
});

const textControlSchema = baseControlConfigSchema.keys({
  type: Joi.string().valid('text').required(),
  placeholder: Joi.string().optional(),
  maxLength: Joi.number().optional(),
});

const backgroundSelectorSchema = baseControlConfigSchema.keys({
  type: Joi.string().valid('backgroundSelector').required(),
  backgrounds: Joi.array()
    .items(
      Joi.object({
        value: Joi.string().required(),
        label: Joi.string().required(),
        color: Joi.string().required(),
      }),
    )
    .required(),
});

const controlConfigSchema = Joi.alternatives().try(
  selectControlSchema,
  sliderControlSchema,
  numberControlSchema,
  textControlSchema,
  backgroundSelectorSchema,
);

const controlsConfigSchema = Joi.object({
  inputConfig: Joi.object({
    maxImages: Joi.number().integer().min(1).max(10).required(),
    minImages: Joi.number().integer().min(1).optional(),
    imageDescriptions: Joi.object().pattern(Joi.string(), Joi.array().items(Joi.string())).optional(),
    allowedTypes: Joi.array().items(Joi.string()).optional(),
    maxSize: Joi.number().optional(),
    requirements: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  }).required(),
  controlsConfig: Joi.array().items(controlConfigSchema).optional(),
});

// Validation schemas
const createProjectSchema = Joi.object({
  slug: Joi.string()
    .min(1)
    .max(100)
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Slug can only contain lowercase letters, numbers and dashes',
      'string.min': 'Slug must be at least 1 character',
      'string.max': 'Slug cannot exceed 100 characters',
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
  controlsConfig: controlsConfigSchema.optional(),
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
    logger.error('Failed to get project list:', error);
    return res.status(500).json({
      error: 'Failed to get project list',
      message: error instanceof Error ? error.message : 'Unknown error',
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
        error: 'Project not found',
        message: 'Project does not exist or has been disabled',
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
        controlsConfig: project.controlsConfig,
      },
    });
  } catch (error) {
    logger.error('Failed to get project by slug:', error);
    return res.status(500).json({
      error: 'Failed to get project',
      message: error instanceof Error ? error.message : 'Unknown error',
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
        error: 'Project not found',
        message: 'Project does not exist or has been disabled',
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
        controlsConfig: project.controlsConfig,
      },
    });
  } catch (error) {
    logger.error('Failed to get project details:', error);
    return res.status(500).json({
      error: 'Failed to get project details',
      message: error instanceof Error ? error.message : 'Unknown error',
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
        error: 'Project not found',
        message: 'Project does not exist or has been disabled',
      });
    }

    // Get i18n content with fallback
    const i18nContent = await ProjectI18n.getWithFallback(id, locale);

    if (!i18nContent) {
      return res.status(404).json({
        error: 'Multilingual content not found',
        message: 'This project has no multilingual content configured',
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
    logger.error('Failed to get project multilingual content:', error);
    return res.status(500).json({
      error: 'Failed to get multilingual content',
      message: error instanceof Error ? error.message : 'Unknown error',
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
        error: 'Invalid request data',
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

    logger.info('Project created successfully', {
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
    logger.error('Failed to create project:', error);
    return res.status(400).json({
      error: 'Failed to create project',
      message: error instanceof Error ? error.message : 'Unknown error',
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
        error: 'Project not found',
        message: 'Project does not exist',
      });
    }

    // Validate request
    const { error, value } = createProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Invalid request data',
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

    logger.info('Project updated successfully', {
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
    logger.error('Failed to update project:', error);
    return res.status(400).json({
      error: 'Failed to update project',
      message: error instanceof Error ? error.message : 'Unknown error',
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
        error: 'Invalid status value',
        message: 'Status must be one of: active, draft, archived',
      });
    }

    const project = await AIProject.findByPk(id);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project does not exist',
      });
    }

    await project.updateStatus(status);

    logger.info('Project status updated successfully', {
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
    logger.error('Failed to update project status:', error);
    return res.status(400).json({
      error: 'Failed to update project status',
      message: error instanceof Error ? error.message : 'Unknown error',
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
        error: 'Project ID cannot be empty',
      });
    }

    // Check if project exists
    const project = await AIProject.findByPk(id);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project does not exist',
      });
    }

    // Validate request
    const { error, value } = createI18nSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.details,
      });
    }

    // Create or update i18n content
    const i18nContent = await ProjectI18n.upsertI18nContent({
      projectId: id,
      locale: value.locale,
      content: value.content,
    });

    logger.info('Project multilingual content updated successfully', {
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
    logger.error('Failed to update project multilingual content:', error);
    return res.status(400).json({
      error: 'Failed to update multilingual content',
      message: error instanceof Error ? error.message : 'Unknown error',
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
    logger.error('Failed to get admin project list:', error);
    return res.status(500).json({
      error: 'Failed to get project list',
      message: error instanceof Error ? error.message : 'Unknown error',
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
        error: 'Project not found',
        message: 'Project does not exist',
      });
    }

    // Soft delete by archiving
    await project.updateStatus('archived');

    logger.info('Project deleted successfully', {
      projectId: project.id,
      deletedBy: req.user?.did,
    });

    return res.json({
      success: true,
      data: {
        message: 'Project has been archived',
        projectId: id,
      },
    });
  } catch (error) {
    logger.error('Failed to delete project:', error);
    return res.status(400).json({
      error: 'Failed to delete project',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
