import z from 'zod'

type AppErrorConstructor = {
  name: string
  message: string
  cause?: unknown
  details?: unknown
  statusCode: number
}

type AppErrorProps = {
  statusCode: number
  details?: unknown
}

type AppErrorResponse = {
  name: string
  status_code: number
  message: string
  details?: unknown
}

export class AppError extends Error {
  private readonly props: AppErrorProps

  constructor({
    name,
    message,
    statusCode,
    cause,
    details,
  }: AppErrorConstructor) {
    super(message, { cause })
    this.name = name
    this.props = { details, statusCode }
  }

  toResponse(): AppErrorResponse {
    return {
      name: this.name,
      message: this.message,
      status_code: this.props.statusCode,
      details: this.props.details,
    }
  }
}

export const validationErrorSchema = z.object({
  name: z.literal('ValidationError'),
  message: z.string(),
  status_code: z.literal(400),
  details: z.array(z.any()),
})

type ValidationErrorProps = {
  message: string
  details?: unknown
  cause?: unknown
}

export class ValidationError extends AppError {
  constructor({ message, details, cause }: ValidationErrorProps) {
    super({
      cause,
      details,
      message,
      name: 'ValidationError',
      statusCode: 400,
    })
  }
}

export const notfoundErrorSchema = z.object({
  name: z.literal('NotFoundError'),
  message: z.string(),
  status_code: z.literal(404),
})

type NotFoundErrorProps = {
  message: string
}

export class NotFoundError extends AppError {
  constructor({ message }: NotFoundErrorProps) {
    super({
      message,
      name: 'NotFoundError',
      statusCode: 404,
    })
  }
}

export const internalServerErrorSchema = z.object({
  name: z.literal('InternalServerError'),
  message: z.literal('An internal server error occurred.'),
  status_code: z.literal(500),
})

type InternalServerErrorProps = {
  cause?: unknown
}

export class InternalServerError extends AppError {
  constructor({ cause }: InternalServerErrorProps) {
    super({
      cause,
      message: 'An internal server error occurred.',
      name: 'InternalServerError',
      statusCode: 500,
    })
  }
}
