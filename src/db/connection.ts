import { drizzle } from 'drizzle-orm/libsql/node'

import { ENV } from '../env'
import * as schema from './schemas'

export const db = drizzle({
  connection: { url: ENV.DATABASE_URL },
  schema,
})
