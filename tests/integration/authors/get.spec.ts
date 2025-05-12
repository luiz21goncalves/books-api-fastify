import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { app } from '../../../src/app'
import { authorFactory } from '../../factories'

describe('GET /authors', () => {
  describe('Anonymous user', () => {
    beforeAll(async () => {
      await app.ready()
    })

    afterAll(async () => {
      await app.close()
    })

    test('without authors', async () => {
      const response = await supertest(app.server).get('/authors')

      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual({
        authors: [],
      })
    })

    test('with authors', async () => {
      const author1 = await authorFactory()
      const author2 = await authorFactory()

      const response = await supertest(app.server).get('/authors')

      expect(response.status).toEqual(200)
      expect(response.body).toStrictEqual({
        authors: [author2, author1],
      })
    })
  })
})
