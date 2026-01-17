<script lang="ts" module>
	const expandedGroups = new Set<string>();
</script>

<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { navigation } from '$lib/config/navigation';
	import { ChevronRight } from '@lucide/svelte';

	function isActive(href: string): boolean {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}

	function isGroupActive(children: typeof navigation[0]['children']): boolean {
		return children?.some((child) => child.href && isActive(child.href)) ?? false;
	}

	function isExpanded(label: string, children: typeof navigation[0]['children']): boolean {
		if (expandedGroups.has(label)) return true;
		if (isGroupActive(children)) {
			expandedGroups.add(label);
			return true;
		}
		return false;
	}

	function toggleExpanded(label: string, open: boolean) {
		if (open) {
			expandedGroups.add(label);
		} else {
			expandedGroups.delete(label);
		}
	}
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					<a href="/" class="flex items-center gap-2">
						<div
							class="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-sm font-bold"
						>
							A
						</div>
						<span class="truncate font-semibold">Aglaea</span>
					</a>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Entities</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navigation as item (item.label)}
						{#if item.children && item.children.length > 0}
							<Collapsible.Root open={isExpanded(item.label, item.children)} onOpenChange={(open) => toggleExpanded(item.label, open)} class="group/collapsible">
								<Sidebar.MenuItem>
									<Collapsible.Trigger>
										{#snippet child({ props })}
											<Sidebar.MenuButton {...props} tooltipContent={item.label}>
												{#if item.icon}
													<item.icon class="size-4" />
												{/if}
												<span>{item.label}</span>
												<ChevronRight
													class="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
												/>
											</Sidebar.MenuButton>
										{/snippet}
									</Collapsible.Trigger>
									<Collapsible.Content>
										<Sidebar.MenuSub>
											{#each item.children as subItem (subItem.label)}
												<Sidebar.MenuSubItem>
													<Sidebar.MenuSubButton
														href={subItem.href}
														isActive={subItem.href ? isActive(subItem.href) : false}
													>
														<span>{subItem.label}</span>
													</Sidebar.MenuSubButton>
												</Sidebar.MenuSubItem>
											{/each}
										</Sidebar.MenuSub>
									</Collapsible.Content>
								</Sidebar.MenuItem>
							</Collapsible.Root>
						{:else if item.href}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={isActive(item.href)}
									tooltipContent={item.label}
								>
									<a href={item.href} class="flex items-center gap-2">
										{#if item.icon}
											<item.icon class="size-4" />
										{/if}
										<span>{item.label}</span>
									</a>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/if}
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Rail />
</Sidebar.Root>
