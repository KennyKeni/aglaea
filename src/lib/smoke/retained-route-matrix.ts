export type RouteKind = 'list' | 'detail';

export interface RetainedRouteExpectation {
  route: string;
  kind: RouteKind;
  sourceGroup: 'pokemon' | 'moves' | 'abilities' | 'items';
  searchTerm?: string;
  slug?: string;
  linkSelector?: string;
  bodyMustContain: string[];
  bodyMustNotContain?: string[];
}

const DEFAULT_BASE_URL = 'http://localhost:5173';

export function resolveBaseUrl(override?: string): string {
  const value = (override ?? process.env.AGLAEA_BASE_URL ?? DEFAULT_BASE_URL).trim();
  if (value.length === 0) return DEFAULT_BASE_URL;
  return value.replace(/\/$/, '');
}

export const RETAINED_ROUTE_MATRIX: readonly RetainedRouteExpectation[] = [
  {
    route: '/pokemon?search=bulbasaur',
    kind: 'list',
    sourceGroup: 'pokemon',
    searchTerm: 'bulbasaur',
    linkSelector: 'main a[href^="/pokemon/"]',
    bodyMustContain: ['Bulbasaur', '#0001', 'Grass'],
  },
  {
    route: '/pokemon/bulbasaur',
    kind: 'detail',
    sourceGroup: 'pokemon',
    slug: 'bulbasaur',
    bodyMustContain: [
      'Bulbasaur',
      '#0001',
      'Base stats',
      'Training',
      'Breeding',
      'Physical',
      'Gameplay & Visuals',
      'Hitbox',
      'Behaviour profile',
      'Drops',
    ],
  },
  {
    route: '/moves?search=swords',
    kind: 'list',
    sourceGroup: 'moves',
    searchTerm: 'swords',
    linkSelector: 'main a[href^="/moves/"]',
    bodyMustContain: ['Swords Dance', 'Status', 'PP:'],
  },
  {
    route: '/moves/swords-dance',
    kind: 'detail',
    sourceGroup: 'moves',
    slug: 'swords-dance',
    bodyMustContain: [
      'Swords Dance',
      'Overview',
      'Status',
      'Accuracy',
      'Always',
      "Raises the user's Attack by 2 stages.",
      'Forms',
    ],
  },
  {
    route: '/abilities?search=battle',
    kind: 'list',
    sourceGroup: 'abilities',
    searchTerm: 'battle',
    linkSelector: 'main a[href^="/abilities/"]',
    bodyMustContain: ['Battle Armor'],
  },
  {
    route: '/abilities/battle-armor',
    kind: 'detail',
    sourceGroup: 'abilities',
    slug: 'battle-armor',
    bodyMustContain: [
      'Battle Armor',
      'Overview',
      'This Pokemon cannot be struck by a critical hit',
      'Forms',
    ],
  },
  {
    route: '/items?search=ability',
    kind: 'list',
    sourceGroup: 'items',
    searchTerm: 'ability',
    linkSelector: 'main a[href^="/items/"]',
    bodyMustContain: ['Ability Capsule', 'Cobblemon'],
  },
  {
    route: '/items/ability-capsule',
    kind: 'detail',
    sourceGroup: 'items',
    slug: 'ability-capsule',
    bodyMustContain: ['Ability Capsule', 'Overview', 'Cobblemon', 'Implemented'],
  },
] as const;

export const RETAINED_SOURCE_GROUPS = ['pokemon', 'moves', 'abilities', 'items'] as const;
export const RETAINED_ROUTE_FORBIDDEN_BODY_FRAGMENTS = [
  'Backend unavailable',
  'Internal Error',
  'Request failed',
  'Not found',
  'Not Found',
  'Pokemon not found',
  'Move not found',
  'Ability not found',
  'Item not found',
] as const;
export type RetainedSourceGroup = (typeof RETAINED_SOURCE_GROUPS)[number];

export function routesForSourceGroup(
  matrix: readonly RetainedRouteExpectation[],
  group: RetainedSourceGroup,
): RetainedRouteExpectation[] {
  return matrix.filter((entry) => entry.sourceGroup === group);
}

export function listRoutes(
  matrix: readonly RetainedRouteExpectation[] = RETAINED_ROUTE_MATRIX,
): RetainedRouteExpectation[] {
  return matrix.filter((entry) => entry.kind === 'list');
}

export function detailRoutes(
  matrix: readonly RetainedRouteExpectation[] = RETAINED_ROUTE_MATRIX,
): RetainedRouteExpectation[] {
  return matrix.filter((entry) => entry.kind === 'detail');
}

export function coveredSourceGroups(
  matrix: readonly RetainedRouteExpectation[] = RETAINED_ROUTE_MATRIX,
): RetainedSourceGroup[] {
  const seen = new Set<RetainedSourceGroup>();
  for (const entry of matrix) seen.add(entry.sourceGroup);
  return RETAINED_SOURCE_GROUPS.filter((group) => seen.has(group));
}
