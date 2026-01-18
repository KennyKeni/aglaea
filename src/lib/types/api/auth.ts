import { z } from 'zod';

export const SessionUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  role: z.string().optional(),
});

export const SessionSchema = z.object({
  session: z.object({
    id: z.string().optional(),
    userId: z.string().optional(),
    token: z.string().optional(),
    expiresAt: z.coerce.date(),
    ipAddress: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
  }),
  user: SessionUserSchema,
});

export type SessionUser = z.infer<typeof SessionUserSchema>;
export type Session = z.infer<typeof SessionSchema>;

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
