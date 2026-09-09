import { readdir, realpath, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, relative, resolve, sep } from 'node:path'
import type { DirectoryListing } from '../../shared/api/repositories.js'
import { AppError } from '../errors/app-error.js'

const isWithin = (path: string, root: string): boolean => {
  const difference = relative(root, path)
  return (
    difference === '' ||
    (!difference.startsWith(`..${sep}`) && difference !== '..')
  )
}

export class DirectoryService {
  constructor(private readonly configuredRoots = [homedir()]) {}

  private async roots(): Promise<string[]> {
    return Promise.all(
      this.configuredRoots.map((root) => realpath(resolve(root))),
    )
  }

  async normalizeDirectory(path: string): Promise<string> {
    const normalized = await realpath(resolve(path)).catch(() => {
      throw new AppError('DIRECTORY_NOT_FOUND', 'Katalog nie istnieje.', 400)
    })
    const allowedRoots = await this.roots()
    if (!allowedRoots.some((root) => isWithin(normalized, root)))
      throw new AppError(
        'DIRECTORY_OUTSIDE_ROOTS',
        'Katalog znajduje się poza dozwolonym obszarem.',
        400,
      )
    const metadata = await stat(normalized)
    if (!metadata.isDirectory())
      throw new AppError(
        'NOT_A_DIRECTORY',
        'Wybrana ścieżka nie jest katalogiem.',
        400,
      )
    return normalized
  }

  async list(path?: string): Promise<DirectoryListing> {
    const allowedRoots = await this.roots()
    const current = await this.normalizeDirectory(path ?? allowedRoots[0])
    const entries = await readdir(current, { withFileTypes: true })
    const directories = entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => ({
        name: entry.name,
        path: resolve(current, entry.name),
      }))
      .sort((left, right) => left.name.localeCompare(right.name))
    const parentPath = dirname(current)
    return {
      path: current,
      parent:
        parentPath !== current &&
        allowedRoots.some((root) => isWithin(parentPath, root))
          ? parentPath
          : null,
      roots: allowedRoots,
      entries: directories,
    }
  }
}
