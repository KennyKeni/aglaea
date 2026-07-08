import type { Form, Pokemon } from '$lib/types/pokemon';
import type { TocItem } from './toc';

export function resolvePokemonFormIndex(
  forms: Pokemon['forms'],
  formId: number | undefined,
): number {
  if (formId == null || !Number.isFinite(formId)) return 0;
  const idx = forms.findIndex((form) => form.id === formId);
  return idx >= 0 ? idx : 0;
}

export function resolvePokemonForm(
  forms: Pokemon['forms'],
  formId: number | undefined,
): Form | null {
  return forms[resolvePokemonFormIndex(forms, formId)] ?? null;
}

export function buildPokemonDetailToc(pokemon: Pokemon, activeForm: Form | null): TocItem[] {
  const items: TocItem[] = [
    { id: 'pokemon-title', text: pokemon.name, level: 0 },
    { id: 'overview', text: 'Overview', level: 2 },
    { id: 'moves', text: 'Moves', level: 2 },
    { id: 'training', text: 'Training', level: 2 },
    { id: 'breeding', text: 'Breeding', level: 2 },
    { id: 'physical', text: 'Physical', level: 2 },
  ];

  if (
    activeForm?.hitbox ||
    activeForm?.lighting ||
    activeForm?.riding ||
    pokemon.lighting ||
    pokemon.riding ||
    pokemon.gameplay ||
    activeForm?.gameplay ||
    activeForm?.aspectChoices.length ||
    activeForm?.behaviour
  ) {
    items.push({ id: 'gameplay-visuals', text: 'Gameplay & Visuals', level: 2 });
  }
  if (activeForm?.labels?.length) {
    items.push({ id: 'labels', text: 'Labels', level: 2 });
  }
  if (activeForm?.spawns?.length) {
    items.push({ id: 'spawn-locations', text: 'Spawn Locations', level: 2 });
  }
  if (
    activeForm?.drops &&
    (activeForm.drops.percentages.length || activeForm.drops.ranges.length)
  ) {
    items.push({ id: 'drops', text: 'Drops', level: 2 });
  }

  return items;
}

export type RidingSource = 'form' | 'species';

export interface ResolvedRiding {
  source: RidingSource;
  data: unknown;
}

export function resolveRiding(
  form: Form | null | undefined,
  pokemon: Pokemon | null | undefined,
): ResolvedRiding | null {
  if (form?.riding) return { source: 'form', data: form.riding.data };
  if (pokemon?.riding) return { source: 'species', data: pokemon.riding.data };
  return null;
}

export interface RidingSummary {
  rideStyles: string[] | null;
  behaviourKeys: string[] | null;
  seatCount: number | null;
  stats: Record<string, string> | null;
  settingProfiles: string[] | null;
  rideSoundCount: number | null;
  inheritance: string | null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function emptyRidingSummary(): RidingSummary {
  return {
    rideStyles: null,
    behaviourKeys: null,
    seatCount: null,
    stats: null,
    settingProfiles: null,
    rideSoundCount: null,
    inheritance: null,
  };
}

function uniqueStrings(values: unknown[]): string[] | null {
  const strings = values.filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  );
  return strings.length ? [...new Set(strings)] : null;
}

export function summarizeRidingData(data: unknown): RidingSummary {
  const record = asRecord(data);
  if (!record) return emptyRidingSummary();

  const behavioursRecord = asRecord(record.behaviours);
  const behaviours = behavioursRecord ? Object.values(behavioursRecord).map(asRecord) : [];
  const behaviourRecords = behaviours.filter((behaviour): behaviour is Record<string, unknown> =>
    Boolean(behaviour),
  );

  if (!behaviourRecords.length) return emptyRidingSummary();

  const rideStyles = uniqueStrings(
    behaviourRecords.map(
      (behaviour, index) => behaviour.rideStyle ?? Object.keys(behavioursRecord ?? {})[index],
    ),
  );
  const behaviourKeys = uniqueStrings(behaviourRecords.map((behaviour) => behaviour.key));
  const settingProfiles = uniqueStrings(
    behaviourRecords.flatMap((behaviour) => {
      const profile = asRecord(behaviour.settingProfile);
      return [profile?.key, profile?.resource];
    }),
  );

  const statsEntries = behaviourRecords.flatMap((behaviour) => {
    const stats = asRecord(behaviour.stats);
    if (!stats) return [];
    return Object.entries(stats).filter((entry): entry is [string, string] => {
      const [, value] = entry;
      return typeof value === 'string' && value.length > 0;
    });
  });
  const stats = statsEntries.length ? Object.fromEntries(statsEntries) : null;

  const rideSoundCount = behaviourRecords.reduce((total, behaviour) => {
    const sounds = behaviour.rideSounds;
    return total + (Array.isArray(sounds) ? sounds.length : 0);
  }, 0);

  const inheritanceValues = behaviourRecords
    .map((behaviour) => behaviour.inheritedFromSpecies)
    .filter((value): value is boolean => typeof value === 'boolean');
  const inheritance =
    inheritanceValues.length === 0
      ? null
      : inheritanceValues.every(Boolean)
        ? 'Inherited from species'
        : inheritanceValues.every((value) => !value)
          ? 'Form-specific'
          : 'Mixed inheritance';

  const seats = record.seats;
  const seatCount = Array.isArray(seats) ? seats.length : null;

  return {
    rideStyles,
    behaviourKeys,
    seatCount,
    stats,
    settingProfiles,
    rideSoundCount: rideSoundCount || null,
    inheritance,
  };
}

export interface BehaviourSummary {
  facts: string[];
  inheritance: string | null;
}

function emptyBehaviourSummary(): BehaviourSummary {
  return { facts: [], inheritance: null };
}

function speedText(speed: unknown): string | null {
  const record = asRecord(speed);
  if (!record) return null;
  if (typeof record.text === 'string' && record.text.length > 0) return record.text;
  if (typeof record.value === 'number' && Number.isFinite(record.value))
    return String(record.value);
  return null;
}

function movementFact(
  label: string,
  section: unknown,
  canKey: string,
  speedKey = 'speed',
): string | null {
  const record = asRecord(section);
  if (!record) return null;
  const can = record[canKey];
  if (can === false) return `${label} No`;
  if (can !== true) return null;
  const speed = speedText(record[speedKey]);
  return speed ? `${label} ${speed}` : label;
}

function formatLightRange(min: unknown, max: unknown): string | null {
  if (typeof min !== 'number' || typeof max !== 'number') return null;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return `Light ${min}-${max}`;
}

function formatFollowRange(min: unknown, max: unknown): string | null {
  if (typeof min !== 'number' || typeof max !== 'number') return null;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return `Follow ${min}-${max}`;
}

export function summarizeBehaviourData(data: unknown): BehaviourSummary {
  const record = asRecord(data);
  if (!record) return emptyBehaviourSummary();

  const facts: string[] = [];

  const walk = movementFact('Walk', record.walk, 'canWalk');
  if (walk) facts.push(walk);

  const swim = movementFact('Swim', record.swim, 'canSwimInWater');
  if (swim) facts.push(swim);

  const fly = movementFact('Fly', record.fly, 'canFly', 'speedHorizontal');
  if (fly) facts.push(fly);

  const walkRecord = asRecord(record.walk);
  if (walkRecord?.avoidsLand === true) facts.push('Avoids land');

  const swimRecord = asRecord(record.swim);
  if (swimRecord?.avoidsWater === true) facts.push('Avoids water');
  if (swimRecord?.canSwimInLava === true) facts.push('Swims in lava');

  const rest = asRecord(record.rest);
  if (rest) {
    if (typeof rest.depth === 'string' && rest.depth.length > 0) {
      facts.push(`Rest ${rest.depth}`);
    }
    const light = formatLightRange(rest.lightMin, rest.lightMax);
    if (light) facts.push(light);
    if (rest.willSleepOnBed === true) facts.push('Sleeps on bed');
    if (rest.canSleep === false) facts.push('Cannot sleep');
  }

  const combat = asRecord(record.combat);
  if (combat) {
    if (combat.willFlee === true) facts.push('Flees');
    if (combat.fightsMelee === true) facts.push('Melee');
    if (combat.willDefendSelf === true) facts.push('Defends self');
    if (combat.willDefendOwner === true) facts.push('Defends owner');
  }

  const herd = asRecord(record.herd);
  if (herd) {
    if (typeof herd.maxSize === 'number' && Number.isFinite(herd.maxSize)) {
      facts.push(`Herd ${herd.maxSize}`);
    }
    const follow = formatFollowRange(herd.followDistanceMin, herd.followDistanceMax);
    if (follow) facts.push(follow);
  }

  if (record.fireImmune === true) facts.push('Fire immune');
  if (record.freezeImmune === true) facts.push('Freeze immune');

  const inheritance =
    record.behaviorInheritedFromSpecies === true
      ? 'Inherited from species'
      : record.behaviorInheritedFromSpecies === false
        ? 'Form-specific'
        : null;

  return { facts, inheritance };
}
