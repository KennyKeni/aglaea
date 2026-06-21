import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';

const CANONICAL_HOST = 'cobblemonwiki.com';
const WWW_HOST = `www.${CANONICAL_HOST}`;

const handleCanonicalHost: Handle = ({ event, resolve }) => {
  if (event.url.hostname === WWW_HOST) {
    const target = new URL(event.url);
    target.hostname = CANONICAL_HOST;

    return Response.redirect(target, 301);
  }

  return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
    });
  });

export const handle: Handle = sequence(handleCanonicalHost, handleParaglide);

export const handleError = (({ error, status, message }) => {
  console.error('[error]', status, error);
  return { message };
}) satisfies HandleServerError;
