export type PageSourceGroup =
  | 'home'
  | 'pokemon'
  | 'moves'
  | 'abilities'
  | 'items'
  | 'llms'
  | 'demo';

export interface PageRenderExpectation {
  route: string;
  sourceGroup: PageSourceGroup;
  linkSelector?: string;
  selectorsMustExist?: string[];
  minBodyTextLength?: number;
  bodyMustContain: string[];
  bodyMustNotContain?: string[];
}

const DEFAULT_BASE_URL = 'http://localhost:5173';

export function resolveBaseUrl(override?: string): string {
  const value = (override ?? process.env.AGLAEA_BASE_URL ?? DEFAULT_BASE_URL).trim();
  if (value.length === 0) return DEFAULT_BASE_URL;
  return value.replace(/\/$/, '');
}

export const PAGE_RENDER_MATRIX: readonly PageRenderExpectation[] = [
  {
    route: '/',
    sourceGroup: 'home',
    linkSelector: 'main a[href="/pokemon"]',
    selectorsMustExist: [
      'main a[href="/items"]',
      'main a[href="/moves"]',
      'main a[href="/abilities"]',
      'main a[href="/llms"]',
    ],
    bodyMustContain: ['Aglaea', 'Directory', 'Species Database', 'Chat'],
  },
  {
    route: '/pokemon?search=bulbasaur',
    sourceGroup: 'pokemon',
    linkSelector: 'main a[href^="/pokemon/"]',
    bodyMustContain: ['Bulbasaur', '#0001', 'Grass'],
  },
  {
    route: '/pokemon/bulbasaur',
    sourceGroup: 'pokemon',
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
    sourceGroup: 'moves',
    linkSelector: 'main a[href^="/moves/"]',
    bodyMustContain: ['Swords Dance', 'Status', 'PP:'],
  },
  {
    route: '/moves/swords-dance',
    sourceGroup: 'moves',
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
    sourceGroup: 'abilities',
    linkSelector: 'main a[href^="/abilities/"]',
    bodyMustContain: ['Battle Armor'],
  },
  {
    route: '/abilities/battle-armor',
    sourceGroup: 'abilities',
    bodyMustContain: [
      'Battle Armor',
      'Overview',
      'This Pokemon cannot be struck by a critical hit',
      'Forms',
    ],
  },
  {
    route: '/items?search=ability',
    sourceGroup: 'items',
    linkSelector: 'main a[href^="/items/"]',
    bodyMustContain: ['Ability Capsule', 'Cobblemon'],
  },
  {
    route: '/items/ability-capsule',
    sourceGroup: 'items',
    bodyMustContain: ['Ability Capsule', 'Overview', 'Cobblemon', 'Implemented'],
  },
  {
    route: '/llms',
    sourceGroup: 'llms',
    minBodyTextLength: 100,
    selectorsMustExist: [
      'textarea[placeholder="Ask Herta"]',
      'button[aria-label="Reset session"]',
      'button[aria-label="Send message"]',
    ],
    bodyMustContain: ['Chat', 'New session'],
  },
  {
    route: '/demo',
    sourceGroup: 'demo',
    linkSelector: 'a[href="/demo/paraglide"]',
    minBodyTextLength: 8,
    bodyMustContain: ['paraglide'],
  },
  {
    route: '/demo/paraglide',
    sourceGroup: 'demo',
    minBodyTextLength: 120,
    bodyMustContain: ['Hello, SvelteKit User from en!', 'en', 'Sherlock i18n extension'],
  },
] as const;

export const PAGE_RENDER_SOURCE_GROUPS = [
  'home',
  'pokemon',
  'moves',
  'abilities',
  'items',
  'llms',
  'demo',
] as const;
export type PageRenderSourceGroup = (typeof PAGE_RENDER_SOURCE_GROUPS)[number];

export const PAGE_RENDER_FORBIDDEN_BODY_FRAGMENTS = [
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

export const EXPECTED_PAGE_ROUTES: readonly string[] = [
  '/',
  '/pokemon?search=bulbasaur',
  '/pokemon/bulbasaur',
  '/moves?search=swords',
  '/moves/swords-dance',
  '/abilities?search=battle',
  '/abilities/battle-armor',
  '/items?search=ability',
  '/items/ability-capsule',
  '/llms',
  '/demo',
  '/demo/paraglide',
] as const;

export function routesForSourceGroup(
  matrix: readonly PageRenderExpectation[],
  group: PageRenderSourceGroup,
): PageRenderExpectation[] {
  return matrix.filter((entry) => entry.sourceGroup === group);
}

export function coveredSourceGroups(
  matrix: readonly PageRenderExpectation[] = PAGE_RENDER_MATRIX,
): PageRenderSourceGroup[] {
  const seen = new Set<PageRenderSourceGroup>();
  for (const entry of matrix) seen.add(entry.sourceGroup);
  return PAGE_RENDER_SOURCE_GROUPS.filter((group) => seen.has(group));
}

export function routesMatchExpected(
  matrix: readonly PageRenderExpectation[] = PAGE_RENDER_MATRIX,
  expected: readonly string[] = EXPECTED_PAGE_ROUTES,
): boolean {
  const actual = matrix.map((entry) => entry.route);
  if (actual.length !== expected.length) return false;
  return actual.every((route, index) => route === expected[index]);
}
