import './index.css'

const paletteSections = [
    {
        title: 'Primary',
        description:
            'Główny zielony kierunek marki. Sprawdza się w CTA, aktywnych stanach i elementach budujących zaufanie oraz spokój.',
        colors: [
            ['Primary', 'var(--color-primary)', '#4F6F1E'],
            ['Primary Hover', 'var(--color-primary-hover)', '#6E8F2A'],
            ['Primary Dark', 'var(--color-primary-dark)', '#3B5416'],
        ],
    },
    {
        title: 'Secondary',
        description:
            'Ciepły brąz jako kontrapunkt dla zieleni. Dobrze działa w akcentach, kategoriach pobocznych i elementach o bardziej rzemieślniczym charakterze.',
        colors: [
            ['Secondary', 'var(--color-secondary)', '#6B3E0B'],
            ['Secondary Hover', 'var(--color-secondary-hover)', '#8A5418'],
            ['Secondary Dark', 'var(--color-secondary-dark)', '#4A2B07'],
        ],
    },
    {
        title: 'UI',
        description:
            'Zestaw kolorów komunikacyjnych do statusów systemowych. Zielony dla sukcesu, bursztyn dla ostrzeżeń i ceglasta czerwień dla błędów.',
        colors: [
            ['Success', 'var(--color-success)', '#5FAF3A'],
            ['Warning', 'var(--color-warning)', '#D4A017'],
            ['Error', 'var(--color-error)', '#C0392B'],
        ],
    },
    {
        title: 'Backgrounds',
        description:
            'Jasna, miękka baza interfejsu. Utrzymuje dużo powietrza, pozwala treści oddychać i daje czyste tło pod komponenty.',
        colors: [
            ['Background', 'var(--color-background)', '#F6F7F2'],
            ['Surface', 'var(--color-surface)', '#FFFFFF'],
            ['Surface Alt', 'var(--color-surface-alt)', '#EDEFE6'],
        ],
    },
    {
        title: 'Text',
        description:
            'Czytelna hierarchia treści. Mocny grafit na treść główną, chłodniejszy szary na wspierające informacje i neutralny ton na metadane.',
        colors: [
            ['Text Primary', 'var(--color-text-primary)', '#1F2933'],
            ['Text Secondary', 'var(--color-text-secondary)', '#4B5563'],
            ['Text Muted', 'var(--color-text-muted)', '#9CA3AF'],
        ],
    },
] as const

export const App = () => {
    return (
        <main className="min-h-screen bg-[var(--color-background)] px-6 py-10 text-[var(--color-text-primary)] sm:px-10 lg:px-14">
            <section className="mx-auto max-w-6xl">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold tracking-[0.28em] text-[var(--color-primary)] uppercase">
                        Color System
                    </p>
                    <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                        Paleta pod spokojny, naturalny interfejs.
                    </h1>
                    <p className="mt-5 text-base leading-8 text-[var(--color-text-secondary)]">
                        Ten zestaw łączy oliwkową zieleń z ciepłym brązem i jasnym tłem.
                        Daje wrażenie stabilności, organiczności i porządku bez sterylnego
                        charakteru. Dobrze pasuje do produktów związanych z planowaniem,
                        naturą, zdrowiem, rzemiosłem albo narzędziami o spokojniejszym
                        tonie.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 lg:grid-cols-2">
                    {paletteSections.map((section) => (
                        <article
                            key={section.title}
                            className="rounded-[2rem] border border-black/6 bg-[var(--color-surface)] p-7 shadow-[0_18px_50px_rgba(31,41,51,0.06)]"
                        >
                            <h2 className="text-2xl font-semibold tracking-[-0.02em]">
                                {section.title}
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                                {section.description}
                            </p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                {section.colors.map(([label, color, hex]) => (
                                    <div
                                        key={label}
                                        className="rounded-[1.5rem] bg-[var(--color-surface-alt)] p-3"
                                    >
                                        <div
                                            className="h-28 rounded-[1.1rem] border border-black/8"
                                            style={{ backgroundColor: color }}
                                        />
                                        <div className="mt-3">
                                            <p className="text-sm font-medium">{label}</p>
                                            <p className="mt-1 font-mono text-xs tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
                                                {hex}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}
