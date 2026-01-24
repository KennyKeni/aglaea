import { Node, type CommandProps, type NodeViewProps } from '@tiptap/core';
import type { Component } from 'svelte';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';

export interface S3ImageOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    s3Image: {
      setS3Image: (options: {
        s3Key: string;
        alt?: string;
        title?: string;
        width?: string;
        align?: string;
      }) => ReturnType;
    };
  }
}

export const S3Image = (component: Component<NodeViewProps>): Node<S3ImageOptions> =>
  Node.create<S3ImageOptions>({
    name: 's3-image',
    group: 'block',
    draggable: true,
    atom: true,

    addOptions() {
      return {
        HTMLAttributes: {},
      };
    },

    addAttributes() {
      return {
        s3Key: { default: null },
        alt: { default: null },
        title: { default: null },
        width: { default: '100%' },
        align: { default: 'left' },
      };
    },

    // parseHTML is not used - content is stored as JSON, never parsed from HTML.
    // Returns impossible selector to make this explicit.
    parseHTML() {
      return [];
    },

    // renderHTML is not used - the Svelte NodeView renders in the editor,
    // and S3ImageHtml (editor.ts) or backend's S3Image handles HTML export.
    // Returns minimal placeholder to satisfy TipTap's interface.
    renderHTML() {
      return ['span', { 'data-s3-image-placeholder': true }];
    },

    addNodeView() {
      return SvelteNodeViewRenderer(component);
    },

    addCommands() {
      return {
        setS3Image:
          (options) =>
          ({ commands }: CommandProps) => {
            return commands.insertContent({
              type: this.name,
              attrs: options,
            });
          },
      };
    },
  });
