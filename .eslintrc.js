module.exports = {
  extends: [
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'lf',
        printWidth: 100,
        semi: false,
        singleQuote: true,
        jsxSingleQuote: true,
        trailingComma: 'all',
      },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'off',
    'no-debugger': 'error',
    "@typescript-eslint/no-explicit-any": "off",
    '@typescript-eslint/no-unused-vars': ['warn'],
  },
}
