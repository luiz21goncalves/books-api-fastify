import { FastifyInstance } from 'fastify'

import { authorRoutes } from './authors'
import { bookRoutes } from './books'

export async function appRoutes(app: FastifyInstance) {
  app.register(authorRoutes)
  app.register(bookRoutes)
}
