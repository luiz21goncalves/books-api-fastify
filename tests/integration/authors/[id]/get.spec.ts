import { fakerPT_BR as faker } from '@faker-js/faker'
import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { app } from '../../../../src/app'
import { authorFactory } from '../../../factories'

describe('GET /authors/:id', () => {
  describe('Anonymous user', () => {
    beforeAll(async () => {
      await app.ready()
    })

    afterAll(async () => {
      await app.close()
    })

    test('when not found author', async () => {
      const response = await supertest(app.server).get(
        `/authors/${faker.string.uuid()}`,
      )

      expect(response.status).toEqual(404)
      expect(response.body).toStrictEqual({
        message: 'Author not found.',
        name: 'NotFoundError',
        status_code: 404,
      })
    })

    test('with invalid author id', async () => {
      const response = await supertest(app.server).get(
        `/authors/${faker.string.alphanumeric()}`,
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

    test('with valid author id', async () => {
      const author = await authorFactory()

      const response = await supertest(app.server).get(`/authors/${author.id}`)

      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual({
        author,
      })
    })
  })
})
