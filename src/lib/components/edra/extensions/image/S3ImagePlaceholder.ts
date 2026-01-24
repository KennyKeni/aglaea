import { Node, mergeAttributes, type CommandProps, type NodeViewProps } from '@tiptap/core';
import type { Component } from 'svelte';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';

export interface S3ImagePlaceholderOptions {
  HTMLAttributes: Record<string, object>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    s3ImagePlaceholder: {
      insertS3ImagePlaceholder: () => ReturnType;
    };
  }
}

export const S3ImagePlaceholder = (
  component: Component<NodeViewProps>
): Node<S3ImagePlaceholderOptions> =>
  Node.create<S3ImagePlaceholderOptions>({
    name: 's3-image-placeholder',

    addOptions() {
      return {
        HTMLAttributes: {},
      };
    },

    parseHTML() {
      return [{ tag: `div[data-type="${this.name}"]` }];
    },

    renderHTML({ HTMLAttributes }) {
      return ['div', mergeAttributes(HTMLAttributes)];
    },

    group: 'block',
    draggable: true,
    atom: true,
    content: 'inline*',
    isolating: true,

    addNodeView() {
      return SvelteNodeViewRenderer(component);
    },

    addCommands() {
      return {
        insertS3ImagePlaceholder:
          () =>
          ({ commands }: CommandProps) => {
            return commands.insertContent({
              type: 's3-image-placeholder',
            });
          },
      };
    },
  });
