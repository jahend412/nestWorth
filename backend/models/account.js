"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(_models) {
      // belongsTo User
      Account.belongsTo(_models.User, {
        foreignKey: "userId",
        as: "user",
      });

      // hasMany Transactions (when you create Transaction model)
      Account.hasMany(_models.Transaction, {
        foreignKey: "accountId",
        as: "transactions",
        onDelete: "CASCADE",
      });
    }

    // Instance methods
    async updateBalance() {
      // This will calculate balance from transactions
      const transactions = await this.getTransactions();
      const newBalance = transactions.reduce((sum, transaction) => {
        return sum + parseFloat(transaction.amount);
      }, 0);

      this.balance = newBalance;
      await this.save();
      return this.balance;
    }

    // Check if account belongs to user
    belongsToUser(userId) {
      return this.userId === userId;
    }

    // Format balance for display
    getFormattedBalance() {
      return `$${parseFloat(this.balance).toFixed(2)}`;
    }
  }

  Account.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "User ID is required",
          },
          isInit: {
            mes: "User ID must be an integer",
          },
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Account name is required",
          },
          notEmpty: {
            msg: "Account name cannot be empty",
          },
          len: {
            args: [1, 100],
            msg: "Account name must be between 1 and 100 characters",
          },
        },
      },
      type: {
        type: DataTypes.ENUM(
          "checking",
          "savings",
          "credit",
          "investment",
          "other"
        ),
        allowNull: false,
        defaultValue: "checking",
        validate: {
          isIn: {
            args: [["checking", "saving", "credit", "investment", "other"]],
            msg: "Account type must be checking, savings, credit, investment, or other",
          },
        },
      },
      balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          isDecimal: {
            msg: "Balance must be a valid decimal number",
          },
          min: {
            args: [-999999999.99], // Allow negative for credit accounts
            msg: "Balance cannot be less than -$999,999,999.99",
          },
          max: {
            args: [999999999.99],
            msg: "Balance cannot exceed $999,999,999.99",
          },
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Account",
      tableName: "Accounts",
      indexes: [
        { fields: ["userId"] },
        { fields: ["type"] },
        { fields: ["isActive"] },
      ],
    }
  );
  return Account;
};
