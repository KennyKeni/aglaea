<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';

	let {
		label,
		overridden = $bindable(false),
		value = $bindable<number | null>(0),
		speciesDefault,
		min = 0,
		max,
		step = 1,
		nullable = false,
		nullLabel = 'None',
	}: {
		label: string;
		overridden: boolean;
		value: number | null;
		speciesDefault: number | null;
		min?: number;
		max?: number;
		step?: number;
		nullable?: boolean;
		nullLabel?: string;
	} = $props();

	function formatDefault(val: number | null): string {
		if (val === null) return nullLabel;
		return String(val);
	}
</script>

<div class="rounded-xl bg-muted p-3">
	<div class="flex items-center justify-between">
		<div class="text-xs font-medium text-muted-foreground">{label}</div>
		<label class="flex items-center gap-1.5 text-xs text-muted-foreground">
			<span>Override</span>
			<Switch checked={overridden} onCheckedChange={(v) => (overridden = v)} />
		</label>
	</div>
	<div class="mt-1">
		{#if overridden}
			{#if nullable}
				<div class="flex items-center gap-2">
					<Input
						type="number"
						{min}
						max={max}
						{step}
						value={value !== null ? String(value) : ''}
						oninput={(e) => {
							const val = (e.target as HTMLInputElement).value;
							value = val ? Number(val) : null;
						}}
						class="h-8 font-semibold"
						placeholder={nullLabel}
						disabled={value === null}
					/>
					<label class="flex items-center gap-1 text-xs whitespace-nowrap">
						<input
							type="checkbox"
							checked={value === null}
							onchange={(e) => {
								value = (e.target as HTMLInputElement).checked ? null : (speciesDefault ?? 0);
							}}
						/>
						{nullLabel}
					</label>
				</div>
			{:else}
				<Input
					type="number"
					{min}
					max={max}
					{step}
					value={String(value ?? 0)}
					oninput={(e) => {
						value = Number((e.target as HTMLInputElement).value) || 0;
					}}
					class="h-8 font-semibold"
					placeholder={formatDefault(speciesDefault)}
				/>
			{/if}
			<div class="mt-1 text-xs text-muted-foreground">
				Species default: {formatDefault(speciesDefault)}
			</div>
		{:else}
			<div class="font-semibold text-muted-foreground/60">
				{formatDefault(speciesDefault)}
			</div>
		{/if}
	</div>
</div>
