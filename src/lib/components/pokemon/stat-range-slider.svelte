<script lang="ts">
  import { Slider } from '$lib/components/ui/slider';

  interface Props {
    label: string;
    min?: number;
    max?: number;
    value: [number, number];
    onValueChange: (value: [number, number]) => void;
  }

  let { label, min = 1, max = 255, value, onValueChange }: Props = $props();

  const isAtDefault = $derived(value[0] === min && value[1] === max);
</script>

<div class="space-y-2">
  <div class="flex items-center justify-between text-sm">
    <span class="font-medium">{label}</span>
    <span class="text-muted-foreground tabular-nums">
      {#if isAtDefault}
        Any
      {:else}
        {value[0]} - {value[1]}
      {/if}
    </span>
  </div>
  <Slider
    type="multiple"
    {min}
    {max}
    step={1}
    {value}
    onValueChange={(v: number[]) => onValueChange(v as [number, number])}
  />
</div>
