import type { Component } from 'svelte';
import { Cat, FileText } from '@lucide/svelte';

export type NavItem = {
	label: string;
	href?: string;
	icon?: Component<{ class?: string }>;
	children?: NavItem[];
};

export const navigation: NavItem[] = [
	{
		label: 'Pokemon',
		icon: Cat,
		children: [{ label: 'All', href: '/pokemon' }]
	},
	{
		label: 'Articles',
		icon: FileText,
		children: [{ label: 'All', href: '/articles' }]
	}
];
