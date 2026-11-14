import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/modules/food-item/utils/expiration.ts',
        'src/modules/planned-meal/utils/stock.ts',
        'src/modules/shopping-item/utils/shopping-list.ts',
      ],
      thresholds: { lines: 90, functions: 90, statements: 90, branches: 85 },
    },
  },
});
