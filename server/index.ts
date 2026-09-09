import { serve } from '@hono/node-server'
import packageJson from '../package.json' with { type: 'json' }
import { createApp } from './app.js'
import { readConfig } from './config.js'
import { createLogger } from './infrastructure/logger.js'

const config = readConfig()
const logger = createLogger(config.logLevel)
const app = createApp({ logger, version: packageJson.version })

const server = serve({
  fetch: app.fetch,
  hostname: config.host,
  port: config.port,
})

logger.info(
  { host: config.host, port: config.port },
  'Pathdrasil backend started',
)

const shutdown = (signal: string) => {
  logger.info({ signal }, 'Stopping Pathdrasil backend')
  server.close((error) => {
    if (error) {
      logger.error({ error }, 'Failed to stop backend cleanly')
      process.exitCode = 1
    }
  })
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
