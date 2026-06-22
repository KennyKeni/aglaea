<script lang="ts">
  import { asset } from '$app/paths';
  import './layout.css';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={asset('/favicon.ico')} sizes="any" type="image/x-icon" />
  <link rel="icon" href={asset('/cobblemon-logo.png')} type="image/png" />
  <meta name="description" content="Unofficial Cobblemon wiki and Pokedex reference" />
</svelte:head>

{@render children()}
