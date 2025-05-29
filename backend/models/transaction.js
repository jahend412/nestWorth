import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Transaction belongs to User
      Transaction.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });

      // Transaction belongs to Account
      Transaction.belongsTo(models.Account, {
        foreignKey: "accountId",
        as: "account",
        onDelete: "SET NULL", // If account deleted, keep transaction but set account to null
      });
    }

    // Instance method to format amount for display
    getFormattedAmount() {
      const amount = parseFloat(this.amount);
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    }

    // Instance method to check if transaction is recent (within last 7 days)
    isRecent() {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return this.date >= weekAgo;
    }

    // Static method to calculate total for a set of transactions
    static calculateTotal(transactions) {
      return transactions.reduce((total, transaction) => {
        const amount = parseFloat(transaction.amount);
        return transaction.type === "income" ? total + amount : total - amount;
      }, 0);
    }
  }

  Transaction.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        validate: {
          notNull: {
            msg: "User ID is required",
          },
          isInt: {
            msg: "User ID must be an integer",
          },
        },
      },
      accountId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for cash transactions or deleted accounts
        references: {
          model: "Accounts",
          key: "id",
        },
        validate: {
          isInt: {
            msg: "Account ID must be an integer",
          },
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2), // Max 10 digits, 2 decimal places
        allowNull: false,
        validate: {
          notNull: {
            msg: "Amount is required",
          },
          isDecimal: {
            msg: "Amount must be a valid decimal number",
          },
          min: {
            args: [0.01],
            msg: "Amount must be greater than 0",
          },
          max: {
            args: [99999999.99],
            msg: "Amount cannot exceed $99,999,999.99",
          },
        },
      },
      type: {
        type: DataTypes.ENUM("income", "expense"),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Transaction type is required",
          },
          isIn: {
            args: [["income", "expense"]],
            msg: "Transaction type must be either income or expense",
          },
        },
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Category is required",
          },
          notEmpty: {
            msg: "Category cannot be empty",
          },
          len: {
            args: [1, 50],
            msg: "Category must be between 1 and 50 characters",
          },
        },
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: "Description cannot exceed 255 characters",
          },
        },
      },
      date: {
        type: DataTypes.DATEONLY, // Only date, no time
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          notNull: {
            msg: "Transaction date is required",
          },
          isDate: {
            msg: "Date must be a valid date",
          },
          isNotFuture(value) {
            const today = new Date();
            const transactionDate = new Date(value);
            if (transactionDate > today) {
              throw new Error("Transaction date cannot be in the future");
            }
          },
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 1000],
            msg: "Notes cannot exceed 1000 characters",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Transaction",
      tableName: "Transactions",
      timestamps: true, // Adds createdAt and updatedAt
      indexes: [
        // Index for faster queries on user's transactions
        {
          fields: ["userId"],
        },
        // Index for filtering by date
        {
          fields: ["date"],
        },
        // Index for category filtering
        {
          fields: ["category"],
        },
        // Compound index for user + date queries (common for dashboards)
        {
          fields: ["userId", "date"],
        },
        // Compound index for budget calculations
        {
          fields: ["userId", "category", "date"],
        },
      ],
      hooks: {
        // Hook to update account balance when transaction is created
        afterCreate: async (transaction, options) => {
          if (transaction.accountId) {
            const { Account } = sequelize.models;
            const account = await Account.findByPk(transaction.accountId);

            if (account) {
              const balanceChange =
                transaction.type === "income"
                  ? parseFloat(transaction.amount)
                  : -parseFloat(transaction.amount);

              await account.update(
                {
                  balance: parseFloat(account.balance) + balanceChange,
                },
                { transaction: options.transaction }
              );
            }
          }
        },

        // Hook to update account balance when transaction is updated
        afterUpdate: async (transaction, options) => {
          if (transaction.accountId && transaction.changed("amount")) {
            const { Account } = sequelize.models;
            const account = await Account.findByPk(transaction.accountId);

            if (account) {
              // Calculate the difference between old and new amounts
              const oldAmount = parseFloat(
                transaction._previousDataValues.amount
              );
              const newAmount = parseFloat(transaction.amount);
              const oldBalanceChange =
                transaction.type === "income" ? oldAmount : -oldAmount;
              const newBalanceChange =
                transaction.type === "income" ? newAmount : -newAmount;
              const netChange = newBalanceChange - oldBalanceChange;

              await account.update(
                {
                  balance: parseFloat(account.balance) + netChange,
                },
                { transaction: options.transaction }
              );
            }
          }
        },

        // Hook to update account balance when transaction is deleted
        afterDestroy: async (transaction, options) => {
          if (transaction.accountId) {
            const { Account } = sequelize.models;
            const account = await Account.findByPk(transaction.accountId);

            if (account) {
              const balanceChange =
                transaction.type === "income"
                  ? -parseFloat(transaction.amount)
                  : parseFloat(transaction.amount);

              await account.update(
                {
                  balance: parseFloat(account.balance) + balanceChange,
                },
                { transaction: options.transaction }
              );
            }
          }
        },
      },
      scopes: {
        // Scope for getting only income transactions
        income: {
          where: {
            type: "income",
          },
        },
        // Scope for getting only expense transactions
        expenses: {
          where: {
            type: "expense",
          },
        },
        // Scope for getting recent transactions (last 30 days)
        recent: {
          where: {
            date: {
              [sequelize.Sequelize.Op.gte]: sequelize.Sequelize.literal(
                "CURRENT_DATE - INTERVAL '30 days'"
              ),
            },
          },
        },
        // Scope for getting transactions by category
        byCategory: (category) => ({
          where: {
            category: category,
          },
        }),
      },
    }
  );

  return Transaction;
};
