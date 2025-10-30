import { WidgetType } from "@codemirror/view";
import {
  ViewUpdate,
  ViewPlugin,
  DecorationSet,
  EditorView,
  Decoration,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean) {
    super();
  }

  eq(other: CheckboxWidget) {
    return other.checked == this.checked;
  }

  toDOM() {
    const wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    wrap.className = "cm-boolean-toggle";
    const box = wrap.appendChild(document.createElement("input"));
    box.type = "checkbox";
    box.checked = this.checked;
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

function checkboxes(view: EditorView) {
  const widgets: any[] = [];
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name == "BooleanLiteral") {
          const isTrue =
            view.state.doc.sliceString(node.from, node.to) == "true";
          const deco = Decoration.widget({
            widget: new CheckboxWidget(isTrue),
            side: 1,
          });
          widgets.push(deco.range(node.to));
        }
      },
    });
  }
  return Decoration.set(widgets);
}

function toggleBoolean(view: EditorView, pos: number) {
  const before = view.state.doc.sliceString(Math.max(0, pos - 5), pos);
  let change;
  if (before == "false") change = { from: pos - 5, to: pos, insert: "true" };
  else if (before.endsWith("true"))
    change = { from: pos - 4, to: pos, insert: "false" };
  else return false;
  view.dispatch({ changes: change });
  return true;
}

const checkboxPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = checkboxes(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged)
        this.decorations = checkboxes(update.view);
    }
  },
  {
    decorations: (v) => v.decorations,

    eventHandlers: {
      mousedown: (e, view) => {
        const target = e.target as HTMLElement;
        if (
          target.nodeName == "INPUT" &&
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          target.parentElement!.classList.contains("cm-boolean-toggle")
        )
          return toggleBoolean(view, view.posAtDOM(target));
      },
    },
  }
);

export { checkboxPlugin };
