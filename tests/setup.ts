import { execSync } from 'node:child_process'

import { afterAll, beforeAll } from 'vitest'

import { db } from '../src/db/connection'
import { authors, books } from '../src/db/schemas'

beforeAll(async () => {
  execSync('pnpm drizzle-kit migrate')
})

afterAll(async () => {
  await db.delete(books)
  await db.delete(authors)
})
