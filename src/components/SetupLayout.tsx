import type { ReactNode } from 'react'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  QuestionIcon,
} from '@phosphor-icons/react'
import { Button } from './Button'
import { Kbd } from './Kbd'

export type SetupStep = { title: string; description: string }

type SetupLayoutProps = {
  steps: SetupStep[]
  activeStep: number
  onStepChange: (step: number) => void
  onBack: () => void
  onNext: () => void
  canNext: boolean
  nextLabel: string
  onHelp: () => void
  children: ReactNode
}

export const SetupLayout = ({
  steps,
  activeStep,
  onStepChange,
  onBack,
  onNext,
  canNext,
  nextLabel,
  onHelp,
  children,
}: SetupLayoutProps): React.JSX.Element => (
  <main className="bg-page text-text min-h-screen">
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-10">
      <header className="border-border/50 flex items-center justify-between border-b pb-5">
        <span className="text-heading font-semibold tracking-tight">
          Pathdrasil / Nowy projekt
        </span>
        <Button
          type="button"
          appearance="ghost"
          size="icon"
          aria-label="Skróty klawiaturowe"
          onClick={onHelp}
        >
          <QuestionIcon aria-hidden="true" />
        </Button>
      </header>
      <div className="grid flex-1 gap-10 py-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Etapy tworzenia projektu">
          <ol className="grid gap-2">
            {steps.map((step, index) => {
              const done = index < activeStep
              const active = index === activeStep
              return (
                <li key={step.title}>
                  <button
                    type="button"
                    disabled={index > activeStep}
                    aria-current={active ? 'step' : undefined}
                    onClick={() => index <= activeStep && onStepChange(index)}
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
                        <span className="text-muted block text-xs">
                          {step.description}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          <p className="text-muted mt-8 text-xs leading-relaxed">
            Każda strona dotyczy jednej domeny. Dane zapiszą się dopiero po
            zatwierdzeniu podsumowania.
          </p>
        </nav>
        <section
          className="mx-auto flex w-full max-w-2xl flex-col"
          aria-label={steps[activeStep]?.title}
        >
          <div className="flex-1">{children}</div>
          <footer className="border-border mt-10 flex items-center justify-between gap-4 border-t pt-5">
            <Button
              type="button"
              appearance="ghost"
              onClick={onBack}
              disabled={activeStep === 0}
            >
              <ArrowLeftIcon aria-hidden="true" /> Wstecz <Kbd>Alt ←</Kbd>
            </Button>
            <Button type="button" onClick={onNext} disabled={!canNext}>
              <span>{nextLabel}</span>
              {activeStep < steps.length - 1 && (
                <>
                  <Kbd>Alt →</Kbd>
                  <ArrowRightIcon aria-hidden="true" />
                </>
              )}
            </Button>
          </footer>
        </section>
      </div>
    </div>
  </main>
)
