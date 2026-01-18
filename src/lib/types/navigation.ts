import type { Component } from 'svelte';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavSection {
  label: string;
  icon?: Component<{ class?: string }>;
  children: NavLink[];
}

export type Navigation = NavSection[];
