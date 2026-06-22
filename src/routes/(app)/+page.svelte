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
      title: 'Chat',
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
      <h1 class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Aglaea</h1>

      <p class="max-w-2xl text-lg text-muted-foreground sm:text-xl">
        {UNOFFICIAL_WIKI_NOTICE}
      </p>

      <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Not affiliated with or endorsed by the Cobblemon mod project.
      </p>

      <a
        class="mt-2 text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        href="https://modrinth.com/server/cobblemon-delta-server"
        target="_blank"
        rel="noreferrer"
      >
        Play Cobblemon Delta
      </a>
    </header>

    <main class="space-y-10">
      <section>
        <div class="mb-5 flex items-end justify-between px-1">
          <h2 class="text-xl font-bold tracking-tight">Directory</h2>
          <span class="text-xs font-medium text-muted-foreground">
            {categories.length} collections
          </span>
        </div>

        <ul class="border-t border-border">
          {#each categories as category (category.href)}
            <li class="border-b border-border">
              <a
                href={resolve(category.href)}
                class="group flex items-center gap-4 px-2 py-5 transition-colors hover:bg-muted/50 sm:px-3"
              >
                <category.icon
                  class="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                />

                <div class="min-w-0 flex-1">
                  <div class="flex items-baseline gap-3">
                    <h3 class="text-base font-semibold tracking-tight text-foreground">
                      {category.title}
                    </h3>
                    <span class="hidden text-xs text-muted-foreground/70 sm:inline">
                      {category.meta}
                    </span>
                  </div>
                  <p class="mt-0.5 truncate text-sm text-muted-foreground">
                    {category.desc}
                  </p>
                </div>

                <ArrowRight
                  class="size-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
                />
              </a>
            </li>
          {/each}
        </ul>
      </section>
    </main>

    <footer
      class="mt-16 border-t border-border/70 pt-6 text-xs leading-relaxed text-muted-foreground"
    >
      {AFFILIATION_DISCLAIMER}
    </footer>
  </div>
</div>
