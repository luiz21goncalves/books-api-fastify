import { randomUUID } from 'node:crypto'

import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import scalarFastify from '@scalar/fastify-api-reference'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { author, description, license, name, version } from '../package.json'
import { errorHandler } from './error-handler'

const app = fastify({
  genReqId: () => {
    return randomUUID()
  },
  logger: true,
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

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

app.setErrorHandler(errorHandler)

export { app }
