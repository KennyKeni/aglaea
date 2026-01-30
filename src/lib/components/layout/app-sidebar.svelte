<script lang="ts" module>
  const expandedGroups = new Set<string>();
</script>

<script lang="ts">
  import { page } from '$app/state';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import type { Navigation, NavLink } from '$lib/types/navigation';
  import { ChevronRight } from '@lucide/svelte';

  interface Props {
    navigation: Navigation;
  }

  let { navigation }: Props = $props();

  function isActive(href: string): boolean {
    const fullUrl = page.url.pathname + page.url.search;

    if (href.includes('?')) {
      return fullUrl === href || fullUrl.startsWith(href + '&');
    }

    const hasSubItems = navigation.some(
      (section) =>
        section.children.length > 1 &&
        section.children[0]?.href === href
    );
    if (hasSubItems) {
      return page.url.pathname === href && page.url.search === '';
    }

    return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
  }

  function isGroupActive(children: NavLink[]): boolean {
    return children.some((child) => isActive(child.href));
  }

  function isExpanded(label: string, children: NavLink[]): boolean {
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
              class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
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
            <Sidebar.MenuItem>
              <Collapsible.Root
                open={isExpanded(item.label, item.children)}
                onOpenChange={(open) => toggleExpanded(item.label, open)}
                class="group/collapsible"
              >
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
                          isActive={isActive(subItem.href)}
                        >
                          <span>{subItem.label}</span>
                        </Sidebar.MenuSubButton>
                      </Sidebar.MenuSubItem>
                    {/each}
                  </Sidebar.MenuSub>
                </Collapsible.Content>
              </Collapsible.Root>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Rail />
</Sidebar.Root>
