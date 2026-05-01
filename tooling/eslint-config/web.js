import base from "./base.js";

export default [
  ...base,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly"
      }
    }
  }
];
