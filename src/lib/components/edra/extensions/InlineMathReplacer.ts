import { textInputRule } from '@tiptap/core';
import { InlineMath } from '@tiptap/extension-mathematics';

export const InlineMathReplacer = InlineMath.extend({
  name: 'inlineMathReplacer',
  addInputRules() {
    return [
      textInputRule({
        find: /\$\$([^$]+)\$\$/,
        // @ts-expect-error tiptap types say string but API accepts function
        replace: ({ match, commands }) => {
          const latex = match[1] ?? '';
          commands.insertInlineMath({ latex });
          return '';
        },
      }),
    ];
  },
});
