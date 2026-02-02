<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { cn } from '$lib/utils';
  import { TYPE_COLORS, formatId } from '$lib/utils/pokemon';
  import ImageOff from '@lucide/svelte/icons/image-off';
  import type { Pokemon } from '$lib/types/pokemon';

  let {
    pokemon,
    loading = false,
    href,
  }: {
    pokemon?: Pokemon;
    loading?: boolean;
    href?: string;
  } = $props();

  let defaultForm = $derived(pokemon?.forms[0]);
</script>

{#if loading}
  <div class="aspect-square rounded-2xl border bg-card p-4">
    <div class="flex h-full flex-col">
      <div class="grid flex-1 grid-cols-[1fr_auto] gap-3">
        <div class="space-y-2">
          <Skeleton class="h-3 w-12" />
          <Skeleton class="h-5 w-24" />
          <div class="mt-2 flex gap-1.5">
            <Skeleton class="h-5 w-14 rounded-full" />
            <Skeleton class="h-5 w-12 rounded-full" />
          </div>
        </div>
        <Skeleton class="h-28 w-28 shrink-0 rounded-xl" />
      </div>
      <Skeleton class="mt-3 h-12 w-full" />
    </div>
  </div>
{:else if pokemon}
  <a {href} class="group w-full text-left">
    <Card.Root
      class="aspect-square rounded-2xl transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <Card.Content class="flex h-full flex-col px-4 pt-2 pb-4">
        <div class="grid flex-1 grid-cols-[1fr_auto] gap-3">
          <div class="flex min-w-0 flex-col justify-between">
            <div>
              <div class="text-xs font-medium text-muted-foreground">{formatId(pokemon.id)}</div>
              <div class="truncate text-base font-semibold">{pokemon.name}</div>
            </div>
            <div class="mt-2 flex flex-wrap gap-1.5">
              {#each defaultForm?.types ?? [] as { type } (type.id)}
                <span
                  class={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    TYPE_COLORS[type.slug] || 'bg-muted',
                  )}
                >
                  {type.name}
                </span>
              {/each}
            </div>
          </div>
          <div class="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-muted p-2">
            {#if pokemon.image?.url}
              <img
                src={pokemon.image.url}
                alt={pokemon.name}
                class="max-h-full max-w-full object-contain"
              />
            {:else}
              <div class="flex flex-col items-center justify-center gap-1 text-muted-foreground/40">
                <ImageOff class="h-8 w-8" />
                <span class="text-xs">No image</span>
              </div>
            {/if}
          </div>
        </div>
        <div class="mt-3 line-clamp-3 text-sm text-muted-foreground">
          {pokemon.description || ''}
        </div>
      </Card.Content>
    </Card.Root>
  </a>
{/if}
