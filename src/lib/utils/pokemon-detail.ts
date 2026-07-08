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
