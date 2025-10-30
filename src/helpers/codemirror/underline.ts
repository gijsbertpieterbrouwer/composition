import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";
import { keymap } from "@codemirror/view";

const addUnderline = StateEffect.define<{from: number, to: number}>()
const underlineMark = Decoration.mark({class: "cm-underline"})

const underlineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(underlines, tr) {
    underlines = underlines.map(tr.changes)
    for (const e of tr.effects) if (e.is(addUnderline)) {
      underlines = underlines.update({
        add: [underlineMark.range(e.value.from, e.value.to)]
      });
    }
    return underlines;
  },
  provide: f => EditorView.decorations.from(f)
});

function underlineSelection(view: EditorView) {
  const effects: StateEffect<unknown>[] = view.state.selection.ranges
    .filter(r => !r.empty)
    .map(({from, to}) => addUnderline.of({from, to}));

  if (!effects.length) { return false; }

  if (!view.state.field(underlineField, false)) {
    effects.push(StateEffect.appendConfig.of([underlineField]))
  }

  view.dispatch({effects});
  return true;
}

export const underline = keymap.of([{
  key: "Mod-h",
  preventDefault: true,
  run: underlineSelection
}]);
