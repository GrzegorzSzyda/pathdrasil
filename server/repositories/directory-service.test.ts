import { mkdir, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DirectoryService } from './directory-service.js'

describe('DirectoryService', () => {
  it('lists directories and hides files outside configured roots', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'pathdrasil-directories-'))
    await mkdir(resolve(root, 'repository'))
    const service = new DirectoryService([root])
    const listing = await service.list(root)
    expect(listing.entries).toEqual([
      { name: 'repository', path: resolve(root, 'repository') },
    ])
    await expect(service.list(tmpdir())).rejects.toMatchObject({
      code: 'DIRECTORY_OUTSIDE_ROOTS',
    })
  })
})
