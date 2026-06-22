import type { Component } from 'svelte';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  icon?: Component<{ class?: string }>;
  children: NavLink[];
}

export interface NavDirectLink {
  label: string;
  icon?: Component<{ class?: string }>;
  href: string;
}

export type NavItem = NavGroup | NavDirectLink;

export type Navigation = NavItem[];
