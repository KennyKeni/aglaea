import { createAuthClient } from 'better-auth/svelte';
import { env } from '$env/dynamic/public';

// DEBUG: Log the baseURL being used
const baseURL = `${env.PUBLIC_APP_URL}/api/auth`;
console.log('[DEBUG] Auth client baseURL:', baseURL);

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    onRequest: (ctx) => {
      console.log('[DEBUG] Auth request:', ctx.url, ctx.options);
    },
    onResponse: (ctx) => {
      console.log('[DEBUG] Auth response:', ctx.response.status, ctx.data);
    },
    onError: (ctx) => {
      console.log('[DEBUG] Auth error:', ctx.error);
    },
  },
});
