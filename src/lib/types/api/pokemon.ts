import { z } from 'zod';
import { RefSchema, NamedRefSchema } from './base';

const ImageRefSchema = z.object({
  id: z.string(),
  url: z.string(),
});

const AbilitySlotSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
});

const MoveMethodSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
});

const FormTypeSchema = z.object({
  type: NamedRefSchema,
  slot: z.number(),
});

const FormAbilitySchema = z.object({
  ability: NamedRefSchema,
  slot: AbilitySlotSchema,
});

const MoveRefSchema = NamedRefSchema.extend({
  type: NamedRefSchema,
  category: NamedRefSchema,
  power: z.number().nullable(),
  accuracy: z.number().nullable(),
  pp: z.number().nullable(),
});

const FormMoveSchema = z.object({
  move: MoveRefSchema,
  method: MoveMethodSchema,
  level: z.number().nullable(),
});

const HitboxSchema = z.object({
  width: z.number(),
  height: z.number(),
  fixed: z.boolean(),
});

const LightingSchema = z.object({
  lightLevel: z.number(),
  liquidGlowMode: z.string().nullable(),
});

const BehaviourSchema = z.object({
  data: z.unknown(),
});

const RidingSchema = z.object({
  data: z.unknown(),
});

const AspectChoiceSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  value: z.string(),
});

const AspectComboSchema = z.object({
  comboIndex: z.number(),
  aspects: z.array(NamedRefSchema),
});

const DropPercentageSchema = z.object({
  item: RefSchema,
  percentage: z.number(),
});

const DropRangeSchema = z.object({
  item: RefSchema,
  quantityMin: z.number(),
  quantityMax: z.number(),
});

const DropsSchema = z.object({
  amount: z.number(),
  percentages: z.array(DropPercentageSchema),
  ranges: z.array(DropRangeSchema),
});

const SpawnWeatherSchema = z.object({
  isRaining: z.boolean().nullable(),
  isThundering: z.boolean().nullable(),
});

const SpawnSkySchema = z.object({
  canSeeSky: z.boolean().nullable(),
  minSkyLight: z.number().nullable(),
  maxSkyLight: z.number().nullable(),
});

const SpawnPositionSchema = z.object({
  minY: z.number().nullable(),
  maxY: z.number().nullable(),
});

const SpawnLureSchema = z.object({
  minLureLevel: z.number().nullable(),
  maxLureLevel: z.number().nullable(),
});

const SpawnConditionSchema = z.object({
  id: z.number(),
  type: z.string(),
  multiplier: z.number().nullable(),
  biomes: z.array(RefSchema),
  biomeTags: z.array(RefSchema),
  timeRanges: z.array(RefSchema),
  moonPhases: z.array(RefSchema),
  weather: SpawnWeatherSchema.nullable(),
  sky: SpawnSkySchema.nullable(),
  position: SpawnPositionSchema.nullable(),
  lure: SpawnLureSchema.nullable(),
});

const SpawnSchema = z.object({
  id: z.number(),
  bucket: RefSchema,
  positionType: RefSchema,
  weight: z.number(),
  levelMin: z.number(),
  levelMax: z.number(),
  conditions: z.array(SpawnConditionSchema),
});

const FormOverridesSchema = z.object({
  catchRate: z.number().optional(),
  baseFriendship: z.number().optional(),
  eggCycles: z.number().optional(),
  maleRatio: z.number().nullable().optional(),
  baseScale: z.number().nullable().optional(),
});

export const FormSchema = z.object({
  id: z.number(),
  name: z.string(),
  fullName: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  generation: z.number().nullable(),
  height: z.number(),
  weight: z.number(),
  overrides: FormOverridesSchema.nullable(),
  baseHp: z.number(),
  baseAttack: z.number(),
  baseDefence: z.number(),
  baseSpecialAttack: z.number(),
  baseSpecialDefence: z.number(),
  baseSpeed: z.number(),
  baseExperienceYield: z.number().nullable(),
  evHp: z.number(),
  evAttack: z.number(),
  evDefence: z.number(),
  evSpecialAttack: z.number(),
  evSpecialDefence: z.number(),
  evSpeed: z.number(),
  labels: z.array(NamedRefSchema),
  aspectChoices: z.array(AspectChoiceSchema),
  types: z.array(FormTypeSchema),
  abilities: z.array(FormAbilitySchema),
  moves: z.array(FormMoveSchema),
  hitbox: HitboxSchema.nullable(),
  drops: DropsSchema.nullable(),
  aspectCombos: z.array(AspectComboSchema),
  behaviour: BehaviourSchema.nullable(),
  spawns: z.array(SpawnSchema),
  image: ImageRefSchema.nullable(),
});

export const ExperienceGroupSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  formula: z.string(),
});

export const PokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  generation: z.number(),
  catchRate: z.number(),
  baseFriendship: z.number(),
  eggCycles: z.number(),
  maleRatio: z.number().nullable(),
  baseScale: z.number().nullable(),
  experienceGroup: ExperienceGroupSchema.nullable(),
  eggGroups: z.array(NamedRefSchema),
  hitbox: HitboxSchema.nullable(),
  lighting: LightingSchema.nullable(),
  riding: RidingSchema.nullable(),
  image: ImageRefSchema.nullable(),
  forms: z.array(FormSchema),
});

