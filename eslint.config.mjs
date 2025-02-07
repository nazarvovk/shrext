import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...tseslint.configs.recommended,
  ...compat.config({
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  }),
  ...compat.config({
    plugins: ['prettier'],
    extends: 'prettier',
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
    },
  }),
  ...compat.config({
    extends: 'plugin:jest/recommended',
  }),
  ...compat.config({
    rules: {
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-unused-vars': 'off',
      'no-debugger': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
    },
  }),
]

export default eslintConfig
