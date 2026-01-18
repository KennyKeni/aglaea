import { z } from 'zod';

export enum Role {
  Admin = 'admin',
  Editor = 'editor',
  User = 'user',
}

export enum Resource {
  Article = 'article',
  Pokemon = 'pokemon',
  Move = 'move',
  Ability = 'ability',
  Item = 'item',
  Image = 'image',
}

export enum Action {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Publish = 'publish',
  Upload = 'upload',
}

export const RoleSchema = z.enum(Role);
export const ResourceSchema = z.enum(Resource);
export const ActionSchema = z.enum(Action);

export const UserPermissionsSchema = z.object({
  role: RoleSchema,
  permissions: z.record(ResourceSchema, z.array(ActionSchema)),
});

export type UserPermissions = z.infer<typeof UserPermissionsSchema>;
