<template>
  <dialog open :class="cssClass" :style="dialogStyle">
    <div class="container" :style="containerStyle" :class="containerClass" v-closable="closeFromContainer">

      <!-- <div>
        <div style="background-color: var(--c-base);">base</div>
        <div style="background-color: var(--c-base-100);">100</div>
        <div style="background-color: var(--c-base-200);">200</div>
        <div style="background-color: var(--c-base-300);">300</div>
        <div style="background-color: var(--c-base-400);">400</div>
        <div style="background-color: var(--c-base-500);">500</div>
      </div> -->
      <slot />
    </div>
    <div v-if="showBackdrop" class="backdrop" :class="{ 'transparent': this.transparentBackdrop }" @click="close"></div>
  </dialog>
</template>

<script lang="ts">
import { closable } from "@/directives";
import keyboard from "@/helpers/keyboard";
import useAppStore, { TickDialogStackData } from "@/store/app";
import useViewstateStore from "@/store/viewstate";
import { Component, Prop, Vue } from "vue-facing-decorator";

export interface TickPanelOptions {
  title: string,
  allowAsSubDialog?: boolean,
  from?: DOMRect,
  x?: number,
  y?: number,
  showAsModal?: boolean,
  defaultPosition?: PanelDefaultPosition,
  offset_Y?: number,
}

export interface Position {
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
}

export enum PanelStyle {
  normal = 'normal',
  wizard = 'wizard',
}

export enum PanelDefaultPosition {
  left = 0,
  right = 1,
}


@Component({
  directives: { closable },
  emits: ["close"]
})
export default class TickPanel extends Vue {
  @Prop() private position!: Position;
  @Prop({ default: false }) private showAsModal!: boolean;
  //@Prop({ default: false }) private useBackdrop!: boolean;
  @Prop() private noPadding: boolean;
  @Prop({ default: false }) private transparentBackdrop!: boolean;
  @Prop({ default: false }) private allowAsSubDialog!: boolean;
  //@Prop({ default: false }) private depth!: number;
  @Prop({ default: "" }) private title!: string;
  @Prop({ default: {} }) private style: object;
  @Prop({ default: {} }) private type: PanelStyle;

  private dialogData: TickDialogStackData = null;
  private keyboardId!: number;

  private get dialogDepth() {
    return this.dialogData?.depth;
  }

  private closeFromContainer() {
    if (this.showBackdrop) { return; } // handles by backdrop
    this.close(false);
  }

  private get useBackdrop() {
    const highest = useAppStore().highestDialog;
    return (highest?.id != this.dialogData?.id);
  }


  mounted() {
    if (!this.allowAsSubDialog) {
      // remove old dialog
      const highest = useAppStore().highestDialog;
      if (highest) {
        useAppStore().removeDialog(highest.id, false);
      }
    }

    this.dialogData = useAppStore().addDialog(this.title ?? "unknown-panel", () => { this.close(false) });

    this.keyboardId = keyboard.on(
      "Escape",
      () => {
        this.close(true);
      },
      { ignoreInputFieldEvents: false }
    );
  }

  beforeUnmount() {
    useAppStore().removeDialog(this.dialogData.id, true);
    keyboard.off(this.keyboardId);
  }


  // private close() {
  //   this.$emit("close");
  // }

  private close(byKeyboard: boolean) {
    const highest = useAppStore().highestDialog;
    if (highest?.id != this.dialogData.id) { return; }

    this.$emit("close", byKeyboard);
  }

  private get showBackdrop() {
    return this.showAsModal || this.useBackdrop;
  }

  private get cssClass() {
    const themeClass = `theme-${useViewstateStore().theme}`;

    let css: object = {
      'center': this.centerScreen,
    };

    css[themeClass] = true;
    return css;
  }

  private get containerClass() {
    const isEvenDepth = this.dialogDepth % 2 == 0;

    let css: object = {

    };
    if (isEvenDepth) {
      css['even'] = true;
    }

    if (this.noPadding == true) {
      css['no-padding'] = true;
    }

    if (this.type) {
      if (this.type == PanelStyle.wizard) {
        css['funky'] = true;
      }
    }

    return css;
  }

  private get centerScreen() {
    return this.showAsModal && (!this.position || !this.position.left && ~this.position.right && !this.position.bottom && !this.position.top);
  }

  private get containerStyle() {
    const d = this.dialogDepth;
    const s0 = d * 3;
    const s1 = d * 4;
    const s2 = d * 4;
    const s3 = d * 4;

    const shadow = {
      'box-shadow': `${s0}px ${s1}px ${s2}px ${s3}px rgba(0, 0, 0, 0.${this.dialogDepth})`
    };

    const s = this.style || {};
    const merged = { ...shadow, ...s };

    return merged;
  }

  private get dialogStyle() {
    return {
      'left': this.position?.left,
      'bottom': this.position?.bottom,
      'right': this.position?.right,
      'top': this.position?.top,
    };
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

dialog {
  display: block;
  position: fixed;
  z-index: 10000;
  background: transparent !important;
  width: min-content;
  height: min-content;
  user-select: none;

  &.center {

    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100dvh;

    .container {
      &.funky {
        @include wizard-bg
      }

      position: fixed;
      left: 50%;
      top: 30%;
      transform: translate(-50%, -30%);
      z-index: 1000000;
    }
  }

  .backdrop {
    position: fixed;
    z-index: 1000;

    padding: 0;
    margin: 0;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    &:not(.transparent) {
      background-color: rgba(56, 56, 56, 0.5); // must be rgba color for blur to work
      backdrop-filter: blur(1px);

    }
  }


  .container {
    display: block;
    //position: absolute;
    ///z-index: 2000;


    border-radius: 12px;
    //box-shadow: 0px 4px 8px 1px rgba(0, 0, 0, 0.16);
    overflow-y: auto;

    padding: 16px;
    max-height: 95vh;
    min-width: 300px;
    min-height: 40px;
    color: var(--c-panel-contrast);

    background-color: var(--c-panel-background);

    &.even {
      background-color: var(--c-panel-base-100);

    }

    --c-contrast: var(--c-panel-contrast);
    --c-base: var(--c-panel-base);
    --c-base-100: var(--c-panel-base-100);
    --c-base-200: var(--c-panel-base-200);
    --c-base-300: var(--c-panel-base-300);
    --c-base-400: var(--c-panel-base-400);
    --c-base-500: var(--c-panel-base-500);

    &.no-padding {
      padding: 0;
      min-height: 0px;
    }

  }

}
</style>
