import z from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['test', 'development', 'production']),
  PORT: z.coerce.number(),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum([
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
    'silent',
  ]),
})

export const ENV = envSchema.parse(process.env)
