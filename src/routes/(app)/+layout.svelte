<script lang="ts">
  import { AppSidebar, AppHeader } from '$lib/components/layout';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { baseNavigation } from '$lib/config/navigation';

  let { data, children } = $props();

  const navigation = $derived(
    baseNavigation.map((section) => {
      if (section.label === 'Articles') {
        return {
          ...section,
          children: [
            { label: 'All', href: '/articles' },
            ...data.articleCategories.map((cat: { name: string; slug: string }) => ({
              label: cat.name,
              href: `/articles?categories=${cat.slug}`,
            })),
          ],
        };
      }
      return section;
    }),
  );
</script>

<Sidebar.Provider>
  <AppSidebar {navigation} />
  <Sidebar.Inset>
    <AppHeader session={data.session} />
    <main class="flex-1">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
