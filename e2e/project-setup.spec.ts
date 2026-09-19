import { expect, test, type Page } from '@playwright/test'

const accountId = 'github-issues:github.com:octocat'
const source = {
  id: 'octocat/tasks',
  name: 'tasks',
  fullName: 'octocat/tasks',
  url: 'https://github.com/octocat/tasks',
  description: 'Product backlog',
  private: false,
}

const mockApi = async (
  page: Page,
  options: { repositoryError?: boolean } = {},
) => {
  let repositoryVerifications = 0
  await page.route('**://*/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const respond = (json: unknown, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', json })

    if (url.pathname === '/api/projects' && request.method() === 'GET')
      return respond({ projects: [] })
    if (url.pathname === '/api/integrations')
      return respond({
        providers: [
          {
            id: 'github-issues',
            domain: 'task-manager',
            status: 'available',
            cli: { command: 'gh', installed: true, version: 'test' },
            accounts: [
              {
                id: accountId,
                host: 'github.com',
                login: 'octocat',
                name: 'Octocat',
                active: true,
              },
            ],
          },
          {
            id: 'gitlab-issues',
            domain: 'task-manager',
            status: 'not-installed',
            message: 'Nie znaleziono programu glab w PATH.',
            accounts: [],
          },
          {
            id: 'linear',
            domain: 'task-manager',
            status: 'unsupported',
            message: 'Integracja nie jest jeszcze obsługiwana.',
            accounts: [],
          },
          {
            id: 'jira',
            domain: 'task-manager',
            status: 'unsupported',
            message: 'Integracja nie jest jeszcze obsługiwana.',
            accounts: [],
          },
        ],
      })
    if (url.pathname === '/api/integrations/github-issues/sources')
      return respond({ sources: [source] })
    if (
      url.pathname === '/api/repositories/verify' &&
      request.method() === 'POST'
    ) {
      repositoryVerifications += 1
      if (options.repositoryError)
        return respond(
          {
            error: {
              code: 'NOT_A_GIT_REPOSITORY',
              message: 'Wybrany katalog nie jest repozytorium Git.',
              requestId: 'e2e-request',
            },
          },
          400,
        )
      const input = request.postDataJSON() as {
        provider: 'github'
        path: string
        worktree: string
      }
      return respond({
        ...input,
        remoteUrl: 'https://github.com/octocat/pathdrasil',
        slug: 'octocat/pathdrasil',
        host: 'github.com',
        defaultBranch: 'main',
      })
    }
    return respond(
      {
        error: {
          code: 'NOT_FOUND',
          message: `Unhandled E2E request: ${request.method()} ${url.pathname}`,
          requestId: 'e2e-request',
        },
      },
      404,
    )
  })
  return { repositoryVerifications: () => repositoryVerifications }
}

const openRepositoryStep = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Dodaj projekt' }).click()
  await page.getByLabel('Nazwa projektu').fill('Pathdrasil')
  await page.getByRole('button', { name: 'Dalej' }).click()
  await page.getByRole('button', { name: /GitHub Issues/ }).click()
  await page.getByRole('button', { name: /Octocat/ }).click()
  await page.getByRole('button', { name: /octocat\/tasks/ }).click()
  await page.getByRole('button', { name: 'Dalej' }).click()
  await page.getByRole('button', { name: /GitHub/ }).click()
  await page.getByLabel('Repozytorium').fill('/workspace/pathdrasil')
  await page.getByLabel('Worktree').fill('/workspace/worktrees')
}

test('shows the empty project screen', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

})

test('validates repositories before showing the agent rules', async ({
  page,
}) => {
  const api = await mockApi(page)
  await openRepositoryStep(page)

  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(page.getByRole('heading', { name: 'Agent' })).toBeVisible()
  expect(api.repositoryVerifications()).toBe(1)
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(
    page.getByRole('heading', { name: 'Zakres działania agenta' }),
  ).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

})

test('keeps the user on the repository step after failed validation', async ({
  page,
}) => {
  await mockApi(page, { repositoryError: true })
  await openRepositoryStep(page)

  await page.getByRole('button', { name: 'Dalej' }).click()

  await expect(
    page.getByText('Wybrany katalog nie jest repozytorium Git.'),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Repozytoria' })).toBeVisible()
})
