import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    env: {
      FRONTEND_URL: 'http://localhost:3001',
      TURSO_DATABASE_URL: 'file::memory:',
      TURSO_AUTH_TOKEN: 'dummy',
    },
  },
});
