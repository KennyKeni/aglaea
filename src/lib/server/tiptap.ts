import { generateHTML } from '@tiptap/html';
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
import { Markdown, MarkdownManager } from '@tiptap/markdown';
import Mathematics from '@tiptap/extension-mathematics';
import { slugify } from '$lib/utils/slugify';
import DOMPurify from 'isomorphic-dompurify';

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
    Markdown,
    Mathematics,
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

export function jsonToHtml(body: string): string {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return markdownToHtml(body);
  }

  try {
    const html = generateHTML(parsed, getServerExtensions());
    return DOMPurify.sanitize(html);
  } catch (e) {
    console.error('Failed to render JSON:', e);
    throw new RenderError('Failed to render article content', e);
  }
}

function markdownToHtml(markdown: string): string {
  try {
    const manager = new MarkdownManager({ extensions: getServerExtensions() });
    const json = manager.parse(markdown);
    const html = generateHTML(json, getServerExtensions());
    return DOMPurify.sanitize(html);
  } catch (e) {
    console.error('Failed to render markdown:', e);
    throw new RenderError('Failed to render article content', e);
  }
}
