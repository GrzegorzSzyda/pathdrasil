# Wspólne komponenty interfejsu

## Komponenty wymagane przed widokami kreatora

Te elementy tworzą kontrakt wykorzystywany przez wszystkie strony i powinny powstać jako pierwsze:

1. **`Button`** — rozszerzenie istniejącego komponentu o warianty primary, secondary, ghost i danger, stan ładowania oraz opcjonalną prezentację skrótu.
2. **`FormField` + `Input`** — wspólne label, opis, błąd, `aria-describedby` i wymagany stan.
3. **`Kbd`** — wizualna reprezentacja jednego klawisza lub kombinacji.
4. **`Dialog`** — dostępny modal oparty na Radix UI, ze sterowaniem focusem i zamykaniem przez `Escape`.
5. **`InlineAlert`** — komunikaty info, sukces, ostrzeżenie i błąd, także dla problemów z CLI.
6. **`ProviderOption` / `ProviderPicker`** — wybór jednego providera, obsługa `disabled`, etykiety „Wkrótce” oraz tekstowej przyczyny niedostępności.
7. **`Topbar`** — stały, kompaktowy pasek aplikacji z marką i semantycznym `Heading`.
8. **`SetupLayout`** — wskaźnik postępu, obszar treści i stałe akcje poprzednia/dalej.
9. **rejestr skrótów + inline hints** — jedno źródło prawdy dla nasłuchiwania klawiszy i treści skrótów przy akcjach.

## Komponenty tworzone z pierwszym użyciem

Nie muszą blokować rozpoczęcia widoków, ale po powstaniu są współdzielone:

- **`DirectoryPickerDialog`** — nawigacja po katalogach zwróconych przez backend.
- **`ConnectionStatus`** — wynik wykrycia programu, autoryzacji i uprawnień.
- **`RepositoryEditor`** — ścieżka repozytorium, wynik walidacji i katalog worktree.
- **`RepositoryListEditor`** — dodawanie i usuwanie wielu `RepositoryEditor`.
- **`SummaryList`** — semantyczne podsumowanie konfiguracji przed zapisem.
- **`Spinner`** — mały wskaźnik dla trwającej walidacji i synchronizacji.

## Logika współdzielona

- **`useKeyboardShortcuts`** ignoruje pola edytowalne, rozstrzyga kontekst i nie przechwytuje skrótów przeglądarki.
- **`ShortcutRegistry`** udostępnia te same definicje handlerom oraz pomocy pod `?`.
- **`useSetupNavigation`** pilnuje kolejności stron, walidacji i przywracania stanu draftu.
- Typ **`ProviderAvailability`** rozróżnia `available`, `missing_tool`, `unauthorized`, `insufficient_permissions` i `coming_soon`.

## Granice komponentów

- Komponenty bazowe nie znają `gh`, `git` ani `codex`.
- Adapter domeny zamienia wynik backendu na `ProviderAvailability` i komunikat dla użytkownika.
- `ProviderPicker` odpowiada za prezentację i interakcję, a strona domeny za wybór i walidację.
- Kreator przechowuje wspólny draft, ale każda strona zapisuje tylko fragment swojej domeny.

## Kolejność implementacji

1. Uzupełnienie `Button`, formularzy, `Kbd`, `Dialog` i `InlineAlert`.
2. Rejestr skrótów oraz pomoc pod `?`.
3. `SetupLayout` i nawigacja kreatora.
4. `ProviderPicker` wraz ze stanami niedostępności.
5. Widok Projekt i Task manager.
6. Przeglądarka katalogów oraz widok Repozytoria.
7. Widok Agent, Reguły projektu i Podsumowanie.
8. Test pełnego przepływu wyłącznie klawiaturą.
