# Providerzy integracji

## Macierz MVP

| Domena       | Provider      | Stan                 | Sposób połączenia                          |
| ------------ | ------------- | -------------------- | ------------------------------------------ |
| Task manager | GitHub Issues | dostępny             | lokalnie autoryzowane `gh`                 |
| Task manager | Linear        | wkrótce              | kontrolka nieaktywna                       |
| Repozytoria  | GitHub        | dostępny             | lokalnie autoryzowane `gh` i lokalny `git` |
| Repozytoria  | GitLab        | wkrótce              | kontrolka nieaktywna                       |
| Agent        | Codex         | dostępny po wykryciu | lokalnie autoryzowane `codex`              |
| Agent        | Claude        | wkrótce              | kontrolka nieaktywna                       |

## Zasady

- Preferujemy istniejącą lokalną autoryzację oficjalnego CLI, jeżeli pozwala wykonać cały wymagany zakres operacji.
- Pathdrasil nie kopiuje tokenów z konfiguracji CLI i nie przekazuje ich do frontendu.
- Backend sprawdza osobno: obecność programu, autoryzację i wymagane uprawnienia.
- Niedostępny provider pozostaje nieaktywny. Etykieta albo opis przy kontrolce wyjaśnia, czy powodem jest brak implementacji, programu, autoryzacji lub uprawnień.
- Komunikat o niedostępności należy do wspólnego komponentu wyboru providera, a nie do logiki konkretnej strony.

## Linear

Na potrzeby MVP Linear pozostaje zablokowany. Nie opieramy przyszłej integracji na nieoficjalnym CLI. Oficjalna ścieżka integracyjna Linear to GraphQL API uwierzytelniane kluczem osobistym lub OAuth; sposób przechowywania sekretu i zakres operacji ustalimy dopiero przy wdrażaniu tego providera.
