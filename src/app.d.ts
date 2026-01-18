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
    // interface Platform {}
  }
}

export {};
