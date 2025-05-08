import { defineConfig } from 'drizzle-kit'

import { ENV } from './src/env'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schemas/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: ENV.DATABASE_URL,
  },
})
