import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/lib/features/food-item/validations/food-item.ts',
        'src/lib/features/auth/validations/auth.ts',
        'src/lib/features/household/validations/household.ts',
      ],
      thresholds: { lines: 90, functions: 90, statements: 90, branches: 85 },
    },
  },
});
