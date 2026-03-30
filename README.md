# Pathdrasil Prototype

Minimalny projekt startowy do prototypowania interfejsu.

Na starcie aplikacja renderuje jedną pustą stronę z listą używanego stacku technologicznego. Usunięte zostały Convex, auth, routing i cała wcześniejsza logika aplikacyjna.

## Stack

- Bun
- React 19
- TypeScript
- Tailwind CSS 4
- Prettier
- Oxlint

## Uruchomienie

```bash
bun install
bun dev
```

`bun dev` uruchamia aplikację na losowym wolnym porcie.

## Skrypty

- `bun dev` - lokalny serwer Bun z HMR na losowym wolnym porcie
- `bun run build` - build produkcyjny
- `bun run lint` - lint przez Oxlint
- `bun run format` - sprawdzenie formatowania
