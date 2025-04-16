import { parserOptions, rules, plugins, languageOptions } from './eslint-setup.js';
import prettier from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['node_modules', 'dist', 'build'],
    languageOptions,
    plugins,
    rules,
  },
  prettier,
];
