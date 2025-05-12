import { fakerPT_BR as faker } from '@faker-js/faker'
import { eq } from 'drizzle-orm'
import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { app } from '../../../../src/app'
import { db } from '../../../../src/db/connection'
import { authorFactory, bookFactory } from '../../../factories'

describe('PATCH /books/:id', () => {
  describe('Anonymous user', () => {
    beforeAll(async () => {
      await app.ready()
    })

    afterAll(async () => {
      await app.close()
    })

    test('when not found book', async () => {
      const response = await supertest(app.server)
        .patch(`/books/${faker.string.uuid()}`)
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
        message: 'Book not found.',
        name: 'NotFoundError',
        status_code: 404,
      })
    })

    test('with invalid book id', async () => {
      const response = await supertest(app.server)
        .patch(`/books/${faker.string.alphanumeric()}`)
        .send({
          author_id: faker.string.uuid(),
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
      })
    })

    test('with empty body', async () => {
      const book = await bookFactory()

      const response = await supertest(app.server)
        .patch(`/books/${book.id}`)
        .send({})

      expect(response.status).toEqual(400)
      expect(response.body).toStrictEqual({
        message: "Request doesn't match the schema",
        name: 'ValidationError',
        status_code: 400,
        details: [
          {
            instancePath: '/',
            keyword: 'custom',
            message: 'Send "cover_url", "name" or "author_id"',
            params: {
              issue: {
                code: 'custom',
                message: 'Send "cover_url", "name" or "author_id"',
                path: [],
              },
            },
            schemaPath: '#//custom',
          },
        ],
      })
    })

    test('with invalid "name"', async () => {
      const book = await bookFactory()

      const response = await supertest(app.server)
        .patch(`/books/${book.id}`)
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

    test('with invalid "author_id"', async () => {
      const book = await bookFactory()

      const response = await supertest(app.server)
        .patch(`/books/${book.id}`)
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

    test('with invalid "cover_url"', async () => {
      const book = await bookFactory()

      const response = await supertest(app.server)
        .patch(`/books/${book.id}`)
        .send({
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

    test('when not found "author"', async () => {
      const book = await bookFactory()

      const response = await supertest(app.server)
        .patch(`/books/${book.id}`)
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

    test('with new "name"', async () => {
      const book = await bookFactory()
      const newName = faker.book.title()

      const response = await supertest(app.server)
        .patch(`/books/${book.id}`)
        .send({
          name: newName,
        })

      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual({
        book: {
          id: book.id,
          name: newName,
          cover_url: book.cover_url,
          author_id: book.author_id,
          created_at: book.created_at,
          updated_at: expect.any(String),
        },
      })
      expect(
        response.body.book.updated_at > response.body.book.created_at,
      ).toBe(true)

      const savedBook = await db.query.books.findFirst({
        where(fields) {
          return eq(fields.id, book.id)
        },
      })

      expect(savedBook?.name).toEqual(newName)
    })

    test('with new "cover_url"', async () => {
      const book = await bookFactory()
      const newCoverUrl = faker.image.url({
        height: 600,
        width: 400,
      })

      const response = await supertest(app.server)
        .patch(`/books/${book.id}`)
        .send({
          cover_url: newCoverUrl,
        })

      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual({
        book: {
          id: book.id,
          name: book.name,
          cover_url: newCoverUrl,
          author_id: book.author_id,
          created_at: book.created_at,
          updated_at: expect.any(String),
        },
      })
      expect(
        response.body.book.updated_at > response.body.book.created_at,
      ).toBe(true)

      const savedBook = await db.query.books.findFirst({
        where(fields) {
          return eq(fields.id, book.id)
        },
      })

      expect(savedBook?.cover_url).toEqual(newCoverUrl)
    })

    test('with new "author_id"', async () => {
      const book = await bookFactory()
      const author = await authorFactory()

      const response = await supertest(app.server)
        .patch(`/books/${book.id}`)
        .send({
          author_id: author.id,
        })

      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual({
        book: {
          id: book.id,
          name: book.name,
          cover_url: book.cover_url,
          author_id: author.id,
          created_at: book.created_at,
          updated_at: expect.any(String),
        },
      })
      expect(
        response.body.book.updated_at > response.body.book.created_at,
      ).toBe(true)

      const savedBook = await db.query.books.findFirst({
        where(fields) {
          return eq(fields.id, book.id)
        },
      })

      expect(savedBook?.author_id).toEqual(author.id)
    })
  })
})
