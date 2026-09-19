import { useEffect, useState } from 'react'
import { CornersInIcon, CornersOutIcon, XIcon } from '@phosphor-icons/react'
import ReactMarkdown from 'react-markdown'
import {
  conversationResponseSchema,
  type Conversation,
} from '../../../shared/api/conversations'
import { taskDraftResponseSchema } from '../../../shared/api/task-drafts'
import { requestJson } from '../../lib/api'
import { renderConversationMarkdown } from './conversation-markdown'

type TaskConversationProps = {
  projectId: string
  taskId: string
  onClose: () => void
}

export const TaskConversation = ({
  projectId,
  taskId,
  onClose,
}: TaskConversationProps) => {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [publicationNotice, setPublicationNotice] = useState('')
  const base = `/api/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}/conversation`
  const draftBase = `/api/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}/draft`

  useEffect(() => {
    let active = true
    const load = () =>
      requestJson(base, conversationResponseSchema)
        .then((response) => active && setConversation(response.conversation))
        .catch(
          (caught: unknown) =>
            active &&
            setError(
              caught instanceof Error
                ? caught.message
                : 'Nie udało się otworzyć rozmowy.',
            ),
        )
    void load().then(async () => {
      const response = await requestJson(base, conversationResponseSchema)
      if (active && response.conversation.messages.length === 0)
        setConversation(
          (
            await requestJson(`${base}/start`, conversationResponseSchema, {
              method: 'POST',
            })
          ).conversation,
        )
    })
    const events = new EventSource(`${base}/events`)
    const refresh = () => void load()
    events.addEventListener('complete', refresh)
    events.addEventListener('cancelled', refresh)
    events.addEventListener('error', refresh)
    return () => {
      active = false
      events.close()
    }
  }, [base])

  useEffect(() => {
    if (publicationNotice !== 'Przygotowuję i zapisuję zaakceptowany draft…')
      return
    const poll = () =>
      requestJson(draftBase, taskDraftResponseSchema)
        .then(({ draft }) => {
          if (draft?.generationStatus === 'failed')
            setPublicationNotice(
              `Nie udało się zapisać: ${draft.generationError || 'spróbuj ponownie.'}`,
            )
          else if (draft?.publishedAt)
            setPublicationNotice('Zaakceptowane ustalenia zapisano w GitHubie.')
        })
        .catch(() =>
          setPublicationNotice('Nie udało się sprawdzić zapisu draftu.'),
        )
    void poll()
    const timer = window.setInterval(() => void poll(), 1_000)
    return () => window.clearInterval(timer)
  }, [draftBase, publicationNotice])

  return (
    <section
      className={`flex min-w-[320px] flex-1 flex-col border-l border-[#293342] bg-[#111720] p-5 ${fullscreen ? 'fixed top-[72px] right-0 bottom-0 left-0 z-50 border-0' : ''}`}
      aria-label="Rozmowa o tasku"
    >
      {fullscreen && (
        <button
          type="button"
          className="absolute top-5 right-5 z-10 grid size-10 place-items-center rounded-[7px] text-white hover:bg-[#283342] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#758399]"
          onClick={() => setFullscreen(false)}
          aria-label="Zamknij pełny ekran"
        >
          <CornersInIcon aria-hidden="true" size={22} />
        </button>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="font-['IBM_Plex_Mono'] text-[10px] font-semibold tracking-[0.12em] text-[#8fa0b6] uppercase">
          Rozmowa z AI
        </p>
        <div className="ml-auto flex items-center gap-1">
          {!fullscreen && (
            <button
              type="button"
              className="grid size-[30px] place-items-center rounded-[7px] text-[#aab4c3] hover:bg-[#283342] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#758399]"
              onClick={() => setFullscreen((open) => !open)}
              aria-label={
                fullscreen ? 'Zamknij pełny ekran' : 'Otwórz pełny ekran'
              }
            >
              {fullscreen ? (
                <CornersInIcon aria-hidden="true" size={18} />
              ) : (
                <CornersOutIcon aria-hidden="true" size={18} />
              )}
            </button>
          )}
          {!fullscreen && (
            <button
              type="button"
              className="grid size-[30px] place-items-center rounded-[7px] text-[#aab4c3] hover:bg-[#283342] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#758399]"
              onClick={onClose}
              aria-label="Zamknij rozmowę"
            >
              <XIcon aria-hidden="true" size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-5 min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:#334155_transparent] space-y-3 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#334155] [&::-webkit-scrollbar-thumb:hover]:bg-[#4b6079]">
        {error && <p className="text-sm text-red-300">{error}</p>}
        {!conversation && !error && (
          <p className="text-sm text-[#9ca8b7]">Agent analizuje task…</p>
        )}
        {conversation?.messages.map((message) => (
          <article
            key={message.id}
            className={
              message.role === 'user'
                ? 'ml-6 rounded-lg bg-[#263548] p-3 text-sm text-[#e6edf5]'
                : 'mr-6 rounded-lg bg-[#1d2632] p-3 text-sm text-[#c7d0dc]'
            }
          >
            {message.content ? (
              <div className="space-y-2 [&_code]:rounded [&_code]:bg-[#111720] [&_code]:px-1 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h3]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_ol]:space-y-1 [&_p]:leading-relaxed">
                <ReactMarkdown>
                  {renderConversationMarkdown(message.content)}
                </ReactMarkdown>
              </div>
            ) : (
              <TypingIndicator />
            )}
          </article>
        ))}
      </div>
      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault()
          const content = draft.trim()
          if (!content || conversation?.status === 'responding') return
          const publishesDraft =
            /(^|[^\p{L}])akcept(?:uję|uje|ujemy|uj(?:ę|emy)?|owano)(?=$|[^\p{L}])/iu.test(
              content,
            )
          setDraft('')
          if (publishesDraft)
            setPublicationNotice('Przygotowuję i zapisuję zaakceptowany draft…')
          void requestJson(`${base}/messages`, conversationResponseSchema, {
            method: 'POST',
            body: JSON.stringify({ content }),
          })
            .then((response) => setConversation(response.conversation))
            .catch((caught: unknown) =>
              setError(
                caught instanceof Error
                  ? caught.message
                  : 'Nie udało się wysłać wiadomości.',
              ),
            )
        }}
      >
        <textarea
          className="min-h-20 w-full resize-y rounded-lg border border-[#334155] bg-[#171f2a] p-3 text-sm text-[#e6edf5] placeholder:text-[#718096] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#758399]"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          placeholder="Napisz wiadomość…"
          disabled={conversation?.status === 'responding'}
        />
        <div className="mt-2 flex justify-end gap-2">
          {conversation?.status === 'responding' && (
            <button
              type="button"
              className="min-h-9 rounded-md border border-[#6e4852] px-3 text-xs text-[#f2b8c0] hover:bg-[#43242b]"
              onClick={() => {
                void fetch(`${base}/cancel`, { method: 'POST' }).then(
                  (response) => {
                    if (!response.ok)
                      setError('Nie udało się zatrzymać odpowiedzi.')
                  },
                  () => setError('Nie udało się zatrzymać odpowiedzi.'),
                )
              }}
            >
              Zatrzymaj
            </button>
          )}
          <button
            type="submit"
            className="min-h-9 rounded-md bg-[#365d89] px-3 text-xs font-semibold text-white hover:bg-[#4774a6] disabled:opacity-50"
            disabled={!draft.trim() || conversation?.status === 'responding'}
          >
            Wyślij
          </button>
        </div>
      </form>
      {publicationNotice && (
        <p className="mt-2 text-xs text-[#b9d8ff]" role="status">
          {publicationNotice}
        </p>
      )}
      <p className="mt-4 text-xs text-[#77869a]">
        Tryb konsultacyjny · tylko odczyt repozytoriów · aby zapisać ustalenia,
        napisz „Akceptuję”.
      </p>
    </section>
  )
}

const TypingIndicator = () => (
  <span className="inline-flex items-center gap-1" aria-label="Agent pisze">
    <i className="size-1.5 animate-bounce rounded-full bg-[#9fb0c4] [animation-delay:-0.2s]" />
    <i className="size-1.5 animate-bounce rounded-full bg-[#9fb0c4] [animation-delay:-0.1s]" />
    <i className="size-1.5 animate-bounce rounded-full bg-[#9fb0c4]" />
  </span>
)
