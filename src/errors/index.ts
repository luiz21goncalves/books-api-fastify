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
      details: this.props.details,
      message: this.message,
      name: this.name,
      status_code: this.props.statusCode,
    }
  }
}

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
