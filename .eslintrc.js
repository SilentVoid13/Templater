module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module",
    },
    plugins: ["@typescript-eslint"],
    rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
        "@typescript-eslint/ban-ts-comment": "off",
        "no-prototype-builtins": "off",
        "@typescript-eslint/no-empty-function": "off",
    },
};
