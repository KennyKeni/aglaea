import type { RequestHandler } from './$types';
import { BACKEND_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';

const HOP_BY_HOP = new Set([
	'connection',
	'keep-alive',
	'transfer-encoding',
	'te',
	'trailer',
	'upgrade',
	'proxy-authorization'
]);

const proxy: RequestHandler = async ({ request, params, url, cookies }) => {
	const targetUrl = `${BACKEND_URL}/${params.path}${url.search}`;

	const headers = new Headers();
	for (const [key, value] of request.headers) {
		if (!HOP_BY_HOP.has(key.toLowerCase())) {
			headers.set(key, value);
		}
	}

	const token = cookies.get('session');
	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	try {
		const res = await fetch(targetUrl, {
			method: request.method,
			headers,
			body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
			// @ts-expect-error duplex is required for streaming request bodies
			duplex: 'half'
		});

		const resHeaders = new Headers();
		for (const [key, value] of res.headers) {
			if (!HOP_BY_HOP.has(key.toLowerCase())) {
				resHeaders.set(key, value);
			}
		}

		return new Response(res.body, {
			status: res.status,
			headers: resHeaders
		});
	} catch (e) {
		console.error('Proxy error:', e);
		error(502, 'Backend unavailable');
	}
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
