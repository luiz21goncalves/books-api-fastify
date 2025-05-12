import { randomUUID } from 'node:crypto'

import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySwagger from '@fastify/swagger'
import scalarFastify from '@scalar/fastify-api-reference'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { author, description, license, name, version } from '../package.json'
import { ENV } from './env'
import { errorHandler } from './error-handler'
import { TooManyRequestsError } from './errors'
import { appRoutes } from './routes'

const app = fastify({
  genReqId: () => {
    return randomUUID()
  },
  logger: {
    level: ENV.LOG_LEVEL,
  },
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyRateLimit, {
  global: true,
  max: 20,
  timeWindow: 60 * 1000,
  errorResponseBuilder(_req, context) {
    throw new TooManyRequestsError({
      message: `I only allow ${context.max} requests per ${context.after} to this Website. Try again soon.`,
    })
  },
})
app.register(fastifyCors)
app.register(fastifySwagger, {
  openapi: {
    info: {
      contact: author,
      description,
      license: {
        name: license,
      },
      title: name,
      version,
    },
  },
  transform: jsonSchemaTransform,
})
app.register(scalarFastify, { routePrefix: '/docs' })

app.register(appRoutes)

app.setErrorHandler(errorHandler)

export { app }
