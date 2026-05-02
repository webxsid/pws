import js from "@eslint/js";
import tseslint from "typescript-eslint";

const ignores = {
  ignores: ["dist/**", "coverage/**", ".turbo/**", "**/eslint.config.js"]
};

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ignores,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd()
      }
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-confusing-void-expression": "error"
    }
  }
);
