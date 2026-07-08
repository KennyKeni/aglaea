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
