<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Plus } from '@lucide/svelte';
  import { can } from '$lib/state/permissions.svelte';
  import { type Resource, Action } from '$lib/types/auth';

  let { resource, href, label }: { resource: Resource; href: string; label: string } = $props();
</script>

{#if can(resource, Action.Create)}
  <Button {href}>
    <Plus class="mr-2 h-4 w-4" />
    {label}
  </Button>
{/if}
