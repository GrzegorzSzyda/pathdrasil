import { z } from 'zod'
import type { TaskSummary } from '../../shared/api/tasks.js'
import { AppError } from '../errors/app-error.js'
import type { CommandRunner } from '../infrastructure/command-runner.js'
import type { ProjectService } from '../projects/project-service.js'

const githubIssueSchema = z.object({
  number: z.number().int().positive(),
  title: z.string(),
  url: z.string().url(),
  labels: z.array(z.object({ name: z.string() })),
  updatedAt: z.string(),
})

const gitlabIssueSchema = z.object({
  iid: z.number().int().positive(),
  title: z.string(),
  web_url: z.string().url(),
  labels: z.array(z.string()),
  updated_at: z.string(),
})

const statusFromLabels = (labels: string[]): TaskSummary['status'] => {
  const normalized = labels.map((label) => label.trim().toLowerCase())
  if (
    normalized.some((label) =>
      ['review', 'code review', 'needs review'].includes(label),
    )
  )
    return 'review'
  if (
    normalized.some((label) =>
      ['in progress', 'in-progress', 'doing', 'wip', 'started'].includes(label),
    )
  )
    return 'in-progress'
  return 'todo'
}

type CachedTasks = { expiresAt: number; tasks: TaskSummary[] }

export class TaskService {
  private readonly cache = new Map<string, CachedTasks>()

  constructor(
    private readonly runner: CommandRunner,
    private readonly projects: ProjectService,
    private readonly cacheTtlMs = 30_000,
  ) {}

  async list(projectId: string, refresh = false): Promise<TaskSummary[]> {
    const cached = this.cache.get(projectId)
    if (!refresh && cached && cached.expiresAt > Date.now()) return cached.tasks

    const project = await this.projects.get(projectId)
    const taskGroups = await Promise.all(
      project.taskManager.sources.map(async (source) => {
        if (project.taskManager.providerId === 'github-issues')
          return this.listGitHub(source.id, source.fullName)
        return this.listGitLab(source.id, source.fullName)
      }),
    )
    const tasks = taskGroups
      .flat()
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    this.cache.set(projectId, {
      tasks,
      expiresAt: Date.now() + this.cacheTtlMs,
    })
    return tasks
  }

  private async listGitHub(
    sourceId: string,
    repository: string,
  ): Promise<TaskSummary[]> {
    const result = await this.runner.run({
      command: 'gh',
      args: [
        'issue',
        'list',
        '--assignee',
        '@me',
        '--repo',
        sourceId,
        '--state',
        'open',
        '--limit',
        '100',
        '--json',
        'number,title,url,labels,updatedAt',
      ],
      timeoutMs: 20_000,
    })
    if (!result.ok)
      throw new AppError(
        'TASK_SYNC_FAILED',
        `Nie udało się pobrać issues z ${repository}.`,
        502,
      )
    const issues = z.array(githubIssueSchema).parse(JSON.parse(result.stdout))
    return issues.map((issue) => {
      const labels = issue.labels.map((label) => label.name)
      return {
        id: `github:${repository}:${issue.number}`,
        provider: 'github' as const,
        repository,
        externalId: issue.number,
        title: issue.title,
        url: issue.url,
        status: statusFromLabels(labels),
        labels,
        updatedAt: issue.updatedAt,
      }
    })
  }

  private async listGitLab(
    sourceId: string,
    repository: string,
  ): Promise<TaskSummary[]> {
    const result = await this.runner.run({
      command: 'glab',
      args: [
        'issue',
        'list',
        '--assignee=@me',
        '--repo',
        sourceId,
        '--output',
        'json',
        '--per-page',
        '100',
      ],
      timeoutMs: 20_000,
    })
    if (!result.ok)
      throw new AppError(
        'TASK_SYNC_FAILED',
        `Nie udało się pobrać issues z ${repository}.`,
        502,
      )
    const issues = z.array(gitlabIssueSchema).parse(JSON.parse(result.stdout))
    return issues.map((issue) => ({
      id: `gitlab:${repository}:${issue.iid}`,
      provider: 'gitlab' as const,
      repository,
      externalId: issue.iid,
      title: issue.title,
      url: issue.web_url,
      status: statusFromLabels(issue.labels),
      labels: issue.labels,
      updatedAt: issue.updated_at,
    }))
  }
}
