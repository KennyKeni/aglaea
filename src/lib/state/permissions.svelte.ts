import type { UserPermissions, Resource, Action, Role } from '$lib/types/auth';
import { UserPermissionsSchema } from '$lib/types/api';

let data: UserPermissions | null = $state(null);

export function initPermissions(permissions: UserPermissions | null) {
  data = permissions;
}

export function clearPermissions() {
  data = null;
}

export function can(resource: Resource, action: Action): boolean {
  return data?.permissions[resource]?.includes(action) ?? false;
}

export function hasRole(role: Role): boolean {
  return data?.role === role;
}

export function getRole(): Role | null {
  return data?.role ?? null;
}

export async function fetchPermissions(
  fetch: typeof globalThis.fetch,
): Promise<UserPermissions | null> {
  try {
    const res = await fetch('/api/auth/me/permissions');
    if (!res.ok) return null;
    const json = await res.json();
    const parsed = UserPermissionsSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error('Invalid permissions response');
    }
    data = parsed.data;
    return parsed.data;
  } catch (e) {
    console.error('Failed to fetch permissions:', e);
    return null;
  }
}

export const permissions = {
  get data() {
    return data;
  },
  init: initPermissions,
  clear: clearPermissions,
  can,
  hasRole,
  getRole,
  fetch: fetchPermissions,
};
