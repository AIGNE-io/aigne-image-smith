import { DataTypes } from 'sequelize';

import type { Migration } from '../migrate';

export const up: Migration = async ({ context: queryInterface }) => {
  // Add usageCount column to ai_projects table
  await queryInterface.addColumn('ai_projects', 'usageCount', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of times this project has been used for AI generation',
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  // Remove usageCount column from ai_projects table
  await queryInterface.removeColumn('ai_projects', 'usageCount');
};
