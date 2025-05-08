import { FastifyInstance } from 'fastify'

import { authorRoutes } from './authors'

export async function appRoutes(app: FastifyInstance) {
  app.register(authorRoutes)
}
