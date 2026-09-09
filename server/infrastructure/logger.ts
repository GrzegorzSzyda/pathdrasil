import pino, { type Logger } from 'pino'

export const createLogger = (level = 'info'): Logger =>
  pino({
    level,
    redact: {
      paths: [
        'req.headers.authorization',
        'headers.authorization',
        '*.token',
        '*.accessToken',
        '*.password',
      ],
      censor: '[REDACTED]',
    },
  })
