import { fakerPT_BR as faker } from '@faker-js/faker'

import { db } from './connection'
import { authors, books } from './schemas'

async function seed() {
  await db.delete(authors)
  await db.delete(books)

  const authorsData = Array.from({ length: 100 }).map(() => {
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
    const booksData = Array.from({
      length: faker.helpers.rangeToNumber({ min: 1, max: 20 }),
    }).map(() => {
      return {
        author_id: author.id,
        name: faker.book.title(),
        cover_url: faker.image.urlLoremFlickr({ category: 'books' }),
      }
    })

    await db.insert(books).values(booksData)
  }
}

seed()
