import js from '@eslint/js';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';

export default ts.config(
  { ignores: ['.svelte-kit/**', 'build/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    rules: {
      // Storage and background refresh failures are deliberately ignored.
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Routes use shared path helpers; the app is hosted at the domain root.
      'svelte/no-navigation-without-resolve': 'off',
    },
  },
  {
    files: ['src/lib/features/food-item/components/food-stock/food-stock.svelte'],
    rules: {
      // Search state is synchronized with the URL, and the Map is built inside $derived.
      'svelte/prefer-writable-derived': 'off',
      'svelte/prefer-svelte-reactivity': 'off',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
);
