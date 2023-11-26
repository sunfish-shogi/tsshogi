module.exports = {
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  rules: {
    "no-console": "error",
    "no-debugger": "error",
    "no-restricted-imports": ["error", { patterns: ["../"] }],
    "no-irregular-whitespace": "off",
  },
};
