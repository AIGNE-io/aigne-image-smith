import { DataTypes, Sequelize } from 'sequelize';

export const CURRENT_TIMESTAMP = Sequelize.literal('CURRENT_TIMESTAMP');

export const dateColumn = {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: CURRENT_TIMESTAMP,
};
