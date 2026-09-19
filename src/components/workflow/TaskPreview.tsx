import type { RefObject } from 'react'
import { ArrowSquareOutIcon, XIcon } from '@phosphor-icons/react'
import ReactMarkdown from 'react-markdown'
import type { TaskSummary } from '../../../shared/api/tasks'
import { TaskConversation } from './TaskConversation'
import { formatDate, providerName } from './workflow-formatters'

type TaskPreviewProps = {
  task: TaskSummary
  headingRef: RefObject<HTMLHeadingElement | null>
  onClose: () => void
  projectId: string
  conversationOpen: boolean
  onOpenConversation: () => void
  onCloseConversation: () => void
  onTaskPublished: () => void
}

export const TaskPreview = ({
  task,
  headingRef,
  onClose,
  projectId,
  conversationOpen,
  onOpenConversation,
  onCloseConversation,
  onTaskPublished,
}: TaskPreviewProps): React.JSX.Element => {
  return (
    <div
      className={`absolute top-14 bottom-0 flex min-w-[418px] overflow-hidden rounded-tl-[22px] bg-[#141922] max-[760px]:top-[52px] ${conversationOpen ? 'left-[302px] w-[838px]' : 'right-0 w-[58%]'}`}
    >
      <aside
        id="task-preview"
        className={`relative min-w-[340px] [scrollbar-width:thin] [scrollbar-color:#334155_transparent] overflow-x-hidden overflow-y-auto p-7 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#334155] [&::-webkit-scrollbar-thumb:hover]:bg-[#4b6079] ${conversationOpen ? 'w-[418px] flex-none' : 'flex-1'}`}
        aria-labelledby="task-preview-heading"
      >
        <button
          type="button"
          className="absolute top-5 right-5 grid size-[30px] cursor-pointer place-items-center rounded-[7px] border-0 text-[#aab4c3] hover:bg-[#283342] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#758399]"
          onClick={onClose}
          aria-label="Zamknij podgląd"
        >
          <XIcon aria-hidden="true" size={18} />
        </button>
        <p className="mr-[46px] mb-[18px] font-['IBM_Plex_Mono'] text-[10px] leading-none font-bold tracking-[0.12em] text-[#c5ceda] uppercase">
          {providerName(task.provider)} · #{task.externalId}
        </p>
        <h4
          ref={headingRef}
          id="task-preview-heading"
          tabIndex={-1}
          className="text-[clamp(20px,2vw,30px)] leading-[1.08] font-bold tracking-[-0.045em] text-[#d9e0e9] outline-0"
        >
          {task.title}
        </h4>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-9 rounded-[7px] bg-[#365d89] px-3 text-xs font-semibold text-white hover:bg-[#4774a6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#758399]"
            onClick={onOpenConversation}
          >
            Opracuj z AI
          </button>
          <a
            className="inline-flex min-h-9 items-center gap-2 rounded-[7px] border border-[#354254] bg-[#202a37] px-3 text-[11px] font-semibold text-[#c2ccd8] no-underline hover:border-[#6d8197] hover:bg-[#2d3b4b] hover:text-[#f2f5f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#758399]"
            href={task.url}
            target="_blank"
            rel="noreferrer"
          >
            <ArrowSquareOutIcon aria-hidden="true" size={15} />
            Otwórz w {task.provider === 'github' ? 'GitHubie' : 'GitLabie'}
          </a>
        </div>
        <div className="my-5 space-y-3 text-[13px] leading-[1.65] text-[#b6bab6] [&_code]:rounded [&_code]:bg-[#0e131b] [&_code]:px-1 [&_h1]:text-xl [&_h2]:text-lg [&_li]:ml-5 [&_li]:list-disc">
          <ReactMarkdown>{task.description || 'Brak opisu.'}</ReactMarkdown>
        </div>
        <dl className="mt-8">
          <div className="mt-7">
            <dt className="mb-[9px] font-['IBM_Plex_Mono'] text-[9px] leading-none font-semibold tracking-[0.12em] text-[#717671] uppercase">
              Repozytorium
            </dt>
            <dd className="m-0 text-xs leading-normal text-[#e1e4df]">
              {task.repository}
            </dd>
          </div>
          <div className="mt-7">
            <dt className="mb-[9px] font-['IBM_Plex_Mono'] text-[9px] leading-none font-semibold tracking-[0.12em] text-[#717671] uppercase">
              Etykiety
            </dt>
            <dd className="m-0 text-xs leading-normal text-[#e1e4df]">
              {task.labels.length ? task.labels.join(', ') : 'Brak'}
            </dd>
          </div>
          <div className="mt-7">
            <dt className="mb-[9px] font-['IBM_Plex_Mono'] text-[9px] leading-none font-semibold tracking-[0.12em] text-[#717671] uppercase">
              Ostatnia aktualizacja
            </dt>
            <dd className="m-0 text-xs leading-normal text-[#e1e4df]">
              <time dateTime={task.updatedAt}>
                {formatDate(task.updatedAt)}
              </time>
            </dd>
          </div>
        </dl>
      </aside>
      {conversationOpen && (
        <TaskConversation
          projectId={projectId}
          taskId={task.id}
          onClose={onCloseConversation}
          onTaskPublished={onTaskPublished}
        />
      )}
    </div>
  )
}
