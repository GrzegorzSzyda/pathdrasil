# MVP 1 — lokalny projekt i GitHub CLI

## Cel

Pierwszy działający pion produktu pozwala użytkownikowi:

1. utworzyć projekt z co najmniej jednym istniejącym lokalnym repozytorium,
2. rozpoznać repozytoria GitHub przez lokalnie autoryzowane `gh`,
3. zobaczyć dane repozytorium i podsumowanie przypisanych issues,
4. zobaczyć otwarte issues przypisane do autoryzowanego użytkownika w workflow.

Pierwszym repozytorium testowym jest `GrzegorzSzyda/pathdrasil`. Integracja nie odczytuje ani nie kopiuje tokena `gh`.

## Stos

- React + TypeScript,
- lokalny serwer Vite z middleware Node odpowiedzialnym za uruchamianie `gh`,
- lokalny plik konfiguracji projektu w katalogu danych Pathdrasil.

SQLite zostanie wprowadzony, gdy pojawią się dane wymagające relacji i cache. W pierwszym pionie pojedynczy plik JSON ogranicza zależności natywne i upraszcza uruchomienie.

## Przepływ

1. Użytkownik wybiera „Dodaj projekt”.
2. Podaje nazwę projektu.
3. Wybiera GitHub Issues jako task manager.
4. Dodaje folder repozytorium w przeglądarce katalogów obsługiwanej przez lokalny backend.
5. Backend sprawdza folder i wykonuje `gh repo view` z tym folderem jako `cwd`.
6. Aplikacja pokazuje rozpoznany remote, domyślny branch i uprawnienia użytkownika.
7. Użytkownik może wybrać „Dodaj kolejne repozytorium” i powtórzyć walidację.
8. Wybiera dostępnego lokalnie agenta i zatwierdza podsumowanie.
9. Projekt zostaje zapisany lokalnie.
10. Dashboard wykonuje `gh api user` i pobiera issues przez `gh issue list`.
11. Workflow wyświetla tylko otwarte issues przypisane do `@me`.

## Dashboard

- liczba otwartych issues przypisanych do użytkownika,
- liczba issues oznaczonych jako praca w toku,
- liczba issues oznaczonych wysokim priorytetem,
- poziom uprawnień użytkownika do repozytorium,
- ostatnio aktualizowane issues,
- folder, domyślny branch i stan funkcji GitHub Issues.

## Workflow

GitHub Issues nie ma uniwersalnych kolumn workflow, dlatego MVP stosuje konwencję labeli:

- `backlog` lub brak labela statusowego → Do zrobienia,
- `in progress`, `in-progress`, `doing`, `wip`, `started` → W toku,
- `review`, `code review`, `needs review` → Do review.

Integracja jest tylko do odczytu. Kliknięcie issue otwiera je w GitHubie. Utworzenie przykładowego issue zawsze wymaga jawnej akcji użytkownika.

## Granice bezpieczeństwa

- `gh` jest wywoływane przez `execFile`, nigdy przez shell,
- frontend nie uruchamia procesów ani nie otrzymuje sekretów środowiska serwera,
- token oraz konfiguracja `gh` nie trafiają do frontendu ani lokalnego store Pathdrasil,
- payloady API są walidowane po stronie serwera,
- zewnętrznie można otworzyć wyłącznie adres HTTPS na `github.com`,
- projekt można utworzyć tylko z istniejącymi katalogami rozpoznanymi przez `gh` jako repozytoria GitHub,
- plik projektów jest zapisywany atomowo i z uprawnieniami `0600`.

## Kryteria ukończenia

- aplikacja uruchamia się jako lokalny Web UI i pokazuje pusty stan projektów,
- przeglądarka katalogów pozwala wybrać foldery repozytoriów dostępne dla lokalnego backendu,
- kreator pozwala dodać i zweryfikować kolejne repozytorium,
- niepoprawny folder i brak autoryzacji `gh` mają czytelne błędy,
- projekt przetrwa restart aplikacji,
- dashboard i workflow korzystają z prawdziwych wyników `gh`,
- repo bez przypisanych issues ma użyteczny pusty stan,
- typecheck, testy logiki workflow i build przechodzą automatycznie.

## Następne kroki

1. Edycja i usuwanie projektu.
2. Cache ostatniej synchronizacji i tryb offline.
3. Obsługa GitHub Projects jako źródła własnych statusów.
4. Tworzenie i edycja issues po dodaniu jawnych uprawnień zapisu.
5. Provider GitLab oraz docelowy provider Linear OAuth.
