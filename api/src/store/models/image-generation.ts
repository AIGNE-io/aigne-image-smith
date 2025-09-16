import Joi from 'joi';
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Transaction } from 'sequelize';
import { Worker } from 'snowflake-uuid';

import { sequelize } from '.';

const idGenerator = new Worker();
const nextId = () => idGenerator.nextId().toString();

interface ImageGenerationInput {
  userDid: string;
  originalImg?: string;
  generatedImg: string;
  clientId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  creditsConsumed: number;
  processingTimeMs?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export const ImageGenerationSchema = Joi.object<ImageGenerationInput>({
  userDid: Joi.string().required(),
  originalImg: Joi.string().optional().allow(''), // Allow empty for text-only projects
  generatedImg: Joi.string().optional().allow(''),
  clientId: Joi.string().required(),
  status: Joi.string().valid('pending', 'processing', 'completed', 'failed').default('pending'),
  creditsConsumed: Joi.number().integer().min(0).required(),
  processingTimeMs: Joi.number().integer().min(0).optional(),
  errorMessage: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

export default class ImageGeneration extends Model<
  InferAttributes<ImageGeneration>,
  InferCreationAttributes<ImageGeneration>
> {
  declare id: CreationOptional<string>;

  declare userDid: string;

  declare originalImg: CreationOptional<string>;

  declare generatedImg: string;

  declare clientId: string;

  declare status: 'pending' | 'processing' | 'completed' | 'failed';

  declare creditsConsumed: number;

  declare processingTimeMs: CreationOptional<number>;

  declare errorMessage: CreationOptional<string>;

  declare metadata: CreationOptional<Record<string, any>>;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  static async validateAndCreate(data: any) {
    const validatedData = await ImageGenerationSchema.validateAsync(data, { stripUnknown: true });
    const newRecord = await this.create({ ...validatedData });
    return newRecord;
  }

  static async validateAndCreateWithTransaction(data: any, transaction: Transaction) {
    const validatedData = await ImageGenerationSchema.validateAsync(data, { stripUnknown: true });
    const newRecord = await this.create({ ...validatedData }, { transaction });
    return newRecord;
  }

  /**
   * Find user's image generation history
   */
  static async findByUser(userDid: string, limit: number = 50, offset: number = 0) {
    return this.findAll({
      where: { userDid },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  /**
   * Get user's generation statistics
   */
  static async getUserStats(userDid: string) {
    const totalGenerations = await this.count({ where: { userDid } });
    const completedGenerations = await this.count({
      where: {
        userDid,
        status: 'completed',
      },
    });
    const totalCreditsSpent = (await this.sum('creditsConsumed', { where: { userDid } })) || 0;

    return {
      totalGenerations,
      completedGenerations,
      totalCreditsSpent,
      successRate: totalGenerations > 0 ? (completedGenerations / totalGenerations) * 100 : 0,
    };
  }

  /**
   * Update generation status
   */
  async updateStatus(
    status: 'pending' | 'processing' | 'completed' | 'failed',
    options: {
      processingTimeMs?: number;
      errorMessage?: string;
      metadata?: Record<string, any>;
    } = {},
  ) {
    return this.update({
      status,
      processingTimeMs: options.processingTimeMs,
      errorMessage: options.errorMessage,
      metadata: options.metadata ? { ...this.metadata, ...options.metadata } : this.metadata,
    });
  }
}

ImageGeneration.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      defaultValue: nextId,
    },
    userDid: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'DID of the user who requested the generation',
    },
    originalImg: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL of the original image (for restoration/colorization)',
    },
    generatedImg: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'URL of the generated/processed image',
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'DID of the client blocklet making the request',
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Current status of the generation process',
    },
    creditsConsumed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Number of credits consumed for this operation',
    },
    processingTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Processing time in milliseconds',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if generation failed',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional metadata about the generation process',
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
    modelName: 'ImageGeneration',
    tableName: 'image_generations',
    indexes: [
      {
        fields: ['userDid'],
        name: 'idx_image_generations_user_did',
      },
      {
        fields: ['status'],
        name: 'idx_image_generations_status',
      },
      {
        fields: ['clientId'],
        name: 'idx_image_generations_client_id',
      },
      {
        fields: ['createdAt'],
        name: 'idx_image_generations_created_at',
      },
    ],
  },
);
