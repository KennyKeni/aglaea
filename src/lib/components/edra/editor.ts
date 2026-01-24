import { Editor, Node, type Extensions, type EditorOptions, type Content } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { getHandlePaste } from './utils.js';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Typography from '@tiptap/extension-typography';
import { ColorHighlighter } from './extensions/ColorHighlighter.js';
import { FontSize, TextStyle, Color } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import SearchAndReplace from './extensions/FindAndReplace.js';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Table, TableCell, TableRow, TableHeader } from './extensions/table/index.js';
import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import MathMatics from '@tiptap/extension-mathematics';
import { s3Config } from '$lib/config/s3';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import markdown from 'highlight.js/lib/languages/markdown';
import java from 'highlight.js/lib/languages/java';
import kotlin from 'highlight.js/lib/languages/kotlin';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import ruby from 'highlight.js/lib/languages/ruby';
import swift from 'highlight.js/lib/languages/swift';
import yaml from 'highlight.js/lib/languages/yaml';

import AutoJoiner from 'tiptap-extension-auto-joiner';
import 'katex/dist/katex.min.css';
import { InlineMathReplacer } from './extensions/InlineMathReplacer.js';

// S3ImageHtml: HTML-only extension for static rendering (getHtmlExtensions).
// The interactive editor uses S3Image with a Svelte NodeView instead.
const S3ImageHtml = Node.create({
  name: 's3-image',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      s3Key: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: '100%' },
      align: { default: 'left' },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { s3Key, align, width, ...rest } = HTMLAttributes;
    if (!s3Key) return ['span'];
    const src = `${s3Config.baseUrl}/${s3Key}`;
    const style = width ? `width: ${width}` : undefined;
    return ['img', { ...rest, src, style, 'data-align': align }];
  },
});

const lowlight = createLowlight({
  javascript,
  typescript,
  python,
  css,
  xml,
  json,
  bash,
  sql,
  markdown,
  java,
  kotlin,
  go,
  rust,
  c,
  cpp,
  csharp,
  ruby,
  swift,
  yaml,
});

export function getHtmlExtensions(): Extensions {
  return [
    StarterKit.configure({
      orderedList: { HTMLAttributes: { class: 'list-decimal' } },
      bulletList: { HTMLAttributes: { class: 'list-disc' } },
      heading: { levels: [1, 2, 3, 4] },
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        validate: (href) => href.startsWith('/') || href.startsWith('#'),
      },
      codeBlock: false,
    }),
    CodeBlockLowlight.configure({ lowlight }),
    Highlight.configure({ multicolor: true }),
    Color,
    Subscript,
    Superscript,
    Typography,
    ColorHighlighter,
    TextStyle,
    FontSize,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    MathMatics,
    Table,
    TableHeader,
    TableRow,
    TableCell,
    Markdown,
    S3ImageHtml,
  ];
}

export default (
  element?: HTMLElement,
  content?: Content,
  extensions?: Extensions,
  options?: Partial<EditorOptions>,
) => {
  const editor = new Editor({
    ...(element && { element }),
    ...(content && { content }),
    extensions: [
      StarterKit.configure({
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc',
          },
        },
        heading: {
          levels: [1, 2, 3, 4],
        },
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          validate: (href) => href.startsWith('/') || href.startsWith('#'),
        },
        codeBlock: false,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        emptyEditorClass: 'is-empty',
        // Use a placeholder:
        // Use different placeholders depending on the node type:
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'What’s the title?';
          } else if (node.type.name === 'paragraph') {
            return 'Press / or write something ...';
          }
          return '';
        },
      }),
      Color,
      Subscript,
      Superscript,
      Typography,
      ColorHighlighter,
      TextStyle,
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      SearchAndReplace,
      InlineMathReplacer,
      MathMatics.configure({
        blockOptions: {
          onClick: (node, pos) => {
            const newCalculation = prompt('Enter new calculation:', node.attrs.latex);
            if (newCalculation) {
              editor
                .chain()
                .setNodeSelection(pos)
                .updateBlockMath({ latex: newCalculation })
                .focus()
                .run();
            }
          },
        },
        inlineOptions: {
          onClick: (node, pos) => {
            const newCalculation = prompt('Enter new calculation:', node.attrs.latex);
            if (newCalculation) {
              editor
                .chain()
                .setNodeSelection(pos)
                .updateInlineMath({ latex: newCalculation })
                .focus()
                .run();
            }
          },
        },
      }),
      AutoJoiner,
      Table,
      TableHeader,
      TableRow,
      TableCell,
      Markdown,
      ...(extensions ?? []),
    ],
    ...options,
  });

  editor.setOptions({
    editorProps: {
      handlePaste: getHandlePaste(editor),
    },
  });
  return editor;
};
