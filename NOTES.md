# AI Dev Workflow — ustalenia projektowe

Ten dokument jest głównym zapisem decyzji dotyczących planowanej aplikacji. Diagram w `index.html` pokazuje skrócony przebieg procesu, natomiast szczegóły i granice odpowiedzialności są opisane tutaj.

## Cel aplikacji

Aplikacja ma być lokalnym orchestratorem pracy programistycznej wykonywanej przez agentów AI. Łączy w jednym interfejsie:

- lokalny Web UI,
- lokalny backend Node pełniący rolę orchestratora,
- task manager, np. Linear, GitHub Issues lub GitLab Issues,
- lokalnie dostępne CLI agentów, np. Codex lub Claude,
- lokalne repozytoria Git i worktree,
- GitHub lub GitLab API,
- PR/MR, review, pipeline, poprawki i merge.

Zarządzanie taskami również może odbywać się przez rozmowę z AI.

## Podstawowe pojęcia

- **Projekt** — odseparowany kontekst pracy zawierający ustawienia, integracje, repozytoria, taski, aktywność, notatki, komunikację i dziennik.
- **Task** — zadanie biznesowe lub techniczne. Nie jest tym samym co uruchomienie agenta.
- **Wykonanie** — jedna próba realizacji taska. Task może mieć wiele wykonań.
- **Praca repozytorium** — część wykonania dotycząca jednego repozytorium.
- **Sesja agenta** — konkretna praca jednego agenta w określonym branchu i worktree.

Docelowa hierarchia:

`Task → Wykonanie → Praca repozytorium → Sesja agenta`

## Zasady UX

- Wszystkie widoki i akcje muszą być wygodnie obsługiwane klawiaturą.
- Najczęstsze operacje powinny mieć skróty, przewidywalne przechodzenie fokusu i dostęp z command palette.
- `D` otwiera dashboard, `W` workflow, `A` przenosi fokus do akcji zaznaczonego taska, a `?` pokazuje kontekstowe podpowiedzi skrótów przy przyciskach.
- Szybkie akcje rozwijają się wewnątrz zaznaczonej karty. Ich skróty pochodzą od angielskich nazw czynności, np. `S` — start, `R` — refine lub review, `P` — plan.
- Na pełnym widoku taska cyfry wybierają zakładki, a strzałki góra/dół przewijają główną treść bez przenoszenia fokusu do bocznych paneli.
- Nazwy widoków powinny jasno opisywać ich zawartość. Unikamy ogólnych nazw w rodzaju „Centrum...”.
- Istotne działanie AI zapisujące dane w zewnętrznym systemie powinno najpierw przedstawić draft do zatwierdzenia lub poprawienia.
- Użytkownik musi widzieć, co robi agent, gdzie pracuje i na jaką zgodę czeka.
- Projekty pozostają odseparowane. Nie tworzymy globalnej skrzynki mieszającej kontekst prywatny, zawodowy i inne niezależne projekty.

## Konfiguracja nowego projektu

Po pierwszym uruchomieniu użytkownik:

1. Dodaje projekt.
2. Łączy go z task managerem.
3. Dodaje co najmniej jedno repozytorium.
4. Dla każdego repozytorium wskazuje istniejący lokalny folder albo katalog, do którego repo ma zostać sklonowane.
5. Dla każdego repozytorium ustawia miejsce przeznaczone na worktree.
6. Może dodać kolejne repozytoria w pętli.
7. Wybiera dostępnych na komputerze agentów.
8. Konfiguruje języki, poziom autonomii oraz reguły projektu.
9. Aplikacja synchronizuje taski, PR/MR, pipeline i pozostałe dane.
10. Użytkownik trafia do dashboardu projektu.

Przy kolejnym uruchomieniu użytkownik wybiera istniejący projekt, aplikacja synchronizuje dane i otwiera jego dashboard.

## Dashboard projektu

Dashboard powinien zawierać:

- ostatnie nieprzeczytane zdarzenia i elementy wymagające reakcji,
- stan tasków, wykonań, PR/MR, pipeline i integracji,
- wykorzystanie AI: tokeny lub kredyty, koszt, czas agentów i błędy,
- oszacowanie ręcznego nakładu zestawione z czasem człowieka potrzebnym przy użyciu narzędzia,
- podsumowanie poprzedniego dnia,
- podsumowanie aktualnego dnia,
- podsumowanie tygodniowe przydatne podczas daily i demo.

Pierwszy ekran dashboardu eksponuje cztery wartości: prace w toku, elementy wymagające reakcji, stan pipeline oraz czas pracy agentów. Niżej pokazuje krótką listę spraw wymagających uwagi i podsumowanie dnia.

## Widoki projektu

### Aktywność projektu

- Pokazuje ostatnie zdarzenia wymagające uwagi.
- Obsługuje stan przeczytane i nieprzeczytane.
- Zbiera zakończenie lub błąd pracy agenta, nowe review, komentarz, PR/MR, failing pipeline, konflikt, brak approvala oraz zmiany tasków.
- Pozwala wykonać szybką akcję bez opuszczania widoku.

### Komunikacja zespołowa

- Służy wyłącznie do kontaktu z ludźmi i innymi zespołami, np. biznesem, backendem, frontendem, designem lub infrastrukturą.
- Wiadomość może być powiązana z taskiem, sesją agenta i miejscem wymagającym ustalenia.
- Statusy komunikacji: draft, gotowe do wysłania, wysłane, oczekiwanie na odpowiedź i odpowiedziane.
- Planowana jest opcjonalna integracja ze Slackiem.
- Początkowo AI przygotowuje draft wiadomości, a użytkownik zatwierdza jej wysłanie.
- Odpowiedź może wrócić do opracowywania taska albo zdjąć bloker wykonania.

### Notatki projektu

- Zapisują luźne pomysły i sprawy do późniejszego przemyślenia, również niezwiązane z bieżącym taskiem.
- Z każdego dialogu z AI można poprosić o zapisanie myśli jako notatki.
- Notatka zawsze należy do aktualnego projektu.
- AI może nadać tytuł i opcjonalnie powiązać notatkę z taskiem, rozmową lub sesją.
- Notatkę można rozwinąć, zamienić w task lub decyzję, przywołać przez `@mention` albo zarchiwizować.

### Dziennik pracy

- Jest trwałą historią działań użytkownika, agentów i integracji.
- Zawiera rozmowy, instrukcje, decyzje, zmiany statusów i przekazania pracy.
- Rejestruje branche, worktree, commity, testy, operacje na PR/MR, modele, skille, użycie i powody zatrzymania.
- Można go filtrować według taska, wykonania, repozytorium, sesji, agenta i rodzaju zdarzenia.
- Dziennik nie jest tym samym co Aktywność projektu: dziennik przechowuje pełną historię, a aktywność pokazuje elementy wymagające uwagi.

### Harmonogram pracy AI

- Pozwala uruchomić task natychmiast, o określonej godzinie albo w oknie nocnym.
- Przechowuje priorytet, agenta, limit równoległych prac i maksymalny budżet użycia.
- Może czekać na zakończenie zależności, zdjęcie blokera i dostępność środowiska.
- Przed uruchomieniem ponownie synchronizuje task oraz repozytoria.
- Nieudany start pozostaje w kolejce z przyczyną i możliwością ponowienia.
- Budżety muszą uwzględniać sposób rozliczania oraz okna limitów konkretnego dostawcy. Nie zakładamy jednego uniwersalnego limitu dziennego.

## Lista tasków

- Pokazuje wszystkie nieukończone zadania lub pusty stan.
- Przy każdym tasku dostępne są akcje „Opracuj zadanie” i „Wykonaj zadanie”.
- Użytkownik może utworzyć nowy task przez rozmowę z AI.
- Task można otworzyć w pełnoekranowym widoku roboczym. Stałe pozostają nagłówek, kontekst i najważniejsze akcje, a główne zakładki zależą od etapu pracy.
- Dla taska do opracowania najważniejsze są opis, plan i rozmowa; dla zaplanowanego harmonogram i zależności; dla trwającego przebieg, logi i kod; dla review zmiany MR/PR, pipeline i dyskusje; dla gotowego podsumowanie i artefakty.

### Tworzenie taska

1. Użytkownik wpisuje prompt.
2. W prompcie może przywoływać inne taski przez `@mention`; wyszukiwarka podpowiada zadania z task managera.
3. AI tworzy draft zawierający tytuł, opis, kryteria akceptacji, zależności i proponowane subtaski.
4. Użytkownik zatwierdza draft albo przekazuje uwagi.
5. Odrzucony draft wraca w pętli do doprecyzowania.
6. Zaakceptowany draft jest publikowany przez Task Manager API.
7. Lista tasków zostaje odświeżona.

### Opracowywanie taska

- Widok zawiera rozmowę z AI i podgląd taska.
- Użytkownik może przeprowadzić burzę mózgów, poprawić opis, zaplanować pracę, podzielić zadanie, wykryć zależności i przygotować pytania do zespołu.
- Zapis treści i zmiana statusu są osobnymi operacjami Task Manager API.
- Dostępne zakończenia: zapisz zmiany, cofnij do backlogu albo przejdź do wykonania.
- Plan powstaje tutaj. Nie wymagamy ponownego zatwierdzania tego samego planu przed wykonaniem.

## Statusy i synchronizacja

- Aplikacja ma własne statusy tasków i wykonań, niezależne od statusów task managera i repozytorium.
- Statusy zewnętrzne są sygnałami mapowanymi przez integrację i nie muszą odpowiadać statusom aplikacji jeden do jednego.
- Mapowanie statusów jest konfigurowane osobno dla każdej integracji i będzie rozwijane wraz z obsługą kolejnych task managerów.
- Przed rozpoczęciem zaplanowanej pracy aplikacja sprawdza, czy opis taska nie zmienił się od przygotowania wykonania.
- Jeżeli task uległ zmianie, agent powinien dostać odświeżony kontekst, a istotna zmiana może wymagać reakcji użytkownika.

## Przygotowanie wykonania

Po wybraniu „Wykonaj zadanie” aplikacja:

1. Sprawdza, czy task jest gotowy. Niegotowy task wraca do opracowywania.
2. Pozwala wybrać repozytoria objęte wykonaniem.
3. Tworzy wykonanie nadrzędne oraz osobne prace dla repozytoriów.
4. Wybiera agentów oraz przygotowuje branch i worktree dla każdej pracy.
5. Sprawdza środowiska.
6. Uruchamia agentów zgodnie z zależnościami i harmonogramem.

Sprawdzenie środowiska obejmuje:

- dostępność repozytorium oraz możliwość utworzenia branchy i worktree,
- dostępność CLI agenta i działającą autoryzację,
- wymagane narzędzia, zależności, konfigurację i komendy testowe,
- brak innej sesji modyfikującej ten sam branch lub worktree,
- zależności i blokery taska,
- aktualność treści taska.

## Wykonanie wielorepozytoryjne

- Jedno wykonanie nadrzędne może zawierać wiele prac repozytoriów.
- Każda praca ma własnego agenta, branch, worktree, status, log i PR/MR.
- Zależności określają kolejność uruchamiania prac.
- Częściowy sukces jest prawidłowym wynikiem: ukończona praca w jednym repozytorium nie jest ukrywana ani cofana przez błąd w innym.
- Wynik każdego repozytorium może zostać dopisany do taska jako automatyczne podsumowanie.
- Podczas pracy użytkownik może otworzyć sesję, dopisać instrukcję, odpowiedzieć na pytanie, zmienić kierunek, wstrzymać, anulować albo ponowić pracę.

## PR/MR, review i merge

Aplikacja pokazuje osobno dla każdego repozytorium:

- diff, pliki, commity i komentarze review,
- status pipeline/checks i linki do logów,
- konflikty, nierozwiązane dyskusje i brakujące approvale,
- screenshoty, preview i inne artefakty dostarczone przez projekt.

Jeżeli pipeline nie przechodzi, istnieje konflikt albo pojawiły się uwagi, użytkownik może zlecić AI naprawę. Agent pracuje w odpowiednim lokalnym worktree, testuje i wysyła kolejny commit.

Każdy PR/MR można mergować ręcznie i niezależnie. Aplikacja może również udostępnić akcję zbiorczą dla zaznaczonych, gotowych zmian. Akcja zbiorcza nie jest transakcją: niepowodzenie jednego merge nie cofa wcześniej wykonanych merge.

Po merge aplikacja:

- dopisuje do taska wynik ukończonych, nieudanych i nadal oczekujących zmian,
- zapisuje podsumowanie wykonania,
- zamyka sesje agentów,
- sprząta lub zachowuje worktree zgodnie z przyszłą polityką anulowania i retencji.

## Języki

- Użytkownik wybiera globalny język interfejsu oraz komunikacji AI z aplikacją.
- Projekt określa domyślny język tasków, dokumentacji, PR/MR i komunikacji zespołowej.
- Repozytorium może nadpisać język commitów albo dokumentacji.

## Poziom autonomii

Uprawnienia są konfigurowane oddzielnie dla:

- edycji plików,
- instalowania zależności,
- pushowania,
- tworzenia PR/MR,
- odpowiadania na review,
- wykonywania merge,
- wysyłania wiadomości do ludzi.

Planowane tryby: tylko proponuj, pracuj lokalnie, pytaj przed publikacją oraz pełna automatyzacja. Task może czasowo zaostrzyć politykę projektu, ale nie powinien samodzielnie rozszerzać swoich uprawnień.

## Reguły projektu i skille

Reguły dostarczania zmian są konfigurowane osobno dla każdego projektu lub repozytorium. Mogą określać:

- wymagane testy,
- format opisu PR/MR,
- wymagane screenshoty i preview,
- konwencje branchy i commitów,
- sekcje dokumentacji,
- Definition of Done.

Podział odpowiedzialności:

- **Skill lub polityka projektu jest przepisem** — opisuje, co i jak zrobić w konkretnym projekcie.
- **Aplikacja jest silnikiem** — znajduje konfigurację, pokazuje aktywne reguły, przekazuje je agentowi, uruchamia skille, zbiera wyniki i pilnuje uprawnień.

Aplikacja nie narzuca jednego formatu wszystkim projektom.

## Preview, screenshoty i artefakty

Projektowy skill określa:

- jak uruchomić projekt,
- jak przygotować dane testowe,
- jak sprawdzić gotowość aplikacji,
- które scenariusze i ekrany otworzyć,
- jakie screenshoty, raporty lub preview przygotować.

Aplikacja zapewnia:

- uruchomienie i zatrzymanie procedury,
- kontrolę procesu preview,
- odbiór ustandaryzowanego rezultatu,
- przechowanie i wyświetlenie artefaktów,
- dołączenie wyniku do PR/MR i dziennika pracy.

Standardowy rezultat może zawierać screenshoty, link do preview, raport testów, opis i metadane. Dzięki temu aplikacja nie musi znać szczegółów każdego frameworka.

## Konfiguracja i sekrety

Konfigurację dzielimy na:

- niesekretne, wersjonowane reguły i skille, które mogą znajdować się w repozytorium,
- lokalną konfigurację projektu obejmującą wiele repozytoriów,
- tokeny, sekrety, lokalne ścieżki i dane maszyny przechowywane wyłącznie lokalnie.

Aplikacja może sprawdzać, czy wymagany sekret istnieje, ale nie powinna kopiować jego wartości do promptów, dziennika ani komunikacji.

## Zasady diagramu

- Główny graf pokazuje tylko najważniejsze przejścia, decyzje i pętle.
- Szczegóły widoków znajdują się w modalach.
- Diagram jest prowadzony od góry do dołu.
- Kolory mają stałe znaczenie: akcja użytkownika, akcja AI, Task Manager API, Repozytorium API oraz neutralny widok lub stan.
- Każde połączenie z zewnętrznym API jest pokazane jako osobny klocek obok właściwego fragmentu procesu.
- Nie powielamy tego samego kroku. Powroty i ponowienia pokazujemy jako pętle.
- Przyciski otwierające szczegóły znajdują się bezpośrednio w odpowiednich klockach grafu.

## Tematy odłożone na później

- Profile agentów określające model, skille, limity, poziom autonomii i dozwolone repozytoria.
- Tryb daily lub demo generujący gotowe podsumowanie pracy, blokerów, ustaleń i elementów do pokazania.
- Dokładna polityka anulowania: usunięcie worktree, zachowanie zmian jako draft albo utworzenie checkpointu do wznowienia.
- Szczegółowe mapowanie statusów dla każdej integracji z task managerem.
- Ostateczny model retencji logów, artefaktów i zakończonych worktree.
