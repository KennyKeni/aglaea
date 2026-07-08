import { describe, expect, it } from 'vitest';
import { createPokemonEndpoint } from './pokemon';
import type { ApiResponse } from '$lib/api/types';
import type { ServerClient } from '../client';

type GetReturn = Promise<ApiResponse<unknown>>;
type GetFn = (path: string, query?: URLSearchParams) => GetReturn;

function fakeClient(get: GetFn): Pick<ServerClient, 'get'> {
  return { get: get as ServerClient['get'] };
}

function ok(data: unknown): ApiResponse<unknown> {
  return { ok: true, data };
}

const namedRef = (id: number, name: string, slug: string) => ({ id, name, slug });
const itemRef = (id: number, name: string) => ({ id, name });

function makeForm(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Normal',
    fullName: 'Bulbasaur-Normal',
    slug: 'normal',
    description: null,
    generation: 1,
    image: null,
    height: 0.7,
    weight: 6.9,
    overrides: null,
    baseHp: 45,
    baseAttack: 49,
    baseDefence: 49,
    baseSpecialAttack: 65,
    baseSpecialDefence: 65,
    baseSpeed: 45,
    baseExperienceYield: 64,
    evHp: 1,
    evAttack: 0,
    evDefence: 0,
    evSpecialAttack: 0,
    evSpecialDefence: 0,
    evSpeed: 0,
    labels: [],
    aspectChoices: [],
    types: [{ type: namedRef(1, 'Grass', 'grass'), slot: 1 }],
    abilities: [
      { ability: namedRef(1, 'Overgrow', 'overgrow'), slot: namedRef(1, 'Ability 1', 'ability-1') },
    ],
    moves: [],
    hitbox: null,
    drops: {
      amount: 1,
      percentages: [],
      ranges: [
        {
          item: itemRef(2, 'Oran Berry'),
          percentage: 50,
          quantityMin: 1,
          quantityMax: 3,
        },
      ],
    },
    aspectCombos: [],
    behaviour: null,
    spawns: [],
    ...overrides,
  };
}

function makeSpeciesDetail() {
  return {
    id: 1,
    name: 'Bulbasaur',
    slug: 'bulbasaur',
    description: 'A seed Pokemon.',
    generation: 1,
    catchRate: 45,
    baseFriendship: 70,
    eggCycles: 20,
    maleRatio: 0.875,
    baseScale: null,
    image: null,
    experienceGroup: { id: 1, slug: 'medium-slow', name: 'Medium Slow', formula: 'mediumSlow' },
    eggGroups: [namedRef(1, 'Monster', 'monster'), namedRef(2, 'Grass', 'grass')],
    hitbox: { width: 1.0, height: 1.0, fixed: true },
    lighting: { lightLevel: 15, liquidGlowMode: null },
    riding: null,
    forms: [makeForm()],
  };
}

function makeSpeciesList() {
  return {
    data: [
      {
        id: 1,
        name: 'Bulbasaur',
        slug: 'bulbasaur',
        description: null,
        generation: 1,
        catchRate: 45,
        baseFriendship: 70,
        eggCycles: 20,
        maleRatio: 0.875,
        baseScale: null,
        image: null,
        experienceGroup: null,
        eggGroups: [namedRef(1, 'Monster', 'monster')],
        hitbox: null,
        lighting: null,
        riding: null,
        forms: [makeForm()],
      },
    ],
    total: 1,
    limit: 24,
    offset: 0,
  };
}

describe('createPokemonEndpoint', () => {
  describe('search (species list)', () => {
    it('validates a well-formed species list response', async () => {
      const list = makeSpeciesList();
      const client = fakeClient(async () => ok(list));
      const api = createPokemonEndpoint(client);

      const result = await api.search({ limit: 24, offset: 0 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data).toHaveLength(1);
        expect(result.data.data[0]?.name).toBe('Bulbasaur');
        expect(result.data.total).toBe(1);
      }
    });

    it('returns an error for an invalid species list payload', async () => {
      const client = fakeClient(async () => ok({ data: [], total: 1 }));
      const api = createPokemonEndpoint(client);

      const result = await api.search();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(500);
        expect(result.message).toContain('Pokemon species list');
      }
    });
  });

  describe('getById (species detail)', () => {
    it('validates a well-formed species detail response with a ranged drop', async () => {
      const detail = makeSpeciesDetail();
      const client = fakeClient(async () => ok(detail));
      const api = createPokemonEndpoint(client);

      const result = await api.getById('bulbasaur');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.name).toBe('Bulbasaur');
        const drop = result.data.forms[0]?.drops?.ranges[0];
        expect(drop).toMatchObject({
          item: { id: 2, name: 'Oran Berry' },
          percentage: 50,
          quantityMin: 1,
          quantityMax: 3,
        });
      }
    });

    it('returns an error for an invalid species detail payload', async () => {
      const client = fakeClient(async () => ok({ id: 'not-a-number', name: 'Bad' }));
      const api = createPokemonEndpoint(client);

      const result = await api.getById(1);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(500);
        expect(result.message).toContain('Pokemon species detail');
      }
    });
  });
});
