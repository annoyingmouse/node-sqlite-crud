import fs from "node:fs"; // Use 'node:' prefix for clarity with built-in modules
import path from "node:path";
import { fileURLToPath } from "node:url"; // To get __filename equivalent
import { dirname } from "node:path"; // To get __dirname equivalent

import Sequelize, { DataTypes } from "sequelize"; // Import DataTypes directly

// Get __filename and __dirname equivalents for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

// Option 1: Modern way to import JSON (Node.js 17.5.0+ with "type": "module")
import allConfigs from "../config/config.json" with { type: "json" };
const config = allConfigs[env];

/*
// Option 2: Fallback for older Node.js or if import assertions are not preferred
// This reads the JSON file synchronously.
const configPath = path.resolve(__dirname, '../config/config.json');
const rawConfig = fs.readFileSync(configPath, 'utf8');
const allConfigs = JSON.parse(rawConfig);
const config = allConfigs[env];
*/

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

// Dynamically import models asynchronously using Top-Level Await
// This entire section will pause execution until all models are loaded
const modelFiles = fs.readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  );
});

// Use Promise.all to await all dynamic imports
await Promise.all(
  modelFiles.map(async (file) => {
    // Dynamic import returns a Module object, we need its default export
    const modelDefinition = (await import(path.join(__dirname, file))).default;
    // Pass the Sequelize instance and DataTypes object to the model definition function
    const model = modelDefinition(sequelize, DataTypes);
    db[model.name] = model;
  }),
);

// After all models are loaded and defined, run their associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Export the db object (which contains all models, sequelize instance, etc.)
export default db;
