import { client } from '../client';
import { validate } from '../validate';
import type { ApiResponse } from '../types';
import { z } from 'zod';

const MutationResponseSchema = z.object({
	id: z.number(),
	slug: z.string(),
});

type MutationResponse = z.infer<typeof MutationResponseSchema>;

export interface SpeciesInput {
	id?: number;
	name?: string;
	description?: string | null;
	generation?: number;
	catchRate?: number;
	baseFriendship?: number;
	eggCycles?: number;
	maleRatio?: number | null;
	baseScale?: number | null;
	experienceGroupId?: number | null;
	eggGroupIds?: number[];
}

export interface FormOverridesInput {
	catchRate?: number | null;
	baseFriendship?: number | null;
	eggCycles?: number | null;
	maleRatio?: number | null;
	baseScale?: number | null;
}

export interface FormInput {
	name?: string;
	formName?: string;
	speciesId?: number;
	height?: number;
	weight?: number;
	baseExperienceYield?: number | null;
	overrides?: FormOverridesInput | null;
	baseHp?: number;
	baseAttack?: number;
	baseDefence?: number;
	baseSpecialAttack?: number;
	baseSpecialDefence?: number;
	baseSpeed?: number;
	evHp?: number;
	evAttack?: number;
	evDefence?: number;
	evSpecialAttack?: number;
	evSpecialDefence?: number;
	evSpeed?: number;
	types?: { typeId: number; slot: number }[];
	abilities?: { abilityId: number; slotId: number }[];
	moves?: { moveId: number; methodId: number; level: number | null }[];
	labelIds?: number[];
	spawns?: SpawnInput[];
	drops?: DropsInput | null;
}

export interface SpawnInput {
	id?: number;
	bucketId: number;
	positionTypeId: number;
	weight: number;
	levelMin: number;
	levelMax: number;
	conditions: SpawnConditionInput[];
}

export interface SpawnConditionInput {
	id?: number;
	type: string;
	multiplier: number | null;
	biomeIds: number[];
	biomeTagIds: number[];
	timeRangeIds: number[];
	moonPhaseIds: number[];
	weather: { isRaining: boolean | null; isThundering: boolean | null } | null;
	sky: { canSeeSky: boolean | null; minSkyLight: number | null; maxSkyLight: number | null } | null;
	position: { minY: number | null; maxY: number | null } | null;
	lure: { minLureLevel: number | null; maxLureLevel: number | null } | null;
}

export interface DropsInput {
	amount: number;
	percentages: { itemId: number; percentage: number }[];
	ranges: { itemId: number; quantityMin: number; quantityMax: number }[];
}

export const pokemon = {
	updateSpecies: async (
		id: number | string,
		input: SpeciesInput,
	): Promise<ApiResponse<MutationResponse>> => {
		const result = await client.patch(`/pokemon/species/${id}`, input);
		return validate(result, MutationResponseSchema);
	},

	updateForm: async (
		id: number | string,
		input: FormInput,
	): Promise<ApiResponse<MutationResponse>> => {
		const result = await client.patch(`/pokemon/forms/${id}`, input);
		return validate(result, MutationResponseSchema);
	},

	createSpecies: async (input: SpeciesInput): Promise<ApiResponse<MutationResponse>> => {
		const result = await client.post('/pokemon/species', input);
		return validate(result, MutationResponseSchema);
	},

	createForm: async (input: FormInput): Promise<ApiResponse<MutationResponse>> => {
		const result = await client.post('/pokemon/forms', input);
		return validate(result, MutationResponseSchema);
	},

	deleteForm: async (id: number | string): Promise<ApiResponse<MutationResponse>> => {
		const result = await client.delete(`/pokemon/forms/${id}`);
		return validate(result, MutationResponseSchema);
	},

	setFormImage: async (
		id: number | string,
		imageId: string | null,
	): Promise<ApiResponse<MutationResponse>> => {
		const result = await client.put(`/pokemon/forms/${id}/image`, { imageId });
		return validate(result, MutationResponseSchema);
	},

	setSpeciesImage: async (
		id: number | string,
		imageId: string | null,
	): Promise<ApiResponse<MutationResponse>> => {
		const result = await client.put(`/pokemon/species/${id}/image`, { imageId });
		return validate(result, MutationResponseSchema);
	},
};
