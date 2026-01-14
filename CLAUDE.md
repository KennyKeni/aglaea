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

## SCHEMA: API.json

- This is a large OPENAPI format'd file

## File Structure & Responsibilities

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
