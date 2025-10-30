<template>
  <div class="dropdown" v-closable="close">
    <TickButton class="button" @click="click" :icon="icon" :disabled="disabled" :appearance="appearance" :color="color" :size="size">
      <slot />
    </TickButton>
    <TickButton class="dropper" @click="toggleOpen" ref="toggleButton" :disabled="disabled" :appearance="appearance" :color="color" :size="size">
      <TickIcon v-if="showChevron" class="chevron" :class="chevronClass" name="chevron-down" />
    </TickButton>
  </div>
</template>

<script lang="ts">
import { closable } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { computed } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import DropdownPanel, { DropdownActionButton } from "../panels/DropdownPanel.vue";
import TickIcon from "../TickIcon.vue";
import TickButton, { Appearance, Color, Size } from "./TickButton.vue";
import { DropdownOption } from "./TickDropdown.vue";
import TickInputLabel from "./TickInputLabel.vue";
import { PanelDefaultPosition, TickPanelOptions } from "./TickPanel.vue";

@Component({
  components: { TickButton, TickIcon, TickInputLabel },
  emits: ["click", "select", "action"],
  directives: { closable },
})
export default class TickComboButton extends Vue {

  @Prop({ default: [] }) private options!: DropdownOption[];
  @Prop({ default: false }) private disabled: boolean;
  @Prop({ default: "" }) private icon: string;
  @Prop({ default: false }) private asButton: boolean;
  @Prop({ default: [] }) private actionButtons!: DropdownActionButton[];
  @Prop({ default: false }) private allowAsSubDialog: boolean;
  @Prop() private appearance: Appearance;
  @Prop() private color: Color;
  @Prop() private size: Size;

  private showOpen = false;
  private activePanel = "";

  private click() {
    this.$emit("click");
  }


  private get chevronClass() {
    return this.showOpen ? "open" : "closed";
  }

  private get showChevron() {
    return !this.asButton;
  }

  private close() {
    this.showOpen = false;
  }

  private toggleOpen() {
    this.showOpen = !this.showOpen;
    this.togglePanel();
  }

  private selectAction(option: DropdownActionButton) {
    this.$emit("action", option);
    this.close();
  }

  private selectOption(option: DropdownOption) {
    this.$emit("select", option.id, option);
    this.close();
  }

  private togglePanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.disabled) {
      return;
    }

    if (this.activePanel) {
      return;
    }
    const panelOptions: TickPanelOptions = {
      title: "DropdownPanel",
      from: getRefElementDOMRect(this, "toggleButton"),
      allowAsSubDialog: this.allowAsSubDialog,
      defaultPosition: PanelDefaultPosition.right,
      offset_Y: -1,
    }

    this.activePanel = mount(DropdownPanel, {
      props: {
        panelOptions: panelOptions,
        actionButtons: this.actionButtons,
        modelValue: computed(() => ""),
        title: "",
        noTitle: true,
        noFilter: true,
        options: this.options,
        noresults: "",
      },
      events: {
        close: () => {
          this.closePanel();
        },
        action: (to: DropdownActionButton) => {
          this.selectAction(to);
        },
        "update:modelValue": (to: DropdownOption) => {
          //this.$emit("update:modelValue", to);
          this.selectOption(to);
        },
      },
    });
  }

  private closePanel() {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";
  }

}
</script>
<style lang="scss" scoped>
@import "@/styles/theme";

.dropdown {

  //position: relative;
  display: flex;
  flex-wrap: nowrap;

  .button {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .dropper {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }


  .chevron {
    margin-left: 5px;
    height: 13px;

    &.open {
      transform: rotate(-180deg);
      transition: transform 150ms ease;
    }

    &.closed {
      transform: rotate(-360deg);
      transition: transform 150ms ease;
    }
  }


}
</style>
