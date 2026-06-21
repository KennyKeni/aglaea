<script lang="ts">
  import type { Snippet } from 'svelte';
  import EntityPageLayout from '$lib/components/ui/entity-page-layout.svelte';

  let { children }: { children: Snippet } = $props();
</script>

<EntityPageLayout footerText="Ability data from Smogon and Cobblemon.">
  {@render children()}
</EntityPageLayout>
