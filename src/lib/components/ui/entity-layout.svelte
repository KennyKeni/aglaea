<script lang="ts" generics="T extends { id: string | number }">
  import { untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import EntityPanelLayout from './entity-panel-layout.svelte';
  import { createPanelMode } from '$lib/state/panel-mode.svelte';
  import { createPanelAnimation } from '$lib/state/panel-animation.svelte';
  import type { GridDataState } from '$lib/state/grid-data.svelte';
  import type { EntityPanelContext } from '$lib/context/entity';

  interface Props {
    data: { totalCount: number; pageSize: number };
    children: Snippet;
    renderPeekContent: Snippet<[T]>;
    footer: string;
    basePath: string;
    pageDataKey: string;
    createState: (totalCount: number) => GridDataState<T>;
    setDataContext: (state: GridDataState<T>) => void;
    setPanelContext: (state: EntityPanelContext<T>) => void;
    getTitle: (item: T) => string;
    getSubtitle: (item: T) => string;
  }

  let {
    data,
    children: content,
    renderPeekContent,
    footer,
    basePath,
    pageDataKey,
    createState,
    setDataContext,
    setPanelContext,
    getTitle,
    getSubtitle,
  }: Props = $props();

  const entityData = untrack(() => {
    const state = createState(data?.totalCount ?? 0);
    setDataContext(state);
    return state;
  });

  let isMobileState = $state(true);

  const panelMode = untrack(() =>
    createPanelMode<T>({
      items: () => entityData.items,
      basePath,
      getId: (item) => item.id,
      getFullItemFromPageData: (pageData: Record<string, unknown>) => {
        const entity = pageData?.[pageDataKey];
        if (entity && !Array.isArray(entity) && typeof entity === 'object' && 'id' in entity) {
          return entity as T;
        }
        return null;
      },
      isMobile: () => isMobileState,
    }),
  );

  const panelAnimation = createPanelAnimation(
    () => panelMode.mode,
    () => panelMode.isNavigating,
  );

  $effect(() => {
    isMobileState = panelAnimation.isMobile;
  });

  untrack(() => setPanelContext({ mode: panelMode, animation: panelAnimation }));

  const panelTitle = $derived(panelMode.activeItem ? getTitle(panelMode.activeItem) : '');
  const panelSubtitle = $derived(panelMode.activeItem ? getSubtitle(panelMode.activeItem) : '');
</script>

<EntityPanelLayout
  {panelMode}
  {panelAnimation}
  title={panelTitle}
  subtitle={panelSubtitle}
  {footer}
>
  {#snippet children()}
    {@render content()}
  {/snippet}

  {#snippet peekContent()}
    {#if panelMode.activeItem}
      {@render renderPeekContent(panelMode.activeItem)}
    {/if}
  {/snippet}
</EntityPanelLayout>
