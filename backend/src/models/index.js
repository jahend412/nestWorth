import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import Sequelize from "sequelize";
import configData from "../config/config.js";

// ES6 modules don't have __filename, so we create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = configData[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// We need to use await with dynamic imports, so wrap in async IIFE
const setupModels = async () => {
  const files = fs.readdirSync(__dirname).filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  });

  // Using Promise.all to handle all dynamic imports
  await Promise.all(
    files.map(async (file) => {
      const modulePath = path.join(__dirname, file);
      // Dynamic import returns a promise resolving to the module
      const module = await import(`file://${modulePath}`);
      const model = module.default(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    })
  );

  // Set up associations
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
};

// Execute the async function to set up models
await setupModels();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Export the db object
export default db;
