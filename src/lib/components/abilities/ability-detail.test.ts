import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import AbilityGrid from './ability-grid.svelte';
import AbilityDetail from './ability-detail.svelte';
import type { Ability } from '$lib/types/ability';
import { abilityUrl, pokemonUrl } from '$lib/utils/url';

function makeAbility(overrides: Partial<Ability> = {}): Ability {
  return {
    id: 4,
    name: 'Battle Armor',
    slug: 'battle-armor',
    desc: 'Hard armor protects the Pokemon from critical hits.',
    shortDesc: 'Blocks critical hits.',
    flags: [
      {
        id: 1,
        name: 'Breakable',
        slug: 'breakable',
        description: 'Can be ignored by Mold Breaker-like effects.',
      },
    ],
    forms: [{ id: 44, name: 'Kabutops-Normal', slug: 'kabutops-normal', speciesId: 141 }],
    ...overrides,
  };
}

describe('AbilityGrid', () => {
  it('renders shared-contract ability cards with flags and descriptions', () => {
    const ability = makeAbility();

    const html = render(AbilityGrid, {
      props: {
        abilities: [ability],
      },
    }).body;

    expect(html).toContain('Battle Armor');
    expect(html).toContain('Breakable');
    expect(html).toContain('Blocks critical hits.');
    expect(html).toContain(`href="${abilityUrl(ability.id)}"`);
  });
});

describe('AbilityDetail', () => {
  it('renders retained ability detail sections from the shared contract shape', () => {
    const ability = makeAbility();

    const html = render(AbilityDetail, {
      props: {
        ability,
      },
    }).body;

    expect(html).toContain('Overview');
    expect(html).toContain('Blocks critical hits.');
    expect(html).toContain('Hard armor protects the Pokemon from critical hits.');
    expect(html).toContain('Flags');
    expect(html).toContain('Breakable');
    expect(html).toContain('Can be ignored by Mold Breaker-like effects.');
    expect(html).toContain('Forms');
    expect(html).toContain('Kabutops-Normal');
    expect(html).toContain(`href="${pokemonUrl(141, 44)}"`);
  });
});
