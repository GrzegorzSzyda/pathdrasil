import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { createInterface } from 'node:readline'
import { z } from 'zod'

const threadStartedEventSchema = z.object({
  type: z.literal('thread.started'),
  thread_id: z.string().min(1),
})

const agentMessageEventSchema = z.object({
  type: z.literal('item.completed'),
  item: z.object({
    type: z.literal('agent_message'),
    text: z.string(),
  }),
})

const errorEventSchema = z.object({
  type: z.literal('error'),
  message: z.string().min(1),
})

export type CodexEvent =
  | { type: 'thread-started'; threadId: string }
  | { type: 'message-completed'; content: string }
  | { type: 'error'; message: string }

export type CodexRunResult =
  | { status: 'complete' }
  | { status: 'cancelled' }
  | { status: 'timed-out' }
  | { status: 'failed'; message: string }

export type CodexRun = {
  cancel(): void
  done: Promise<CodexRunResult>
}

type CodexRunInput = {
  prompt: string
  cwd: string
  sessionId?: string
  onEvent(event: CodexEvent): void
}

type CodexAdapterOptions = {
  command?: string
  timeoutMs?: number
  killAfterMs?: number
  spawnProcess?: (
    command: string,
    args: readonly string[],
    cwd: string,
  ) => ChildProcessWithoutNullStreams
}

export const parseCodexEvent = (line: string): CodexEvent | undefined => {
  let value: unknown
  try {
    value = JSON.parse(line)
  } catch {
    return undefined
  }

  const threadStarted = threadStartedEventSchema.safeParse(value)
  if (threadStarted.success)
    return { type: 'thread-started', threadId: threadStarted.data.thread_id }

  const message = agentMessageEventSchema.safeParse(value)
  if (message.success)
    return { type: 'message-completed', content: message.data.item.text }

  const error = errorEventSchema.safeParse(value)
  if (error.success) return { type: 'error', message: error.data.message }

  return undefined
}

export class CodexAdapter {
  private readonly command: string
  private readonly timeoutMs: number
  private readonly killAfterMs: number
  private readonly spawnProcess: NonNullable<
    CodexAdapterOptions['spawnProcess']
  >

  constructor(options: CodexAdapterOptions = {}) {
    this.command = options.command ?? 'codex'
    this.timeoutMs = options.timeoutMs ?? 120_000
    this.killAfterMs = options.killAfterMs ?? 5_000
    this.spawnProcess =
      options.spawnProcess ??
      ((command, args, cwd) =>
        spawn(command, args, {
          cwd,
          shell: false,
          stdio: ['pipe', 'pipe', 'pipe'],
        }))
  }

  start({ prompt, cwd, sessionId, onEvent }: CodexRunInput): CodexRun {
    const process = this.spawnProcess(
      this.command,
      sessionId
        ? ['exec', 'resume', '--json', sessionId, '-']
        : ['exec', '--json', '--sandbox', 'read-only', '-'],
      cwd,
    )
    let cancelled = false
    let timedOut = false
    let failureMessage = ''
    let killTimer: NodeJS.Timeout | undefined

    const stop = (reason: 'cancelled' | 'timed-out') => {
      if (cancelled || timedOut) return
      cancelled = reason === 'cancelled'
      timedOut = reason === 'timed-out'
      process.kill('SIGTERM')
      killTimer = setTimeout(() => process.kill('SIGKILL'), this.killAfterMs)
      killTimer.unref()
    }

    const timeout = setTimeout(() => stop('timed-out'), this.timeoutMs)
    timeout.unref()

    const stdout = createInterface({
      input: process.stdout,
      crlfDelay: Infinity,
    })
    stdout.on('line', (line) => {
      const event = parseCodexEvent(line)
      if (!event) return
      if (event.type === 'error') failureMessage = event.message
      onEvent(event)
    })
    process.stderr.on('data', (chunk: Buffer) => {
      const message = chunk.toString('utf8').trim()
      if (message) failureMessage = message
    })
    process.stdin.end(prompt)

    const done = new Promise<CodexRunResult>((resolve) => {
      process.once('error', (error) => {
        failureMessage = error.message
      })
      process.once('close', (exitCode) => {
        clearTimeout(timeout)
        if (killTimer) clearTimeout(killTimer)
        stdout.close()
        if (timedOut) return resolve({ status: 'timed-out' })
        if (cancelled) return resolve({ status: 'cancelled' })
        if (exitCode === 0) return resolve({ status: 'complete' })
        return resolve({
          status: 'failed',
          message: failureMessage || 'Codex zakończył działanie z błędem.',
        })
      })
    })

    return { cancel: () => stop('cancelled'), done }
  }
}
