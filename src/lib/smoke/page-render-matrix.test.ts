import { describe, expect, it } from 'vitest';
import {
  EXPECTED_PAGE_ROUTES,
  PAGE_RENDER_FORBIDDEN_BODY_FRAGMENTS,
  PAGE_RENDER_MATRIX,
  PAGE_RENDER_SOURCE_GROUPS,
  coveredSourceGroups,
  resolveBaseUrl,
  routesForSourceGroup,
  routesMatchExpected,
} from './page-render-matrix';

describe('page render matrix', () => {
  it('covers every user-facing Svelte page route exactly once and in order', () => {
    expect(PAGE_RENDER_MATRIX.length, 'matrix covers every expected route').toBe(
      EXPECTED_PAGE_ROUTES.length,
    );
    expect(routesMatchExpected()).toBe(true);
  });

  it('does not include the API proxy route', () => {
    for (const route of PAGE_RENDER_MATRIX) {
      expect(route.route.startsWith('/api/'), `${route.route} is not an API route`).toBe(false);
    }
  });

  it('asserts meaningful body content for every route, not only HTTP 200', () => {
    for (const route of PAGE_RENDER_MATRIX) {
      expect(
        route.bodyMustContain.length,
        `${route.route} asserts at least one body fragment`,
      ).toBeGreaterThan(0);
    }
  });

  it('covers every expected source group', () => {
    expect(coveredSourceGroups()).toEqual([
      'home',
      'pokemon',
      'moves',
      'abilities',
      'items',
      'llms',
      'demo',
    ]);
  });

  it('requires exactly the expected source groups and no extras', () => {
    expect(PAGE_RENDER_SOURCE_GROUPS).toEqual([
      'home',
      'pokemon',
      'moves',
      'abilities',
      'items',
      'llms',
      'demo',
    ]);
  });

  it('marks high-value navigation routes with link selectors where useful', () => {
    const linkExpected = ['/', '/pokemon?search=bulbasaur', '/demo'];
    for (const route of PAGE_RENDER_MATRIX) {
      if (linkExpected.includes(route.route)) {
        expect(route.linkSelector, `${route.route} carries a link selector`).toBeTypeOf('string');
      }
    }
  });

  it('uses selector assertions for controls and secondary home navigation links', () => {
    const home = PAGE_RENDER_MATRIX.find((entry) => entry.route === '/');
    expect(home?.selectorsMustExist).toEqual(
      expect.arrayContaining(['main a[href="/llms"]', 'main a[href="/abilities"]']),
    );

    const llms = PAGE_RENDER_MATRIX.find((entry) => entry.route === '/llms');
    expect(llms?.selectorsMustExist).toEqual(
      expect.arrayContaining([
        'textarea[placeholder="Ask Herta"]',
        'button[aria-label="Reset session"]',
        'button[aria-label="Send message"]',
      ]),
    );
  });

  it('allows intentionally sparse pages to declare their own body threshold', () => {
    const llms = PAGE_RENDER_MATRIX.find((entry) => entry.route === '/llms');
    expect(llms?.minBodyTextLength).toBe(100);

    const demo = PAGE_RENDER_MATRIX.find((entry) => entry.route === '/demo');
    expect(demo?.minBodyTextLength).toBe(8);

    const paraglide = PAGE_RENDER_MATRIX.find((entry) => entry.route === '/demo/paraglide');
    expect(paraglide?.minBodyTextLength).toBe(120);
    expect(paraglide?.bodyMustContain).toContain('Hello, SvelteKit User from en!');
  });

  it('uses the stable retained-route fixture slugs and searches', () => {
    const pokemonList = PAGE_RENDER_MATRIX.find(
      (entry) => entry.route === '/pokemon?search=bulbasaur',
    );
    expect(pokemonList?.bodyMustContain).toContain('Bulbasaur');
    const itemsDetail = PAGE_RENDER_MATRIX.find(
      (entry) => entry.route === '/items/ability-capsule',
    );
    expect(itemsDetail?.bodyMustContain).toContain('Ability Capsule');
  });

  it('forbids known crash and empty-state fragments globally', () => {
    expect(PAGE_RENDER_FORBIDDEN_BODY_FRAGMENTS).toEqual(
      expect.arrayContaining(['Backend unavailable', 'Internal Error', 'Request failed']),
    );
  });

  it('covers each source group with at least one route', () => {
    for (const group of PAGE_RENDER_SOURCE_GROUPS) {
      const routes = routesForSourceGroup(PAGE_RENDER_MATRIX, group);
      expect(routes.length, `${group} has at least one route`).toBeGreaterThan(0);
    }
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
