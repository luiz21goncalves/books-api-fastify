import { fakerPT_BR as faker } from '@faker-js/faker'
import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { app } from '../../../src/app'
import { authorFactory } from '../../factories'

describe('POST /books', () => {
  describe('Anonymous user', () => {
    beforeAll(async () => {
      await app.ready()
    })

    afterAll(async () => {
      await app.close()
    })

    test('without body', async () => {
      const response = await supertest(app.server).post('/books')

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

    test('with invalid "author_id"', async () => {
      const response = await supertest(app.server)
        .post('/books')
        .send({
          author_id: '',
          name: faker.book.title(),
          cover_url: faker.image.url({
            height: 600,
            width: 400,
          }),
        })

      expect(response.status).toEqual(400)
      expect(response.body).toStrictEqual({
        message: "Request doesn't match the schema",
        name: 'ValidationError',
        status_code: 400,
        details: [
          {
            instancePath: '/author_id',
            keyword: 'invalid_string',
            message: 'Invalid uuid',
            params: {
              issue: {
                code: 'invalid_string',
                message: 'Invalid uuid',
                path: ['author_id'],
                validation: 'uuid',
              },
            },
            schemaPath: '#/author_id/invalid_string',
          },
        ],
      })
    })

    test('when author_id not found', async () => {
      const response = await supertest(app.server)
        .post('/books')
        .send({
          author_id: faker.string.uuid(),
          name: faker.book.title(),
          cover_url: faker.image.url({
            height: 600,
            width: 400,
          }),
        })

      expect(response.status).toEqual(404)
      expect(response.body).toStrictEqual({
        message: 'Author not found.',
        name: 'NotFoundError',
        status_code: 404,
      })
    })

    test('with invalid "name"', async () => {
      const response = await supertest(app.server)
        .post('/books')
        .send({
          author_id: faker.string.uuid(),
          name: '',
          cover_url: faker.image.url({
            height: 600,
            width: 400,
          }),
        })

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

    test('with invalid "cover_url"', async () => {
      const response = await supertest(app.server).post('/books').send({
        author_id: faker.string.uuid(),
        name: faker.book.title(),
        cover_url: '',
      })

      expect(response.status).toEqual(400)
      expect(response.body).toStrictEqual({
        message: "Request doesn't match the schema",
        name: 'ValidationError',
        status_code: 400,
        details: [
          {
            instancePath: '/cover_url',
            keyword: 'invalid_string',
            message: 'Invalid url',
            params: {
              issue: {
                code: 'invalid_string',
                message: 'Invalid url',
                path: ['cover_url'],
                validation: 'url',
              },
            },
            schemaPath: '#/cover_url/invalid_string',
          },
        ],
      })
    })

    test('with valid data', async () => {
      const author = await authorFactory()
      const name = faker.book.title()
      const cover_url = faker.image.url({
        height: 600,
        width: 400,
      })

      const response = await supertest(app.server).post('/books').send({
        author_id: author.id,
        name,
        cover_url,
      })

      expect(response.status).toEqual(201)
      expect(response.body).toStrictEqual({
        book: {
          id: expect.any(String),
          name,
          cover_url,
          author_id: author.id,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      })
    })
  })
})
