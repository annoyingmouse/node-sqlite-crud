import Sequelize, { DataTypes } from "sequelize"; // Import DataTypes directly

const env = process.env.NODE_ENV || "development";

import allConfigs from "../config/config.json" with { type: "json" };

const config = allConfigs[env];

const sequelize = new Sequelize(config);

export const Task = sequelize.define("Task", {
  title: DataTypes.STRING,
  description: DataTypes.STRING,
  status: DataTypes.STRING,
  dueDate: DataTypes.DATE,
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Users", // Ensure this matches the User model name
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
});
