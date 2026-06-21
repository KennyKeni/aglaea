import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getBackendUrl } from '$lib/server/backend-url';

const HOP_BY_HOP = new Set([
  'authorization',
  'connection',
  'cookie',
  'keep-alive',
  'proxy-authenticate',
  'transfer-encoding',
  'te',
  'set-cookie',
  'trailer',
  'upgrade',
  'proxy-authorization',
]);

const proxy: RequestHandler = async ({ request, params, url }) => {
  const targetUrl = `${getBackendUrl()}/${params.path}${url.search}`;

  const headers = new Headers();
  for (const [key, value] of request.headers) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
    });

    const resHeaders = new Headers();
    for (const [key, value] of res.headers) {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    }

    return new Response(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (e) {
    console.error('Proxy error:', e);
    error(502, 'Backend unavailable');
  }
};

export const GET = proxy;
export const HEAD = proxy;
