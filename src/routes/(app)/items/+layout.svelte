<script lang="ts">
	import EntityPageLayout from '$lib/components/ui/entity-page-layout.svelte';

	let { children }: { children: any } = $props();
</script>

<EntityPageLayout footerText="Item data from Smogon and Cobblemon.">
	{@render children()}
</EntityPageLayout>
