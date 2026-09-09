export class AppError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 500,
    readonly cause?: unknown,
  ) {
    super(message, { cause })
    this.name = 'AppError'
  }
}
