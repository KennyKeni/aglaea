import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import PokemonGrid from './pokemon-grid.svelte';
import { pokemonUrl } from '$lib/utils/url';
import type { Pokemon } from '$lib/types/pokemon';

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
    types: [{ type: { id: 1, name: 'Grass', slug: 'grass' }, slot: 1 }],
    abilities: [],
    moves: [],
    hitbox: null,
    drops: null,
    aspectCombos: [],
    behaviour: null,
    spawns: [],
    ...overrides,
  };
}

function makeSpecies(overrides: Record<string, unknown> = {}): Pokemon {
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
    experienceGroup: null,
    eggGroups: [],
    hitbox: null,
    lighting: null,
    riding: null,
    forms: [makeForm()],
    ...overrides,
  } as unknown as Pokemon;
}

function renderGrid(pokemon: Pokemon[]) {
  return render(PokemonGrid, {
    props: {
      pokemon,
    },
  }).body;
}

describe('PokemonGrid', () => {
  it('renders shared-contract species card data', () => {
    const html = renderGrid([
      makeSpecies({
        id: 25,
        name: 'Pikachu',
        slug: 'pikachu',
        description: 'A mouse Pokemon.',
        image: { id: 'pikachu-image', url: 'https://example.com/pikachu.png' },
        forms: [
          makeForm({
            types: [{ type: { id: 13, name: 'Electric', slug: 'electric' }, slot: 1 }],
          }),
        ],
      }),
    ]);

    expect(html).toContain('Pikachu');
    expect(html).toContain('#0025');
    expect(html).toContain('Electric');
    expect(html).toContain('A mouse Pokemon.');
    expect(html).toContain('src="https://example.com/pikachu.png"');
    expect(html).toContain('alt="Pikachu"');
  });

  it('links species cards by slug while preserving canonical ID display', () => {
    const pokemon = makeSpecies({ id: 1, slug: 'bulbasaur' });
    const html = renderGrid([pokemon]);

    expect(html).toContain(`href="${pokemonUrl(pokemon.slug)}"`);
    expect(html).toContain('#0001');
    expect(html).not.toContain('href="/pokemon/1"');
  });

  it('renders a graceful fallback when the species image is absent', () => {
    const html = renderGrid([makeSpecies({ image: null })]);

    expect(html).toContain('No image');
    expect(html).not.toContain('<img');
  });
});
