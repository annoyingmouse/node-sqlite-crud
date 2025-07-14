import Sequelize, { DataTypes } from "sequelize"; // Import DataTypes directly
const env = process.env.NODE_ENV || "development";
import allConfigs from "../config/config.json" with { type: "json" };
const config = allConfigs[env];

const sequelize = new Sequelize(config);
export const User = sequelize.define("User", {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
});
