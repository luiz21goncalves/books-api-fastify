import { fakerPT_BR as faker } from '@faker-js/faker'
import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { app } from '../../../../src/app'
import { bookFactory } from '../../../factories'

describe('GET /books/:id', () => {
  describe('Anonymous user', () => {
    beforeAll(async () => {
      await app.ready()
    })

    afterAll(async () => {
      await app.close()
    })

    test('when not found book', async () => {
      const response = await supertest(app.server).get(
        `/books/${faker.string.uuid()}`,
      )

      expect(response.status).toEqual(404)
      expect(response.body).toStrictEqual({
        message: 'Book not found.',
        name: 'NotFoundError',
        status_code: 404,
      })
    })

    test('with invalid book id', async () => {
      const response = await supertest(app.server).get(
        `/books/${faker.string.alphanumeric()}`,
      )

      expect(response.status).toEqual(400)
      expect(response.body).toStrictEqual({
        details: [
          {
            instancePath: '/id',
            keyword: 'invalid_string',
            message: 'Invalid uuid',
            params: {
              issue: {
                code: 'invalid_string',
                message: 'Invalid uuid',
                path: ['id'],
                validation: 'uuid',
              },
            },
            schemaPath: '#/id/invalid_string',
          },
        ],
        message: "Request doesn't match the schema",
        name: 'ValidationError',
        status_code: 400,
      })
    })

    test('with valid book id', async () => {
      const book = await bookFactory()

      const response = await supertest(app.server).get(`/books/${book.id}`)

      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual({
        book,
      })
    })
  })
})
