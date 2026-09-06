# Pathdrasil — kontekst i nazewnictwo

Ten plik jest krótkim słownikiem nazw używanych w kodzie, interfejsie i dokumentacji. Szczegółowe zachowania należą do dokumentów domenowych w `docs/`.

## Produkt

- **Pathdrasil** — lokalna aplikacja webowa do organizowania pracy programistycznej wykonywanej przez agentów AI.
- **Web UI** — frontend React otwierany w przeglądarce.
- **lokalny backend** — serwer Node uruchamiający lokalne CLI, odczytujący katalogi i przechowujący dane. Frontend nie wykonuje tych operacji bezpośrednio.

## Model pracy

- **Projekt (`Project`)** — odseparowana przestrzeń ustawień, integracji, repozytoriów, tasków i historii.
- **Task (`Task`)** — zadanie biznesowe lub techniczne pochodzące z task managera. Nie oznacza uruchomienia agenta.
- **Wykonanie (`Execution`)** — jedna próba realizacji taska, mogąca obejmować kilka repozytoriów.
- **Praca repozytorium (`Repository Work`)** — część wykonania dotycząca jednego repozytorium.
- **Sesja agenta (`Agent Session`)** — praca jednego agenta w konkretnym branchu i worktree.

Hierarchia: `Task → Wykonanie → Praca repozytorium → Sesja agenta`.

## Integracje

- **domena integracji (`Integration Domain`)** — jeden rodzaj odpowiedzialności, np. task manager, repozytoria lub agent AI. Jedna strona konfiguracji obsługuje tylko jedną domenę.
- **provider** — konkretne narzędzie wybrane w domenie, np. GitHub Issues w domenie task managera.
- **task manager** — zewnętrzne źródło tasków i ich statusów.
- **provider repozytoriów** — narzędzie dostarczające metadane repozytoriów, pull requestów i checks.
- **agent** — lokalnie dostępne CLI wykonujące pracę, np. Codex CLI.
- **połączenie (`Connection`)** — sprawdzona możliwość użycia providera. W MVP wynika z lokalnej instalacji i autoryzacji CLI.

## Repozytorium

- **Repozytorium (`Repository`)** — repozytorium Git przypisane do projektu.
- **folder repozytorium (`Repository Directory`)** — istniejący lokalny katalog repozytorium dostępny dla backendu.
- **katalog worktree (`Worktree Directory`)** — katalog nadrzędny przeznaczony na robocze worktree repozytorium.

## Status dostępności

- **dostępny (`available`)** — provider można wybrać i zweryfikować.
- **niedostępny (`unavailable`)** — provider istnieje w produkcie, ale nie można go użyć w danym środowisku; interfejs pokazuje przyczynę.
- **wkrótce (`coming soon`)** — provider nie jest jeszcze obsługiwany; kontrolka jest nieaktywna i jednoznacznie oznaczona.

## Konwencje językowe

- W polskim UI używamy słowa „task”, gdy mowa o elemencie z task managera.
- „Projekt” oznacza projekt Pathdrasil, nie GitHub Project ani Linear Project.
- „Repozytorium” nie jest synonimem projektu.
- W kodzie preferujemy powyższe angielskie nazwy typów. Nie używamy `Job` jako zamiennika `Task` lub `Execution`.
