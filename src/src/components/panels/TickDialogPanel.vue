<template>
  <TickPanel @close="close" ref="panel" :showAsModal="true" class="dialog-panel" :style="style" :type="type" :transparentBackdrop="transparentBackdrop" :allowAsSubDialog="allowAsSubDialog">
    <div class="header" v-if="header">
      <div class="title">
        <slot name="title" />
        <BusyIndicator :loading="loading" />
      </div>
      <div class="actions">
        <slot name="actions" />
        <button v-if="!noClose" class="close-button" @click="$emit('close')">
          <TickIcon name="close" />
        </button>
      </div>

    </div>
    <div class="content">
      <slot />
    </div>

    <div class="footer" v-if="hasFooterSlot && this.showFooter">
      <slot name="footer" />
    </div>
  </TickPanel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import TickIcon from "@/components/TickIcon.vue";
import TickPanel, { PanelStyle, TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import { closable } from "@/directives";
import keyboard from "@/helpers/keyboard";
import BusyIndicator from "../atoms/BusyIndicator.vue";

@Component({
  emits: ["close"],
  directives: { closable },
  components: {
    TickPanel,
    TickIcon,
    BusyIndicator,
  },
})
export default class TickDialogPanel extends Vue {
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop({ default: true }) private header!: boolean;
  @Prop({ default: false }) private loading!: boolean;
  @Prop({ default: true }) private showFooter!: boolean;
  @Prop({ default: false }) private noClose: boolean;
  @Prop({ default: {} }) private style: object;
  @Prop({ default: {} }) private type: PanelStyle;
  @Prop({ default: false }) private transparentBackdrop!: boolean;
  private close() {
    if (this.noClose) { return; }
    this.$emit("close");
  }

  private keyboardId!: number;

  private get allowAsSubDialog() {
    return this.panelOptions?.allowAsSubDialog;
  }

  private get hasFooterSlot() {
    return !!this.$slots.footer;
  }

  private mounted() {
    this.keyboardId = keyboard.on(
      "Escape",
      () => {
        this.close();
      },
      { ignoreInputFieldEvents: false }
    );
  }

  private beforeUnmount() {
    keyboard.off(this.keyboardId);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.dialog-panel {
  width: min-content;
  padding: 16px;
  //max-height: 95vh; // maximize height of panel, allowing for a scrollbar instead
  min-width: 230px;
}

.footer {
  border-top: solid 1px var(--c-base-200);
  margin-top: 15px;
  padding-top: 20px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row-reverse;
  gap: 5px;
  align-items: center;
}

.header {
  display: flex;
  padding-bottom: 12px;

  .title {
    flex-grow: 1;
    @include font-outfit;
    text-transform: uppercase;
    font-size: $text-size-regular;
    font-weight: 600;
    line-height: 20px;
  }

  button {
    flex-shrink: 0;
    opacity: 0.6;
  }

  .actions {
    display: flex;
    gap: 10px;
  }
}
</style>
