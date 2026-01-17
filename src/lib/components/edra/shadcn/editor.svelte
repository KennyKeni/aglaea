<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { EdraEditorProps } from '../types.js';
  import initEditor from '../editor.js';
  import { focusEditor } from '../utils.js';
  import { cn } from '$lib/utils.js';
  import '../editor.css';
  import './style.css';
  import '../onedark.css';
  import { ImagePlaceholder } from '../extensions/image/ImagePlaceholder.js';
  import ImagePlaceholderComp from './components/ImagePlaceholder.svelte';
  import { ImageExtended } from '../extensions/image/ImageExtended.js';
  import ImageExtendedComp from './components/ImageExtended.svelte';
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
  import { SvelteNodeViewRenderer } from 'svelte-tiptap';
  import CodeBlock from './components/CodeBlock.svelte';
  import TableCol from './menus/TableCol.svelte';
  import TableRow from './menus/TableRow.svelte';
  import Link from './menus/Link.svelte';
  import slashcommand from '../extensions/slash-command/slashcommand.js';
  import SlashCommandList from './components/SlashCommandList.svelte';

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

  /**
   * Bind the element to the editor
   */
  let element = $state<HTMLElement>();
  let {
    editor = $bindable(),
    editable = true,
    content,
    onUpdate,
    autofocus = false,
    class: className,
  }: EdraEditorProps = $props();

  onMount(() => {
    editor = initEditor(
      element,
      content,
      [
        CodeBlockLowlight.configure({
          lowlight,
        }).extend({
          addNodeView() {
            return SvelteNodeViewRenderer(CodeBlock);
          },
        }),
        ImagePlaceholder(ImagePlaceholderComp),
        ImageExtended(ImageExtendedComp),
        slashcommand(SlashCommandList),
      ],
      {
        ...(onUpdate && { onUpdate }),
        onTransaction(props) {
          editor = undefined;
          editor = props.editor;
        },
        editable,
        autofocus,
      },
    );
  });

  onDestroy(() => {
    if (editor) editor.destroy();
  });
</script>

{#if editor && !editor.isDestroyed}
  <Link {editor} />
  <TableCol {editor} />
  <TableRow {editor} />
{/if}
<div
  bind:this={element}
  role="button"
  tabindex="0"
  onclick={(event) => focusEditor(editor, event)}
  onkeydown={(event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      focusEditor(editor, event);
    }
  }}
  class={cn('edra-editor h-full w-full cursor-auto *:outline-none', className)}
></div>
