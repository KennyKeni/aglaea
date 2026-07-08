import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import MoveGrid from './move-grid.svelte';
import MoveDetail from './move-detail.svelte';
import type { Move } from '$lib/types/move';
import { moveUrl, pokemonUrl } from '$lib/utils/url';

function makeMove(overrides: Partial<Move> = {}): Move {
  return {
    id: 14,
    name: 'Swords Dance',
    slug: 'swords-dance',
    desc: 'A frenetic dance boosts the Attack stat.',
    shortDesc: 'Boosts Attack by two stages.',
    type: { id: 1, name: 'Normal', slug: 'normal' },
    category: { id: 3, name: 'Status', slug: 'status', description: null },
    target: { id: 7, name: 'User', slug: 'user', description: null },
    power: null,
    accuracy: true,
    pp: 20,
    priority: 0,
    critRatio: null,
    minHits: null,
    maxHits: null,
    drainPercent: null,
    healPercent: null,
    recoilPercent: null,
    flags: [
      {
        id: 1,
        name: 'Snatch',
        slug: 'snatch',
        description: 'Can be stolen by Snatch.',
      },
    ],
    boosts: [
      {
        stat: { id: 2, name: 'Attack', slug: 'attack' },
        stages: 2,
        isSelf: true,
      },
    ],
    effects: [],
    maxPower: null,
    zData: null,
    gmaxSpecies: [],
    forms: [{ id: 25, name: 'Scyther-Normal', slug: 'scyther-normal', speciesId: 123 }],
    ...overrides,
  };
}

describe('MoveGrid', () => {
  it('renders shared-contract move cards with retained combat facts', () => {
    const move = makeMove();

    const html = render(MoveGrid, {
      props: {
        moves: [move],
      },
    }).body;

    expect(html).toContain('Swords Dance');
    expect(html).toContain('Normal');
    expect(html).toContain('Status');
    expect(html).toContain('Acc: <strong class="text-foreground">Always</strong>');
    expect(html).toContain('PP: <strong class="text-foreground">20</strong>');
    expect(html).toContain('Boosts Attack by two stages.');
    expect(html).toContain(`href="${moveUrl(move.id)}"`);
  });
});

describe('MoveDetail', () => {
  it('renders retained move detail sections from the shared contract shape', () => {
    const move = makeMove();

    const html = render(MoveDetail, {
      props: {
        move,
      },
    }).body;

    expect(html).toContain('Overview');
    expect(html).toContain('User');
    expect(html).toContain('Always');
    expect(html).toContain('Flags');
    expect(html).toContain('Snatch');
    expect(html).toContain('Can be stolen by Snatch.');
    expect(html).toContain('Stat Changes');
    expect(html).toContain('Attack');
    expect(html).toContain('+2');
    expect(html).toContain('Forms');
    expect(html).toContain('Scyther-Normal');
    expect(html).toContain(`href="${pokemonUrl(123, 25)}"`);
  });
});
