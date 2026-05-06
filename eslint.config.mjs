import js from "@eslint/js";
import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".next/**",
      ".vercel/**",
      ".claude/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  sonarjs.configs.recommended,
  {
    files: ["*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Math.random in animation/particle code is the right primitive.
      "sonarjs/pseudo-random": "off",
      // Cognitive-complexity surfaces real refactor candidates — keep visible.
      "sonarjs/cognitive-complexity": "warn",
      // Nested-function depth is a Java/OO heuristic that misfits browser
      // callback orchestration (setTimeout inside forEach inside listeners).
      "sonarjs/no-nested-functions": "off",
      // Time-band / state branches with intentionally-equal handlers are a
      // readability-vs-DRY tradeoff; surface as warnings, not errors.
      "sonarjs/no-duplicated-branches": "warn",
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}", "*.config.{js,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
