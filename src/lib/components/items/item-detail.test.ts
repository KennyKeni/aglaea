import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ItemGrid from './item-grid.svelte';
import ItemDetail from './item-detail.svelte';
import type { Item } from '$lib/types/item';
import { itemUrl } from '$lib/utils/url';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 6,
    slug: 'ability-capsule',
    name: 'Ability Capsule',
    num: null,
    desc: 'Switches a Pokemon between regular abilities.',
    shortDesc: 'Swaps regular abilities.',
    generation: 6,
    namespace: { id: 1, name: 'Cobblemon', slug: 'cobblemon' },
    implemented: true,
    boosts: [
      {
        stat: { id: 2, name: 'Attack', slug: 'attack' },
        stages: 1,
      },
    ],
    flags: [{ id: 1, name: 'Consumable', slug: 'consumable' }],
    tags: [
      { id: 1, name: 'Utility', slug: 'utility' },
      { id: 2, name: 'Medicine', slug: 'medicine' },
    ],
    recipes: [],
    ...overrides,
  };
}

describe('ItemGrid', () => {
  it('renders shared-contract item cards with namespace, tags, and copy', () => {
    const item = makeItem();

    const html = render(ItemGrid, {
      props: {
        items: [item],
      },
    }).body;

    expect(html).toContain('Ability Capsule');
    expect(html).toContain('Cobblemon');
    expect(html).toContain('Utility');
    expect(html).toContain('Medicine');
    expect(html).toContain('Swaps regular abilities.');
    expect(html).toContain(`href="${itemUrl(item.id)}"`);
  });
});

describe('ItemDetail', () => {
  it('renders retained item detail sections from the shared contract shape', () => {
    const item = makeItem();

    const html = render(ItemDetail, {
      props: {
        item,
      },
    }).body;

    expect(html).toContain('Overview');
    expect(html).toContain('Cobblemon');
    expect(html).toContain('Gen 6');
    expect(html).toContain('Implemented');
    expect(html).toContain('Switches a Pokemon between regular abilities.');
    expect(html).toContain('Tags');
    expect(html).toContain('Utility');
    expect(html).toContain('Medicine');
    expect(html).toContain('Stat Boosts');
    expect(html).toContain('Attack');
    expect(html).toContain('+1');
    expect(html).toContain('Flags');
    expect(html).toContain('Consumable');
  });
});
