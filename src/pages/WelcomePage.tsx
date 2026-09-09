import { useEffect, useRef, useState } from 'react'
import { PlusIcon, TrashIcon } from '@phosphor-icons/react'
import type { Project } from '../../shared/api/projects'
import { Button } from '../components/Button'
import { Dialog } from '../components/Dialog'
import { Heading } from '../components/Heading'
import { InlineAlert } from '../components/InlineAlert'
import { Kbd } from '../components/Kbd'
import { Topbar } from '../components/Topbar'

type WelcomePageProps = {
  onCreate: () => void
  onOpen: (id: string) => void
  onDelete: (project: Project) => Promise<void>
  projects: Project[]
  projectsError: string
  shortcutsVisible: boolean
}

export const WelcomePage = ({
  onCreate,
  onOpen,
  onDelete,
  projects,
  projectsError,
  shortcutsVisible,
}: WelcomePageProps): React.JSX.Element => {
  const firstProjectRef = useRef<HTMLButtonElement>(null)
  const createProjectRef = useRef<HTMLButtonElement>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (projects.length > 0) firstProjectRef.current?.focus()
    else createProjectRef.current?.focus()
  }, [projects.length])

  const confirmDelete = async () => {
    if (!projectToDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await onDelete(projectToDelete)
      setProjectToDelete(null)
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Nie udało się usunąć projektu.',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <main className="bg-welcome text-text min-h-screen px-6 py-8 text-base sm:px-10">
        <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
          <Topbar />
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            {projectsError && (
              <div className="mb-6 w-full max-w-md text-left">
                <InlineAlert tone="danger">{projectsError}</InlineAlert>
              </div>
            )}
            {projects.length === 0 ? (
              <>
                <Heading as="h2" level="h1">
                  Zacznijmy od projektu
                </Heading>
                <p className="mt-5 mb-8 max-w-md text-base leading-relaxed">
                  Dodaj lokalne repozytorium, aby zbudować swoją pierwszą
                  przestrzeń pracy
                </p>
                <span className="relative">
                  <Button
                    ref={createProjectRef}
                    type="button"
                    onClick={onCreate}
                  >
                    <PlusIcon size={20} weight="bold" aria-hidden="true" />
                    <span>Dodaj projekt</span>
                  </Button>
                  {shortcutsVisible && (
                    <Kbd className="absolute top-1/2 left-full ml-2 -translate-y-1/2">
                      N
                    </Kbd>
                  )}
                </span>
              </>
            ) : (
              <section className="w-full max-w-2xl">
                <div className="grid gap-3">
                  {projects.map((project, index) => (
                    <div key={project.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        ref={index === 0 ? firstProjectRef : undefined}
                        data-project-item
                        onClick={() => onOpen(project.id)}
                        className="bg-page-deep hover:bg-surface focus-visible:bg-surface min-w-0 flex-1 cursor-pointer rounded-xl p-4 text-left transition focus-visible:outline-none"
                      >
                        <strong className="text-heading block">
                          {project.name}
                        </strong>
                      </button>
                      <Button
                        type="button"
                        tone="danger"
                        appearance="ghost"
                        size="icon"
                        aria-label={`Usuń projekt ${project.name}`}
                        onClick={() => setProjectToDelete(project)}
                      >
                        <TrashIcon weight="bold" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  data-project-item
                  appearance="ghost"
                  onClick={onCreate}
                  className="text-brand hover:bg-brand/15 hover:text-brand focus-visible:bg-brand/15 focus-visible:text-brand mt-6"
                >
                  <PlusIcon size={20} weight="bold" aria-hidden="true" />
                  <span>Dodaj kolejny projekt</span>
                </Button>
              </section>
            )}
          </div>
        </div>
      </main>
      <Dialog
        open={projectToDelete !== null}
        title="Usunąć projekt?"
        onClose={() => !deleting && setProjectToDelete(null)}
      >
        <p className="text-muted leading-relaxed">
          Projekt{' '}
          <strong className="text-heading">{projectToDelete?.name}</strong>{' '}
          zostanie usunięty z Pathdrasil. Lokalne repozytoria nie zostaną
          zmienione.
        </p>
        {deleteError && (
          <p className="text-danger mt-4" role="alert">
            {deleteError}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            appearance="ghost"
            onClick={() => setProjectToDelete(null)}
            disabled={deleting}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            tone="danger"
            onClick={() => void confirmDelete()}
            disabled={deleting}
          >
            {deleting ? 'Usuwanie…' : 'Usuń projekt'}
          </Button>
        </div>
      </Dialog>
    </>
  )
}
