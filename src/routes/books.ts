import { eq } from 'drizzle-orm'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '../db/connection'
import { books } from '../db/schemas'
import {
  internalServerErrorSchema,
  NotFoundError,
  notfoundErrorSchema,
  tooManyRequestsErrorSchema,
  validationErrorSchema,
} from '../errors'

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

export async function bookRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/books',
    {
      schema: {
        tags: ['Books'],
        response: {
          200: z.object({ books: z.array(bookSchema) }),
          429: tooManyRequestsErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const booksResponse = await db.query.books.findMany({
        orderBy(fields, { desc }) {
          return desc(fields.created_at)
        },
      })
      request.log.debug({ books: booksResponse })

      return reply.status(200).send({ books: booksResponse })
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
          429: tooManyRequestsErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      request.log.debug({ id })

      const book = await db.query.books.findFirst({
        where(fields) {
          return eq(fields.id, id)
        },
      })
      request.log.debug({ book })

      if (!book) {
        throw new NotFoundError({
          message: 'Book not found.',
        })
      }

      return reply.status(200).send({ book })
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
          404: notfoundErrorSchema,
          429: tooManyRequestsErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { author_id, cover_url, name } = request.body
      request.log.debug({ author_id, cover_url, name })

      const author = await db.query.authors.findFirst({
        where(fields) {
          return eq(fields.id, author_id)
        },
      })
      request.log.debug({ author })

      if (!author) {
        throw new NotFoundError({
          message: 'Author not found.',
        })
      }

      const [book] = await db
        .insert(books)
        .values({ author_id, cover_url, name })
        .returning()
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
        body: bookInputSchema.partial().refine(
          (obj) => {
            return Object.keys(obj).filter(Boolean).length >= 1
          },
          { message: 'Send "cover_url", "name" or "author_id"' },
        ),
        response: {
          200: z.object({ book: bookSchema }),
          400: validationErrorSchema,
          429: tooManyRequestsErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { author_id, cover_url, name } = request.body
      request.log.debug({ id, author_id, cover_url, name })

      const savedBook = await db.query.books.findFirst({
        where(fields) {
          return eq(fields.id, id)
        },
      })
      request.log.debug({ book: savedBook })

      if (!savedBook) {
        throw new NotFoundError({
          message: 'Book not found.',
        })
      }

      if (author_id) {
        const author = await db.query.authors.findFirst({
          where(fields) {
            return eq(fields.id, author_id)
          },
        })

        if (!author) {
          throw new NotFoundError({
            message: 'Author not found.',
          })
        }
      }

      const [updatedBook] = await db
        .update(books)
        .set({
          ...savedBook,
          author_id,
          cover_url,
          name,
          updated_at: new Date().toISOString(),
        })
        .where(eq(books.id, id))
        .returning()

      return reply.status(200).send({ book: updatedBook })
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
          429: tooManyRequestsErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      request.log.debug({ id })

      const book = await db.query.books.findFirst({
        where(fields) {
          return eq(fields.id, id)
        },
      })
      request.log.debug({ book })

      if (!book) {
        throw new NotFoundError({
          message: 'Book not found.',
        })
      }

      await db.delete(books).where(eq(books.id, id))

      return reply.status(204).send()
    },
  )
}
