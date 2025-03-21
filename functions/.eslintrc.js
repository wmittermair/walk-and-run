module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Compiled files
    ".eslintrc.js",
  ],
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": "error"
  },
};
