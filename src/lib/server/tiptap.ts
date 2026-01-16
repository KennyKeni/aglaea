import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Typography from '@tiptap/extension-typography';
import { FontSize, TextStyle, Color } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Table, TableCell, TableRow, TableHeader } from '@tiptap/extension-table';
import { Markdown } from '@tiptap/markdown';
import Mathematics from '@tiptap/extension-mathematics';

function getServerExtensions() {
	return [
		StarterKit.configure({
			orderedList: { HTMLAttributes: { class: 'list-decimal' } },
			bulletList: { HTMLAttributes: { class: 'list-disc' } },
			heading: { levels: [1, 2, 3, 4] },
			codeBlock: false
		}),
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
		Mathematics
	];
}

export function jsonToHtml(body: string): string {
	try {
		const parsed = JSON.parse(body);
		return generateHTML(parsed, getServerExtensions());
	} catch (e) {
		console.error('jsonToHtml error:', e);
		return body;
	}
}
