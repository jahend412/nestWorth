"use strict";
import { Model } from "sequelize";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      User.hasMany(models.Account, {
        foreignKey: "userId",
        as: "accounts",
      });
    }

    // Instance method to check if password is correct
    async correctPassword(candidatePassword, userPassword) {
      return await bcrypt.compare(candidatePassword, userPassword);
    }

    // Instance method to check if password was changed after token was issued
    changedPasswordAfter(JWTTimestamp) {
      if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
          this.passwordChangedAt.getTime() / 1000,
          10
        );
        return JWTTimestamp < changedTimestamp;
      }
      return false;
    }

    // Instance method to create password reset token
    createPasswordResetToken() {
      const resetToken = crypto.randomBytes(32).toString("hex");

      this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      return resetToken;
    }
  }

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "user",
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        // Hash password before creating new user
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, 12);
        },
        // Update passwordChangedAt when password changes
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 12);
            user.passwordChangedAt = new Date(Date.now() - 1000);
          }
        },
      },
    }
  );

  return User;
};
