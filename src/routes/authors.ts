import { randomUUID } from 'node:crypto'

import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { internalServerErrorSchema, validationErrorSchema } from '../errors'

const authorSchema = z.object({
  id: z.string().uuid(),
  avatar_url: z.string().url(),
  name: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

const authorInputSchema = z.object({
  avatar_url: z.string().url(),
  name: z.string().min(1),
})

const author = {
  id: randomUUID(),
  avatar_url: 'http://example.com',
  name: 'John Doe',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export async function authorRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/authors',
    {
      schema: {
        tags: ['Authors'],
        response: {
          200: z.object({ authors: z.array(authorSchema) }),
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      request.log.debug({ author })

      return reply.status(201).send({ authors: [author] })
    },
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/authors/:id',
    {
      schema: {
        tags: ['Authors'],
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ author: authorSchema }),
          400: validationErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      request.log.debug({ id })

      return reply.status(201).send({ author })
    },
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/authors',
    {
      schema: {
        tags: ['Authors'],
        body: authorInputSchema,
        response: {
          201: z.object({ author: authorSchema }),
          400: validationErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { avatar_url, name } = request.body
      request.log.debug({ avatar_url, name })

      request.log.debug({ author })

      return reply.status(201).send({ author })
    },
  )

  app.withTypeProvider<ZodTypeProvider>().patch(
    '/authors/:id',
    {
      schema: {
        tags: ['Authors'],
        params: z.object({ id: z.string().uuid() }),
        body: authorInputSchema,
        response: {
          200: z.object({ author: authorSchema }),
          400: validationErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      request.log.debug({ id })

      request.log.debug({ author })

      return reply.status(201).send({ author })
    },
  )

  app.withTypeProvider<ZodTypeProvider>().delete(
    '/authors/:id',
    {
      schema: {
        tags: ['Authors'],
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

      request.log.debug({ author })

      return reply.status(204).send()
    },
  )
}
