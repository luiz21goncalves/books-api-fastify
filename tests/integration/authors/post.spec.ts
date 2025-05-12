import { fakerPT_BR as faker } from '@faker-js/faker'
import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { app } from '../../../src/app'

describe('POST /authors', () => {
  describe('Anonymous user', () => {
    beforeAll(async () => {
      await app.ready()
    })

    afterAll(async () => {
      await app.close()
    })

    test('without body', async () => {
      const response = await supertest(app.server).post('/authors')

      expect(response.status).toEqual(400)
      expect(response.body).toStrictEqual({
        details: [
          {
            instancePath: '/',
            keyword: 'invalid_type',
            message: 'Expected object, received null',
            params: {
              issue: {
                code: 'invalid_type',
                expected: 'object',
                message: 'Expected object, received null',
                path: [],
                received: 'null',
              },
            },
            schemaPath: '#//invalid_type',
          },
        ],
        message: "Request doesn't match the schema",
        name: 'ValidationError',
        status_code: 400,
      })
    })

    test('with invalid name', async () => {
      const response = await supertest(app.server)
        .post('/authors')
        .send({ name: '', avatar_url: faker.image.avatar() })

      expect(response.status).toEqual(400)
      expect(response.body).toStrictEqual({
        message: "Request doesn't match the schema",
        name: 'ValidationError',
        status_code: 400,
        details: [
          {
            instancePath: '/name',
            keyword: 'too_small',
            message: 'String must contain at least 1 character(s)',
            params: {
              issue: {
                code: 'too_small',
                exact: false,
                inclusive: true,
                message: 'String must contain at least 1 character(s)',
                minimum: 1,
                path: ['name'],
                type: 'string',
              },
            },
            schemaPath: '#/name/too_small',
          },
        ],
      })
    })

    test('with invalid avatar_url', async () => {
      const response = await supertest(app.server)
        .post('/authors')
        .send({ name: faker.person.fullName(), avatar_url: '' })

      expect(response.status).toEqual(400)
      expect(response.body).toStrictEqual({
        message: "Request doesn't match the schema",
        name: 'ValidationError',
        status_code: 400,
        details: [
          {
            instancePath: '/avatar_url',
            keyword: 'invalid_string',
            message: 'Invalid url',
            params: {
              issue: {
                code: 'invalid_string',
                message: 'Invalid url',
                path: ['avatar_url'],
                validation: 'url',
              },
            },
            schemaPath: '#/avatar_url/invalid_string',
          },
        ],
      })
    })

    test('with valid data', async () => {
      const name = faker.person.fullName()
      const avatar_url = faker.image.avatar()

      const response = await supertest(app.server)
        .post('/authors')
        .send({ name, avatar_url })

      expect(response.status).toEqual(201)
      expect(response.body).toStrictEqual({
        author: {
          id: expect.any(String),
          name,
          avatar_url,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      })
    })
  })
})
