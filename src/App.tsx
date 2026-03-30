import './index.css'

const stack = [
    'Bun',
    'React 19',
    'TypeScript',
    'Tailwind CSS 4',
    'Prettier',
    'Oxlint',
] as const

export const App = () => {
    return (
        <main className="min-h-screen px-6 py-8 sm:px-10 sm:py-10">
            <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
                <div className="w-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,17,30,0.82),rgba(9,17,30,0.62))] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur xl:p-12">
                    <div className="max-w-3xl">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[var(--color-aqua-300)]">
                            Empty Start
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                            Pusta strona startowa pod szybkie prototypowanie.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-sand-200)]/82">
                            Projekt został uproszczony do czystego frontendu. Nie ma już
                            Convexa, auth ani dodatkowej logiki aplikacyjnej.
                        </p>
                    </div>

                    <div className="mt-10">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-coral-300)]">
                            Stack technologiczny
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {stack.map((item) => (
                                <div
                                    key={item}
                                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--color-sand-100)]"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
