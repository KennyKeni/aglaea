import { z } from 'zod';

export const RoleSchema = z.enum(['admin', 'editor', 'user']);
export const ResourceSchema = z.enum(['article', 'pokemon', 'move', 'ability', 'item']);
export const ActionSchema = z.enum(['create', 'update', 'delete', 'publish']);

export const UserPermissionsSchema = z.object({
	role: RoleSchema,
	permissions: z.record(ResourceSchema, z.array(ActionSchema))
});

export type Role = z.infer<typeof RoleSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type UserPermissions = z.infer<typeof UserPermissionsSchema>;
