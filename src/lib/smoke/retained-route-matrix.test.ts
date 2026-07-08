import { describe, expect, it } from 'vitest';
import {
  RETAINED_ROUTE_MATRIX,
  RETAINED_ROUTE_FORBIDDEN_BODY_FRAGMENTS,
  RETAINED_SOURCE_GROUPS,
  coveredSourceGroups,
  detailRoutes,
  listRoutes,
  resolveBaseUrl,
  routesForSourceGroup,
} from './retained-route-matrix';

describe('retained route matrix', () => {
  it('covers pokemon, moves, abilities, and items with both list and detail routes', () => {
    for (const group of RETAINED_SOURCE_GROUPS) {
      const routes = routesForSourceGroup(RETAINED_ROUTE_MATRIX, group);
      expect(routes.length, `${group} has at least one route`).toBeGreaterThan(0);
      expect(
        routes.some((route) => route.kind === 'list'),
        `${group} has a list route`,
      ).toBe(true);
      expect(
        routes.some((route) => route.kind === 'detail'),
        `${group} has a detail route`,
      ).toBe(true);
    }
  });

  it('asserts meaningful body content for every route, not only HTTP 200', () => {
    for (const route of RETAINED_ROUTE_MATRIX) {
      expect(
        route.bodyMustContain.length,
        `${route.route} asserts at least one body fragment`,
      ).toBeGreaterThan(0);
    }
  });

  it('requires detail routes to include an overview signal', () => {
    for (const route of detailRoutes()) {
      if (route.sourceGroup === 'pokemon') {
        expect(route.bodyMustContain, `${route.route} asserts base stats`).toContain('Base stats');
      } else {
        expect(route.bodyMustContain, `${route.route} asserts an Overview section`).toContain(
          'Overview',
        );
      }
    }
  });

  it('requires list routes to carry a search term and card link selector', () => {
    for (const route of listRoutes()) {
      expect(route.searchTerm, `${route.route} has a searchTerm`).toBeTypeOf('string');
      expect(route.searchTerm?.length, `${route.route} searchTerm is non-empty`).toBeGreaterThan(0);
      expect(route.linkSelector, `${route.route} has a link selector`).toBeTypeOf('string');
      expect(
        route.linkSelector?.length,
        `${route.route} link selector is non-empty`,
      ).toBeGreaterThan(0);
    }
  });

  it('requires detail routes to declare the slug they target', () => {
    for (const route of detailRoutes()) {
      expect(route.slug, `${route.route} has a slug`).toBeTypeOf('string');
      expect(route.slug?.length, `${route.route} slug is non-empty`).toBeGreaterThan(0);
    }
  });

  it('marks exactly pokemon, moves, abilities, and items as covered source groups', () => {
    expect(coveredSourceGroups()).toEqual(['pokemon', 'moves', 'abilities', 'items']);
  });

  it('targets the issue #20 fixture rows: bulbasaur, swords-dance, battle-armor, ability-capsule', () => {
    const slugs = detailRoutes().map((route) => route.slug);
    expect(slugs).toEqual(['bulbasaur', 'swords-dance', 'battle-armor', 'ability-capsule']);
  });

  it('forbids known crash and empty-state fragments globally', () => {
    expect(RETAINED_ROUTE_FORBIDDEN_BODY_FRAGMENTS).toEqual(
      expect.arrayContaining(['Backend unavailable', 'Internal Error', 'Request failed']),
    );
  });

  it('resolves the smoke base URL with AGLAEA_BASE_URL override and trims trailing slashes', () => {
    expect(resolveBaseUrl(undefined)).toBe('http://localhost:5173');
    expect(resolveBaseUrl('http://localhost:4173/')).toBe('http://localhost:4173');
    expect(resolveBaseUrl('  http://localhost:9999  ')).toBe('http://localhost:9999');
  });

  it('falls back to the default base URL when AGLAEA_BASE_URL is empty', () => {
    const previous = process.env.AGLAEA_BASE_URL;
    process.env.AGLAEA_BASE_URL = '';
    try {
      expect(resolveBaseUrl()).toBe('http://localhost:5173');
    } finally {
      if (previous === undefined) delete process.env.AGLAEA_BASE_URL;
      else process.env.AGLAEA_BASE_URL = previous;
    }
  });
});
