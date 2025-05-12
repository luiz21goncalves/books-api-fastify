import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { app } from '../../../src/app'
import { bookFactory } from '../../factories'

describe('GET /books', () => {
  describe('Anonymous user', () => {
    beforeAll(async () => {
      await app.ready()
    })

    afterAll(async () => {
      await app.close()
    })

    test('without authors', async () => {
      const response = await supertest(app.server).get('/books')

      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual({
        books: [],
      })
    })

    test('with authors', async () => {
      const book1 = await bookFactory()
      const book2 = await bookFactory()

      const response = await supertest(app.server).get('/books')

      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual({
        books: [book2, book1],
      })
    })
  })
})
