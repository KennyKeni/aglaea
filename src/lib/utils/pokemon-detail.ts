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
  const riding = resolveRiding(activeForm, pokemon);
  if (riding && detailRidingData(riding.data)) {
    items.push({ id: 'riding-details', text: 'Riding Details', level: 2 });
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

export interface RidingStatDetail {
  label: string;
  description: string | null;
}

export interface RidingSoundDetail {
  location: string;
  facts: string[];
}

export interface RidingSettingProfileDetail {
  label: string | null;
  resource: string | null;
  values: string[];
}

export interface RidingBehaviourDetail {
  style: string | null;
  key: string | null;
  compositeRole: string | null;
  transitionStrategy: string | null;
  inheritance: string | null;
  stats: RidingStatDetail[];
  values: string[];
  settingProfile: RidingSettingProfileDetail | null;
  rideSounds: RidingSoundDetail[];
}

export interface RidingSeatDetail {
  label: string;
  offset: string | null;
  poseOffsets: string[];
}

export interface RidingDetails {
  behaviours: RidingBehaviourDetail[];
  seats: RidingSeatDetail[];
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function formatScalar(value: unknown): string | null {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && value.length > 0) return value;
  return null;
}

function formatRangeMultiplier(record: Record<string, unknown>): string | null {
  const min = finiteNumber(record.min);
  const max = finiteNumber(record.max);
  const multiplier = finiteNumber(record.multiplier);
  if (min === null || max === null) return null;
  const range = `${min}-${max}`;
  return multiplier === null ? range : `${range} x${multiplier}`;
}

function formatOffsetCoords(offset: unknown): string | null {
  const record = asRecord(offset);
  if (!record) return null;
  const x = finiteNumber(record.x);
  const y = finiteNumber(record.y);
  const z = finiteNumber(record.z);
  if (x === null || y === null || z === null) return null;
  return `x ${x} y ${y} z ${z}`;
}

function formatSettingValue(value: unknown): string | null {
  const scalar = formatScalar(value);
  if (scalar !== null) return scalar;

  const record = asRecord(value);
  if (!record) return null;

  if (typeof record.kind === 'string' || typeof record.rideStat === 'string') {
    const parts: string[] = [];
    if (typeof record.kind === 'string' && record.kind.length > 0) parts.push(record.kind);
    if (typeof record.rideStyle === 'string' && record.rideStyle.length > 0) {
      parts.push(record.rideStyle);
    }
    if (typeof record.rideStat === 'string' && record.rideStat.length > 0) {
      parts.push(record.rideStat);
    }
    const range = formatRangeMultiplier(record);
    if (range) parts.push(range);
    return parts.length ? parts.join(' ') : null;
  }

  return formatRangeMultiplier(record);
}

function formatBehaviourValue(value: unknown): string | null {
  const scalar = formatScalar(value);
  if (scalar !== null) return scalar;
  const record = asRecord(value);
  if (!record) return null;
  return formatRangeMultiplier(record);
}

function inheritanceLabel(value: unknown): string | null {
  if (value === true) return 'Inherited from species';
  if (value === false) return 'Form-specific';
  return null;
}

function detailBehaviour(
  styleKey: string,
  behaviour: Record<string, unknown>,
): RidingBehaviourDetail {
  const style =
    typeof behaviour.rideStyle === 'string' && behaviour.rideStyle.length > 0
      ? behaviour.rideStyle
      : styleKey || null;
  const key = typeof behaviour.key === 'string' && behaviour.key.length > 0 ? behaviour.key : null;
  const compositeRole =
    typeof behaviour.compositeRole === 'string' && behaviour.compositeRole.length > 0
      ? `Composite ${behaviour.compositeRole}`
      : null;
  const transitionStrategy =
    typeof behaviour.transitionStrategy === 'string' && behaviour.transitionStrategy.length > 0
      ? `Transition ${behaviour.transitionStrategy}`
      : null;

  const statsRecord = asRecord(behaviour.stats);
  const statDetailsRecord = asRecord(behaviour.statDetails);
  const statKeys = new Set<string>([
    ...Object.keys(statsRecord ?? {}),
    ...Object.keys(statDetailsRecord ?? {}),
  ]);
  const stats: RidingStatDetail[] = [];
  for (const statKey of statKeys) {
    const detail = asRecord(statDetailsRecord?.[statKey]);
    const displayName =
      typeof detail?.displayName === 'string' && detail.displayName.length > 0
        ? detail.displayName
        : statKey;
    const rangeStart = finiteNumber(detail?.rangeStart);
    const rangeEnd = finiteNumber(detail?.rangeEnd);
    const statsValue = statsRecord?.[statKey];
    const range =
      rangeStart !== null && rangeEnd !== null
        ? `${rangeStart}-${rangeEnd}`
        : typeof statsValue === 'string' && statsValue.length > 0
          ? statsValue
          : null;
    if (!range) continue;
    stats.push({
      label: `${displayName} ${range}`,
      description:
        typeof detail?.description === 'string' && detail.description.length > 0
          ? detail.description
          : null,
    });
  }

  const valuesRecord = asRecord(behaviour.values);
  const values: string[] = [];
  if (valuesRecord) {
    for (const [valueKey, raw] of Object.entries(valuesRecord)) {
      const formatted = formatBehaviourValue(raw);
      if (formatted) values.push(`${valueKey} ${formatted}`);
    }
  }

  const profileRecord = asRecord(behaviour.settingProfile);
  let settingProfile: RidingSettingProfileDetail | null = null;
  if (profileRecord) {
    const profileId = finiteNumber(profileRecord.id);
    const profileKey =
      typeof profileRecord.key === 'string' && profileRecord.key.length > 0
        ? profileRecord.key
        : null;
    const profileParts: string[] = [];
    if (profileId !== null) profileParts.push(`#${profileId}`);
    if (profileKey) profileParts.push(profileKey);
    const label = profileParts.length ? `Profile ${profileParts.join(' ')}` : null;
    const resource =
      typeof profileRecord.resource === 'string' && profileRecord.resource.length > 0
        ? profileRecord.resource
        : null;
    const profileValuesRecord = asRecord(profileRecord.values);
    const profileValues: string[] = [];
    if (profileValuesRecord) {
      for (const [valueKey, raw] of Object.entries(profileValuesRecord)) {
        const formatted = formatSettingValue(raw);
        if (formatted) profileValues.push(`${valueKey} ${formatted}`);
      }
    }
    if (label || resource || profileValues.length) {
      settingProfile = { label, resource, values: profileValues };
    }
  }

  const rideSoundsRaw = Array.isArray(behaviour.rideSounds) ? behaviour.rideSounds : [];
  const rideSounds: RidingSoundDetail[] = [];
  for (const sound of rideSoundsRaw) {
    const soundRecord = asRecord(sound);
    if (!soundRecord) continue;
    const location =
      typeof soundRecord.soundLocation === 'string' && soundRecord.soundLocation.length > 0
        ? soundRecord.soundLocation
        : null;
    if (!location) continue;
    const facts: string[] = [];
    if (
      typeof soundRecord.volumeExpressionKind === 'string' &&
      soundRecord.volumeExpressionKind.length > 0
    ) {
      facts.push(`volume ${soundRecord.volumeExpressionKind}`);
    }
    if (
      typeof soundRecord.pitchExpressionKind === 'string' &&
      soundRecord.pitchExpressionKind.length > 0
    ) {
      facts.push(`pitch ${soundRecord.pitchExpressionKind}`);
    }
    if (soundRecord.muffleEnabled === true) facts.push('Muffled');
    if (soundRecord.playForPassengers === true && soundRecord.playForNonPassengers === false) {
      facts.push('Passengers only');
    } else if (
      soundRecord.playForPassengers === false &&
      soundRecord.playForNonPassengers === true
    ) {
      facts.push('Non-passengers only');
    }
    rideSounds.push({ location, facts });
  }

  return {
    style,
    key,
    compositeRole,
    transitionStrategy,
    inheritance: inheritanceLabel(behaviour.inheritedFromSpecies),
    stats,
    values,
    settingProfile,
    rideSounds,
  };
}

function detailSeat(seat: unknown, index: number): RidingSeatDetail | null {
  const record = asRecord(seat);
  if (!record) return null;
  const locator =
    typeof record.locator === 'string' && record.locator.length > 0 ? record.locator : null;
  const label = locator ? `Seat ${index + 1} ${locator}` : `Seat ${index + 1}`;
  const coords = formatOffsetCoords(record.offset);
  const offset = coords ? `Offset ${coords}` : null;

  const poseOffsetsRaw = Array.isArray(record.poseOffsets) ? record.poseOffsets : [];
  const poseOffsets: string[] = [];
  for (const pose of poseOffsetsRaw) {
    const poseRecord = asRecord(pose);
    if (!poseRecord) continue;
    const poseCoords = formatOffsetCoords(poseRecord.offset);
    if (!poseCoords) continue;
    const poseTypes = Array.isArray(poseRecord.poseTypes)
      ? poseRecord.poseTypes.filter(
          (type): type is string => typeof type === 'string' && type.length > 0,
        )
      : [];
    const typesLabel = poseTypes.length ? poseTypes.join(', ') : 'Pose';
    poseOffsets.push(`Pose ${typesLabel} ${poseCoords}`);
  }

  return { label, offset, poseOffsets };
}

function behaviourHasDetail(behaviour: RidingBehaviourDetail): boolean {
  return Boolean(
    behaviour.style ||
    behaviour.key ||
    behaviour.compositeRole ||
    behaviour.transitionStrategy ||
    behaviour.inheritance ||
    behaviour.stats.length ||
    behaviour.values.length ||
    behaviour.settingProfile ||
    behaviour.rideSounds.length,
  );
}

function seatHasDetail(seat: RidingSeatDetail): boolean {
  return Boolean(seat.label || seat.offset || seat.poseOffsets.length);
}

export function detailRidingData(data: unknown): RidingDetails | null {
  const record = asRecord(data);
  if (!record) return null;

  const behavioursRecord = asRecord(record.behaviours);
  const behaviours: RidingBehaviourDetail[] = [];
  if (behavioursRecord) {
    for (const [styleKey, raw] of Object.entries(behavioursRecord)) {
      const behaviour = asRecord(raw);
      if (!behaviour) continue;
      const detailed = detailBehaviour(styleKey, behaviour);
      if (behaviourHasDetail(detailed)) behaviours.push(detailed);
    }
  }

  const seatsRaw = Array.isArray(record.seats) ? record.seats : [];
  const seats = seatsRaw
    .map((seat, index) => detailSeat(seat, index))
    .filter((seat): seat is RidingSeatDetail => Boolean(seat && seatHasDetail(seat)));

  if (!behaviours.length && !seats.length) return null;
  return { behaviours, seats };
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
