import { Cat, FileText } from '@lucide/svelte';
import type { Navigation } from '$lib/types/navigation';

export const baseNavigation: Navigation = [
  {
    label: 'Pokemon',
    icon: Cat,
    children: [{ label: 'All', href: '/pokemon' }],
  },
  {
    label: 'Articles',
    icon: FileText,
    children: [{ label: 'All', href: '/articles' }],
  },
];
