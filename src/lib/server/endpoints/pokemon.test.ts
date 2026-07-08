import { describe, expect, it } from 'vitest';
import { createPokemonEndpoint, buildSearchQuery } from './pokemon';
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

describe('buildSearchQuery', () => {
  it('serializes include as a comma-list', () => {
    const q = buildSearchQuery({ include: ['forms', 'types', 'abilities'] });
    expect(q.get('include')).toBe('forms,types,abilities');
  });

  it('serializes name, limit, and offset', () => {
    const q = buildSearchQuery({ name: 'pika', limit: 24, offset: 48 });
    expect(q.get('name')).toBe('pika');
    expect(q.get('limit')).toBe('24');
    expect(q.get('offset')).toBe('48');
  });

  it('repeats hasForm.typeSlugs for each type', () => {
    const q = buildSearchQuery({ typeSlugs: ['grass', 'poison'] });
    expect(q.getAll('hasForm.typeSlugs')).toEqual(['grass', 'poison']);
  });

  it('repeats hasForm.abilitySlugs for each ability', () => {
    const q = buildSearchQuery({ abilitySlugs: ['overgrow', 'chlorophyll'] });
    expect(q.getAll('hasForm.abilitySlugs')).toEqual(['overgrow', 'chlorophyll']);
  });

  it('repeats hasForm.moveSlugs for each move', () => {
    const q = buildSearchQuery({ moveSlugs: ['tackle', 'growl'] });
    expect(q.getAll('hasForm.moveSlugs')).toEqual(['tackle', 'growl']);
  });

  it('repeats generations for each generation', () => {
    const q = buildSearchQuery({ generations: ['1', '2'] });
    expect(q.getAll('generations')).toEqual(['1', '2']);
  });

  it('serializes representative stat bounds', () => {
    const q = buildSearchQuery({ hpMin: 40, hpMax: 80, totalStatsMin: 300, totalStatsMax: 600 });
    expect(q.get('hpMin')).toBe('40');
    expect(q.get('hpMax')).toBe('80');
    expect(q.get('totalStatsMin')).toBe('300');
    expect(q.get('totalStatsMax')).toBe('600');
  });

  it('omits unset optional params', () => {
    const q = buildSearchQuery({ limit: 24 });
    expect(q.has('include')).toBe(false);
    expect(q.has('name')).toBe(false);
    expect(q.has('hasForm.typeSlugs')).toBe(false);
    expect(q.has('hpMin')).toBe(false);
  });
});
