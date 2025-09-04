import Joi from 'joi';
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Transaction } from 'sequelize';
import { Worker } from 'snowflake-uuid';

import { sequelize } from '.';

const idGenerator = new Worker();
const nextId = () => idGenerator.nextId().toString();

interface TestModelInput {
  name: string;
  desc: string;
}

export const ActionPlanSchema = Joi.object<TestModelInput>({
  name: Joi.string().allow('').required(),
  desc: Joi.string().required(),
});

export default class TestModel extends Model<InferAttributes<TestModel>, InferCreationAttributes<TestModel>> {
  declare id: string;

  declare name: string;

  declare desc: string;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  static async validateAndCreate(data: any) {
    await ActionPlanSchema.validateAsync(data, { stripUnknown: true });
    const newRecord = await this.create({ ...data });
    return newRecord;
  }

  static async validateAndCreateWithTransaction(data: any, transaction: Transaction) {
    await ActionPlanSchema.validateAsync(data, { stripUnknown: true });
    const newRecord = await this.create({ ...data }, { transaction });
    return newRecord;
  }
}

TestModel.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      defaultValue: nextId,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'TestModel',
    tableName: 'TestModel',
  },
);
