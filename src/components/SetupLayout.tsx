import type { ReactNode } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'
import { Button } from './Button'
import { Kbd } from './Kbd'
import { Topbar } from './Topbar'

export type SetupStep = { title: string }

type SetupLayoutProps = {
  steps: SetupStep[]
  activeStep: number
  maxUnlockedStep: number
  onStepChange: (step: number) => void
  onBack: () => void
  onNext: () => void
  canNext: boolean
  nextLabel: string
  shortcutsVisible: boolean
  children: ReactNode
}

export const SetupLayout = ({
  steps,
  activeStep,
  maxUnlockedStep,
  onStepChange,
  onBack,
  onNext,
  canNext,
  nextLabel,
  shortcutsVisible,
  children,
}: SetupLayoutProps): React.JSX.Element => (
  <main className="bg-page text-text min-h-screen">
    <div className="flex min-h-screen w-full flex-col px-6 py-6 sm:px-10">
      <Topbar />
      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 py-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Etapy tworzenia projektu">
          <ol className="grid gap-2">
            {steps.map((step, index) => {
              const done = index < activeStep
              const active = index === activeStep
              return (
                <li key={step.title}>
                  <button
                    type="button"
                    disabled={index > maxUnlockedStep}
                    aria-current={active ? 'step' : undefined}
                    onClick={() =>
                      index <= maxUnlockedStep && onStepChange(index)
                    }
                    className="text-left disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 ${active ? 'bg-surface text-heading' : 'text-muted hover:bg-surface/50'}`}
                    >
                      <span
                        className={`grid size-8 place-items-center rounded-lg border font-mono text-xs ${done ? 'border-brand/40 bg-brand/10 text-brand' : active ? 'border-brand/50 text-brand' : 'border-border'}`}
                      >
                        {done ? '✓' : index + 1}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">
                          {step.title}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
        <section
          id="setup-content"
          className="mx-auto flex w-full max-w-2xl flex-col"
          aria-label={steps[activeStep]?.title}
        >
          <div className="flex-1">{children}</div>
          <footer className="mt-10 flex items-center justify-between gap-4 pt-5">
            {activeStep > 0 ? (
              <span className="relative">
                <Button type="button" appearance="ghost" onClick={onBack}>
                  <ArrowLeftIcon aria-hidden="true" /> Wstecz
                </Button>
                {shortcutsVisible && (
                  <Kbd className="absolute top-1/2 left-full ml-2 -translate-y-1/2">
                    Esc / ⌫
                  </Kbd>
                )}
              </span>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="relative">
              <Button type="button" onClick={onNext} disabled={!canNext}>
                <span>{nextLabel}</span>
                {activeStep < steps.length - 1 && (
                  <ArrowRightIcon aria-hidden="true" />
                )}
              </Button>
              {shortcutsVisible && activeStep < steps.length - 1 && (
                <Kbd className="absolute top-1/2 right-full mr-2 -translate-y-1/2">
                  Alt →
                </Kbd>
              )}
            </span>
          </footer>
        </section>
      </div>
    </div>
  </main>
)
