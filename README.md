# Pathdrasil

Lokalna aplikacja webowa do organizowania pracy programistycznej wykonywanej
przez agentów AI. Repozytorium jest pojedynczym pakietem z frontendem React,
backendem Hono i wspólnymi kontraktami TypeScript.

## Wymagania

- Node.js 22 LTS,
- Bun,
- Git,
- opcjonalnie autoryzowany `gh` i/lub `glab`.

Pathdrasil korzysta z istniejącej autoryzacji CLI. Nie kopiuje ani nie zapisuje
tokenów providerów.

## Uruchomienie

```bash
bun install
bun run dev
```

Frontend działa przez Vite, a żądania `/api` są przekazywane do backendu na
`127.0.0.1:4310`.

Najważniejsze komendy:

```bash
bun run dev          # frontend i backend
bun run test         # testy Vitest
bun run test:e2e     # przepływy i snapshoty wizualne Playwright
bun run test:e2e:update # świadoma aktualizacja obrazów po zmianie UI
bun run lint         # ESLint
bun run typecheck    # frontend, shared i backend
bun run build        # produkcyjny build obu części
bun run check        # pełna kontrola jakości
```

Snapshoty Playwrighta są przechowywane w `e2e/screenshots`. Dzięki temu zmiana
wyglądu trafia do diffu pull requesta razem z kodem. Workflow CI porównuje
aktualny interfejs z zapisanymi obrazami i dołącza raport Playwrighta jako
artefakt, jeśli test E2E się nie powiedzie.

## Struktura

```text
src/       frontend React
server/    lokalny backend Node/Hono
shared/    schematy Zod i typy kontraktów API
docs/      dokumentacja domenowa
planning/  plany wdrożenia i materiały projektowe
```

Konfiguracja projektów jest domyślnie zapisywana w
`~/.local/share/pathdrasil/projects.json` z uprawnieniami `0600`. Lokalizację
można zmienić przez `PATHDRASIL_DATA_DIR`.

Pozostałe zmienne środowiskowe:

- `PATHDRASIL_HOST` — domyślnie `127.0.0.1`,
- `PATHDRASIL_PORT` — domyślnie `4310`,
- `PATHDRASIL_LOG_LEVEL` — domyślnie `info`.

Szczegóły implementacji backendu opisuje
[planning/BACKEND.md](planning/BACKEND.md).
