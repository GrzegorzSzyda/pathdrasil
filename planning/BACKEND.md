# Backend Pathdrasil — plan wdrożenia

## Stan realizacji

Pierwszy pion został wdrożony 8 września 2026 roku. Obejmuje osobny serwer Hono,
wspólne kontrakty, bezpieczny runner procesów, integracje `gh` i `glab`,
przeglądarkę katalogów, weryfikację repozytoriów, atomowy store projektów,
synchronizację issues z krótkim cache oraz podstawowy dashboard. Pierwsza wersja
obsługuje aktywne konto CLI; bezpieczny wybór wielu kont pozostaje osobnym
rozszerzeniem.

## Cel

Zbudować lokalny backend, który można rozwijać równolegle z interfejsem. Frontend
nie może uruchamiać procesów ani znać szczegółów działania `gh`, `glab`, `git`
czy agentów. Komunikuje się wyłącznie z typowanym API HTTP.

Pierwszy pion backendu ma:

1. uruchamiać się niezależnie od Vite,
2. raportować stan aplikacji,
3. wykrywać instalację i autoryzację `gh` oraz `glab`,
4. zwracać zweryfikowane konto użytkownika bez ujawniania tokenów,
5. mieć testowalny adapter procesów i wspólny format błędów,
6. dostarczać frontendowi stabilny kontrakt, także gdy CLI jest niedostępne.

## Decyzje na start

| Obszar            | Decyzja                                                               |
| ----------------- | --------------------------------------------------------------------- |
| Runtime           | Node.js 22 LTS                                                        |
| Pakiety i skrypty | Bun                                                                   |
| HTTP              | Hono + `@hono/node-server`                                            |
| Walidacja         | Zod na wejściu i na wyjściu adapterów CLI                             |
| Procesy           | Execa, zawsze bez powłoki                                             |
| Logi              | Pino; bez stdout/stderr z danymi wrażliwymi                           |
| Testy             | Vitest                                                                |
| Development       | osobny proces backendu i Vite z proxy `/api`                          |
| Dane              | bez bazy w pierwszym pionie; trwały store dodajemy z zapisem projektu |

Nie wprowadzamy jeszcze Drizzle, SQLite, kolejki ani systemu pluginów. Nie są
potrzebne do wykrywania integracji, a utrudniłyby ustabilizowanie pierwszego API.

## Docelowy układ katalogów pierwszego pionu

```text
src/                         # istniejący frontend React
server/
  index.ts                   # start procesu i graceful shutdown
  app.ts                     # składanie Hono, middleware i tras
  config.ts                  # port, host, timeouty; walidowane env
  api/
    health.ts
    integrations.ts
  integrations/
    types.ts                 # wspólny kontrakt providera
    registry.ts              # allowlista obsługiwanych providerów
    github-cli.ts
    gitlab-cli.ts
  infrastructure/
    command-runner.ts        # jedyne miejsce uruchamiające procesy
    logger.ts
  errors/
    app-error.ts
    error-handler.ts
shared/
  api/
    integrations.ts          # schematy Zod i typy używane przez UI i serwer
tests/
  fixtures/cli/              # bezpieczne, zanonimizowane odpowiedzi CLI
```

Frontend może importować typy i schematy wyłącznie z `shared/`. Nie importuje
niczego z `server/`. Warstwa HTTP nie parsuje tekstu CLI — deleguje to do
adaptera konkretnego providera.

## Uruchamianie lokalne

Planowane skrypty:

```json
{
  "dev": "frontend i backend równolegle",
  "dev:web": "vite",
  "dev:server": "tsx watch server/index.ts",
  "build": "typecheck, build frontendu i backendu",
  "typecheck": "TypeScript dla obu części",
  "test": "vitest run",
  "lint": "eslint ."
}
```

Vite przekazuje `/api/*` do lokalnego portu backendu. Dzięki temu frontend nie
potrzebuje CORS ani adresu serwera wpisanego na stałe. W buildzie backend serwuje
statyczne pliki frontendu albo oba procesy uruchamia jeden skrypt startowy — tę
decyzję można odłożyć do momentu przygotowania dystrybucji.

## Kontrakt pierwszego API

### `GET /api/health`

Służy do sprawdzenia, czy backend działa.

```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

### `GET /api/integrations`

Zwraca stan wszystkich providerów potrzebnych kreatorowi. Niedostępność CLI lub
brak autoryzacji jest poprawnym wynikiem biznesowym, nie błędem HTTP.

```json
{
  "providers": [
    {
      "id": "github",
      "domain": "task-manager",
      "status": "available",
      "cli": { "command": "gh", "installed": true, "version": "..." },
      "accounts": [
        {
          "id": "github:github.com:octocat",
          "host": "github.com",
          "login": "octocat",
          "active": true
        }
      ]
    },
    {
      "id": "gitlab",
      "domain": "task-manager",
      "status": "not-installed",
      "cli": { "command": "glab", "installed": false },
      "accounts": []
    }
  ]
}
```

Wspólne statusy pierwszej wersji:

- `available` — CLI działa, a konto zostało potwierdzone przez API providera,
- `not-installed` — programu nie ma w `PATH`,
- `not-authenticated` — program działa, ale nie ma aktywnej sesji,
- `unreachable` — provider lub sieć nie odpowiedziały,
- `unsupported` — provider jest pokazany w UI, ale adapter jeszcze nie istnieje,
- `error` — nieoczekiwany, bezpiecznie opisany błąd.

### `POST /api/integrations/:provider/verify`

Ponawia sprawdzenie jednego providera. `:provider` musi należeć do allowlisty;
wartość z URL nigdy nie staje się nazwą programu ani argumentem procesu.

W pierwszym pionie obsługujemy aktywne konto CLI dla danego hosta. Nie
przełączamy globalnie konta `gh` lub `glab`, ponieważ byłaby to mutacja ustawień
użytkownika. Obsługę wielu kont dodamy po rozpoznaniu zachowania konkretnych
wersji CLI i zaprojektowaniu wyboru bez efektów ubocznych.

### `GET /api/integrations/:provider/sources`

Zwraca projekty dostępne dla aktywnego konta CLI. GitHub mapuje dostępne
repozytoria, a GitLab projekty należące do użytkownika. Wybrane źródło trafia do
`taskManager.sources` i nie zależy od repozytoriów kodu dodanych w kolejnym
kroku kreatora.

## Adaptery `gh` i `glab`

Każdy adapter implementuje ten sam interfejs:

```ts
type IntegrationAdapter = {
  detect(): Promise<IntegrationProvider>
  listSources(): Promise<TaskSource[]>
}
```

Przebieg sprawdzenia:

1. uruchomienie `--version` potwierdza obecność programu,
2. natywna komenda `auth status` rozróżnia brak autoryzacji,
3. wywołanie API użytkownika pobiera maszynowo czytelne dane konta,
4. odpowiedź JSON jest walidowana przez Zod,
5. adapter mapuje błędy procesu na wspólne statusy domenowe.

Nie opieramy identyfikacji konta na jednym wyrażeniu regularnym dopasowanym do
tekstu `auth status`. Tekst może zmieniać się między wersjami i językami CLI.
To wywołanie służy do diagnozy autoryzacji, natomiast tożsamość potwierdza API.

## Bezpieczeństwo procesu

`command-runner.ts` jest jedynym modułem z prawem uruchamiania lokalnych komend.
Musi zapewniać:

- `shell: false` i wyłącznie jawnie przekazane argumenty,
- allowlistę programów: początkowo `gh` i `glab`, później `git` i agenci,
- limit czasu, początkowo 10 sekund dla sprawdzeń integracji,
- limit rozmiaru stdout i stderr,
- anulowanie po rozłączeniu klienta, jeśli operacja jest długa,
- mapowanie `ENOENT`, timeoutu i kodów wyjścia na typowane błędy,
- redakcję tokenów, nagłówków i wartości zmiennych środowiskowych,
- logowanie nazwy operacji, czasu i kodu wyjścia bez logowania sekretów.

Backend nie zwraca surowego stderr do UI. Frontend dostaje kod, krótki komunikat
oraz opcjonalną bezpieczną wskazówkę naprawy.

## Format błędów API

Nieoczekiwane lub niepoprawne requesty używają jednego formatu:

```json
{
  "error": {
    "code": "INVALID_PROVIDER",
    "message": "Nieobsługiwany provider.",
    "requestId": "..."
  }
}
```

Kody HTTP:

- `400` — niepoprawne dane wejściowe,
- `404` — nieznana trasa lub zasób,
- `409` — konflikt stanu przy przyszłych operacjach zapisu,
- `500` — nieoczekiwany błąd backendu.

Brak CLI, autoryzacji lub sieci w endpointach diagnostycznych pozostaje `200`,
ponieważ UI musi normalnie wyrenderować te stany.

## Etapy realizacji

### Etap 1 — fundament serwera

- dodać Hono, adapter Node, Zod, Execa, Pino, Vitest i runner TypeScript,
- utworzyć strukturę `server/`, `shared/` i konfigurację TypeScript,
- dodać `GET /api/health`, obsługę 404, błędów i request ID,
- ustawić Vite proxy oraz równoległe skrypty developerskie,
- dodać test endpointu health i test uruchamiania aplikacji.

Rezultat: frontend i backend startują jedną komendą, a awaria jednego procesu
jest widoczna i kończy cały tryb developerski.

### Etap 2 — bezpieczny command runner

- opakować Execa we wspólny interfejs,
- wprowadzić allowlistę, timeout, limit wyjścia i mapowanie błędów,
- umożliwić wstrzyknięcie fałszywego runnera do testów,
- przetestować sukces, brak programu, kod błędu, timeout i zbyt duże wyjście.

Rezultat: żaden endpoint ani adapter nie uruchamia procesu bezpośrednio.

### Etap 3 — GitHub CLI

- zaimplementować wykrywanie `gh`, stan autoryzacji i pobranie bieżącego usera,
- dodać schemat odpowiedzi GitHub API i mapowanie błędów,
- obsłużyć `GET /api/integrations` oraz weryfikację GitHuba,
- podłączyć krok „Menedżer zadań” do nowego kontraktu,
- usunąć tymczasowy middleware `localCliAccounts` z `vite.config.ts`.

Rezultat: UI pokazuje rzeczywisty stan GitHub CLI oraz aktywne konto.

### Etap 4 — GitLab CLI

- zaimplementować analogiczny adapter `glab`,
- uwzględnić host GitLab.com oraz skonfigurowane hosty self-managed,
- dodać fixture'y i testy niezależne od lokalnej autoryzacji developera,
- podłączyć status i konto GitLaba w kreatorze.

Rezultat: oba CLI mają ten sam kontrakt mimo różnic w swoich komendach.

### Etap 5 — repozytorium i utworzenie projektu

- dodać adapter `git` oraz walidację istniejącego katalogu,
- rozpoznać remote i powiązać go z kontem GitHub/GitLab,
- dodać bezpieczne endpointy przeglądania katalogów,
- wprowadzić repozytorium danych projektu i zapis atomowy do lokalnego JSON,
- dodać endpoint tworzenia oraz odczytu projektu,
- dopiero wtedy zdecydować, kiedy relacje uzasadniają migrację do SQLite.

Rezultat: cały obecny kreator kończy się utworzeniem prawdziwego lokalnego
projektu, który przetrwa restart.

### Etap 6 — pierwsze dane produktowe

- pobrać przypisane issues przez adapter providera,
- znormalizować GitHub Issue i GitLab Issue do wspólnego typu `TaskSummary`,
- dodać synchronizację na żądanie, limit współbieżności i podstawowy cache,
- podłączyć dashboard i workflow do backendu przez TanStack Query.

Rezultat: aplikacja pokazuje prawdziwe taski bez uzależniania UI od formatu
GitHuba lub GitLaba.

## Jak rozwijać frontend równolegle

Po ustaleniu schematów z `shared/api/` frontend może korzystać z fixture'ów lub
Mock Service Worker. Backend implementuje ten sam kontrakt niezależnie. Dla
każdego endpointu kolejność pracy jest następująca:

1. schemat requestu i response w `shared/`,
2. przykładowe odpowiedzi dla wszystkich stanów UI,
3. ekran oparty na mocku i adapter backendu rozwijane równolegle,
4. test kontraktu adaptera,
5. przełączenie UI z mocka na `/api` bez zmiany komponentów.

Nie eksportujemy typów wygenerowanych z implementacji endpointu. Schemat w
`shared/` jest jawną granicą i obie strony muszą go walidować.

## Testy i kryteria ukończenia pierwszego pionu

Testy jednostkowe nie mogą zależeć od tego, czy autor ma zalogowane `gh` lub
`glab`. Używają wstrzykniętego runnera i fixture'ów. Osobny, opcjonalny test
integracyjny może sprawdzać prawdziwe lokalne CLI.

Pierwszy pion jest gotowy, gdy:

- `bun run dev` uruchamia backend i frontend,
- `GET /api/health` odpowiada po starcie,
- kreator rozróżnia dostępność, brak programu, brak autoryzacji i błąd sieci,
- konto pochodzi z odpowiedzi API providera, a nie z kruchego parsowania tekstu,
- tokeny i pełne stderr nigdy nie trafiają do przeglądarki ani logów,
- GitHub i GitLab korzystają z jednego kontraktu UI,
- testy przechodzą bez zainstalowanych CLI,
- typecheck, lint, format i build są częścią jednej kontroli CI.

## Kolejność najbliższych prac

Najmniejszy sensowny zestaw na pierwszy pull request to Etap 1 i Etap 2. Drugi
pull request obejmuje GitHub CLI i przepięcie istniejącego UI. Trzeci dodaje
GitLab CLI. Dzięki temu każdy PR kończy się działającym, testowalnym przyrostem,
a tymczasowa logika w Vite znika dopiero, gdy zastępuje ją gotowy endpoint.
