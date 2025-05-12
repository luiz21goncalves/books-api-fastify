import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'

import { Environment } from 'vitest/environments'

export default <Environment>{
  name: 'drizzle',
  transformMode: 'ssr',
  async setup() {
    const path = `./tmp/test-${randomUUID()}.db`

    process.env.DATABASE_URL = `file:${path}`

    execSync('pnpm drizzle-kit migrate')
    return {
      async teardown() {
        await rm(path)
      },
    }
  },
}
