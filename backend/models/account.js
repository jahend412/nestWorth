import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(models) {
      Account.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }

    getFormattedBalance() {
      return `$${parseFloat(this.balance).toFixed(2)}`;
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
