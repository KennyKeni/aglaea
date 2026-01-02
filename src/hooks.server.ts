import type { Handle, HandleFetch } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { env } from '$env/dynamic/private';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handleAuth: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');

	if (token) {
		event.locals.token = token;
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleAuth, handleParaglide);

export const handleFetch: HandleFetch = async ({ request, fetch, event }) => {
	if (env.BACKEND_URL && request.url.startsWith(env.BACKEND_URL)) {
		const token = event.cookies.get('session');
		if (token) {
			request.headers.set('Authorization', `Bearer ${token}`);
		}
	}
	return fetch(request);
};
