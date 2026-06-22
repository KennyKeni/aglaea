import { Bot, Cat, Swords, Package, Sparkles } from '@lucide/svelte';
import type { Navigation } from '$lib/types/navigation';

export const baseNavigation: Navigation = [
  {
    label: 'Pokemon',
    icon: Cat,
    children: [{ label: 'All', href: '/pokemon' }],
  },
  {
    label: 'Moves',
    icon: Swords,
    children: [{ label: 'All', href: '/moves' }],
  },
  {
    label: 'Items',
    icon: Package,
    children: [{ label: 'All', href: '/items' }],
  },
  {
    label: 'Abilities',
    icon: Sparkles,
    children: [{ label: 'All', href: '/abilities' }],
  },
  {
    label: 'Chat',
    icon: Bot,
    href: '/llms',
  },
];
