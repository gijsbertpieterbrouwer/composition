<template>
  <TickInputLabel>
    <slot />
    <div class="dropdown" v-closable="close">
      <TickButton class="button" @click="toggleOpen" ref="toggleButton" :indicator="indicator" :icon="icon" :class="buttonClass" :disabled="disabled" :appearance="appearance" :color="color"
        :size="size" :round="round">
        <slot name="content" />{{ this.placeholder }}
        <TickIcon v-if="showChevron" class="chevron" :class="chevronClass" name="chevron-down" />
      </TickButton>
    </div>
  </TickInputLabel>
</template>

<script lang="ts">
import { closable } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { translate } from "@/plugins/translatePlugin";
import { LanguagePath } from "@/TickApi";
import { computed } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import DropdownPanel, { DropdownActionButton } from "../panels/DropdownPanel.vue";
import TickIcon from "../TickIcon.vue";
import TickButton, { Appearance, Color, Size } from "./TickButton.vue";
import { TickIndicatorData } from "./TickIndicator.vue";
import TickInputLabel from "./TickInputLabel.vue";
import { TickPanelOptions } from "./TickPanel.vue";

export enum DropdownOptionType {
  normal = 0,
  spacer = 1,
}

export interface DropdownOption {
  type?: DropdownOptionType;
  id: string | number;
  icon?: string;
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  onSelect?: () => void;
}

@Component({
  components: { TickButton, TickIcon, TickInputLabel },
  emits: ["select", "action"],
  directives: { closable },
})
export default class TickDropdown extends Vue {


  @Prop({ default: [] }) private options!: DropdownOption[];
  @Prop({ default: "" }) private placeholder!: string;
  @Prop() private noresults!: string;
  @Prop() private dropdownTitle!: string;
  @Prop({ default: false }) private disabled: boolean;
  @Prop({ default: false }) private noFilter: boolean;
  @Prop({ default: "" }) private class: string;
  @Prop({ default: "" }) private icon: string;
  @Prop({ default: false }) private asButton: boolean;
  @Prop({ default: [] }) private actionButtons!: DropdownActionButton[];
  @Prop({ default: false }) private allowAsSubDialog: boolean;
  @Prop({ default: false }) private round: boolean;
  @Prop() private appearance: Appearance;
  @Prop() private color: Color;
  @Prop() private size: Size;
  @Prop() private indicator?: TickIndicatorData;

  private showOpen = false;
  private activePanel = "";

  private get buttonClass() {
    return this.class;
  }

  private get noResultsTitle(): string {
    return this.noresults || translate(LanguagePath.APP_TickDropdown_NoResults_Title)
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
    }

    this.activePanel = mount(DropdownPanel, {
      props: {
        panelOptions: panelOptions,
        actionButtons: this.actionButtons,
        modelValue: computed(() => ""),
        title: this.dropdownTitle || translate(LanguagePath.Select),
        noFilter: this.noFilter,
        options: this.options,
        noresults: this.noResultsTitle,
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
  position: relative;
  display: inline-block;

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
