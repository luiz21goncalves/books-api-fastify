import { defaultExclude, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      exclude: [...defaultExclude, './drizzle.config.ts'],
    },
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
  },
})
