import { fakerPT_BR as faker } from '@faker-js/faker'

import { db } from './connection'
import { authors, books } from './schemas'

async function seed() {
  await db.delete(books)
  await db.delete(authors)

  const length = faker.helpers.rangeToNumber({ min: 100, max: 200 })
  const authorsData = Array.from({ length }).map(() => {
    return {
      name: faker.book.author(),
      avatar_url: faker.image.avatar(),
    }
  })

  const createdAuthors = await db
    .insert(authors)
    .values(authorsData)
    .returning()

  for (const author of createdAuthors) {
    const length = faker.helpers.rangeToNumber({ min: 1, max: 20 })

    const booksData = Array.from({ length }).map(() => {
      return {
        author_id: author.id,
        name: faker.book.title(),
        cover_url: faker.image.url({
          height: 600,
          width: 400,
        }),
      }
    })

    await db.insert(books).values(booksData)
  }
}

seed()
