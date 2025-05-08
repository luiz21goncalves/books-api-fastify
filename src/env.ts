import z from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['test', 'development', 'production']),
  PORT: z.coerce.number(),
})

export const ENV = envSchema.parse(process.env)
