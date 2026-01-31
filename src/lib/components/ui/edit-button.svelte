<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Pencil } from '@lucide/svelte';
  import { can } from '$lib/state/permissions.svelte';
  import { type Resource, Action } from '$lib/types/auth';

  let { resource, href }: { resource: Resource; href: string } = $props();
</script>

{#if can(resource, Action.Update)}
  <Button variant="ghost" size="sm" {href} data-sveltekit-preload-data="off">
    <Pencil class="mr-2 h-4 w-4" />
    Edit
  </Button>
{/if}
