import Joi from 'joi';
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Transaction } from 'sequelize';
import type { Sequelize } from 'sequelize';
import { Worker } from 'snowflake-uuid';

const idGenerator = new Worker();
const nextId = () => idGenerator.nextId().toString();

export interface ProjectUIConfig {
  layout?: 'card' | 'full' | 'compact';
  features?: {
    uploadMultiple?: boolean;
    showComparisonSlider?: boolean;
  };
  customStyles?: Record<string, any>;
}

export interface ProjectControlsConfig {
  inputConfig: {
    maxImages: number;
    minImages?: number;
    imageDescriptions?: Record<string, string[]>;
    allowedTypes?: string[];
    maxSize?: number;
    requirements?: Record<string, string>;
  };
  controlsConfig: Array<{
    type: string;
    key: string;
    label: string;
    description?: string;
    required?: boolean;
    defaultValue?: any;
    [key: string]: any;
  }>;
}

interface AIProjectInput {
  id?: string;
  slug: string; // URL路径，唯一标识
  name: Record<string, string>; // 多语言名称 {"en": "ID Photo Maker", "zh": "证件照制作"}
  subtitle?: Record<string, string>; // 多语言副标题
  description: Record<string, string>; // 多语言描述
  promptTemplate: string; // AI Prompt 模板
  uiConfig?: ProjectUIConfig; // UI配置
  controlsConfig?: ProjectControlsConfig; // 控制组件配置
  status: 'active' | 'draft' | 'archived';
  metadata?: Record<string, any>;
}

export const AIProjectSchema = Joi.object<AIProjectInput>({
  id: Joi.string().optional(),
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
  promptTemplate: Joi.string().min(10).required(),
  uiConfig: Joi.object({
    layout: Joi.string().valid('card', 'full', 'compact').optional(),
    features: Joi.object({
      uploadMultiple: Joi.boolean().optional(),
      showComparisonSlider: Joi.boolean().optional(),
    }).optional(),
    customStyles: Joi.object().optional(),
  }).optional(),
  controlsConfig: Joi.object({
    inputConfig: Joi.object({
      maxImages: Joi.number().integer().min(1).required(),
      minImages: Joi.number().integer().min(0).optional(),
      imageDescriptions: Joi.object().pattern(Joi.string(), Joi.array().items(Joi.string())).optional(),
      allowedTypes: Joi.array().items(Joi.string()).optional(),
      maxSize: Joi.number().positive().optional(),
      requirements: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    }).required(),
    controlsConfig: Joi.array()
      .items(
        Joi.object({
          type: Joi.string().required(),
          key: Joi.string().required(),
          label: Joi.string().required(),
          description: Joi.string().optional(),
          required: Joi.boolean().optional(),
          defaultValue: Joi.any().optional(),
        }).unknown(),
      )
      .optional(),
  }).optional(),
  status: Joi.string().valid('active', 'draft', 'archived').default('active'),
  metadata: Joi.object().optional(),
});

export default class AIProject extends Model<InferAttributes<AIProject>, InferCreationAttributes<AIProject>> {
  declare id: CreationOptional<string>;

  declare slug: string;

  declare name: Record<string, string>;

  declare subtitle: CreationOptional<Record<string, string>>;

  declare description: Record<string, string>;

  declare promptTemplate: string;

  declare uiConfig: CreationOptional<ProjectUIConfig>;

  declare controlsConfig: CreationOptional<ProjectControlsConfig>;

  declare status: 'active' | 'draft' | 'archived';

  declare metadata: CreationOptional<Record<string, any>>;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  static async validateAndCreate(data: any) {
    const validatedData = await AIProjectSchema.validateAsync(data, { stripUnknown: true });
    const newRecord = await this.create({ ...validatedData });
    return newRecord;
  }

  static async validateAndCreateWithTransaction(data: any, transaction: Transaction) {
    const validatedData = await AIProjectSchema.validateAsync(data, { stripUnknown: true });
    const newRecord = await this.create({ ...validatedData }, { transaction });
    return newRecord;
  }

  /**
   * Find all active projects
   */
  static async findActiveProjects() {
    return this.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Find project by id if active
   */
  static async findActiveById(id: string) {
    return this.findOne({
      where: { id, status: 'active' },
    });
  }

  /**
   * Find project by slug if active
   */
  static async findActiveBySlug(slug: string) {
    return this.findOne({
      where: { slug, status: 'active' },
    });
  }

  /**
   * Get localized name
   */
  getLocalizedName(locale: string = 'en'): string {
    return this.name[locale] || this.name.en || this.name[Object.keys(this.name)[0] || 'en'] || 'Untitled';
  }

  /**
   * Get localized description
   */
  getLocalizedDescription(locale: string = 'en'): string {
    return (
      this.description[locale] ||
      this.description.en ||
      this.description[Object.keys(this.description)[0] || 'en'] ||
      'No description available'
    );
  }

  /**
   * Update project status
   */
  async updateStatus(status: 'active' | 'draft' | 'archived') {
    return this.update({ status });
  }
}

export function initAIProject(sequelize: Sequelize) {
  AIProject.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        defaultValue: nextId,
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'URL path for the project (unique)',
      },
      name: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Multi-language project names',
      },
      subtitle: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Multi-language project subtitles',
      },
      description: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Multi-language project descriptions',
      },
      promptTemplate: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'AI prompt template for this project',
      },
      uiConfig: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'UI configuration including colors, layout, features',
      },
      controlsConfig: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Controls configuration including input settings and dynamic controls',
      },
      status: {
        type: DataTypes.ENUM('active', 'draft', 'archived'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Project status',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional project metadata',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'AIProject',
      tableName: 'ai_projects',
      indexes: [
        {
          fields: ['slug'],
          name: 'idx_ai_projects_slug',
          unique: true,
        },
        {
          fields: ['status'],
          name: 'idx_ai_projects_status',
        },
        {
          fields: ['createdAt'],
          name: 'idx_ai_projects_created_at',
        },
      ],
    },
  );
}
