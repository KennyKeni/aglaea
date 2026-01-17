import { Slice } from '@tiptap/pm/model';
import { EditorView } from '@tiptap/pm/view';
import * as pmView from '@tiptap/pm/view';

interface ClipboardData {
  dom: HTMLElement;
  text: string;
}

function getPmView() {
  try {
    return pmView;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function serializeForClipboard(view: EditorView, slice: Slice): ClipboardData {
  // Newer Tiptap/ProseMirror
  if (view && typeof view.serializeForClipboard === 'function') {
    return view.serializeForClipboard(slice) as ClipboardData;
  }

  // Older version fallback
  const proseMirrorView = getPmView() as {
    __serializeForClipboard?: (view: EditorView, slice: Slice) => unknown;
  } | null;

  if (proseMirrorView && typeof proseMirrorView.__serializeForClipboard === 'function') {
    return proseMirrorView.__serializeForClipboard(view, slice) as ClipboardData;
  }

  throw new Error('No supported clipboard serialization method found.');
}
