import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node, // Adds Node.js globals like process, __dirname, Buffer
        ...globals.es2021, // Adds modern JavaScript globals like Promise, globalThis
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules, // Apply ESLint recommended rules
    },
  },
];
