import type { Ref, NamedRef } from './base';

export type TypeRef = NamedRef;
export type AbilityRef = NamedRef;
export type MoveRef = NamedRef;
export type LabelRef = NamedRef;
export type EggGroupRef = NamedRef;
export type AspectRef = NamedRef;

export interface FormType {
  type: TypeRef;
  slot: number;
}

export interface AbilitySlot {
  id: number;
  slug: string;
  name: string;
}

export interface FormAbility {
  ability: AbilityRef;
  slot: AbilitySlot;
}

export interface MoveMethod {
  id: number;
  slug: string;
  name: string;
}

export interface FormMove {
  move: MoveRef;
  method: MoveMethod;
  level: number | null;
}

export interface Hitbox {
  width: number;
  height: number;
  fixed: boolean;
}

export interface Lighting {
  lightLevel: number;
  liquidGlowMode: string | null;
}

export interface Riding {
  data: unknown;
}

export interface Behaviour {
  data: unknown;
}

export interface AspectChoice {
  id: number;
  slug: string;
  name: string;
  value: string;
}

export interface AspectCombo {
  comboIndex: number;
  aspects: AspectRef[];
}

export interface DropPercentage {
  item: Ref;
  percentage: number;
}

export interface DropRange {
  item: Ref;
  quantityMin: number;
  quantityMax: number;
}

export interface Drops {
  amount: number;
  percentages: DropPercentage[];
  ranges: DropRange[];
}

export interface SpawnWeather {
  isRaining: boolean | null;
  isThundering: boolean | null;
}

export interface SpawnSky {
  canSeeSky: boolean | null;
  minSkyLight: number | null;
  maxSkyLight: number | null;
}

export interface SpawnPosition {
  minY: number | null;
  maxY: number | null;
}

export interface SpawnLure {
  minLureLevel: number | null;
  maxLureLevel: number | null;
}

export interface SpawnCondition {
  id: number;
  type: string;
  multiplier: number | null;
  biomes: Ref[];
  biomeTags: Ref[];
  timeRanges: Ref[];
  moonPhases: Ref[];
  weather: SpawnWeather | null;
  sky: SpawnSky | null;
  position: SpawnPosition | null;
  lure: SpawnLure | null;
}

export interface Spawn {
  id: number;
  bucket: Ref;
  positionType: Ref;
  weight: number;
  levelMin: number;
  levelMax: number;
  conditions: SpawnCondition[];
}

export interface Form {
  id: number;
  name: string;
  fullName: string;
  slug: string;
  description: string | null;
  generation: number | null;
  height: number;
  weight: number;
  catchRate: number;
  baseFriendship: number;
  eggCycles: number;
  maleRatio: number | null;
  baseScale: number | null;
  baseHp: number;
  baseAttack: number;
  baseDefence: number;
  baseSpecialAttack: number;
  baseSpecialDefence: number;
  baseSpeed: number;
  baseExperienceYield: number | null;
  evHp: number;
  evAttack: number;
  evDefence: number;
  evSpecialAttack: number;
  evSpecialDefence: number;
  evSpeed: number;
  labels: LabelRef[];
  aspectChoices: AspectChoice[];
  types: FormType[];
  abilities: FormAbility[];
  moves: FormMove[];
  hitbox: Hitbox | null;
  drops: Drops | null;
  aspectCombos: AspectCombo[];
  behaviour: Behaviour | null;
  spawns: Spawn[];
}

export interface ExperienceGroup {
  id: number;
  slug: string;
  name: string;
  formula: string;
}

export interface Pokemon {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  generation: number;
  experienceGroup: ExperienceGroup | null;
  eggGroups: EggGroupRef[];
  hitbox: Hitbox | null;
  lighting: Lighting | null;
  riding: Riding | null;
  forms: Form[];
}
