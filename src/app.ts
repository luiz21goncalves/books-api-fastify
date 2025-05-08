import { randomUUID } from 'node:crypto'

import fastifyCors from '@fastify/cors'
import fastify from 'fastify'

const app = fastify({
  genReqId: () => {
    return randomUUID()
  },
  logger: true,
})

app.register(fastifyCors)

export { app }
