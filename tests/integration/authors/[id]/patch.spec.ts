import { fakerPT_BR as faker } from '@faker-js/faker'
import { eq } from 'drizzle-orm'
import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { app } from '../../../../src/app'
import { db } from '../../../../src/db/connection'
import { authorFactory } from '../../../factories'

describe('PATCH /authors/:id', () => {
  describe('Anonymous user', () => {
    beforeAll(async () => {
      await app.ready()
    })

    afterAll(async () => {
      await app.close()
    })

    test('when not found author', async () => {
      const response = await supertest(app.server)
        .patch(`/authors/${faker.string.uuid()}`)
        .send({
          name: faker.book.author(),
          avatar_url: faker.image.avatar(),
        })

      expect(response.status).toEqual(404)
      expect(response.body).toStrictEqual({
        message: 'Author not found.',
        name: 'NotFoundError',
        status_code: 404,
      })
    })

    test('with invalid author id', async () => {
      const response = await supertest(app.server)
        .patch(`/authors/${faker.string.alphanumeric()}`)
        .send({
          name: faker.book.author(),
          avatar_url: faker.image.avatar(),
        })

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

    test('with empty body', async () => {
      const author = await authorFactory()

      const response = await supertest(app.server)
        .patch(`/authors/${author.id}`)
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
            message: 'Send "name" or "avatar_url"',
            params: {
              issue: {
                code: 'custom',
                message: 'Send "name" or "avatar_url"',
                path: [],
              },
            },
            schemaPath: '#//custom',
          },
        ],
      })
    })

    test('with invalid "name', async () => {
      const author = await authorFactory()

      const response = await supertest(app.server)
        .patch(`/authors/${author.id}`)
        .send({ name: '' })

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

    test('with invalid "avatar_url', async () => {
      const author = await authorFactory()

      const response = await supertest(app.server)
        .patch(`/authors/${author.id}`)
        .send({ avatar_url: '' })

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

    test('with new "name"', async () => {
      const author = await authorFactory()
      const newName = faker.book.author()

      const response = await supertest(app.server)
        .patch(`/authors/${author.id}`)
        .send({
          name: newName,
        })

      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual({
        author: {
          id: author.id,
          name: newName,
          avatar_url: author.avatar_url,
          created_at: author.created_at,
          updated_at: expect.any(String),
        },
      })
      expect(
        response.body.author.updated_at > response.body.author.created_at,
      ).toBe(true)

      const savedAuthor = await db.query.authors.findFirst({
        where(fields) {
          return eq(fields.id, author.id)
        },
      })

      expect(savedAuthor?.name).toEqual(newName)
    })

    test('with new "avatar_url"', async () => {
      const author = await authorFactory()
      const newAvatarUrl = faker.image.avatar()

      const response = await supertest(app.server)
        .patch(`/authors/${author.id}`)
        .send({
          avatar_url: newAvatarUrl,
        })

      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual({
        author: {
          id: author.id,
          name: author.name,
          avatar_url: newAvatarUrl,
          created_at: author.created_at,
          updated_at: expect.any(String),
        },
      })
      expect(
        response.body.author.updated_at > response.body.author.created_at,
      ).toBe(true)

      const savedAuthor = await db.query.authors.findFirst({
        where(fields) {
          return eq(fields.id, author.id)
        },
      })

      expect(savedAuthor?.avatar_url).toEqual(newAvatarUrl)
    })
  })
})
