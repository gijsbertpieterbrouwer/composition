<template>
  <TickInputLabel>
    <slot />
    <div class="dropdown" v-closable="close">
      <button @click="toggleOpen" ref="toggleButton" :icon="icon" :disabled="disabled" :appearance="appearance" :class="[this.colorName, { 'has-color': this.hasColor }]" :size="size">{{
        this.placeholder }}
        <TickIcon v-if="showChevron" class="chevron" :class="chevronClass" name="chevron-down" />
      </button>
    </div>
  </TickInputLabel>
</template>

<script lang="ts">
import { Component, Prop, VModel, Vue } from "vue-facing-decorator";
import TickButton, { Appearance, Size } from "@/components/atoms/TickButton.vue";
import { closable } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import { getColorName, getColorOptionsForUI } from "@/helpers/colorsHelper";
import { ColorsEnum, LanguagePath } from "@/TickApi";
import TickInputLabel from "@/components/atoms/TickInputLabel.vue";
import ColorsPanel from "@/components/panels/ColorsPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { translate } from '@/plugins/translatePlugin';

@Component({
  components: { TickButton, TickIcon, TickInputLabel },
  emits: ["select", "action"],
  directives: { closable },
})
export default class TickColorSelector extends Vue {
  @VModel({ required: true }) private value!: ColorsEnum;

  @Prop({ default: "" }) private placeholder!: string;
  @Prop() private dropdownTitle!: string;
  @Prop({ default: false }) private disabled: boolean;
  @Prop({ default: "" }) private icon: string;
  @Prop() private appearance: Appearance;
  @Prop() private size: Size;
  @Prop() private allowAsSubDialog: boolean;

  private colorOptions: ColorsEnum[][] = getColorOptionsForUI();
  private showOpen = false;
  private activePanel = "";

  private get formattedDropdownTitle() {
    return this.dropdownTitle || translate(LanguagePath.Select)
  }


  private get model() {
    return this.value;
  }


  private set model(to: ColorsEnum) {
    this.$emit("update:modelValue", to);
  }

  private get colorName() {
    return getColorName(this.model);
  }

  private get hasColor() {
    return this.model != null && this.model != ColorsEnum.Grey;
  }



  private get chevronClass() {
    return this.showOpen ? "open" : "closed";
  }

  private get showChevron() {
    return false;
  }

  private close() {
    this.showOpen = false;
  }

  private toggleOpen() {
    this.showOpen = !this.showOpen;
    this.togglePanel();
  }


  private selectOption(option?: ColorsEnum) {
    this.model = option;
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
      title: "ColorsPanel",
      from: getRefElementDOMRect(this, "toggleButton"),
      allowAsSubDialog: this.allowAsSubDialog,
    }

    this.activePanel = mount(ColorsPanel, {
      props: {
        panelOptions: panelOptions,
        title: this.formattedDropdownTitle,
        selected: this.model,
      },
      events: {
        close: () => {
          this.closePanel();
        },
        select: (c?: ColorsEnum) => {
          this.selectOption(c);
          this.closePanel();
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

button {
  @include neon-bg;
  border-radius: 6px;
  display: flex;
  gap: 5px;
  font-size: $text-size-regular;
  line-height: 20px;
  transition: all 100ms ease-in;
  align-items: center;
  justify-items: center;

  min-width: 20px;
  min-height: 20px;

  width: 48px;
  border-radius: 4px;

  background-color: var(--c-base-100);

  &:not(.has-color) {
    border: 1px solid var(--c-contrast-200);
  }
}


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

  .dropdown-area {
    position: absolute;
    overflow: auto;

    background-color: var(--c-base);
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;

    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
    min-width: 200px;
    padding: 10px;
    right: 0px;
    font-size: $text-size-regular;

    .option {
      padding: 10px;
      min-height: 32px;
      display: block;
      width: 100%;
      text-align: left;

      &:not(:last-child) {
        border-bottom: solid 1px #ccc;
      }

      &:hover {
        background-color: var(--button-hover-back);
      }
    }

    .no-results {
      font-style: italic;
    }
  }
}
</style>
