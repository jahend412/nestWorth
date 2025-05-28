"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(_models) {
      // define association here
    }
  }
  Account.init(
    {
      userId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      type: DataTypes.STRING,
      balance: DataTypes.DECIMAL,
      isActive: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Account",
    }
  );
  return Account;
};
