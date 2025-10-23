<template>
  <TickPanel @close="close" ref="panel" :position="position" :showAsModal="showAsModal" :allowAsSubDialog="allowAsSubDialog" class="settings-panel" :noPadding="noPadding">
    <div class="header" v-if="header">
      <div class="title">
        <slot name="title" />
      </div>
      <div class="actions">
        <slot name="actions" />
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
import TickIcon from "@/components/TickIcon.vue";
import TickPanel, { PanelDefaultPosition, Position, TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import { closable } from "@/directives";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: ["close"],
  directives: { closable },
  components: {
    TickPanel,
    TickIcon,
  },
})
export default class TickSettingsPanel extends Vue {
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop({ default: true }) private header!: boolean;
  @Prop({ default: true }) private showFooter!: boolean;
  @Prop({ default: false }) private noPadding!: boolean;


  private position: Position = null; // calculated

  private get showAsModal(): boolean {
    return this.panelOptions?.showAsModal;
  }

  private get allowAsSubDialog() {
    return this.panelOptions?.allowAsSubDialog;
  }
  private close(byKeyboard: boolean) {
    this.$emit("close", byKeyboard);
  }

  private get hasFooterSlot() {
    return !!this.$slots.footer;
  }


  private calculatePositionFromXYCoordinate() {

    let left = this.panelOptions.x;
    let top = this.panelOptions.y;
    let bottom: number = null;
    const panelRect = getRefElementDOMRect(this, "panel");
    const spacingFromWindowSide = 10;
    const fromSpacing = 1;
    //TOP-BOTTOM
    if (panelRect.height + top >= window.innerHeight) {

      // check if above if suitable
      if (top - panelRect.height > spacingFromWindowSide) {
        //invert
        top = undefined;
        bottom = fromSpacing;
      } else {
        // clip on top windows
        top = spacingFromWindowSide;
      }
    }


    this.position = {
      left: `${left}px`,
      top: `${top}px`,
      bottom: bottom ? `${bottom}px` : undefined,
    };
  }

  private calculatePositionFromRect() {
    const fromSpacing = this.panelOptions?.offset_Y || 1;
    const spacingFromWindowSide = 10;
    const fromRect = this.panelOptions.from;
    const panelRect = getRefElementDOMRect(this, "panel");

    let defaultPosition: PanelDefaultPosition = this.panelOptions?.defaultPosition || PanelDefaultPosition.left;

    const defaultLeft = defaultPosition == PanelDefaultPosition.left
      ? Math.floor(fromRect.left)
      : Math.floor(fromRect.right - panelRect.width)

    const pos: Record<string, number> = {
      left: defaultLeft,
      top: Math.floor(fromRect.bottom + fromSpacing),
    };


    //TOP-BOTTOM
    if (panelRect.height + pos.top >= window.innerHeight) {

      // check if above if suitable
      if (pos.top - panelRect.height > spacingFromWindowSide) {
        //invert
        pos.top = undefined;
        pos.bottom = window.innerHeight - (fromRect.bottom - fromSpacing - fromRect.height);
      } else {
        // clip on top windows
        pos.top = spacingFromWindowSide;
      }
    }


    //:LEFT-RIGHT
    if (panelRect.width + pos.left >= (window.innerWidth - spacingFromWindowSide)) {
      // try align right of panel to right of button

      // pos.left = fromRect.right - panelRect.width;//window.innerWidth - panelRect.width;//
      pos.left = Math.min(fromRect.right - panelRect.width, (window.innerWidth - panelRect.width - spacingFromWindowSide));

      if (pos.left < 0) {
        pos.left = 0;
      }
    }



    this.position = {
      left: `${pos.left}px`,
      top: `${pos.top}px`,
      bottom: (pos.bottom) ? `${pos.bottom}px` : undefined,
    };
  }

  private mounted() {
    this.$nextTick(() => {
      if (!this.panelOptions?.showAsModal) {
        if (this.panelOptions.x && this.panelOptions.y) {
          this.calculatePositionFromXYCoordinate();
        } else {
          this.calculatePositionFromRect();
        }
      }
    });

  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.footer {
  border-top: solid 1px var(--c-base-200);
  margin-top: 15px;
  padding-top: 20px;
}

.settings-panel {
  width: min-content;
  //padding: 16px;
  //max-height: 95vh; // maximize height of panel, allowing for a scrollbar instead
  min-width: 230px;
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
    align-self: center;
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
