import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction.belongsTo(models.Account, {
        foreignKey: "accountId",
        as: "account", // Added alias for cleaner queries
      });
    }
  }

  Transaction.init(
    {
      description: DataTypes.STRING,
      amount: DataTypes.DECIMAL,
      date: DataTypes.DATE,
      category: DataTypes.STRING,
      accountId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );

  return Transaction;
};
