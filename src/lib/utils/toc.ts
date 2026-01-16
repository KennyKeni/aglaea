import { slugify } from './slugify';

export interface TocItem {
	id: string;
	text: string;
	level: number;
}

interface TiptapNode {
	type: string;
	content?: TiptapNode[];
	text?: string;
	attrs?: { level?: number };
}

export function extractToc(doc: TiptapNode): TocItem[] {
	const items: TocItem[] = [];
	const slugCounts = new Map<string, number>();

	function walk(node: TiptapNode) {
		if (node.type === 'heading') {
			const text = node.content?.map((n) => n.text ?? '').join('') ?? '';
			if (!text.trim()) return;

			const baseSlug = slugify(text);
			const count = slugCounts.get(baseSlug) ?? 0;
			const id = count > 0 ? `${baseSlug}-${count}` : baseSlug;
			slugCounts.set(baseSlug, count + 1);

			items.push({
				id,
				text: text.trim(),
				level: node.attrs?.level ?? 2
			});
		}
		node.content?.forEach(walk);
	}

	walk(doc);
	return items;
}
