// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintConfigPrettier = require("eslint-config-prettier/flat");
const simpleImportSort = require("eslint-plugin-simple-import-sort");

const barrelOnlyPatterns = [
  {
    group: ["@/constants/**"],
    message:
      "Import from @/constants barrel only, not @/constants/... subpaths.",
  },
  {
    group: ["@/hooks/*", "@/hooks/*/**"],
    message: "Import from @/hooks barrel only.",
  },
  {
    group: ["@/utils/*", "@/utils/*/**"],
    message: "Import from @/utils barrel only.",
  },
  {
    group: ["@/assets/*", "@/assets/*/**"],
    message: "Import from @/assets barrel only (or @/constants for ASSETS).",
  },
  {
    group: ["shared/*", "shared/**/*"],
    message: 'Import from "shared" only, not shared/... subpaths.',
  },
];

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // TypeScript Rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],

      // Code Quality
      "prefer-const": "error",
      "no-console": ["error", { allow: ["error"] }],

      // Import Organization
      "simple-import-sort/imports": "error",
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            ["internal", "parent", "sibling", "index"],
          ],
        },
      ],

      // File Size Management
      "max-lines": [
        "warn",
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    files: ["*.tsx"],
    rules: {
      // Component Props Naming Convention
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            regex: "^[A-Z][a-zA-Z0-9]+Props$",
            match: true,
          },
        },
      ],
      // Enforce React.FC usage for components
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
      // Enforce consistent component definitions
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
    },
  },
  {
    files: ["components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components", "@/components/**"],
              message:
                "Inside components/, import other components via relative paths, not @/components.",
            },
            ...barrelOnlyPatterns,
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [...barrelOnlyPatterns],
        },
      ],
    },
  },
  {
    // Exempt test files, mockData files, layout files, and hook files from max-lines rule
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/mockData.ts",
      "**/_layout.tsx",
      "hooks/**/*.ts",
    ],
    rules: {
      "max-lines": "off",
    },
  },
  {
    ignores: ["dist/*", "**/__tests__/**", "/.expo", "node_modules"],
  },
  eslintConfigPrettier,
]);
