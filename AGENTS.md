You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

# PROJECT USES BUN

# UI: shadcn-svelte (community port of shadcn/ui)

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

# SvelteKit + Elysia Backend Architecture

## Overview

SvelteKit acts as a BFF (Backend-for-Frontend) proxy. All browser requests go through SvelteKit, which forwards to the Elysia backend. This eliminates CORS issues entirely.

## API: herta.kennykeni.com

## File Structure & Responsibilities

### `src/lib/` Structure

```
lib/
├── components/     # Svelte components
│   ├── ui/         # shadcn-svelte primitives
│   ├── layout/     # App shell (sidebar, header)
│   ├── pokemon/    # Pokemon-specific components
│   └── articles/   # Article-specific components
├── state/          # Reactive state (Svelte 5 runes)
│   ├── panel-mode.svelte.ts      # Panel open/close/peek state
│   ├── panel-animation.svelte.ts # Panel animation derived state
│   ├── media-query.svelte.ts     # IsMobile class, createMediaQuery
│   ├── grid-data.svelte.ts       # Generic paginated grid state
│   ├── pokemon-data.svelte.ts    # Pokemon grid factory
│   └── article-data.svelte.ts    # Article grid factory
├── context/        # Svelte context helpers (getContext/setContext wrappers)
├── config/         # App configuration (navigation, etc.)
├── types/          # TypeScript type definitions
└── utils/          # Pure utility functions
```

Naming conventions:
- State files use `create*` prefix (e.g., `createPanelMode`) — not React's `use*`
- State files have `.svelte.ts` extension for rune support
- No `-state` suffix (redundant when in `state/` folder)

### `src/hooks.server.ts`

Centralized middleware for auth validation and cookie forwarding:

- `handle` — validate session cookie, populate `locals.user`
- `handleFetch` — forward auth headers for SSR fetches to external backend
- `handleError` — centralized error logging

### `src/routes/api/[...path]/+server.ts`

Catch-all proxy endpoint. Forwards client-side requests to Elysia:

- Strips hop-by-hop headers
- Converts session cookie → Authorization Bearer header
- Streams request/response bodies

### `+page.server.ts`

SSR data fetching. Runs before HTML is rendered:

- Use `event.fetch` (not native fetch) for automatic cookie handling
- Access `cookies.get('session')` for auth
- Return promises (not awaited) for streaming slow data
- Use `actions` for form mutations with progressive enhancement

### `+page.ts` (universal load)

Runs on server AND client. Use for:

- Data that needs client-side revalidation
- When you need `invalidate()` support

## Auth Pattern

```
Login: Elysia returns JWT → SvelteKit sets httpOnly cookie
Requests: SvelteKit reads cookie → forwards as Authorization header → Elysia validates
```

Store tokens in httpOnly cookies (XSS protection). Elysia stays stateless.

## SSR/CSR Control

```typescript
// +page.ts or +layout.ts
export const ssr = false; // SPA-only (no server render)
export const csr = false; // Static, no JS
export const prerender = true; // Build-time static
```

For client-only components, use dynamic imports with `browser` check.

## Environment Variables

- `BACKEND_URL` — private, server-only (e.g., `http://backend:3001` in Docker)
- `PUBLIC_API_URL` — exposed to client, used for client-side fetch through proxy

## Type Safety

Export `type App = typeof app` from Elysia, use Eden Treaty in SvelteKit for fully typed API calls.

## Docker Networking

Containers communicate via service names. SvelteKit uses `BACKEND_URL=http://backend:3001` for SSR, browser uses `/api/*` proxy routes.

## Key Patterns

1. **Parallel fetches**: `Promise.all([fetch(...), fetch(...)])` in load functions
2. **Streaming**: Return unawaited promises for slow data
3. **Error handling**: Use `error()` helper, handle in `handleError` hook
4. **Protected routes**: Check `locals.user` in `+layout.server.ts`, redirect if missing

## Panel System Architecture

The app uses a sliding panel UI for detail views. Panel mode is determined by two mechanisms:

### Peek Mode (lightweight preview)
- Triggered by clicking a card in the grid
- Adds `?focus=123` query param to URL
- **No page navigation** — stays on same route (e.g., `/articles`)
- No server round-trip, instant preview
- Panel slides in at partial width

### Full Mode (SSR detail page)
- Triggered by navigating to a detail route (`/articles/[id]`, `/articles/new`, `/articles/[id]/edit`)
- Route's load function returns `panel: true`
- Full SSR + CDN caching benefits
- Panel expands to full width

### Why two mechanisms?
- **Peek uses query params** for instant client-side overlay without server load
- **Full uses route data** for proper SSR pages that can be cached and shared

### Adding a new full-panel route
Return `panel: true` from the load function:
```ts
// +page.server.ts or +page.ts
export const load = () => {
  return { /* your data */, panel: true };
};
```

### Panel mode decision logic
```ts
// From panel-mode.svelte.ts
const mode = isDetailRoute ? 'full' : focusId ? 'peek' : 'closed';
// isDetailRoute = page.data.panel === true
// focusId = URL search param ?focus=123
```

## Svelte 5 State Initialization (avoiding `state_referenced_locally` warning)

When copying props into local state, Svelte warns that prop changes won't update the local copy. Choose the pattern based on intent:

### Pattern 1: Initialize once, never sync (forms/editors)

Use when component mounts fresh each time (e.g., editor opens/closes):

```svelte
let { initialTitle, initialBody } = $props();

let title = $state('');
let body = $state('');
let initialized = $state(false);

$effect(() => {
  if (initialized) return;
  title = initialTitle;
  body = initialBody;
  initialized = true;
});
```

### Pattern 2: Always sync on prop changes (navigation)

Use when props change during component lifetime (e.g., route params):

```svelte
let { data } = $props();

let article: Article = $state(null!);
let isEditing = $state(false);

$effect(() => {
  article = data.article;
  isEditing = false;
});
```

**Important**: Add a guard in the template since `$effect` runs after initial render:

```svelte
{#if !article}
  <!-- Loading state -->
{:else}
  <Content {article} />
{/if}
```

### Pattern 3: Sync until user edits (dirty tracking)

Use when you want prop sync but not during active editing:

```svelte
let { initialValue } = $props();

let draft = $state('');
let dirty = $state(false);

$effect(() => {
  if (!dirty) draft = initialValue;
});
```

### When to use each

- **Form/Editor components**: Pattern 1 (snapshot on mount)
- **Pages with route params**: Pattern 2 (sync on navigation)
- **Editable fields that should reset**: Pattern 3 (dirty tracking)

## Component Cleanup (onDestroy)

Always clean up resources to prevent memory leaks. Common cases:

### TipTap Editor instances

Components that create or bind to a TipTap Editor must destroy it:

```svelte
import { onDestroy } from 'svelte';

let editor: Editor | undefined = $state();

onDestroy(() => {
  if (editor) {
    editor.destroy();
    editor = undefined;
  }
});
```

### Event listeners added in $effect

Return a cleanup function from `$effect`:

```svelte
$effect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
});
```

### Event listeners added in onMount

Return cleanup from `onMount`:

```svelte
onMount(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('scroll', handler);
  return () => window.removeEventListener('scroll', handler);
});
```

### TipTap extensions with DOM elements

Extensions that create DOM elements must remove them in `onDestroy`:

```typescript
Extension.create({
  onCreate() {
    this.element = document.createElement('div');
    document.body.appendChild(this.element);
  },
  onDestroy() {
    this.element?.remove();
  }
});
```

### Checklist for cleanup

Resources that need cleanup:
- TipTap/ProseMirror editors and plugins
- DOM elements created with `document.createElement`
- Event listeners on `window`, `document`, or external elements
- IntersectionObserver, ResizeObserver, MutationObserver
- setInterval (setTimeout usually fine unless component unmounts mid-delay)
- WebSocket connections
- Third-party library instances
