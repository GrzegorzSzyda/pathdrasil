import { execa } from 'execa'

export const allowedCommands = ['gh', 'glab', 'git'] as const
export type AllowedCommand = (typeof allowedCommands)[number]

export type CommandRequest = {
  command: AllowedCommand
  args: readonly string[]
  cwd?: string
  timeoutMs?: number
  env?: Record<string, string>
}

export type CommandResult = {
  ok: boolean
  stdout: string
  stderr: string
  exitCode?: number
  errorCode?: string
  timedOut: boolean
}

export type CommandRunner = {
  run(request: CommandRequest): Promise<CommandResult>
}

const MAX_OUTPUT_BYTES = 1024 * 1024

export const createCommandRunner = (): CommandRunner => ({
  async run({ command, args, cwd, timeoutMs = 10_000, env }) {
    if (!allowedCommands.includes(command))
      return {
        ok: false,
        stdout: '',
        stderr: '',
        errorCode: 'COMMAND_NOT_ALLOWED',
        timedOut: false,
      }
    try {
      const result = await execa(command, args, {
        cwd,
        env,
        extendEnv: true,
        reject: false,
        shell: false,
        timeout: timeoutMs,
        maxBuffer: MAX_OUTPUT_BYTES,
        stdin: 'ignore',
      })
      return {
        ok: result.exitCode === 0,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        timedOut: result.timedOut,
      }
    } catch (error) {
      const processError = error as {
        code?: string
        stdout?: string
        stderr?: string
        exitCode?: number
        timedOut?: boolean
      }
      return {
        ok: false,
        stdout: processError.stdout ?? '',
        stderr: processError.stderr ?? '',
        exitCode: processError.exitCode,
        errorCode: processError.code,
        timedOut: processError.timedOut ?? false,
      }
    }
  },
})
