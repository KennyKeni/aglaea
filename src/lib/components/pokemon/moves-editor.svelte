<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { X, Plus, ChevronDown } from '@lucide/svelte';
  import { SearchPalette } from '$lib/components/search-palette';
  import { getSearchSources } from '$lib/api/endpoints/search';
  import type { SearchResult } from '$lib/types/search';
  import type { FormMove, MoveMethod, MoveRef } from '$lib/types/pokemon';

  let {
    title = 'Moves',
    moves = [],
    allMoves = $bindable<FormMove[]>([]),
    methodSlug,
    initialMoveIds,
  }: {
    title?: string;
    moves?: FormMove[];
    allMoves?: FormMove[];
    methodSlug?: string;
    initialMoveIds?: Set<string>;
  } = $props();

  const sorted = $derived(
    [...moves].sort((a, b) => a.move.name.localeCompare(b.move.name)),
  );

  const currentMethod = $derived<MoveMethod | null>(moves[0]?.method ?? null);

  let moveSearchOpen = $state(false);
  let expanded = $state(true);
  const moveSources = getSearchSources(['moves']);

  function toMoveRef(result: SearchResult): MoveRef {
    if (result.raw) return result.raw as MoveRef;
    return {
      id: result.id,
      name: result.name,
      slug: result.slug,
      type: { id: 0, name: 'Unknown', slug: 'unknown' },
      category: { id: 0, name: 'Unknown', slug: 'unknown' },
      power: null,
      accuracy: null,
      pp: null,
    };
  }

  function addMove(result: SearchResult) {
    if (!currentMethod) return;
    if (allMoves.some((m) => m.move.id === result.id && m.method.id === currentMethod.id)) return;
    allMoves = [...allMoves, { move: toMoveRef(result), method: currentMethod, level: null }];
  }

  function removeMove(moveId: number, methodId: number) {
    allMoves = allMoves.filter(
      (m) => !(m.move.id === moveId && m.method.id === methodId),
    );
  }

  function updateLevel(moveId: number, methodId: number, value: string) {
    allMoves = allMoves.map((m) => {
      if (m.move.id === moveId && m.method.id === methodId) {
        return { ...m, level: value ? Number(value) : null };
      }
      return m;
    });
  }
</script>

<Collapsible.Root bind:open={expanded}>
  <Card.Root id="moves" class="rounded-2xl">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <Card.Header class="cursor-pointer pb-3" onclick={() => (expanded = !expanded)}>
      <div class="flex items-center justify-between">
        <div>
          <Card.Title class="text-base">{title}</Card.Title>
          <div class="mt-1 text-sm text-muted-foreground">
            {moves.length} moves
          </div>
        </div>
        <div class="flex items-center gap-2">
          {#if currentMethod}
            <Button
              variant="outline"
              size="sm"
              class="h-7 gap-1"
              onclick={(e: MouseEvent) => { e.stopPropagation(); moveSearchOpen = true; }}
            >
              <Plus class="h-3.5 w-3.5" />
              Add
            </Button>
          {/if}
          <span class="transition-transform" class:rotate-180={!expanded}>
            <ChevronDown class="h-4 w-4" />
          </span>
        </div>
      </div>
    </Card.Header>
    <Collapsible.Content>
      <Card.Content>
        <div class="space-y-2">
          {#each sorted as mv, i (`move-${i}-${mv.move.id}-${mv.method.id}`)}
            <div class="rounded-xl border bg-background p-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{mv.move.name}</span>
                    {#if !initialMoveIds?.has(`${mv.move.id}-${mv.method.id}`)}
                      <span class="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">New</span>
                    {/if}
                    <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{mv.move.type.name}</span>
                    <span class="text-xs text-muted-foreground">{mv.move.category.name}</span>
                  </div>
                  <div class="mt-1 flex flex-wrap items-center gap-3">
                    <div class="flex items-center gap-1">
                      <span class="text-xs text-muted-foreground">Lv.</span>
                      <Input
                        type="number"
                        min="0"
                        value={mv.level !== null ? String(mv.level) : ''}
                        oninput={(e: Event) =>
                          updateLevel(mv.move.id, mv.method.id, (e.target as HTMLInputElement).value)}
                        class="h-6 w-14 text-xs"
                        placeholder="—"
                      />
                    </div>
                    <span class="text-xs text-muted-foreground">
                      Pow: {mv.move.power ?? '—'}
                    </span>
                    <span class="text-xs text-muted-foreground">
                      Acc: {mv.move.accuracy ?? '—'}
                    </span>
                    <span class="text-xs text-muted-foreground">
                      PP: {mv.move.pp ?? '—'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7 shrink-0"
                  onclick={() => removeMove(mv.move.id, mv.method.id)}
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
          {/each}
          {#if moves.length === 0}
            <div class="text-sm text-muted-foreground">No moves in this group.</div>
          {/if}
        </div>
      </Card.Content>
    </Collapsible.Content>
  </Card.Root>
</Collapsible.Root>

<SearchPalette
  bind:open={moveSearchOpen}
  sources={moveSources}
  onselect={addMove}
  placeholder="Search moves..."
/>
