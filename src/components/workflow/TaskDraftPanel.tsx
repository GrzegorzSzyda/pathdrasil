import { useCallback, useEffect, useState } from 'react'
import {
  taskDraftResponseSchema,
  type TaskDraft,
  type UpdateTaskDraftRequest,
} from '../../../shared/api/task-drafts'
import type { TaskSummary } from '../../../shared/api/tasks'
import { requestJson } from '../../lib/api'

type TaskDraftPanelProps = {
  projectId: string
  taskId: string
  task: TaskSummary
}

const fields: Array<{
  key: keyof Pick<
    TaskDraft,
    'acceptanceCriteria' | 'plan' | 'dependencies' | 'questions'
  >
  label: string
  placeholder: string
}> = [
  {
    key: 'acceptanceCriteria',
    label: 'Kryteria akceptacji',
    placeholder: 'Jedno kryterium w wierszu',
  },
  { key: 'plan', label: 'Plan', placeholder: 'Jeden krok w wierszu' },
  {
    key: 'dependencies',
    label: 'Zależności',
    placeholder: 'Jedna zależność w wierszu',
  },
  {
    key: 'questions',
    label: 'Pytania i ryzyka',
    placeholder: 'Jedno pytanie lub ryzyko w wierszu',
  },
]

const toLines = (value: string[]) => value.join('\n')
const fromLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

export const TaskDraftPanel = ({
  projectId,
  taskId,
  task,
}: TaskDraftPanelProps) => {
  const [draft, setDraft] = useState<TaskDraft | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const base = `/api/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}/draft`

  const load = useCallback(
    () =>
      requestJson(base, taskDraftResponseSchema)
        .then((response) => setDraft(response.draft))
        .catch((caught: unknown) =>
          setError(
            caught instanceof Error
              ? caught.message
              : 'Nie udało się wczytać draftu.',
          ),
        ),
    [base],
  )

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (draft?.generationStatus !== 'generating') return
    const timer = window.setInterval(() => void load(), 1_000)
    return () => window.clearInterval(timer)
  }, [draft?.generationStatus, load])

  const generate = () => {
    setError('')
    void requestJson(`${base}/generate`, taskDraftResponseSchema, {
      method: 'POST',
    })
      .then((response) => setDraft(response.draft))
      .catch((caught: unknown) =>
        setError(
          caught instanceof Error
            ? caught.message
            : 'Nie udało się utworzyć draftu.',
        ),
      )
  }

  const update = (next: TaskDraft) => setDraft(next)

  const save = () => {
    if (!draft) return
    setSaving(true)
    setError('')
    const input: UpdateTaskDraftRequest = {
      title: draft.title,
      description: draft.description,
      acceptanceCriteria: draft.acceptanceCriteria,
      plan: draft.plan,
      dependencies: draft.dependencies,
      questions: draft.questions,
      status: draft.status,
    }
    void requestJson(base, taskDraftResponseSchema, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
      .then((response) => setDraft(response.draft))
      .catch((caught: unknown) =>
        setError(
          caught instanceof Error
            ? caught.message
            : 'Nie udało się zapisać draftu.',
        ),
      )
      .finally(() => setSaving(false))
  }

  const publish = () => {
    if (!draft) return
    setPublishing(true)
    setError('')
    void requestJson(`${base}/publish`, taskDraftResponseSchema, {
      method: 'POST',
    })
      .then((response) => setDraft(response.draft))
      .catch((caught: unknown) =>
        setError(
          caught instanceof Error
            ? caught.message
            : 'Nie udało się opublikować draftu.',
        ),
      )
      .finally(() => setPublishing(false))
  }

  return (
    <section
      className="mt-7 border-t border-[#2c3644] pt-5"
      aria-label="Draft opracowania"
    >
      <div className="flex items-center justify-between gap-3">
        <h5 className="font-['IBM_Plex_Mono'] text-[10px] font-semibold tracking-[0.12em] text-[#9cabc0] uppercase">
          Opracowanie
        </h5>
        {draft && (
          <span className="text-[10px] text-[#9cabc0]">
            {draft.generationStatus === 'generating'
              ? 'Codex przygotowuje draft…'
              : draft.status === 'ready'
                ? 'Gotowe do akceptacji'
                : 'Wersja robocza'}
          </span>
        )}
      </div>
      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
      {!draft && (
        <div className="mt-3">
          <p className="text-xs leading-relaxed text-[#9cabc0]">
            Zamień rozmowę i opis taska w edytowalny plan, kryteria oraz otwarte
            pytania.
          </p>
          <button
            type="button"
            className="mt-3 min-h-9 rounded-[7px] border border-[#47698e] px-3 text-xs font-semibold text-[#cfe6ff] hover:bg-[#24394f]"
            onClick={generate}
          >
            Przygotuj draft z AI
          </button>
        </div>
      )}
      {draft?.generationStatus === 'generating' && (
        <p className="mt-3 text-xs text-[#9cabc0]">
          Trwa analiza taska i rozmowy. Możesz dalej czytać task, a draft pojawi
          się automatycznie.
        </p>
      )}
      {draft?.generationStatus === 'failed' && (
        <div className="mt-3">
          <p className="text-xs text-red-300">
            {draft.generationError || 'Nie udało się utworzyć draftu.'}
          </p>
          <button
            type="button"
            className="mt-2 text-xs text-[#b9d8ff] underline"
            onClick={generate}
          >
            Spróbuj ponownie
          </button>
        </div>
      )}
      {draft && draft.generationStatus === 'idle' && (
        <div className="mt-4 space-y-3">
          {(draft.title !== task.title ||
            draft.description !== task.description) && (
            <details className="rounded border border-[#354254] bg-[#171f2a] p-2 text-xs text-[#c7d0dc]">
              <summary className="cursor-pointer text-[#b9d8ff]">
                Zobacz zmiany względem issue
              </summary>
              <p className="mt-2 text-[#9cabc0]">Obecny tytuł: {task.title}</p>
              <p className="mt-1 text-[#9cabc0]">Nowy tytuł: {draft.title}</p>
            </details>
          )}
          <label className="block text-xs text-[#c7d0dc]">
            Tytuł
            <input
              className="mt-1 w-full rounded border border-[#354254] bg-[#171f2a] p-2 text-sm text-white"
              value={draft.title}
              onChange={(event) =>
                update({ ...draft, title: event.target.value })
              }
            />
          </label>
          <label className="block text-xs text-[#c7d0dc]">
            Opis
            <textarea
              className="mt-1 min-h-24 w-full rounded border border-[#354254] bg-[#171f2a] p-2 text-sm text-white"
              value={draft.description}
              onChange={(event) =>
                update({ ...draft, description: event.target.value })
              }
            />
          </label>
          {fields.map(({ key, label, placeholder }) => (
            <label key={key} className="block text-xs text-[#c7d0dc]">
              {label}
              <textarea
                className="mt-1 min-h-16 w-full rounded border border-[#354254] bg-[#171f2a] p-2 text-xs text-white"
                placeholder={placeholder}
                value={toLines(draft[key])}
                onChange={(event) =>
                  update({ ...draft, [key]: fromLines(event.target.value) })
                }
              />
            </label>
          ))}
          <label className="block text-xs text-[#c7d0dc]">
            Status
            <select
              className="mt-1 w-full rounded border border-[#354254] bg-[#171f2a] p-2 text-xs text-white"
              value={draft.status}
              onChange={(event) =>
                update({
                  ...draft,
                  status: event.target.value as TaskDraft['status'],
                })
              }
            >
              <option value="draft">Wersja robocza</option>
              <option value="ready">Gotowy do akceptacji</option>
              <option value="approved">Zaakceptowany lokalnie</option>
              <option value="rejected">Odrzucony</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="min-h-9 rounded-[7px] bg-[#365d89] px-3 text-xs font-semibold text-white hover:bg-[#4774a6] disabled:opacity-50"
              disabled={saving}
              onClick={save}
            >
              Zapisz lokalnie
            </button>
            <button
              type="button"
              className="min-h-9 rounded-[7px] border border-[#354254] px-3 text-xs text-[#c7d0dc] hover:bg-[#263548]"
              onClick={generate}
            >
              Wygeneruj ponownie
            </button>
          </div>
          {draft.status === 'approved' && task.provider === 'github' && (
            <div className="rounded border border-[#47698e] bg-[#1a2938] p-3">
              <p className="text-xs leading-relaxed text-[#cfe6ff]">
                Publikacja zaktualizuje tytuł i opis issue w GitHubie.
              </p>
              <button
                type="button"
                className="mt-2 min-h-9 rounded-[7px] bg-[#4774a6] px-3 text-xs font-semibold text-white hover:bg-[#5d8ab8] disabled:opacity-50"
                disabled={publishing}
                onClick={publish}
              >
                {draft.publishedAt
                  ? 'Opublikuj ponownie w GitHubie'
                  : 'Opublikuj w GitHubie'}
              </button>
            </div>
          )}
          <p className="text-[10px] leading-relaxed text-[#77869a]">
            Zmiany pozostają lokalne do chwili osobnej publikacji w GitHubie.
          </p>
        </div>
      )}
    </section>
  )
}
