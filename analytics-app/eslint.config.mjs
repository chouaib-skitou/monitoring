import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';

export default defineConfig([
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      'prettier/prettier': 'error'
    }
  }
]);
