import { randomUUID } from 'node:crypto'

import { relations } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { books } from './books'

export const authors = sqliteTable('authors', {
  id: text()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text().notNull(),
  avatar_url: text().notNull(),
  created_at: text()
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updated_at: text()
    .notNull()
    .$onUpdateFn(() => new Date().toISOString())
    .$defaultFn(() => new Date().toISOString()),
})

export const authorsRelations = relations(authors, ({ many }) => {
  return {
    books: many(books),
  }
})
