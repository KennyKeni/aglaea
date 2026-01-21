# Project Stack

- **Runtime**: Bun
- **Frontend**: SvelteKit (Svelte 5), shadcn-svelte
- **Backend**: Elysia (separate repo at `/Users/klin344/Projects/herta`)
- **API**: herta.kennykeni.com

# Svelte MCP Server

Use MCP tools for Svelte development:

1. **list-sections** — Call FIRST to discover documentation sections
2. **get-documentation** — Fetch relevant sections based on use_cases
3. **svelte-autofixer** — MUST run on all Svelte code before sending to user; repeat until no issues
4. **playground-link** — Only after user confirms, never for files written to project

# Architecture

SvelteKit acts as a BFF proxy. All browser requests go through SvelteKit, which forwards to Elysia. This eliminates CORS.

## Auth Flow

JWT stored in httpOnly cookie (XSS protection). SvelteKit reads cookie and forwards as Authorization header. Elysia stays stateless.

## Key Files

- `src/hooks.server.ts` — Auth validation, cookie forwarding, error handling
- `src/routes/api/[...path]/+server.ts` — Catch-all proxy to backend
- `+page.server.ts` — SSR data fetching (use `event.fetch` for cookie handling)

## Data Loading Patterns

- Use `event.fetch` (not native fetch) for automatic cookie forwarding
- Return unawaited promises for streaming slow data
- Use `isDataRequest` to conditionally await: SSR gets full HTML, client nav gets instant skeleton

# Project Structure

```
src/lib/
├── components/     # Svelte components
│   ├── ui/         # shadcn-svelte primitives (buttons, dialogs, etc.)
│   ├── layout/     # App shell (sidebar, header, navigation)
│   └── [domain]/   # Domain-specific components (e.g., articles/, pokemon/)
├── state/          # Reactive state classes (Svelte 5 runes)
├── config/         # App configuration (nav items, constants)
├── types/          # TypeScript type definitions
└── utils/          # Pure utility functions
```

# Conventions

## Naming

- State files: `create*` prefix (not `use*`), `.svelte.ts` extension
- Components organized by domain in `src/lib/components/`

## Svelte 5 Patterns

**Props to local state** — Choose pattern based on intent:
- Initialize once (forms): Use `initialized` flag guard
- Always sync (navigation): Sync in `$effect`, add template guard for first render
- Dirty tracking: Sync only when `!dirty`

**Cleanup** — Always clean up in `onDestroy` or return cleanup from `$effect`/`onMount`:
- TipTap editors
- Event listeners on window/document
- Observers (Intersection, Resize, Mutation)
- Intervals, WebSockets, third-party instances
