<script lang="ts">
  import { permissions } from '$lib/state/permissions.svelte';
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';

  let { data, children } = $props();

  $effect(() => {
    permissions.init(data.permissions);
  });

  $effect(() => {
    if (!data.session) {
      permissions.clear();
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta name="description" content="Cobblemon species database and Pokedex" />
</svelte:head>

{@render children()}
