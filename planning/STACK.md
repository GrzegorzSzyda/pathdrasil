# Pathdrasil — stack technologiczny

Dokument opisuje docelowy fundament aplikacji. Pierwsza wersja jest lokalną aplikacją webową uruchamianą w WSL/Linux.

## Decyzje główne

| Obszar             | Wybór                                                                       | Powód                                                           |
| ------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Runtime            | Node.js 22 LTS                                                              | lokalne procesy, Git, `gh` i Codex CLI                          |
| Package manager    | Bun                                                                         | szybkie instalowanie zależności i skrypty projektu              |
| Język              | TypeScript strict                                                           | wspólne typy między serwerem i UI                               |
| Frontend           | React 19                                                                    | komponentowy interfejs i obsługa modali                         |
| Bundler/dev server | Vite                                                                        | szybki development oraz lokalny serwer                          |
| Style              | Tailwind CSS 4                                                              | spójne tokeny i szybkie iterowanie UI                           |
| Komponenty UI      | własne komponenty + Radix UI tylko dla zachowań dostępnościowych            | kontrola nad wyglądem bez ciężkiego frameworka                  |
| Ikony              | `@phosphor-icons/react`                                                     | spójne ikony, warianty regular/duotone                          |
| Font               | lokalny `@fontsource/nunito-sans`                                           | miękka typografia i działanie offline                           |
| Serwer HTTP        | Hono                                                                        | mały, typowany routing i middleware                             |
| Walidacja          | Zod                                                                         | walidacja requestów, konfiguracji i rezultatów agentów          |
| Dane               | SQLite                                                                      | relacje między projektami, taskami, wykonaniami i sesjami       |
| ORM/migracje       | Drizzle ORM + drizzle-kit                                                   | typy zbliżone do SQL, proste migracje i brak generatora runtime |
| Stan serwera w UI  | TanStack Query                                                              | cache, odświeżanie i stany ładowania                            |
| Stan lokalny UI    | React state; Zustand dopiero gdy pojawi się command palette i wiele ekranów | nie wprowadzamy globalnego store bez potrzeby                   |
| Procesy            | `node:child_process` przez `execa`                                          | bez shell injection, kontrola stdout/stderr i anulowania        |
| Kolejka agentów    | `p-queue`                                                                   | limity równoległości i późniejsze harmonogramy                  |
| GitHub             | GitHub CLI (`gh`)                                                           | korzysta z istniejącej autoryzacji użytkownika                  |
| Agent MVP          | Codex CLI                                                                   | lokalny agent, model i effort wybierane w UI                    |
| Logowanie          | Pino                                                                        | strukturalny dziennik procesu i sesji                           |
| Testy jednostkowe  | Vitest                                                                      | szybkie testy logiki, API i adapterów                           |
| Testy UI           | Playwright                                                                  | scenariusze modali, workflow i tworzenia taska                  |
| Jakość             | ESLint + typescript-eslint + Prettier                                       | jednolity kod i automatyczna kontrola                           |

## Architektura aplikacji

```text
React + Vite + Tailwind
          │ HTTP/JSON
Hono (lokalny serwer Node)
   ├── SQLite/Drizzle — dane Pathdrasil
   ├── gh — GitHub i issues/PR
   ├── git — repozytoria i worktree
   └── codex exec — sesje agentów
```

Serwer nasłuchuje domyślnie tylko lokalnie. Dostęp z Windows do WSL wymaga nasłuchiwania na interfejsie WSL, ale API nadal pozostaje lokalne i nie wystawia sekretów do renderera poza niezbędnymi rezultatami.

## Model danych pierwszej wersji

- `projects` — nazwa, ścieżka, provider i konfiguracja;
- `repositories` — repozytoria przypisane do projektu;
- `tasks` — tytuł, opis, kryteria akceptacji, status własny i identyfikator zewnętrzny;
- `task_drafts` — kolejne wersje draftu i prompty rozmowy;
- `agents` — agent, komenda, dostępność i konfiguracja projektu;
- `agent_runs` — model, effort, status, czas, błędy i zużycie;
- `activity_events` — trwały dziennik zdarzeń.

GitHub pozostaje źródłem issues, ale Pathdrasil przechowuje lokalny cache i własny status taska. Tokenów GitHub ani Codex nie zapisujemy w bazie.

## Zakres MVP

1. Projekt i repozytorium GitHub.
2. Synchronizacja issues przez `gh`.
3. Kanban z własnym mapowaniem statusów.
4. Modal tworzenia taska przez `codex exec`.
5. Iteracyjne poprawianie draftu promptami.
6. Jawne zatwierdzenie i publikacja GitHub Issue.
7. Podstawowy dziennik sesji agenta.

## Po MVP

- rejestr agentów per projekt;
- harmonogram i kolejka prac;
- GitHub Projects jako źródło statusów;
- worktree, branche, PR i review;
- provider GitLab/Linear;
- tryb offline i pełniejszy cache;
- opcjonalna aplikacja desktopowa dopiero po ustabilizowaniu wersji webowej.

## Zasady, których nie zmieniamy bez powodu

- agent nie publikuje danych zewnętrznie bez zatwierdzenia użytkownika;
- procesy uruchamiamy bez powłoki i z kontrolowanymi argumentami;
- każda operacja należy do konkretnego projektu;
- status taska, wykonania i sesji agenta są osobnymi pojęciami;
- biblioteka trafia do projektu dopiero, gdy rozwiązuje konkretny problem.

## Zasady komponentów

- Powtarzalne elementy interfejsu mają własne komponenty bazowe.
- Strony korzystają z komponentów zamiast powielać markup i klasy Tailwinda.
- Przed dodaniem nowego powtarzalnego elementu sprawdzamy, czy istnieje odpowiedni komponent.
- Jeśli komponentu brakuje, najpierw uzgadniamy jego utworzenie i API.
- Komponenty powinny mieć warianty kontrolowane przez `class-variance-authority`, a klasy łączymy przez `cn()`.
