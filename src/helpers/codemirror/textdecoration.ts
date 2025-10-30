import { ensureSyntaxTree } from "@codemirror/language";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";

function textdecorationWidgets(view: EditorView) {
  const widgets: any[] = [];

  let isLeft = true;

  for (const { from, to } of view.visibleRanges) {
    ensureSyntaxTree(view.state, view.state.doc.length, 5000)?.iterate({
      from,
      to,
      enter: (node) => {
        if (node.name == "Emphasis") {
          const deco = Decoration.mark({ class: "cm-italic", name: node.name });
          widgets.push(deco.range(node.from, node.to));
        }

        if (node.name == "StrongEmphasis") {
          const deco = Decoration.mark({ class: "cm-bold", name: node.name });
          widgets.push(deco.range(node.from, node.to));
        }

        if (node.name === "EmphasisMark") {
          const deco = Decoration.mark({
            class: "cm-atomic-mark",
            name: node.name,
            isLeft,
          });
          widgets.push(deco.range(node.from, node.to));
          isLeft = !isLeft;
        }
      },
    });
  }

  return Decoration.set(widgets);
}

const textdecoration = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = textdecorationWidgets(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = textdecorationWidgets(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
    provide: () =>
      EditorView.atomicRanges.of((view) => {
        const value = view.plugin(textdecoration);
        if (!value) {
          return Decoration.none;
        }

        const decorations: DecorationSet = value.decorations;
        const emphasisMarks: any[] = [];

        decorations.between(
          0,
          view.state.doc.length,
          (from, to, decoration) => {
            if (decoration.spec.name === "EmphasisMark") {
              const deco = Decoration.mark({
                class: "cm-italic-mark",
                name: decoration.spec.name,
              });

              const f = decoration.spec.isLeft && from > 0 ? from - 1 : from;
              const t =
                !decoration.spec.isLeft && to < view.state.doc.length - 1
                  ? to + 1
                  : to;

              emphasisMarks.push(deco.range(f, t));
            }
          }
        );

        if (!emphasisMarks.length) {
          return Decoration.none;
        }
        return Decoration.set(emphasisMarks);
      }),
  }
);

export { textdecoration };

