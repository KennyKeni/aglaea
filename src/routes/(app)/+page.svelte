<script lang="ts">
  import { resolve } from '$app/paths';
  import { AFFILIATION_DISCLAIMER, UNOFFICIAL_WIKI_NOTICE } from '$lib/config/disclaimers';
  import { ArrowRight, Bot, Database, Package, Sparkles, Swords } from '@lucide/svelte';

  type DirectoryCategory = {
    title: string;
    icon: typeof Database;
    href: '/pokemon' | '/items' | '/moves' | '/abilities' | '/llms';
    desc: string;
    meta: string;
  };

  const categories = [
    {
      title: 'Species Database',
      icon: Database,
      href: '/pokemon',
      desc: 'Browse Cobblemon species, stats, abilities, and evolution chains.',
      meta: 'Species',
    },
    {
      title: 'Items',
      icon: Package,
      href: '/items',
      desc: 'Cobblemon items, crafting recipes, and drop sources.',
      meta: 'Items & Recipes',
    },
    {
      title: 'Moves',
      icon: Swords,
      href: '/moves',
      desc: 'Review move power, accuracy, categories, and effects.',
      meta: 'Move Data',
    },
    {
      title: 'Abilities',
      icon: Sparkles,
      href: '/abilities',
      desc: 'Look up Cobblemon abilities and related species.',
      meta: 'Ability Data',
    },
    {
      title: 'LLMs',
      icon: Bot,
      href: '/llms',
      desc: 'Query the Herta data tools through a chat session.',
      meta: 'Chat',
    },
  ] satisfies DirectoryCategory[];
</script>

<svelte:head>
  <title>Aglaea | Cobblemon Species Database</title>
</svelte:head>

<div class="min-h-screen w-full pt-12 pb-20 text-foreground md:pt-20">
  <div class="mx-auto max-w-6xl px-4">
    <header
      class="mb-12 flex flex-col items-center text-center md:mb-16 md:items-start md:text-left"
    >
      <div
        class="mb-6 inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
      >
        <span class="size-1.5 rounded-full bg-primary"></span>
        <span>v1.0.0 Public Beta</span>
      </div>

      <h1 class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Aglaea Index</h1>

      <p class="max-w-2xl text-lg text-muted-foreground sm:text-xl">
        {UNOFFICIAL_WIKI_NOTICE}
      </p>

      <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Not affiliated with or endorsed by the Cobblemon mod project.
      </p>
    </header>

    <main class="space-y-10">
      <section>
        <div class="mb-5 flex items-end justify-between px-1">
          <h2 class="text-xl font-bold tracking-tight">Directory</h2>
          <span class="text-xs font-medium text-muted-foreground">
            {categories.length} collections
          </span>
        </div>

        <div class="grid gap-6 grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))]">
          {#each categories as category (category.href)}
            <a
              href={resolve(category.href)}
              class="group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/30 hover:bg-accent/40"
            >
              <div class="mb-5 flex items-start justify-between">
                <category.icon class="size-5 text-muted-foreground" />
                <ArrowRight
                  class="size-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>

              <h3 class="mb-2 text-lg font-semibold tracking-tight text-foreground">
                {category.title}
              </h3>
              <p class="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                {category.desc}
              </p>

              <div class="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
                <span class="text-xs font-medium text-muted-foreground">{category.meta}</span>
              </div>
            </a>
          {/each}
        </div>
      </section>
    </main>

    <footer
      class="mt-16 border-t border-border/70 pt-6 text-xs leading-relaxed text-muted-foreground"
    >
      {AFFILIATION_DISCLAIMER}
    </footer>
  </div>
</div>
