<template>
  <div class="codemirror" ref="root"></div>
</template>

<script lang="ts">
import { Component, VModel, Vue } from 'vue-facing-decorator';

import getRefElement from "@/helpers/refHelpers";

import { EditorView, keymap } from "@codemirror/view";
import { standardKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { textdecoration } from "@/helpers/codemirror/textdecoration";

@Component({
  emits: ["update:modelValue", "submit"],
})
export default class CodeMirror extends Vue {
  @VModel() private value!: string;
  private view!: EditorView;

  mounted() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const me = this;
    this.view = new EditorView({
      doc: this.value.slice(),
      parent: getRefElement(this, "root"),
      extensions: [
        markdown(),
        textdecoration,
        EditorView.updateListener.of((u) => {
          if (u.docChanged) {
            const value = u.state.doc.toString();
            this.value = value;
          }
        }),
        keymap.of([
          ...standardKeymap,
          {
            mac: "Mod-Enter",
            win: "Ctrl-Enter",
            run() {
              me.$emit("submit");
              return true;
            }
          }
        ]),
      ],
    });

    this.view.focus();

  }
}
</script>

<style lang="scss" scoped>
.codemirror {
  overflow: hidden;
}
</style>

<style lang="scss">
@import "@/styles/theme";

.codemirror {
  .cm-editor.cm-focused {
    outline: none;
  }

  .cm-line {
    @include font-inter;
    line-height: 20px;
  }

  .cm-underline {
    text-decoration: underline;
  }

  .cm-italic {
    font-style: italic;
    display: inline-block;
  }

  .cm-bold {
    font-weight: bold;
  }

  .cm-atomic-mark {
    background: rgba(255, 0, 0, 0.16);
    // NOTE: using display: none won't allow the user to add additional text after the closing EmphasisMark.
    width: 0;
    height: 0;
    overflow: hidden;
    display: inline-block;
  }
}
</style>
