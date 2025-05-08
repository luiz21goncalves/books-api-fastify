import { FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'

import { AppError, InternalServerError, ValidationError } from './errors'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof AppError) {
    const errorResponse = error.toResponse()

    return reply.status(errorResponse.status_code).send(errorResponse)
  }

  if (hasZodFastifySchemaValidationErrors(error)) {
    const validationError = new ValidationError({
      cause: error,
      details: error.validation,
      message: "Request doesn't match the schema",
    })
    const validationResponse = validationError.toResponse()

    return reply.code(validationResponse.status_code).send(validationResponse)
  }

  const internalError = new InternalServerError({ cause: error })
  const internalErrorResponse = internalError.toResponse()
  console.error(internalError)

  return reply
    .status(internalErrorResponse.status_code)
    .send(internalErrorResponse)
}
