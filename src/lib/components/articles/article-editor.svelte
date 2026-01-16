<script lang="ts">
	import type { Content, Editor } from '@tiptap/core';
	import { generateHTML } from '@tiptap/html';
	import {
		EdraEditor,
		EdraToolBar,
		EdraDragHandleExtended
	} from '$lib/components/edra/shadcn';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from '@lucide/svelte';
	import type { Article } from '$lib/types/article';
	import initEditor from '$lib/components/edra/editor';

	let {
		article = null,
		onSave,
		onCancel
	}: {
		article?: Article | null;
		onSave: (saved: Article) => void;
		onCancel: () => void;
	} = $props();

	const isCreateMode = $derived(!article);

	let title = $state(article?.title ?? '');
	let subtitle = $state(article?.subtitle ?? '');
	let description = $state(article?.description ?? '');
	let author = $state(article?.author ?? '');

	let editor: Editor | undefined = $state();
	let isSaving = $state(false);
	let error = $state('');

	const initialContent: Content = $derived.by(() => {
		if (!article?.body) {
			return { type: 'doc', content: [{ type: 'paragraph', content: [] }] };
		}
		try {
			const parsed = JSON.parse(article.body);
			if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
				return parsed;
			}
			return article.body;
		} catch {
			return article.body;
		}
	});

	function getEditorExtensions() {
		const tempEditor = initEditor(undefined, undefined, [], {});
		const extensions = tempEditor.extensionManager.extensions;
		tempEditor.destroy();
		return extensions;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!editor) return;

		isSaving = true;
		error = '';

		const body = JSON.stringify(editor.getJSON());
		const url = isCreateMode ? '/api/articles' : `/api/articles/${article!.id}`;
		const method = isCreateMode ? 'POST' : 'PATCH';

		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					subtitle: subtitle || null,
					description: description || null,
					author: author || null,
					body
				})
			});

			if (!res.ok) {
				if (res.status === 401) {
					error = 'Session expired. Please log in again.';
					return;
				}
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message || `Failed to save (${res.status})`);
			}

			const response = await res.json();
			const bodyHtml = generateHTML(editor.getJSON(), getEditorExtensions());

			onSave({
				id: response.id,
				slug: response.slug,
				title,
				subtitle: subtitle || null,
				description: description || null,
				author: author || null,
				body,
				bodyHtml,
				createdAt: article?.createdAt ?? new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				categories: article?.categories ?? [],
				images: article?.images ?? []
			});
		} catch (e) {
			error = e instanceof Error ? e.message : 'An unexpected error occurred';
		} finally {
			isSaving = false;
		}
	}
</script>

<form onsubmit={handleSubmit}>
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-3xl font-bold tracking-tight">
			{isCreateMode ? 'New Article' : 'Edit Article'}
		</h1>
		<div class="flex items-center gap-2">
			<Button variant="outline" onclick={onCancel} type="button" disabled={isSaving}>
				Cancel
			</Button>
			<Button type="submit" disabled={isSaving}>
				{#if isSaving}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{isCreateMode ? 'Creating...' : 'Saving...'}
				{:else}
					{isCreateMode ? 'Create Article' : 'Save Changes'}
				{/if}
			</Button>
		</div>
	</div>

	{#if error}
		<div class="bg-destructive/10 text-destructive rounded-md p-3 text-sm mb-6">
			{error}
		</div>
	{/if}

	<div class="space-y-6 mb-8">
		<div class="space-y-2">
			<Label for="title">Title</Label>
			<Input
				id="title"
				bind:value={title}
				required
				disabled={isSaving}
				class="text-lg"
				placeholder="Article title"
			/>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label for="subtitle">Subtitle</Label>
				<Input
					id="subtitle"
					bind:value={subtitle}
					disabled={isSaving}
					placeholder="Optional subtitle"
				/>
			</div>

			<div class="space-y-2">
				<Label for="author">Author</Label>
				<Input
					id="author"
					bind:value={author}
					disabled={isSaving}
					placeholder="Author name"
				/>
			</div>
		</div>

		<div class="space-y-2">
			<Label for="description">Description</Label>
			<Input
				id="description"
				bind:value={description}
				disabled={isSaving}
				placeholder="Brief description for previews"
			/>
		</div>
	</div>

	<div class="space-y-2">
		<Label>Body</Label>
		<div class="rounded-lg border bg-background">
			{#if editor && !editor.isDestroyed}
				<EdraToolBar
					class="bg-muted/50 flex w-full items-center overflow-x-auto border-b p-1 sticky top-0 z-10"
					{editor}
				/>
				<EdraDragHandleExtended {editor} />
			{/if}
			<div class="min-h-[400px] p-6">
				<EdraEditor
					bind:editor
					content={initialContent}
					editable={!isSaving}
					onUpdate={() => {}}
				/>
			</div>
		</div>
	</div>
</form>
