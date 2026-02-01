<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Progress } from '$lib/components/ui/progress';
  import { Upload, X, ImageIcon } from '@lucide/svelte';
  import { uploadImage, ImageUploadError } from '$lib/utils/image-upload';

  type UploadState =
    | { mode: 'idle' }
    | { mode: 'uploading'; fileName: string; progress: number; abortController: AbortController }
    | { mode: 'error'; message: string };

  import { cn } from '$lib/utils';

  let {
    imageId = $bindable<string | null>(null),
    imageUrl = $bindable<string | null>(null),
    disabled = false,
    class: className = '',
  }: {
    imageId: string | null;
    imageUrl: string | null;
    disabled?: boolean;
    class?: string;
  } = $props();

  let uploadState: UploadState = $state({ mode: 'idle' });
  let isDragOver = $state(false);
  let fileInput: HTMLInputElement | undefined = $state();

  function handleFileSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file) startUpload(file);
  }

  async function startUpload(file: File) {
    const abortController = new AbortController();
    uploadState = { mode: 'uploading', fileName: file.name, progress: 0, abortController };

    try {
      const result = await uploadImage(file, {
        onProgress: (p) => {
          if (uploadState.mode === 'uploading') {
            uploadState = { ...uploadState, progress: p.percent };
          }
        },
        signal: abortController.signal,
      });

      imageId = result.imageId;
      imageUrl = result.publicUrl;
      uploadState = { mode: 'idle' };
    } catch (err) {
      if (err instanceof ImageUploadError) {
        if (err.type === 'aborted') {
          uploadState = { mode: 'idle' };
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
    uploadState = { mode: 'idle' };
  }

  function remove() {
    imageId = null;
    imageUrl = null;
    uploadState = { mode: 'idle' };
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
</script>

{#if imageUrl && uploadState.mode === 'idle'}
  <div class={cn('relative overflow-hidden rounded-lg border', className)}>
    <img
      src={imageUrl}
      alt="Cover"
      class="h-full w-full object-contain"
    />
    <div class="absolute right-2 top-2">
      <Button
        variant="secondary"
        size="icon-sm"
        onclick={remove}
        {disabled}
        type="button"
      >
        <X class="size-4" />
      </Button>
    </div>
  </div>
{:else if uploadState.mode === 'uploading'}
  <div class={cn('flex flex-col gap-3 rounded-lg border p-4', className)}>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <ImageIcon class="size-4" />
      <span class="flex-1 truncate">Uploading {uploadState.fileName}...</span>
      <Button variant="ghost" size="icon-sm" onclick={handleCancel} type="button">
        <X class="size-4" />
      </Button>
    </div>
    <div class="flex items-center gap-3">
      <Progress value={uploadState.progress} class="flex-1" />
      <span class="text-sm tabular-nums text-muted-foreground">{uploadState.progress}%</span>
    </div>
  </div>
{:else if uploadState.mode === 'error'}
  <div class={cn('flex flex-col items-center gap-3 rounded-lg border p-4', className)}>
    <p class="text-sm text-destructive">{uploadState.message}</p>
    <Button variant="outline" size="sm" onclick={() => (uploadState = { mode: 'idle' })} type="button">
      Try again
    </Button>
  </div>
{:else}
  <button
    type="button"
    class={cn('flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50 hover:bg-muted', isDragOver
      ? 'border-primary bg-primary/5'
      : 'border-muted-foreground/25', className)}
    ondrop={handleDrop}
    ondragover={(e) => { e.preventDefault(); isDragOver = true; }}
    ondragleave={(e) => { e.preventDefault(); isDragOver = false; }}
    onclick={() => fileInput?.click()}
    {disabled}
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
      <p class="mt-1 text-xs text-muted-foreground">PNG, JPG, GIF, WebP up to 10MB</p>
    </div>
  </button>
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    class="hidden"
    onchange={(e) => handleFileSelect(e.currentTarget.files)}
  />
{/if}
