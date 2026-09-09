import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { z } from 'zod'

const envSchema = z.object({
  PATHDRASIL_HOST: z.string().default('127.0.0.1'),
  PATHDRASIL_PORT: z.coerce.number().int().min(1).max(65535).default(4310),
  PATHDRASIL_DATA_DIR: z
    .string()
    .default(resolve(homedir(), '.local', 'share', 'pathdrasil')),
  PATHDRASIL_LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
})

export type ServerConfig = {
  host: string
  port: number
  dataDirectory: string
  logLevel: z.infer<typeof envSchema>['PATHDRASIL_LOG_LEVEL']
}

export const readConfig = (
  environment: NodeJS.ProcessEnv = process.env,
): ServerConfig => {
  const env = envSchema.parse(environment)
  return {
    host: env.PATHDRASIL_HOST,
    port: env.PATHDRASIL_PORT,
    dataDirectory: env.PATHDRASIL_DATA_DIR,
    logLevel: env.PATHDRASIL_LOG_LEVEL,
  }
}
