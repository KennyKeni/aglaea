import type { Pokemon } from '$lib/types/pokemon';
import type { SpeciesInput } from '$lib/api/endpoints/pokemon';

export class PokemonSpeciesEditor {
	id = $state<number | null>(null);
	name = $state('');
	description = $state<string | null>(null);
	generation = $state(1);
	catchRate = $state(45);
	baseFriendship = $state(50);
	eggCycles = $state(20);
	maleRatio = $state<number | null>(0.5);
	baseScale = $state<number | null>(null);
	experienceGroupId = $state<number | null>(null);
	eggGroupIds = $state<number[]>([]);
	coverImageId = $state<string | null>(null);
	coverImageUrl = $state<string | null>(null);

	initFromPokemon(pokemon: Pokemon) {
		this.id = pokemon.id;
		this.name = pokemon.name;
		this.description = pokemon.description;
		this.generation = pokemon.generation;
		this.catchRate = pokemon.catchRate;
		this.baseFriendship = pokemon.baseFriendship;
		this.eggCycles = pokemon.eggCycles;
		this.maleRatio = pokemon.maleRatio;
		this.baseScale = pokemon.baseScale;
		this.experienceGroupId = pokemon.experienceGroup?.id ?? null;
		this.eggGroupIds = pokemon.eggGroups.map((g) => g.id);
		this.coverImageId = pokemon.image?.id ?? null;
		this.coverImageUrl = pokemon.image?.url ?? null;
	}

	toCreateInput(): SpeciesInput {
		return {
			...(this.id != null ? { id: this.id } : {}),
			name: this.name,
			description: this.description,
			generation: this.generation,
			catchRate: this.catchRate,
			baseFriendship: this.baseFriendship,
			eggCycles: this.eggCycles,
			maleRatio: this.maleRatio,
			baseScale: this.baseScale,
			experienceGroupId: this.experienceGroupId,
			eggGroupIds: this.eggGroupIds,
		};
	}

	toUpdateInput(): SpeciesInput {
		return {
			name: this.name,
			description: this.description,
			generation: this.generation,
			catchRate: this.catchRate,
			baseFriendship: this.baseFriendship,
			eggCycles: this.eggCycles,
			maleRatio: this.maleRatio,
			baseScale: this.baseScale,
			experienceGroupId: this.experienceGroupId,
			eggGroupIds: this.eggGroupIds,
		};
	}
}

export function createPokemonSpeciesEditor(): PokemonSpeciesEditor {
	return new PokemonSpeciesEditor();
}
