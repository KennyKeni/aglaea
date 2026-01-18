<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Progress } from '$lib/components/ui/progress';
  import { uploadImage, ImageUploadError } from '$lib/utils/image-upload';
  import '../../types';
  import Upload from '@lucide/svelte/icons/upload';
  import Link from '@lucide/svelte/icons/link';
  import X from '@lucide/svelte/icons/x';
  import ImageIcon from '@lucide/svelte/icons/image';

  let {
    open = $bindable(false),
    editor,
  }: {
    open: boolean;
    editor: Editor | undefined;
  } = $props();

  const uploadOptions = $derived(editor?.storage.imageUpload);

  type UploadState =
    | { mode: 'idle' }
    | { mode: 'uploading'; fileName: string; progress: number; abortController: AbortController }
    | { mode: 'error'; message: string };

  let uploadState: UploadState = $state({ mode: 'idle' });
  let isDragOver = $state(false);
  let embedUrl = $state('');
  let fileInputRef: HTMLInputElement | undefined = $state();

  const maxSizeMB = $derived(uploadOptions?.maxSizeMB ?? 10);

  function resetState() {
    uploadState = { mode: 'idle' };
    embedUrl = '';
    isDragOver = false;
  }

  function handleOpenChange(isOpen: boolean) {
    open = isOpen;
    if (!isOpen) {
      if (uploadState.mode === 'uploading') {
        uploadState.abortController.abort();
      }
      resetState();
    }
  }

  function handleFileSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    startUpload(file);
  }

  async function startUpload(file: File) {
    if (!editor) return;

    const abortController = new AbortController();
    uploadState = { mode: 'uploading', fileName: file.name, progress: 0, abortController };

    try {
      const onProgress = (p: { percent: number }) => {
        if (uploadState.mode === 'uploading') {
          uploadState = { ...uploadState, progress: p.percent };
        }
      };

      let result;
      if (uploadOptions) {
        result = await uploadOptions.upload(file, onProgress);
      } else {
        result = await uploadImage(file, {
          onProgress,
          signal: abortController.signal,
        });
      }

      editor.chain().focus().setImage({ src: result.publicUrl }).run();
      open = false;
      resetState();
    } catch (err) {
      if (err instanceof ImageUploadError) {
        if (err.type === 'aborted') {
          resetState();
          return;
        }
        uploadState = { mode: 'error', message: err.message };
      } else {
        uploadState = { mode: 'error', message: 'Upload failed' };
      }
    }
  }

  function handleCancel() {
    if (uploadState.mode === 'uploading') {
      uploadState.abortController.abort();
    }
    resetState();
  }

  function handleEmbed() {
    if (!editor) return;
    const url = embedUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      uploadState = { mode: 'error', message: 'URL must start with http:// or https://' };
      return;
    }
    editor.chain().focus().setImage({ src: url }).run();
    open = false;
    resetState();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        startUpload(file);
      } else {
        uploadState = { mode: 'error', message: 'Please drop an image file' };
      }
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;
  }

  function handleRetry() {
    uploadState = { mode: 'idle' };
  }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Insert Image</Dialog.Title>
      <Dialog.Description>Upload an image or embed from a URL.</Dialog.Description>
    </Dialog.Header>

    <div class="py-4">
      {#if uploadState.mode === 'uploading'}
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon class="size-4" />
            <span class="flex-1 truncate">Uploading {uploadState.fileName}...</span>
            <Button variant="ghost" size="icon-sm" onclick={handleCancel}>
              <X class="size-4" />
            </Button>
          </div>
          <div class="flex items-center gap-3">
            <Progress value={uploadState.progress} class="flex-1" />
            <span class="text-sm tabular-nums text-muted-foreground">{uploadState.progress}%</span>
          </div>
        </div>
      {:else if uploadState.mode === 'error'}
        <div class="flex flex-col items-center gap-3 py-2">
          <p class="text-sm text-destructive">{uploadState.message}</p>
          <Button variant="outline" size="sm" onclick={handleRetry}>Try again</Button>
        </div>
      {:else}
        <Tabs value="upload" class="w-full">
          <TabsList class="w-full">
            <TabsTrigger value="upload" class="flex-1 gap-1.5">
              <Upload class="size-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="embed" class="flex-1 gap-1.5">
              <Link class="size-4" />
              Embed URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" class="mt-3">
            <button
              type="button"
              class="flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50 hover:bg-muted {isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25'}"
              ondrop={handleDrop}
              ondragover={handleDragOver}
              ondragleave={handleDragLeave}
              onclick={() => fileInputRef?.click()}
            >
              <div
                class="flex size-12 items-center justify-center rounded-full bg-muted {isDragOver
                  ? 'text-primary'
                  : 'text-muted-foreground'}"
              >
                <Upload class="size-6" />
              </div>
              <div class="text-center">
                <p class="text-sm font-medium">Drop image here or click to upload</p>
                <p class="mt-1 text-xs text-muted-foreground">
                  PNG, JPG, GIF, WebP up to {maxSizeMB}MB
                </p>
              </div>
            </button>
            <input
              bind:this={fileInputRef}
              type="file"
              accept="image/*"
              class="hidden"
              onchange={(e) => handleFileSelect(e.currentTarget.files)}
            />
          </TabsContent>

          <TabsContent value="embed" class="mt-3">
            <div class="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.png"
                bind:value={embedUrl}
                onkeydown={(e) => e.key === 'Enter' && handleEmbed()}
                class="flex-1"
              />
              <Button onclick={handleEmbed} disabled={!embedUrl.trim()}>Embed</Button>
            </div>
          </TabsContent>
        </Tabs>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
