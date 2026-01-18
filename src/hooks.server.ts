import type { Handle, HandleFetch, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { env } from '$env/dynamic/private';
import { UserPermissionsSchema, SessionSchema } from '$lib/types/api';

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
    });
  });

const handleAuth: Handle = async ({ event, resolve }) => {
  event.locals.session = null;
  event.locals.permissions = null;

  const cookie = event.request.headers.get('cookie') || '';
  console.log('[handleAuth] cookie:', cookie ? cookie.substring(0, 100) + '...' : '(empty)');

  try {
    const sessionRes = await fetch(`${env.BACKEND_URL}/auth/get-session`, {
      headers: { cookie },
    });

    console.log('[handleAuth] sessionRes.status:', sessionRes.status);

    if (sessionRes.ok) {
      const sessionData = await sessionRes.json();
      console.log('[handleAuth] sessionData:', JSON.stringify(sessionData).substring(0, 200));
      const parsed = SessionSchema.safeParse(sessionData);
      console.log('[handleAuth] parsed.success:', parsed.success);
      if (!parsed.success) {
        console.log('[handleAuth] parse error:', JSON.stringify(parsed.error.issues));
      }
      if (parsed.success) {
        event.locals.session = parsed.data;

        const permRes = await fetch(`${env.BACKEND_URL}/auth/me/permissions`, {
          headers: { cookie: event.request.headers.get('cookie') || '' },
        });
        if (permRes.ok) {
          const permData = await permRes.json();
          const permParsed = UserPermissionsSchema.safeParse(permData);
          if (permParsed.success) {
            event.locals.permissions = permParsed.data;
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch session:', e);
  }

  return resolve(event);
};

export const handle: Handle = sequence(handleAuth, handleParaglide);

export const handleFetch: HandleFetch = async ({ request, fetch, event }) => {
  if (request.url.startsWith(env.BACKEND_URL)) {
    const cookie = event.request.headers.get('cookie');
    if (cookie) {
      request.headers.set('cookie', cookie);
    }
  }
  return fetch(request);
};

export const handleError = (({ error, status, message }) => {
  console.error('[error]', status, error);
  return { message };
}) satisfies HandleServerError;
