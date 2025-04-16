/** @type {import('eslint').Linter.FlatConfig['parserOptions']} */
export const parserOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

/** @type {import('eslint').Linter.FlatConfig['rules']} */
export const rules = {
  semi: ['off'],
  quotes: ['error', 'single'],
  indent: ['error', 2],
  'prettier/prettier': [
    'error',
    {
      endOfLine: 'lf',
      semi: false,
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 100,
      tabWidth: 2,
    },
  ],
}

/** @type {import('eslint').Linter.FlatConfig['plugins']} */
export const plugins = {
  prettier: require('eslint-plugin-prettier'),
}

/** @type {import('eslint').Linter.FlatConfig['languageOptions']} */
export const languageOptions = {
  parserOptions,
  ecmaVersion: 'latest',
}
