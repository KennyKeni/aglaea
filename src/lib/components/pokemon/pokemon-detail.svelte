<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import TypeBadge from './type-badge.svelte';
  import { formatId, getStatTotal, clamp } from '$lib/utils/pokemon';
  import ImageOff from '@lucide/svelte/icons/image-off';
  import { abilityUrl } from '$lib/utils/url';
  import type { Pokemon, Form } from '$lib/types/pokemon';

  let {
    pokemon,
    form,
  }: {
    pokemon: Pokemon;
    form: Form;
  } = $props();

  const stats = $derived([
    { label: 'HP', value: form.baseHp },
    { label: 'Atk', value: form.baseAttack },
    { label: 'Def', value: form.baseDefence },
    { label: 'SpA', value: form.baseSpecialAttack },
    { label: 'SpD', value: form.baseSpecialDefence },
    { label: 'Spe', value: form.baseSpeed },
  ]);

  const formImage = $derived(form.image);
  const activeImage = $derived(formImage ?? pokemon.image);
  const activeImageAlt = $derived(formImage ? `${pokemon.name} ${form.name}` : pokemon.name);
  const activeDescription = $derived(form.description ?? pokemon.description);
  const statTotal = $derived(getStatTotal(form));
</script>

<div class="rounded-lg border bg-card p-4 md:p-6">
  <div class="grid gap-4 md:grid-cols-12">
    <div class="self-stretch md:col-span-4">
      <div class="flex h-full flex-col rounded-lg bg-muted p-4">
        <div class="flex h-52 w-full flex-1 items-center justify-center md:h-auto">
          {#if activeImage?.url}
            <img src={activeImage.url} alt={activeImageAlt} class="h-full w-full object-contain" />
          {:else}
            <div class="flex flex-col items-center justify-center gap-1 text-muted-foreground/40">
              <ImageOff class="h-12 w-12" />
              <span class="text-xs">No image</span>
            </div>
          {/if}
        </div>
        <div class="mt-3 text-center">
          <div class="text-base font-semibold">{form.name}</div>
        </div>
      </div>
    </div>

    <div class="space-y-3 md:col-span-8">
      <div class="grid grid-cols-2 items-start gap-3">
        <div>
          <div class="text-xs font-medium text-muted-foreground">
            {formatId(pokemon.id)}
          </div>
          <div id="pokemon-title" class="text-3xl font-semibold">{pokemon.name}</div>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          {#each form.types as { type } (type.id)}
            <TypeBadge {type} />
          {/each}
        </div>
      </div>

      {#if form.abilities?.length}
        <div class="flex flex-wrap gap-2">
          {#each form.abilities as ab (`${ab.ability.id}-${ab.slot.id}`)}
            <Badge variant="outline" class="rounded-full px-3 py-1">
              <a href={abilityUrl(ab.ability.id)} class="hover:underline">
                {ab.ability.name}
              </a>
              {#if ab.slot.slug === 'hidden'}
                <span class="ml-1 text-xs text-muted-foreground">(Hidden)</span>
              {/if}
            </Badge>
          {/each}
        </div>
      {/if}

      <div class="pt-3 mt-3 border-t border-border/50">
        <div class="mb-2 flex items-center justify-between">
          <div class="text-xs font-medium text-muted-foreground">Base stats</div>
          <div class="text-xs text-muted-foreground tabular-nums">
            Total {statTotal}
          </div>
        </div>
        <div class="space-y-2">
          {#each stats as stat (stat.label)}
            <div class="grid grid-cols-12 items-center gap-3">
              <div class="col-span-2 text-xs text-muted-foreground">{stat.label}</div>
              <div class="col-span-8">
                <Progress value={(clamp(stat.value, 0, 255) / 255) * 100} class="h-2" />
              </div>
              <div class="col-span-2 text-right text-xs text-foreground tabular-nums">
                {stat.value}
              </div>
            </div>
          {/each}
        </div>
      </div>

      {#if activeDescription}
        <p class="pt-3 mt-3 border-t border-border/50 text-sm text-muted-foreground">
          {activeDescription}
        </p>
      {/if}
    </div>
  </div>
</div>
