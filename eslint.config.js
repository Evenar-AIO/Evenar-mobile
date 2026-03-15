import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactNative from "eslint-plugin-react-native";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
      globals: {
        fetch: "readonly",
        require: "readonly",
        alert: "readonly",
        console: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setTimeout: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-native": reactNative,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
      eqeqeq: "error",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-native/no-inline-styles": "warn",
      "react-native/no-unused-styles": "error",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
