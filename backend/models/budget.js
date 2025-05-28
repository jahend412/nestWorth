import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Budget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      Budget.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  Budget.init(
    {
      name: DataTypes.STRING,
      amount: DataTypes.DECIMAL,
      period: DataTypes.STRING,
      category: DataTypes.STRING,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Budget",
    }
  );

  return Budget;
};
