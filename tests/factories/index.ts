import { fakerPT_BR as faker } from '@faker-js/faker'

import { db } from '../../src/db/connection'
import { authors, books } from '../../src/db/schemas'

export async function authorFactory(override?: typeof authors.$inferInsert) {
  const [author] = await db
    .insert(authors)
    .values({
      name: faker.book.author(),
      avatar_url: faker.image.avatar(),
      ...override,
    })
    .returning()

  return author
}

export async function bookFactory(
  override?: Omit<typeof books.$inferInsert, 'author_id'>,
) {
  const author = await authorFactory()

  const [book] = await db
    .insert(books)
    .values({
      name: faker.book.title(),
      cover_url: faker.image.url({
        height: 600,
        width: 400,
      }),
      author_id: author.id,
      ...override,
    })
    .returning()

  return book
}
