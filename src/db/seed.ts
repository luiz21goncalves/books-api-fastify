import { fakerPT_BR as faker } from '@faker-js/faker'

import { db } from './connection'
import { authors } from './schemas'

async function seed() {
  const authorsData = Array.from({ length: 100 }).map(() => {
    return {
      name: faker.person.fullName(),
      avatar_url: faker.image.avatar(),
    }
  })

  await db.insert(authors).values(authorsData)
}

seed()
