import { DataTypes } from 'sequelize';

import type { Migration } from '../migrate';
import { dateColumn } from './lib/helper';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('image_generations', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
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
    createdAt: dateColumn,
    updatedAt: dateColumn,
  });

  // Create indexes for better query performance
  await queryInterface.addIndex('image_generations', ['userDid'], {
    name: 'idx_image_generations_user_did',
  });

  await queryInterface.addIndex('image_generations', ['status'], {
    name: 'idx_image_generations_status',
  });

  await queryInterface.addIndex('image_generations', ['clientId'], {
    name: 'idx_image_generations_client_id',
  });

  await queryInterface.addIndex('image_generations', ['createdAt'], {
    name: 'idx_image_generations_created_at',
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  // Drop indexes first
  await queryInterface.removeIndex('image_generations', 'idx_image_generations_user_did');
  await queryInterface.removeIndex('image_generations', 'idx_image_generations_status');
  await queryInterface.removeIndex('image_generations', 'idx_image_generations_client_id');
  await queryInterface.removeIndex('image_generations', 'idx_image_generations_created_at');

  // Drop table
  await queryInterface.dropTable('image_generations');
};
