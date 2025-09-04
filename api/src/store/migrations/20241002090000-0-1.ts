import { DataTypes } from 'sequelize';

import type { Migration } from '../migrate';
import { dateColumn } from './lib/helper';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('TestModel', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    desc: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    createdAt: dateColumn,
    updatedAt: dateColumn,
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  // 删除表
  await queryInterface.dropTable('TestModel');
};
