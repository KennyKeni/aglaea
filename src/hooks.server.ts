import type { Handle, HandleFetch } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { env } from '$env/dynamic/private';
import { UserPermissionsSchema } from '$lib/types/api';

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
    });
  });

const handleAuth: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');

  if (token) {
    event.locals.token = token;

    try {
      const res = await fetch(`${env.BACKEND_URL}/auth/me/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = UserPermissionsSchema.safeParse(data);
        if (parsed.success) {
          event.locals.permissions = parsed.data;
        }
      }
    } catch (e) {
      console.error('Failed to fetch permissions:', e);
      event.locals.permissions = null;
    }
  }

  return resolve(event);
};

export const handle: Handle = sequence(handleAuth, handleParaglide);

export const handleFetch: HandleFetch = async ({ request, fetch, event }) => {
  if (request.url.startsWith(env.BACKEND_URL)) {
    const token = event.cookies.get('session');
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return fetch(request);
};
