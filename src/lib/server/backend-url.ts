import { env } from '$env/dynamic/private';

const DEFAULT_BACKEND_URL = 'http://localhost:3000';

export function getBackendUrl() {
  return (env.BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '');
}
