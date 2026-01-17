<script lang="ts">
  let { children }: { children: any } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/40 p-4 lg:p-8">
  {@render children()}
</div>
