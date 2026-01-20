import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Typography from '@tiptap/extension-typography';
import { FontSize, TextStyle, Color } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Table, TableCell, TableRow, TableHeader } from '@tiptap/extension-table';
import Mathematics from '@tiptap/extension-mathematics';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import { slugify } from '$lib/utils/slugify';
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

function createHeadingWithIds() {
  const slugCounts = new Map<string, number>();

  return Heading.extend({
    renderHTML({ node, HTMLAttributes }) {
      const text = node.textContent;
      const baseSlug = slugify(text);
      const count = slugCounts.get(baseSlug) ?? 0;
      const id = count > 0 ? `${baseSlug}-${count}` : baseSlug;
      slugCounts.set(baseSlug, count + 1);

      const level = node.attrs.level;
      return [`h${level}`, { ...HTMLAttributes, id }, 0];
    },
  }).configure({ levels: [1, 2, 3, 4] });
}

function getServerExtensions() {
  return [
    StarterKit.configure({
      orderedList: { HTMLAttributes: { class: 'list-decimal' } },
      bulletList: { HTMLAttributes: { class: 'list-disc' } },
      heading: false,
      codeBlock: false,
      link: false,
    }),
    createHeadingWithIds(),
    Highlight.configure({ multicolor: true }),
    Color,
    Subscript,
    Superscript,
    Typography,
    TextStyle,
    FontSize,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: false }),
    TableHeader,
    TableRow,
    TableCell,
    Mathematics,
    Image,
    CodeBlockLowlight.configure({ lowlight }),
    Link.configure({ openOnClick: false }),
  ];
}

export class RenderError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'RenderError';
  }
}

export function jsonToHtml(content: object): string {
  try {
    return renderToHTMLString({
      extensions: getServerExtensions(),
      content,
    });
  } catch (e) {
    console.error('Failed to render JSON:', e);
    throw new RenderError('Failed to render article content', e);
  }
}
