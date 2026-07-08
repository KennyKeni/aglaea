import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import PokemonContent from './pokemon-content.svelte';
import PokemonDetail from './pokemon-detail.svelte';
import type { Form, Pokemon } from '$lib/types/pokemon';
import { buildPokemonDetailToc, resolvePokemonForm } from '$lib/utils/pokemon-detail';

function makeForm(overrides: Record<string, unknown> = {}): Form {
  return {
    id: 1,
    name: 'Normal',
    fullName: 'Charizard-Normal',
    slug: 'normal',
    description: null,
    generation: 1,
    image: null,
    height: 17,
    weight: 905,
    overrides: null,
    baseHp: 78,
    baseAttack: 84,
    baseDefence: 78,
    baseSpecialAttack: 109,
    baseSpecialDefence: 85,
    baseSpeed: 100,
    baseExperienceYield: 240,
    evHp: 0,
    evAttack: 0,
    evDefence: 0,
    evSpecialAttack: 3,
    evSpecialDefence: 0,
    evSpeed: 0,
    labels: [],
    aspectChoices: [],
    types: [{ type: { id: 10, name: 'Fire', slug: 'fire' }, slot: 1 }],
    abilities: [
      {
        ability: { id: 66, name: 'Blaze', slug: 'blaze' },
        slot: { id: 1, name: 'Normal', slug: 'normal' },
      },
    ],
    moves: [],
    hitbox: null,
    drops: null,
    aspectCombos: [],
    behaviour: null,
    spawns: [],
    ...overrides,
  } as unknown as Form;
}

function makeSpecies(overrides: Record<string, unknown> = {}): Pokemon {
  return {
    id: 6,
    name: 'Charizard',
    slug: 'charizard',
    description: 'Spits fire hot enough to melt boulders.',
    generation: 1,
    catchRate: 45,
    baseFriendship: 70,
    eggCycles: 20,
    maleRatio: 0.875,
    baseScale: null,
    image: { id: 'charizard-species', url: 'https://example.com/charizard.png' },
    experienceGroup: { id: 4, name: 'Medium Slow', slug: 'medium-slow' },
    eggGroups: [{ id: 1, name: 'Monster', slug: 'monster' }],
    hitbox: null,
    lighting: null,
    riding: null,
    forms: [makeForm()],
    ...overrides,
  } as unknown as Pokemon;
}

describe('PokemonDetail', () => {
  it('renders the species image even when the active form has an image', () => {
    const form = makeForm({
      name: 'Mega X',
      image: { id: 'charizard-mega-x', url: 'https://example.com/charizard-mega-x.png' },
    });
    const pokemon = makeSpecies({
      forms: [form],
      image: { id: 'charizard-species', url: 'https://example.com/charizard.png' },
    });

    const html = render(PokemonDetail, {
      props: {
        pokemon,
        form,
      },
    }).body;

    expect(html).toContain('src="https://example.com/charizard.png"');
    expect(html).toContain('alt="Charizard"');
    expect(html).toContain('Mega X');
    expect(html).not.toContain('https://example.com/charizard-mega-x.png');
  });

  it('renders a graceful fallback when the species image is absent', () => {
    const form = makeForm({
      image: { id: 'charizard-mega-x', url: 'https://example.com/charizard-mega-x.png' },
    });
    const pokemon = makeSpecies({
      image: null,
      forms: [form],
    });

    const html = render(PokemonDetail, {
      props: {
        pokemon,
        form,
      },
    }).body;

    expect(html).toContain('No image');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('https://example.com/charizard-mega-x.png');
  });
});

describe('PokemonContent', () => {
  it('uses initialFormId during SSR so the selected form drives detail content', () => {
    const standardForm = makeForm({
      id: 1,
      name: 'Standard',
      types: [{ type: { id: 11, name: 'Water', slug: 'water' }, slot: 1 }],
      abilities: [
        {
          ability: { id: 1, name: 'Torrent', slug: 'torrent' },
          slot: { id: 1, name: 'Normal', slug: 'normal' },
        },
      ],
      baseHp: 50,
      baseAttack: 50,
      baseDefence: 50,
      baseSpecialAttack: 50,
      baseSpecialDefence: 50,
      baseSpeed: 50,
      moves: [
        {
          move: {
            id: 1,
            name: 'Splash Start',
            slug: 'splash-start',
            type: { id: 11, name: 'Water', slug: 'water' },
            category: { id: 1, name: 'Status', slug: 'status' },
            power: null,
            accuracy: null,
            pp: 40,
          },
          method: { id: 1, name: 'Level Up', slug: 'level-up' },
          level: 1,
        },
      ],
      drops: {
        amount: 1,
        percentages: [
          {
            item: { id: 1, name: 'Water Stone', slug: 'water-stone' },
            percentage: 50,
          },
        ],
        ranges: [],
      },
    });
    const chargedForm = makeForm({
      id: 2,
      name: 'Charged',
      image: null,
      types: [{ type: { id: 13, name: 'Electric', slug: 'electric' }, slot: 1 }],
      abilities: [
        {
          ability: { id: 31, name: 'Static Surge', slug: 'static-surge' },
          slot: { id: 1, name: 'Normal', slug: 'normal' },
        },
      ],
      baseHp: 60,
      baseAttack: 70,
      baseDefence: 80,
      baseSpecialAttack: 90,
      baseSpecialDefence: 100,
      baseSpeed: 110,
      evSpeed: 2,
      moves: [
        {
          move: {
            id: 2,
            name: 'Thunder Rise',
            slug: 'thunder-rise',
            type: { id: 13, name: 'Electric', slug: 'electric' },
            category: { id: 2, name: 'Special', slug: 'special' },
            power: 90,
            accuracy: 100,
            pp: 15,
          },
          method: { id: 1, name: 'Level Up', slug: 'level-up' },
          level: 36,
        },
      ],
      drops: {
        amount: 1,
        percentages: [
          {
            item: { id: 2, name: 'Spark Stone', slug: 'spark-stone' },
            percentage: 75,
          },
        ],
        ranges: [],
      },
    });
    const pokemon = makeSpecies({
      forms: [standardForm, chargedForm],
    });

    const html = render(PokemonContent, {
      props: {
        pokemon,
        fullPokemon: pokemon,
        initialFormId: chargedForm.id,
      },
    }).body;

    expect(html).toContain('Standard');
    expect(html).toContain('Charged');
    expect(html).toContain('Electric');
    expect(html).toContain('Static Surge');
    expect(html).toContain('Total 510');
    expect(html).toContain('Thunder Rise');
    expect(html).toContain('Spark Stone');
    expect(html).not.toContain('Torrent');
    expect(html).not.toContain('Splash Start');
    expect(html).not.toContain('Water Stone');
  });

  it('does not require form image refs when rendering selected form content', () => {
    const pokemon = makeSpecies({
      image: null,
      forms: [
        makeForm({
          id: 1,
          name: 'Standard',
          image: null,
        }),
        makeForm({
          id: 2,
          name: 'No Image Form',
          image: null,
        }),
      ],
    });

    const html = render(PokemonContent, {
      props: {
        pokemon,
        fullPokemon: pokemon,
        initialFormId: 2,
      },
    }).body;

    expect(html).toContain('No Image Form');
    expect(html).toContain('No image');
    expect(html).not.toContain('<img');
  });
});

describe('Pokemon detail TOC', () => {
  it('uses the selected form when adding form-dependent anchors', () => {
    const baseForm = makeForm({
      id: 1,
      name: 'Base',
      labels: [],
      spawns: [],
      drops: null,
    });
    const dropsForm = makeForm({
      id: 2,
      name: 'Drops Form',
      labels: [{ id: 1, name: 'Regional', slug: 'regional' }],
      drops: {
        amount: 1,
        percentages: [
          {
            item: { id: 2, name: 'Spark Stone', slug: 'spark-stone' },
            percentage: 75,
          },
        ],
        ranges: [],
      },
    });
    const pokemon = makeSpecies({
      forms: [baseForm, dropsForm],
    });

    const activeForm = resolvePokemonForm(pokemon.forms, dropsForm.id);
    const tocIds = buildPokemonDetailToc(pokemon, activeForm).map((item) => item.id);

    expect(tocIds).toContain('labels');
    expect(tocIds).toContain('drops');
  });
});
