import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import neostandard, { plugins } from 'neostandard'

export default [
  ...neostandard({ env: ['node'], ts: true }),
  plugins['@stylistic'].configs['recommended-flat'],
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          arrowParens: 'always',
          printWidth: 80,
          semi: false,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
        },
      ],
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
    },
  },
  {
    rules: {
      camelcase: ['off'],
    },
  },
  eslintPluginPrettierRecommended,
]
