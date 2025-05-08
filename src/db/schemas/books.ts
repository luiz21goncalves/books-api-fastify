import { randomUUID } from 'crypto'
import { relations } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { authors } from './author'

export const books = sqliteTable('books', {
  id: text()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text().notNull(),
  cover_url: text().notNull(),
  author_id: text()
    .notNull()
    .references(() => authors.id, { onDelete: 'cascade' }),
  created_at: text()
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updated_at: text()
    .notNull()
    .$onUpdateFn(() => new Date().toISOString())
    .$defaultFn(() => new Date().toISOString()),
})

export const booksRelations = relations(books, ({ one }) => {
  return {
    author: one(authors, {
      references: [authors.id],
      fields: [books.author_id],
      relationName: 'book_author',
    }),
  }
})
