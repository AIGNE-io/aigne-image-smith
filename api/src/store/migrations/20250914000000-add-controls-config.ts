import { DataTypes } from 'sequelize';

import type { Migration } from '../migrate';

export const up: Migration = async ({ context: queryInterface }) => {
  // Add controlsConfig column to ai_projects table
  await queryInterface.addColumn('ai_projects', 'controlsConfig', {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: '{}',
    comment: 'Controls configuration including input settings and dynamic controls',
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  // Remove controlsConfig column from ai_projects table
  await queryInterface.removeColumn('ai_projects', 'controlsConfig');
};
