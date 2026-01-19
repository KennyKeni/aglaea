// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { UserPermissions, Session } from '$lib/types/auth';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: Session | null;
      permissions: UserPermissions | null;
    }
    // interface PageData {}
    // interface PageState {}
    interface Platform {
      env: {
        BACKEND_URL: string;
        PUBLIC_APP_URL: string;
      };
      context: {
        waitUntil(promise: Promise<unknown>): void;
      };
      caches: CacheStorage & { default: Cache };
    }
  }
}

export {};
