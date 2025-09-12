import Joi from 'joi';
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Transaction } from 'sequelize';
import { Worker } from 'snowflake-uuid';

import { sequelize } from '.';

const idGenerator = new Worker();
const nextId = () => idGenerator.nextId().toString();

export interface ProjectI18nContent {
  // 基础UI文本
  ui: {
    title: string;
    subtitle?: string;
    uploadButton: string;
    processButton: string;
    downloadButton: string;
    uploadPlaceholder?: string;
    processingText?: string;
    successText?: string;
    errorText?: string;
    tryAgainButton?: string;
    backButton?: string;
    historyButton?: string;
    creditsText?: string;
  };

  // 功能说明
  features?: string[];
  instructions?: string[];
  tips?: string[];

  // SEO相关
  seo?: {
    title: string;
    description: string;
    keywords: string[];
    imageUrl?: string; // OpenGraph image URL
  };

  // 其他自定义内容
  custom?: Record<string, any>;
}

interface ProjectI18nInput {
  projectId: string;
  locale: string; // 'en', 'zh', 'ja', etc.
  content: ProjectI18nContent;
}

export const ProjectI18nSchema = Joi.object<ProjectI18nInput>({
  projectId: Joi.string().required(),
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
      imageUrl: Joi.string().uri().optional(),
    }).optional(),
    custom: Joi.object().optional(),
  }).required(),
});

export default class ProjectI18n extends Model<InferAttributes<ProjectI18n>, InferCreationAttributes<ProjectI18n>> {
  declare id: CreationOptional<string>;

  declare projectId: string;

  declare locale: string;

  declare content: ProjectI18nContent;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  static async validateAndCreate(data: any) {
    const validatedData = await ProjectI18nSchema.validateAsync(data, { stripUnknown: true });
    const newRecord = await this.create({ ...validatedData });
    return newRecord;
  }

  static async validateAndCreateWithTransaction(data: any, transaction: Transaction) {
    const validatedData = await ProjectI18nSchema.validateAsync(data, { stripUnknown: true });
    const newRecord = await this.create({ ...validatedData }, { transaction });
    return newRecord;
  }

  /**
   * Find i18n content for a project and locale
   */
  static async findByProjectAndLocale(projectId: string, locale: string) {
    return this.findOne({
      where: { projectId, locale },
    });
  }

  /**
   * Find all i18n content for a project
   */
  static async findByProject(projectId: string) {
    return this.findAll({
      where: { projectId },
      order: [['locale', 'ASC']],
    });
  }

  /**
   * Get i18n content with fallback
   * Priority: requested locale -> 'en' -> first available
   */
  static async getWithFallback(projectId: string, locale: string = 'en') {
    // Try to find the requested locale
    let content = await this.findByProjectAndLocale(projectId, locale);

    if (content) {
      return content;
    }

    // Fallback to English
    if (locale !== 'en') {
      content = await this.findByProjectAndLocale(projectId, 'en');
      if (content) {
        return content;
      }
    }

    // Fallback to first available locale
    const firstAvailable = await this.findOne({
      where: { projectId },
      order: [['locale', 'ASC']],
    });

    return firstAvailable;
  }

  /**
   * Update or create i18n content
   */
  static async upsertI18nContent(data: ProjectI18nInput) {
    const validatedData = await ProjectI18nSchema.validateAsync(data, { stripUnknown: true });

    const [record] = await this.findOrCreate({
      where: {
        projectId: validatedData.projectId,
        locale: validatedData.locale,
      },
      defaults: validatedData,
    });

    if (!record.isNewRecord) {
      await record.update({ content: validatedData.content });
    }

    return record;
  }
}

ProjectI18n.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      defaultValue: nextId,
    },
    projectId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'ai_projects',
        key: 'id',
      },
      comment: 'Reference to AI project',
    },
    locale: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: 'Locale code (e.g., en, zh, ja)',
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'I18n content for the project',
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
    modelName: 'ProjectI18n',
    tableName: 'project_i18n',
    indexes: [
      {
        fields: ['projectId'],
        name: 'idx_project_i18n_project_id',
      },
      {
        fields: ['locale'],
        name: 'idx_project_i18n_locale',
      },
      {
        fields: ['projectId', 'locale'],
        name: 'idx_project_i18n_project_locale',
        unique: true,
      },
    ],
  },
);
