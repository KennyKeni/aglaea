<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, Clock, Database, FileText, Shield, Zap } from '@lucide/svelte';

	const categories = [
		{
			title: 'Pokemon Database',
			icon: Database,
			href: '/pokemon',
			desc: 'Complete species registry, stats, and evolution chains.',
			meta: '151 Species',
		},
		{
			title: 'Articles & Guides',
			icon: FileText,
			href: '/articles',
			desc: 'In-depth tutorials, architectural patterns, and best practices.',
			meta: '12 Articles',
		},
		{
			title: 'Component Library',
			icon: Zap,
			href: '/demo',
			desc: 'Interactive UI components, blocks, and layout primitives.',
			meta: '24 Components',
		},
		{
			title: 'Security & Auth',
			icon: Shield,
			href: '/login',
			desc: 'User sessions, security protocols, and permission scopes.',
			meta: 'v2.0 Spec',
		},
	];

	const updates = [
		{ label: 'Data', title: 'Added Generation IX species stats', date: '2h ago' },
		{ label: 'Docs', title: 'Updated server-side caching guide', date: '1d ago' },
		{ label: 'UI', title: 'New "Glass" variant for cards', date: '3d ago' },
		{ label: 'Fix', title: 'Resolved hydration mismatch in nav', date: '5d ago' },
	];

	const quickLinks = ['CLI Reference', 'Theming', 'Deployment', 'Shortcuts'];
</script>

<div class="min-h-screen w-full pt-12 pb-20 text-foreground md:pt-20">
	<div class="mx-auto max-w-6xl px-4">
		<header
			class="mb-12 flex flex-col items-center text-center md:mb-16 md:items-start md:text-left"
		>
			<div
				class="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
			>
				<span class="relative flex h-2 w-2">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
					></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
				</span>
				<span>v1.0.0 Public Beta</span>
			</div>

			<h1 class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
				Aglaea <span class="text-muted-foreground">Index</span>
			</h1>

			<p class="max-w-2xl text-lg text-muted-foreground sm:text-xl">Cobblemon Index.</p>
		</header>

		<div class="grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-12">
			<main class="space-y-10">
				<section>
					<div class="mb-5 flex items-end justify-between px-1">
						<h2 class="text-xl font-bold tracking-tight">Directory</h2>
						<span class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
							{categories.length} Collections
						</span>
					</div>

					<div class="grid gap-6 sm:grid-cols-2">
						{#each categories as category (category.href)}
							<a
								href={category.href}
								class="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
							>
								<div class="mb-5 flex items-start justify-between">
									<div
										class="flex size-12 items-center justify-center rounded-2xl bg-muted/50 transition-colors group-hover:bg-primary/10"
									>
										<category.icon
											class="size-6 text-muted-foreground transition-colors group-hover:text-primary"
										/>
									</div>
									<div
										class="opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100"
									>
										<ArrowRight class="size-5 text-muted-foreground" />
									</div>
								</div>

								<h3 class="mb-2 text-lg font-semibold tracking-tight text-foreground">
									{category.title}
								</h3>
								<p class="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
									{category.desc}
								</p>

								<div
									class="mt-auto flex items-center justify-between border-t border-border/50 pt-4"
								>
									<span class="text-xs font-medium text-muted-foreground">{category.meta}</span>
									<span
										class="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
									>
										Access →
									</span>
								</div>
							</a>
						{/each}
					</div>
				</section>

				<section>
					<h3 class="mb-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
						Quick Access
					</h3>
					<div class="flex flex-wrap gap-2">
						{#each quickLinks as link (link)}
							<button
								class="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 hover:text-foreground"
							>
								{link}
							</button>
						{/each}
					</div>
				</section>
			</main>

			<aside class="space-y-8">
				<div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
					<div class="mb-6 flex items-center justify-between">
						<h3 class="flex items-center gap-2 font-semibold tracking-tight">
							<Clock class="size-4 text-muted-foreground" />
							Updates
						</h3>
						<span class="relative flex h-2 w-2">
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"
							></span>
							<span class="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
						</span>
					</div>

					<div class="space-y-6">
						{#each updates as update (update.title)}
							<div class="group relative pl-4">
								<div
									class="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-border transition-colors group-hover:bg-primary/50"
								></div>

								<div class="mb-1 flex items-center gap-2">
									<span class="text-[10px] font-bold tracking-wider text-primary uppercase">
										{update.label}
									</span>
									<span class="text-[10px] text-muted-foreground">{update.date}</span>
								</div>
								<button
									type="button"
									class="block text-left text-sm leading-snug font-medium text-foreground/80 transition-colors hover:text-primary hover:underline"
								>
									{update.title}
								</button>
							</div>
						{/each}
					</div>

					<div class="mt-6 border-t border-border pt-6">
						<Button
							variant="ghost"
							size="sm"
							class="group h-8 w-full justify-between text-muted-foreground hover:text-foreground"
						>
							View Changelog
							<ArrowRight class="size-3 transition-transform group-hover:translate-x-1" />
						</Button>
					</div>
				</div>
			</aside>
		</div>
	</div>
</div>
