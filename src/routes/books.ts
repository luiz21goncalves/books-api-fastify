import { randomUUID } from 'node:crypto'

import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { internalServerErrorSchema, validationErrorSchema } from '../errors'

const bookSchema = z.object({
  id: z.string().uuid(),
  cover_url: z.string().url(),
  name: z.string(),
  author_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

const bookInputSchema = z.object({
  cover_url: z.string().url(),
  name: z.string().min(1),
  author_id: z.string().uuid(),
})

const book = {
  id: randomUUID(),
  cover_url: 'http://example.com',
  name: 'John Doe',
  author_id: randomUUID(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export async function bookRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/books',
    {
      schema: {
        tags: ['Books'],
        response: {
          200: z.object({ books: z.array(bookSchema) }),
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      request.log.debug({ book })

      return reply.status(201).send({ books: [book] })
    },
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/books/:id',
    {
      schema: {
        tags: ['Books'],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ book: bookSchema }),
          400: validationErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      request.log.debug({ id })

      return reply.status(201).send({ book })
    },
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/books',
    {
      schema: {
        tags: ['Books'],
        body: bookInputSchema,
        response: {
          201: z.object({ book: bookSchema }),
          400: validationErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { author_id, cover_url, name } = request.body
      request.log.debug({ author_id, cover_url, name })

      request.log.debug({ book })

      return reply.status(201).send({ book })
    },
  )

  app.withTypeProvider<ZodTypeProvider>().patch(
    '/books/:id',
    {
      schema: {
        tags: ['Books'],
        params: z.object({ id: z.string().uuid() }),
        body: bookInputSchema,
        response: {
          200: z.object({ book: bookSchema }),
          400: validationErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      request.log.debug({ id })

      request.log.debug({ book })

      return reply.status(201).send({ book })
    },
  )

  app.withTypeProvider<ZodTypeProvider>().delete(
    '/books/:id',
    {
      schema: {
        tags: ['Books'],
        params: z.object({ id: z.string().uuid() }),
        response: {
          204: z.undefined(),
          400: validationErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      request.log.debug({ id })

      request.log.debug({ book })

      return reply.status(204).send()
    },
  )
}
