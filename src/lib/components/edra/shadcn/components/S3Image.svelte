<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import MediaExtended from './MediaExtended.svelte';
  import { s3Config } from '$lib/config/s3';

  const { ...rest }: NodeViewProps = $props();

  let mediaRef = $state<HTMLElement>();

  const src = $derived(
    rest.node.attrs.s3Key ? `${s3Config.baseUrl}/${rest.node.attrs.s3Key}` : null
  );
</script>

<MediaExtended bind:mediaRef {...rest}>
  {@const node = rest.node}
  {#if src}
    <img
      bind:this={mediaRef}
      {src}
      alt={node.attrs.alt}
      title={node.attrs.title}
      class="m-0 object-cover"
    />
  {:else}
    <div class="flex items-center justify-center p-4 text-muted-foreground">Invalid image</div>
  {/if}
</MediaExtended>
