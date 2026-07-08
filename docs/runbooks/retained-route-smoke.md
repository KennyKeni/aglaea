# Retained route smoke runbook

Pre-deploy browser smoke for Aglaea's retained read routes. Catches SSR
crashes, empty retained pages, and Herta response drift before a deploy is
considered ready. Tracks Aglaea issue #20.

The smoke loads each retained route in a headless Chromium browser (via the
existing `playwright` dependency) and asserts:

- HTTP 2xx responses for the page.
- No 4xx/5xx sub-request responses (304 cache responses are allowed).
- No uncaught `pageerror` events.
- No real `console.error` events (benign warnings are filtered).
- The body is not near-empty.
- Expected content fragments are present (not only HTTP 200).
- The page is not a rendered SvelteKit error page.

## Prerequisites

The smoke runs against a running Aglaea URL that is backed by a seeded Herta.

### 1. Seed and run Herta

Herta must be reset/imported from `data/cobblemon.sqlite` using Herta's
explicit game-data reset/import command. Aglaea does not mutate Herta.

From the Herta repository:

```sh
cd ../herta-rewrite
mise exec -- bun run infra:up
DATABASE_URL=postgres://herta:herta@localhost:55432/herta_rewrite_test mise exec -- bun run db:seed:sqlite-game
CACHE_ENABLED=false RATE_LIMIT_ENABLED=false mise exec -- bun run dev
```

Use `CACHE_ENABLED=false` for smoke runs so stale Redis responses cannot hide a
freshly seeded database. Herta's default local port is `3000`.

### 2. Start Aglaea

Point Aglaea at the local Herta via `BACKEND_URL` and start the dev or preview
server:

```sh
BACKEND_URL=http://localhost:3000 mise exec -- bun run dev
```

For a production-build smoke:

```sh
BACKEND_URL=http://localhost:3000 mise exec -- bun run build
BACKEND_URL=http://localhost:3000 mise exec -- bun run preview
```

The dev server defaults to `http://localhost:5173`.

### 3. Run the smoke

```sh
mise exec -- bun run smoke:retained-routes
```

Override the target URL (e.g. for `vite preview` on port 4173):

```sh
AGLAEA_BASE_URL=http://localhost:4173 mise exec -- bun run smoke:retained-routes
```

Exit code is non-zero if any route in the matrix fails.

## Retained route matrix

The first slice covers Pokemon, moves, abilities, and items list + detail
routes. The list routes also assert retained card links, so an empty list cannot
pass on body text alone. See `src/lib/smoke/retained-route-matrix.ts` for the
canonical matrix and `src/lib/smoke/retained-route-matrix.test.ts` for the
red/green unit test that does not require local servers.

| Route                       | Kind   | Source group |
| --------------------------- | ------ | ------------ |
| `/pokemon?search=bulbasaur` | list   | pokemon      |
| `/pokemon/bulbasaur`        | detail | pokemon      |
| `/moves?search=swords`      | list   | moves        |
| `/moves/swords-dance`       | detail | moves        |
| `/abilities?search=battle`  | list   | abilities    |
| `/abilities/battle-armor`   | detail | abilities    |
| `/items?search=ability`     | list   | items        |
| `/items/ability-capsule`    | detail | items        |

## Coverage scope

This matrix is the first retained slice. Broader source groups (recipes,
spawns, visual assets, localization/resource data, biome/resource data, and
Minecraft/runtime groups) are tracked by:

- Aglaea #21 - frontend representation coverage map
- Herta #47 - broader SQLite-backed contract readiness
- aglaea-contract #6 - shared contract coverage

See [../coverage/frontend-representation-coverage.md](../coverage/frontend-representation-coverage.md)
for the full map.
