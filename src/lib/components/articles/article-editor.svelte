<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Content, Editor } from '@tiptap/core';
  import { generateHTML } from '@tiptap/html';
  import { EdraEditor, EdraToolBar, EdraDragHandleExtended } from '$lib/components/edra/shadcn';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Button } from '$lib/components/ui/button';
  import { Loader2 } from '@lucide/svelte';
  import type { Article, ArticleCategory, ArticleImage, TiptapDoc, ArticleAuthor } from '$lib/types/article';
  import initEditor from '$lib/components/edra/editor';
  import { articles as articlesApi } from '$lib/api/endpoints/articles';

  onDestroy(() => {
    if (editor) {
      editor.destroy();
      editor = undefined;
    }
  });

  interface EditMeta {
    id: string;
    createdAt: string;
    ownerId: string | null;
    author: ArticleAuthor | null;
    categories: ArticleCategory[];
    images: ArticleImage[];
  }

  let {
    initialTitle = '',
    initialSubtitle = '',
    initialDescription = '',
    initialContent = null,
    editMeta = null,
    onSave,
    onCancel,
  }: {
    initialTitle?: string;
    initialSubtitle?: string;
    initialDescription?: string;
    initialContent?: TiptapDoc | null;
    editMeta?: EditMeta | null;
    onSave: (saved: Article) => void;
    onCancel: () => void;
  } = $props();

  const isCreateMode = $derived(!editMeta);

  let title = $state('');
  let subtitle = $state('');
  let description = $state('');
  let initialized = $state(false);

  $effect(() => {
    if (initialized) return;
    title = initialTitle;
    subtitle = initialSubtitle;
    description = initialDescription;
    initialized = true;
  });

  let editor: Editor | undefined = $state();
  let isSaving = $state(false);
  let error = $state('');

  const editorContent: Content = $derived.by(() => {
    if (!initialContent) {
      return { type: 'doc', content: [{ type: 'paragraph', content: [] }] };
    }
    return initialContent;
  });

  function getEditorExtensions() {
    const tempEditor = initEditor(undefined, undefined, [], {});
    const extensions = tempEditor.extensionManager.extensions;
    tempEditor.destroy();
    return extensions;
  }

  function getEditorContent(): TiptapDoc {
    const json = editor!.getJSON();
    return {
      type: 'doc',
      content: json.content,
    };
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!editor) return;

    isSaving = true;
    error = '';

    const content = getEditorContent();
    const input = {
      title,
      subtitle: subtitle || null,
      description: description || null,
      content,
    };

    const result = isCreateMode
      ? await articlesApi.create(input)
      : await articlesApi.update(editMeta!.id, input);

    if (!result.ok) {
      error = result.message;
      isSaving = false;
      return;
    }

    const contentHtml = generateHTML(content, getEditorExtensions());

    onSave({
      id: result.data.id,
      slug: result.data.slug,
      title,
      subtitle: subtitle || null,
      description: description || null,
      content,
      contentHtml,
      ownerId: editMeta?.ownerId ?? null,
      author: editMeta?.author ?? null,
      createdAt: editMeta?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: editMeta?.categories ?? [],
      images: editMeta?.images ?? [],
    });

    isSaving = false;
  }
</script>

<form onsubmit={handleSubmit}>
  <div class="mb-8 flex items-center justify-between">
    <h1 class="text-3xl font-bold tracking-tight">
      {isCreateMode ? 'New Article' : 'Edit Article'}
    </h1>
    <div class="flex items-center gap-2">
      <Button variant="outline" onclick={onCancel} type="button" disabled={isSaving}>Cancel</Button>
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
    <div class="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
      {error}
    </div>
  {/if}

  <div class="mb-8 space-y-6">
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
    <Label>Content</Label>
    <div class="rounded-lg border bg-background">
      {#if editor && !editor.isDestroyed}
        <EdraToolBar
          class="sticky top-0 z-10 flex w-full items-center overflow-x-auto border-b bg-muted/50 p-1"
          {editor}
        />
        <EdraDragHandleExtended {editor} />
      {/if}
      <div class="min-h-[400px] p-6">
        <EdraEditor bind:editor content={editorContent} editable={!isSaving} onUpdate={() => {}} />
      </div>
    </div>
  </div>
</form>
