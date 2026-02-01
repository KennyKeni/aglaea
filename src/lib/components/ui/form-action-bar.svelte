<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from '@lucide/svelte';

	interface Props {
		oncancel: () => void;
		onsave: () => void;
		isSaving?: boolean;
		saveLabel?: string;
		savingLabel?: string;
	}

	let {
		oncancel,
		onsave,
		isSaving = false,
		saveLabel = 'Save Changes',
		savingLabel = 'Saving...',
	}: Props = $props();
</script>

<footer class="sticky bottom-0 z-10 border-t bg-background/80 backdrop-blur">
	<div class="flex min-h-14 items-center justify-end gap-2 px-4 py-3">
		<Button variant="outline" onclick={oncancel} disabled={isSaving}>Cancel</Button>
		<Button onclick={onsave} disabled={isSaving}>
			{#if isSaving}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{savingLabel}
			{:else}
				{saveLabel}
			{/if}
		</Button>
	</div>
</footer>
