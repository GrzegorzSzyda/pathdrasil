# Tworzenie projektu

## Cel

Użytkownik może rozpocząć tworzenie projektu z pustego widoku głównego bez używania myszy, skonfigurować po jednej domenie integracji na stronie, dodać wiele repozytoriów i zatwierdzić podsumowanie.

## Przepływ MVP

1. **Projekt** — nazwa i podstawowe ustawienia wewnętrzne Pathdrasil.
2. **Task manager** — GitHub Issues albo nieaktywny Linear.
3. **Repozytoria** — GitHub i co najmniej jedno lokalne repozytorium; akcja „Dodaj kolejne repozytorium” pozostaje na tej samej stronie domeny.
4. **Agent** — wykrycie i wybór Codex CLI; pozostali providerzy mogą być pokazani jako „Wkrótce”.
5. **Reguły projektu** — języki i początkowa polityka autonomii Pathdrasil.
6. **Podsumowanie** — przegląd konfiguracji i utworzenie projektu.

Strony „Projekt”, „Reguły projektu” i „Podsumowanie” dotyczą konfiguracji wewnętrznej. Każda strona integracyjna odpowiada dokładnie jednej domenie i nie miesza ustawień innych providerów.

## Stan kreatora

- Dane są draftem do momentu użycia akcji „Utwórz projekt”.
- Przejście dalej wymaga poprawnej konfiguracji bieżącej strony.
- Powrót zachowuje wprowadzone dane.
- Nie można pominąć wymaganego kroku przez kliknięcie wskaźnika postępu.
- Błąd integracji nie usuwa danych formularza i wskazuje możliwe rozwiązanie.

## Wybór folderu w lokalnym Web UI

W MVP używamy przeglądarki katalogów dostarczanej przez lokalny backend:

- pole ścieżki pozwala wkleić lub wpisać ścieżkę,
- akcja „Przeglądaj” otwiera dialog pokazujący wyłącznie katalogi,
- backend zwraca katalog domowy użytkownika i katalog roboczy jako bezpieczne punkty startowe,
- backend normalizuje ścieżkę, sprawdza jej istnienie i uprawnienia oraz weryfikuje repozytorium przez `git` i `gh`,
- frontend otrzymuje jedynie informacje potrzebne do nawigacji i walidacji; nie odczytuje zawartości plików.

Nie używamy przeglądarkowego `File System Access API`. Aplikacja potrzebuje rzeczywistej ścieżki widocznej dla procesu backendu w WSL.

## Wiele repozytoriów

- Pierwsze poprawne repozytorium jest wymagane.
- „Dodaj kolejne repozytorium” dodaje następny edytor na stronie repozytoriów.
- Każde repozytorium ma folder repozytorium oraz katalog worktree.
- Nie można dodać dwa razy tej samej znormalizowanej ścieżki ani tego samego GitHub remote.
- Repozytorium można usunąć przed utworzeniem projektu, o ile pozostanie przynajmniej jedno.

## Kryteria akceptacji planowanego UI

- `N` i `Enter` rozpoczynają kreator z pustego widoku głównego.
- Cały przepływ da się ukończyć klawiaturą.
- `?` pokazuje skróty właściwe dla aktualnej strony.
- Focus po zmianie strony trafia na jej nagłówek, a następnie na pierwszą kontrolkę.
- Linear jest widoczny, oznaczony „Wkrótce” i nie można go wybrać.
- Niedostępna funkcja ma widoczny komunikat z przyczyną; brak obsługi nie kończy się martwą kontrolką bez wyjaśnienia.
- Można dodać i zweryfikować więcej niż jedno repozytorium.
