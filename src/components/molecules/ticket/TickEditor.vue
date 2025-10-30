<template>
  <div class="tick-editor" ref="container" />
</template>

<script lang="ts">
import emitter, { EditorEventType } from "@/helpers/editorEventBus";
import { getReadStorageLocations } from "@/helpers/enumsHelper";
import getRefElement from "@/helpers/refHelpers";
import { onTokenizableEditorChange, onTokenizableEditorClick } from "@/helpers/tokenizationHelper";
import { debug } from "@/log";
import { StorageLocation } from "@/TickApi";
import * as Editor from "@toast-ui/editor";
import { EditorOptions } from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Component, Prop, VModel, Vue, Watch } from "vue-facing-decorator";

enum EditorCommand {
  bold = "bold",
  italic = "italic",
  addLink = "addLink", // { linkText, linkUrl }
  bulletList = "bulletList",
  orderedList = "orderedList",
  code = "code",
  codeBlock = "codeBlock",
  // --
  indent = "indent",
  outdent = "outdent",
  addImage = "addImage", // { altText, imageUrl }
  selectAll = "selectAll",
  strike = "strike",
  blockQuote = "blockQuote",
  hr = "hr",
  taskList = "taskList",
  addTable = "addTable", // { columnCount, rowCount }
}

@Component({
  emits: ["update:modelValue", "submit", "blur", "focus", "change"],
})
export default class TickEditor extends Vue {
  @VModel() private modelValue!: string;
  @Prop({ default: true }) private autoSize!: boolean;
  @Prop() private tokenizable!: boolean;
  @Prop({ default: "Type" }) private placeholder: string;
  @Prop({ default: null }) private maxlength: number;
  @Prop({ default: null }) private maxheight: number;
  @Prop({ default: null }) private locations: StorageLocation[];

  private editor!: Editor.EditorCore;
  private isLarge = false;
  private lastKnownValue = "";
  private container: HTMLElement;

  private setEditorToCalculatedHeight() {
    const lines =
      4 +
      this.editor
        .getMarkdown()
        .split("")
        .filter((c) => c === "\n").length;
    const linesHeight = 20 * lines;
    const max = Math.floor(window.innerHeight * 0.5);
    const height = linesHeight > max ? max : linesHeight;

    const min = Math.min(this.maxheight || height, height);

    this.editor.setHeight(`${min}px`);
  }

  private get largeHeight(): string {
    const preferred = this.maxheight || 700;
    return `clamp(65px, ${preferred}px, 45dvh)`;
  }
  private get normalHeight(): string {
    const preferred = this.maxheight || 100;
    return `clamp(48px, ${preferred}px, 20dvh)`;
  }


  mounted() {
    this.container = getRefElement(this, "container");
    this.container.addEventListener('click', this.onEditorClick);


    const options: EditorOptions = {
      placeholder: this.placeholder,//'line1 \n line2',
      el: this.container,
      plugins: [],
      initialEditType: "markdown", // [wysiwyg, markdown]
      initialValue: this.modelValue,
      toolbarItems: [],
      height: this.normalHeight,
      theme: "dark",
      hideModeSwitch: true,
      usageStatistics: false,
      viewer: false,
      autofocus: false,
      previewStyle: "tab",

      events: {
        change: () => {
          const md = this.editor.getMarkdown();
          const html = this.editor.getHTML();

          if (this.maxlength && md.length > this.maxlength) {
            // Trim the content to the maximum length
            var trimmedContent = md.substring(0, this.maxlength);
            this.editor.setMarkdown(trimmedContent);
          }


          this.lastKnownValue = md;
          this.$emit("update:modelValue", md);
          this.$emit("change", md, html)

        },
        keyup: (type, e) => {

          if (this.autoSize) {
            if ((e.key === "Enter" && !e.shiftKey) || e.key === "Backspace") {
              this.setEditorToCalculatedHeight();
            }
          }

          if (e.key === "Enter" && e.shiftKey && this.modelValue.trim().length) {
            debug("[Editor:submit]");
            // submit with shift + enter
            this.$emit("submit");
          }

          if (e.key === "{" && this.tokenizable) {
            this.tryCaptureToken();
          }
        },
        focus: () => {
          // console.trace();
          debug("[Editor:focus]");
          this.$emit("focus");
        },
        blur: () => {
          debug("[Editor:blur]");
          this.$emit("blur");
        },
      },
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.editor = new (Editor as any)(options) as Editor.EditorCore;

    emitter.on(EditorEventType.toggleBold, () => {
      this.editor.exec(EditorCommand.bold);
    });

    emitter.on(EditorEventType.toggleBulletList, () => {
      this.editor.exec(EditorCommand.bulletList);
    });

    emitter.on(EditorEventType.toggleCode, () => {
      this.editor.exec(EditorCommand.code);
    });

    emitter.on(EditorEventType.toggleCodeBlock, () => {
      this.editor.exec(EditorCommand.codeBlock);
    });

    emitter.on(EditorEventType.toggleItalics, () => {
      this.editor.exec(EditorCommand.italic);
    });

    emitter.on(EditorEventType.toggleLink, () => {
      this.editor.exec(EditorCommand.addLink);
    });

    emitter.on(EditorEventType.toggleOrderedList, () => {
      this.editor.exec(EditorCommand.orderedList);
    });

    emitter.on(EditorEventType.focus, () => {
      debug("[Editor:focusing]");
      this.editor?.focus();

      // this.editor.moveCursorToEnd(true);
    });

    emitter.on(EditorEventType.blur, () => {
      debug("[Editor:blurring]");
      this.editor.blur();
    });

    emitter.on(EditorEventType.toggleResize, () => {
      debug("[Editor:resizing]");
      this.isLarge = !this.isLarge;
      // const to = this.isLarge ? "60vh" : "48px";
      const to = this.isLarge ? this.largeHeight : this.normalHeight;

      this.editor.setHeight(to);
      this.editor.moveCursorToEnd(true);
    });

    emitter.on(EditorEventType.maximizeSize, () => {
      debug("[Editor:resizing to large]");
      if (this.isLarge) { return; }
      this.isLarge = true;
      const to = this.largeHeight;
      this.editor.setHeight(to);
      this.editor.moveCursorToEnd(true);
    });

    //this.editor.moveCursorToEnd(true);

    this.setEditorToCalculatedHeight();


  }

  @Watch("modelValue")
  private onModelValueChanged(to: string) {
    if (to == this.lastKnownValue) { return; }
    this.editor.setMarkdown(this.modelValue, false);
  }

  private tryCaptureToken(): void {
    if (!this.tokenizable) { return; }
    console.log("e1");
    const selection = this.editor.getSelection();
    const cursorPos = selection[0][1] as number;
    const searchableLocations = this.locations || getReadStorageLocations();
    const newStorageLocation: StorageLocation = null;
    const currentValue = this.editor.getMarkdown();
    onTokenizableEditorChange(true, true, this.container.getBoundingClientRect(), cursorPos, currentValue, searchableLocations, newStorageLocation, (newMd: string, token: string) => {
      //this.editor.insertText("{" + token + "}}"); // first accolade is already typed
      this.editor.setMarkdown(newMd);
    }, () => {
      this.editor.moveCursorToEnd(true);
    });

  }

  private onEditorClick(e: MouseEvent): void {
    console.log("click editor");
    if (!this.tokenizable) { return; }

    const selection = this.editor.getSelection();
    const cursorPos = selection[0][1] as number;
    const searchableLocations = this.locations || getReadStorageLocations();
    const newStorageLocation: StorageLocation = null;
    const currentValue = this.editor.getMarkdown();
    onTokenizableEditorClick(true, false, this.container.getBoundingClientRect(), cursorPos, currentValue, searchableLocations, newStorageLocation, (newMd: string, token: string) => {
      this.editor.setMarkdown(newMd);// insertText("{" + token + "}}"); // first accolade is already typed
    }, () => {
      this.editor.moveCursorToEnd(true);
    });

    e.preventDefault();
    e.stopPropagation();
  }
}
</script>

<style lang="scss" scoped>
.tick-editor {
  :deep(.toastui-editor-defaultUI) {
    border: none;

    .toastui-editor-md-splitter,
    .toastui-editor-md-preview,
    .toastui-editor-toolbar {
      display: none;
    }

    // .toastui-editor-ww-container {
    //   color: var(--c-contrast);

    //   background-color: transparent;

    //   * {
    //     color: var(--c-contrast);
    //   }

    // }

    .toastui-editor-md-meta,
    .toastui-editor-md-code:not(.toastui-editor-md-delimiter),
    .ProseMirror,
    .toastui-editor-md-delimiter {
      color: var(--c-contrast);
    }

    .toastui-editor-md-delimiter {
      color: var(--c-base-500);
    }

    .toastui-editor-md-code-block-line-background,
    .toastui-editor-md-code {
      background-color: var(--c-base-100);
    }

    .toastui-editor-md-list-item {
      color: var(--c-secondary);
    }

    .ProseMirror {
      padding: 0;
    }
  }
}
</style>
