import { describe, expect, it } from 'vitest';
import { createMoveEndpoint, buildSearchQuery } from './moves';
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

function err(status: number, message: string): ApiResponse<unknown> {
  return { ok: false, status, message };
}

const namedRef = (id: number, name: string, slug: string) => ({ id, name, slug });
const formRef = (id: number, name: string, slug: string, speciesId: number) => ({
  id,
  name,
  slug,
  speciesId,
});

function makeMove(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Tackle',
    slug: 'tackle',
    desc: null,
    shortDesc: null,
    type: namedRef(1, 'Normal', 'normal'),
    category: { id: 1, slug: 'physical', name: 'Physical', description: null },
    target: { id: 1, name: 'Selected target', slug: 'selected-target', description: null },
    power: 40,
    accuracy: 100,
    pp: 35,
    priority: 0,
    critRatio: null,
    minHits: null,
    maxHits: null,
    drainPercent: null,
    healPercent: null,
    recoilPercent: null,
    flags: [],
    boosts: [],
    effects: [],
    maxPower: null,
    zData: null,
    gmaxSpecies: [],
    forms: [],
    ...overrides,
  };
}

function makeMoveList() {
  return {
    data: [makeMove()],
    total: 1,
    limit: 24,
    offset: 0,
  };
}

describe('createMoveEndpoint', () => {
  describe('search (move list)', () => {
    it('validates a well-formed move list response', async () => {
      const list = makeMoveList();
      const client = fakeClient(async () => ok(list));
      const api = createMoveEndpoint(client);

      const result = await api.search({ limit: 24, offset: 0 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.data).toHaveLength(1);
        expect(result.data.data[0]?.name).toBe('Tackle');
        expect(result.data.total).toBe(1);
      }
    });

    it('returns an error for an invalid move list payload', async () => {
      const client = fakeClient(async () => ok({ data: [], total: 1 }));
      const api = createMoveEndpoint(client);

      const result = await api.search();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(500);
        expect(result.message).toContain('move list');
      }
    });

    it('propagates upstream errors unchanged', async () => {
      const client = fakeClient(async () => err(503, 'upstream down'));
      const api = createMoveEndpoint(client);

      const result = await api.search();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(503);
        expect(result.message).toBe('upstream down');
      }
    });
  });

  describe('getById (move detail)', () => {
    it('validates a well-formed move detail response', async () => {
      const detail = makeMove({
        forms: [formRef(1, 'Bulbasaur-Normal', 'bulbasaur-normal', 1)],
      });
      const client = fakeClient(async () => ok(detail));
      const api = createMoveEndpoint(client);

      const result = await api.getById('tackle');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.name).toBe('Tackle');
        expect(result.data.forms[0]?.speciesId).toBe(1);
      }
    });

    it('returns an error for an invalid move detail payload', async () => {
      const client = fakeClient(async () => ok({ id: 'not-a-number', name: 'Bad' }));
      const api = createMoveEndpoint(client);

      const result = await api.getById(1);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(500);
        expect(result.message).toContain('move detail');
      }
    });
  });
});

describe('buildSearchQuery', () => {
  it('serializes name, limit, and offset', () => {
    const q = buildSearchQuery({ name: 'tack', limit: 24, offset: 48 });
    expect(q.get('name')).toBe('tack');
    expect(q.get('limit')).toBe('24');
    expect(q.get('offset')).toBe('48');
  });

  it('repeats typeSlugs for each type', () => {
    const q = buildSearchQuery({ typeSlugs: ['normal', 'fire'] });
    expect(q.getAll('typeSlugs')).toEqual(['normal', 'fire']);
  });

  it('repeats categorySlugs for each category', () => {
    const q = buildSearchQuery({ categorySlugs: ['physical', 'special'] });
    expect(q.getAll('categorySlugs')).toEqual(['physical', 'special']);
  });

  it('repeats flagSlugs for each flag', () => {
    const q = buildSearchQuery({ flagSlugs: ['contact', 'protect'] });
    expect(q.getAll('flagSlugs')).toEqual(['contact', 'protect']);
  });

  it('omits unset optional params', () => {
    const q = buildSearchQuery({ limit: 24 });
    expect(q.has('name')).toBe(false);
    expect(q.has('typeSlugs')).toBe(false);
  });
});
