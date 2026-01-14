<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PokemonCard from './pokemon-card.svelte';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Pokemon/Card',
		component: PokemonCard,
		tags: ['autodocs'],
		args: {
			onclick: fn()
		},
		parameters: {
			layout: 'centered'
		}
	});

	const basePokemon = {
		id: 25,
		name: 'Pikachu',
		slug: 'pikachu',
		description:
			'When several of these Pokemon gather, their electricity could build and cause lightning storms.',
		generation: 1,
		forms: [
			{
				types: [{ type: { id: 7, name: 'Electric', slug: 'electric' } }]
			}
		]
	};

	const dualTypePokemon = {
		id: 6,
		name: 'Charizard',
		slug: 'charizard',
		description:
			'Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.',
		generation: 1,
		forms: [
			{
				types: [
					{ type: { id: 2, name: 'Fire', slug: 'fire' } },
					{ type: { id: 10, name: 'Flying', slug: 'flying' } }
				]
			}
		]
	};

	const longNamePokemon = {
		id: 474,
		name: 'Porygon-Z',
		slug: 'porygon-z',
		description:
			'Additional software was installed to make it a better Pokemon. It began acting oddly, however.',
		generation: 4,
		forms: [
			{
				types: [{ type: { id: 1, name: 'Normal', slug: 'normal' } }]
			}
		]
	};
</script>

<Story name="Default" args={{ pokemon: basePokemon }} />
<Story name="Dual Type" args={{ pokemon: dualTypePokemon }} />
<Story name="Long Name" args={{ pokemon: longNamePokemon }} />
<Story name="No Description" args={{ pokemon: { ...basePokemon, description: '' } }} />
