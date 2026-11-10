import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)), 'server-only': fileURLToPath(new URL('./src/test/server-only-stub.ts', import.meta.url)) } },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 20000,
    env: { DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgresql://postgres@localhost:5432/atlas_test', ATLAS_CONTENT_MIN_REVIEW: 'agent_reviewed' },
  },
});
