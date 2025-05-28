"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Accounts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "Cascade",
        onDelete: "Cascade",
      },
      name: {
        type: Sequelize.STRING(100), // Limit for length set to 100
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      type: {
        type: Sequelize.ENUM(
          "checking",
          "savings",
          "credit",
          "investment",
          "other"
        ), // ENUM restricts to only the specified options
        allowNull: false,
        defaultValue: "checking",
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2), // Total of 12 digits, 2 after the decimal
        allowNull: false,
        defaultValue: 0.0,
      },
      // isActive serves as a soft delete, this preserves data while hiding them from normal queries
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Indexes
    await queryInterface.addIndex("Accounts", ["userId"]);
    await queryInterface.addIndex("Accounts", ["type"]);
    await queryInterface.addIndex("Accounts", ["isActive"]);
  },
  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable("Accounts");
  },
};
