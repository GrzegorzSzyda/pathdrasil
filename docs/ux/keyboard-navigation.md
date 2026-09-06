# Nawigacja klawiaturą

## Skróty początkowe

| Kontekst                | Klawisz             | Działanie                                   |
| ----------------------- | ------------------- | ------------------------------------------- |
| pusty widok główny      | `N` lub `Enter`     | rozpocznij tworzenie projektu               |
| dowolny widok aplikacji | `?`                 | pokaż kontekstową pomoc skrótów             |
| dialog                  | `Escape`            | zamknij dialog i przywróć poprzedni focus   |
| kreator                 | `Alt+ArrowLeft`     | poprzednia strona                           |
| kreator                 | `Alt+ArrowRight`    | następna strona, jeżeli jest poprawna       |
| lista opcji             | strzałki            | zmień aktywną opcję zgodnie ze wzorcem ARIA |
| kontrolka               | `Enter` lub `Space` | aktywuj kontrolkę                           |

Skróty literowe nie uruchamiają się podczas pisania w `input`, `textarea`, `select` ani w elemencie edytowalnym. Samych `ArrowLeft` i `ArrowRight` nie przeznaczamy do zmiany stron, ponieważ są potrzebne do edycji tekstu i obsługi kontrolek.

## Pomoc pod `?`

- `?` przełącza widoczność skrótów bez otwierania modala ani nakładki.
- Skróty pojawiają się bezpośrednio przy akcjach dostępnych w aktualnym widoku.
- Pokazuje tylko akcje faktycznie dostępne w bieżącym stanie.
- Przycisk „Skróty” w topbarze pozwala przełączyć ten sam stan także myszą.

## Focus

- Po otwarciu strony kreatora focus trafia programowo na nagłówek strony (`tabIndex=-1`).
- Kolejność Tab odpowiada kolejności wizualnej.
- `Escape` i `Backspace` cofają do poprzedniej strony, gdy focus nie jest w polu edycyjnym.
- Nieaktywne providery używają natywnego `disabled`; opis stanu pozostaje dostępny dla czytnika ekranu poza nieaktywną kontrolką.
- Błąd walidacji przenosi focus do podsumowania błędów, a komunikaty są powiązane z polami przez `aria-describedby`.

Skróty będziemy dopracowywać podczas implementowania konkretnych widoków. Rejestr skrótów pozostaje wspólny, aby dialog pomocy i obsługa klawiszy korzystały z tego samego źródła danych.
