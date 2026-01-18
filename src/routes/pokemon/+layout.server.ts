import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';
import { PaginatedSchema, PokemonSchema, NamedRefSchema } from '$lib/types/api';
import { parseResponse } from '$lib/server/api';
import { z } from 'zod';

const PAGE_SIZE = 24;

const AbilitySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  desc: z.string().nullable(),
  shortDesc: z.string().nullable(),
  flags: z.array(z.unknown()),
});

const MoveSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  desc: z.string().nullable(),
  shortDesc: z.string().nullable(),
  type: NamedRefSchema,
  category: z.object({ id: z.number(), slug: z.string(), name: z.string() }),
  target: z.unknown().nullable(),
  power: z.number().nullable(),
  accuracy: z.number().nullable(),
  pp: z.number(),
  priority: z.number(),
  critRatio: z.number().nullable(),
  minHits: z.number().nullable(),
  maxHits: z.number().nullable(),
  drainPercent: z.number().nullable(),
  healPercent: z.number().nullable(),
  recoilPercent: z.number().nullable(),
  flags: z.array(z.unknown()),
  boosts: z.array(z.unknown()),
  effects: z.array(z.unknown()),
  maxPower: z.number().nullable(),
  zData: z.unknown().nullable(),
  gmaxSpecies: z.array(z.unknown()),
});

export const load: LayoutServerLoad = async ({ fetch }) => {
  const [pokemonRes, typesRes, abilitiesRes, movesRes] = await Promise.all([
    fetch(`${env.BACKEND_URL}/pokemon?limit=1&offset=0`).catch(() => null),
    fetch(`${env.BACKEND_URL}/types?limit=9999`).catch(() => null),
    fetch(`${env.BACKEND_URL}/abilities?limit=9999`).catch(() => null),
    fetch(`${env.BACKEND_URL}/moves?limit=9999`).catch(() => null),
  ]);

  let totalCount = 0;
  if (pokemonRes?.ok) {
    try {
      const data = await parseResponse(pokemonRes, PaginatedSchema(PokemonSchema));
      totalCount = data.total ?? 0;
    } catch {
      // Ignore parse errors
    }
  }

  let types: z.infer<typeof NamedRefSchema>[] = [];
  if (typesRes?.ok) {
    try {
      const data = await parseResponse(typesRes, PaginatedSchema(NamedRefSchema));
      types = data.data ?? [];
    } catch {
      // Ignore parse errors
    }
  }

  let abilities: z.infer<typeof NamedRefSchema>[] = [];
  if (abilitiesRes?.ok) {
    try {
      const data = await parseResponse(abilitiesRes, PaginatedSchema(AbilitySchema));
      abilities = (data.data ?? []).map((a) => ({ id: a.id, slug: a.slug, name: a.name }));
    } catch {
      // Ignore parse errors
    }
  }

  let moves: z.infer<typeof NamedRefSchema>[] = [];
  if (movesRes?.ok) {
    try {
      const data = await parseResponse(movesRes, PaginatedSchema(MoveSchema));
      moves = (data.data ?? []).map((m) => ({ id: m.id, slug: m.slug, name: m.name }));
    } catch {
      // Ignore parse errors
    }
  }

  return {
    totalCount,
    pageSize: PAGE_SIZE,
    types,
    abilities,
    moves,
  };
};
