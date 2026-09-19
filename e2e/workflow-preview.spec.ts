import { expect, test } from '@playwright/test'

const projectId = '5f725a74-710d-45aa-afc6-90f12081ab12'

const project = {
  id: projectId,
  name: 'Pathdrasil',
  taskManager: {
    providerId: 'github-issues',
    accountId: 'github-issues:github.com:octocat',
    sources: [
      {
        id: 'octocat/pathdrasil',
        name: 'pathdrasil',
        fullName: 'octocat/pathdrasil',
        url: 'https://github.com/octocat/pathdrasil',
      },
    ],
  },
  repositories: [
    {
      provider: 'github',
      path: '/workspace/pathdrasil',
      worktree: '/workspace/worktrees',
      remoteUrl: 'https://github.com/octocat/pathdrasil',
      slug: 'octocat/pathdrasil',
      host: 'github.com',
      defaultBranch: 'main',
    },
  ],
  agent: { id: 'codex' },
  rules: {
    taskLanguage: 'Polski',
    repositoryLanguage: 'English',
    pathdrasilLanguage: 'Polski',
    autonomy: 'publikuj-draft-pr-mr',
    permissions: {
      pushBranch: true,
      createPullRequest: true,
      merge: false,
      respondToReview: false,
      updateTask: true,
      sendMessages: false,
    },
  },
  createdAt: '2026-09-08T10:00:00.000Z',
  updatedAt: '2026-09-08T10:00:00.000Z',
}

const tasks = [
  {
    id: 'github:octocat/pathdrasil:12',
    provider: 'github',
    repository: 'octocat/pathdrasil',
    externalId: 12,
    title: 'Build the workflow preview',
    description: 'Read the issue description.\nKeep the board accessible.',
    url: 'https://github.com/octocat/pathdrasil/issues/12',
    status: 'todo',
    labels: ['frontend', 'workflow', 'mvp'],
    updatedAt: '2026-09-08T10:00:00.000Z',
  },
  {
    id: 'github:octocat/pathdrasil:13',
    provider: 'github',
    repository: 'octocat/pathdrasil',
    externalId: 13,
    title: 'Existing work',
    description: '',
    url: 'https://github.com/octocat/pathdrasil/issues/13',
    status: 'in-progress',
    labels: [],
    updatedAt: '2026-09-08T09:00:00.000Z',
  },
  {
    id: 'github:octocat/pathdrasil:15',
    provider: 'github',
    repository: 'octocat/pathdrasil',
    externalId: 15,
    title: 'Polish keyboard navigation',
    description: 'Arrow keys should enter and navigate the task list.',
    url: 'https://github.com/octocat/pathdrasil/issues/15',
    status: 'todo',
    labels: ['accessibility'],
    updatedAt: '2026-09-08T08:30:00.000Z',
  },
  {
    id: 'github:octocat/pathdrasil:14',
    provider: 'github',
    repository: 'octocat/pathdrasil',
    externalId: 14,
    title: 'Review changes',
    description: '',
    url: 'https://github.com/octocat/pathdrasil/issues/14',
    status: 'review',
    labels: [],
    updatedAt: '2026-09-08T08:00:00.000Z',
  },
]

test('opens and closes the workflow task preview with the keyboard', async ({
  page,
}) => {
  await page.route('**/api/projects/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith('/tasks'))
      return route.fulfill({
        contentType: 'application/json',
        json: { tasks, syncedAt: '2026-09-08T10:00:00.000Z' },
      })
    return route.fulfill({ contentType: 'application/json', json: project })
  })

  await page.goto(`/projects/${projectId}`)
  await expect(
    page.getByRole('region', { name: 'Workflow projektu' }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: /Workflow/ }).click()
  await expect(page).toHaveURL(`/projects/${projectId}/workflow`)
  await expect(
    page.getByRole('heading', { name: 'Workflow', exact: true }),
  ).toBeVisible()
  for (const title of [
    'Do przejrzenia',
    'Opracowywanie',
    'Zaplanowane',
    'W toku',
    'Do review',
    'Gotowe',
  ]) {
    await expect(
      page.getByRole('heading', { name: new RegExp(title) }),
    ).toBeVisible()
  }
  await page.evaluate(() => document.fonts.ready)

  const card = page.getByRole('button', { name: /Build the workflow preview/ })
  const secondCard = page.getByRole('button', {
    name: /Polish keyboard navigation/,
  })
  await page.keyboard.press('ArrowDown')
  await expect(card).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(secondCard).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(card).toBeFocused()
  await expect(card).toHaveAttribute('aria-expanded', 'false')
  await card.press('Enter')
  await expect(page.getByText('Keep the board accessible.')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Build the workflow preview' }),
  ).toBeFocused()
  await expect
    .poll(() =>
      page.locator('#task-preview').evaluate((panel) => panel.scrollTop),
    )
    .toBe(0)
  await page.keyboard.press('Escape')
  await expect(card).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(`/projects/${projectId}`)
})
