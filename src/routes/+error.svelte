<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
  import { Home } from '@lucide/svelte';

  const is404 = $derived(page.status === 404);
</script>

<div class="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 py-12">
  <div class="text-center">
    <img
      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png"
      alt="Psyduck"
      class="mx-auto h-48 w-48 opacity-80"
    />

    <h1 class="mt-6 text-7xl font-black tracking-tight sm:text-8xl">
      {page.status}
    </h1>

    <p class="mx-auto mt-4 max-w-sm text-muted-foreground">
      {#if is404}
        The page you're looking for doesn't exist or has been moved.
      {:else if page.error?.message}
        {page.error.message}
      {:else}
        Something unexpected happened. Please try again.
      {/if}
    </p>

    <Button size="lg" class="mt-6" onclick={() => goto('/')}>
      <Home class="h-4 w-4" />
      Return home
    </Button>
  </div>
</div>
