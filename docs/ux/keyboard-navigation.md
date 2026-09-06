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

- Pomoc jest dialogiem modalnym z tytułem „Skróty klawiaturowe”.
- Zawiera sekcję globalną oraz sekcję aktualnego widoku.
- Pokazuje tylko akcje faktycznie dostępne w bieżącym stanie.
- Po zamknięciu focus wraca do elementu aktywnego przed otwarciem.
- Ikona lub przycisk pomocy jest dostępny także dla użytkowników myszy.

## Focus

- Po otwarciu strony kreatora focus trafia programowo na nagłówek strony (`tabIndex=-1`).
- Kolejność Tab odpowiada kolejności wizualnej.
- Nieaktywne providery używają natywnego `disabled`; opis stanu pozostaje dostępny dla czytnika ekranu poza nieaktywną kontrolką.
- Błąd walidacji przenosi focus do podsumowania błędów, a komunikaty są powiązane z polami przez `aria-describedby`.

Skróty będziemy dopracowywać podczas implementowania konkretnych widoków. Rejestr skrótów pozostaje wspólny, aby dialog pomocy i obsługa klawiszy korzystały z tego samego źródła danych.
