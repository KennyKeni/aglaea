import type { Content, Editor } from '@tiptap/core';
import type { EditorState } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import type { Snippet } from 'svelte';
import type { UploadProgressCallback, UploadResult } from '$lib/utils/image-upload';

export interface ImageUploadOptions {
  upload: (file: File, onProgress?: UploadProgressCallback) => Promise<UploadResult>;
  maxSizeMB?: number;
}

declare module '@tiptap/core' {
  interface Storage {
    imageUpload?: ImageUploadOptions;
    openImageModal?: () => void;
  }
}

export interface EdraEditorProps {
  content?: Content;
  editable?: boolean;
  editor?: Editor | undefined;
  autofocus?: boolean;
  onUpdate?: () => void;
  class?: string;
  imageUpload?: ImageUploadOptions;
}

export interface EdraToolbarProps {
  editor: Editor;
  class?: string;
  excludedCommands?: string[];
  children?: Snippet<[]>;
}

export interface ShouldShowProps {
  editor: Editor;
  element: HTMLElement;
  view: EditorView;
  state: EditorState;
  oldState?: EditorState;
  from: number;
  to: number;
}
