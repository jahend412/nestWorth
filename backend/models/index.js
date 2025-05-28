import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, basename } from "path";
import { Sequelize, DataTypes } from "sequelize";

// Get current file path and directory (ES6 equivalent of __filename and __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const currentBasename = basename(__filename);

// Read config
const env = process.env.NODE_ENV || "development";
const configFile = readFileSync(
  join(__dirname, "../config/config.json"),
  "utf8"
);
const config = JSON.parse(configFile)[env];

// Initialize Sequelize
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

const db = {};

// Get all model files
const modelFiles = readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== currentBasename &&
    file.slice(-3) === ".js" &&
    file.indexOf(".test.js") === -1
  );
});

// Import models dynamically
for (const file of modelFiles) {
  const modelPath = `file://${join(__dirname, file)}`;
  const { default: modelFunction } = await import(modelPath);
  const model = modelFunction(sequelize, DataTypes);
  db[model.name] = model;
}

// Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Export individual models and the db object
export const { User, Account } = db;
export { sequelize };
export default db;
