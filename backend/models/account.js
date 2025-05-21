"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(models) {
      // Define association here
      Account.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  Account.init(
    {
      name: DataTypes.STRING,
      type: DataTypes.STRING,
      balance: DataTypes.DECIMAL,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Account",
    }
  );

  return Account;
};
