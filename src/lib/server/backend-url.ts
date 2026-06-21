import { env } from '$env/dynamic/private';

const DEFAULT_BACKEND_URL = 'https://herta.kennykeni.com';

export function getBackendUrl() {
  return (env.BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '');
}
