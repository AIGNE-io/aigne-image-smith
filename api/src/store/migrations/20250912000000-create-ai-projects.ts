import { DataTypes } from 'sequelize';

import type { Migration } from '../migrate';
import { dateColumn } from './lib/helper';

export const up: Migration = async ({ context: queryInterface }) => {
  // Create ai_projects table
  await queryInterface.createTable('ai_projects', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
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
      defaultValue: '{}',
      comment: 'UI configuration including colors, layout, features',
    },
    status: {
      type: DataTypes.ENUM('active', 'draft', 'archived'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Project status',
    },
    logoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Project logo URL',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional project metadata',
    },
    createdAt: dateColumn,
    updatedAt: dateColumn,
  });

  // Create indexes
  await queryInterface.addIndex('ai_projects', ['slug'], {
    name: 'idx_ai_projects_slug',
    unique: true,
  });

  await queryInterface.addIndex('ai_projects', ['status'], {
    name: 'idx_ai_projects_status',
  });

  await queryInterface.addIndex('ai_projects', ['createdAt'], {
    name: 'idx_ai_projects_created_at',
  });

  // Create project_i18n table
  await queryInterface.createTable('project_i18n', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
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
    createdAt: dateColumn,
    updatedAt: dateColumn,
  });

  // Create indexes for project_i18n
  await queryInterface.addIndex('project_i18n', ['projectId'], {
    name: 'idx_project_i18n_project_id',
  });

  await queryInterface.addIndex('project_i18n', ['locale'], {
    name: 'idx_project_i18n_locale',
  });

  await queryInterface.addIndex('project_i18n', ['projectId', 'locale'], {
    name: 'idx_project_i18n_project_locale',
    unique: true,
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  // Drop tables in reverse order
  await queryInterface.dropTable('project_i18n');
  await queryInterface.dropTable('ai_projects');
};
