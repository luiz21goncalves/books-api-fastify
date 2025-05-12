import { eq } from 'drizzle-orm'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '../db/connection'
import { authors } from '../db/schemas'
import {
  internalServerErrorSchema,
  NotFoundError,
  notfoundErrorSchema,
  validationErrorSchema,
} from '../errors'

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
      const authorsResponse = await db.query.authors.findMany({
        orderBy(fields, { desc }) {
          return desc(fields.created_at)
        },
      })
      request.log.debug({ authors: authorsResponse })

      return reply.status(200).send({ authors: authorsResponse })
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
          404: notfoundErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      request.log.debug({ id })

      const author = await db.query.authors.findFirst({
        where(fields) {
          return eq(fields.id, id)
        },
      })
      request.log.debug({ author })

      if (!author) {
        throw new NotFoundError({
          message: 'Author not found.',
        })
      }

      return reply.status(200).send({ author })
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

      const [author] = await db
        .insert(authors)
        .values({ avatar_url, name })
        .returning()
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
        body: authorInputSchema.partial().refine(
          (obj) => {
            return Object.keys(obj).filter(Boolean).length >= 1
          },
          { message: 'Send "name" or "avatar_url"' },
        ),
        response: {
          200: z.object({ author: authorSchema }),
          400: validationErrorSchema,
          404: notfoundErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { avatar_url, name } = request.body
      request.log.debug({ id, avatar_url, name })

      const savedAuthor = await db.query.authors.findFirst({
        where(fields) {
          return eq(fields.id, id)
        },
      })
      request.log.debug({ author: savedAuthor })

      if (!savedAuthor) {
        throw new NotFoundError({
          message: 'Author not found.',
        })
      }

      const [updatedAuthor] = await db
        .update(authors)
        .set({
          ...savedAuthor,
          name,
          avatar_url,
          updated_at: new Date().toISOString(),
        })
        .where(eq(authors.id, id))
        .returning()
      request.log.debug({ author: updatedAuthor })

      return reply.status(200).send({ author: updatedAuthor })
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
          404: notfoundErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      request.log.debug({ id })

      const author = await db.query.authors.findFirst({
        where(fields) {
          return eq(fields.id, id)
        },
      })
      request.log.debug({ author })

      if (!author) {
        throw new NotFoundError({
          message: 'Author not found.',
        })
      }
      request.log.debug({ author })

      await db.delete(authors).where(eq(authors.id, id))

      return reply.status(204).send()
    },
  )
}
