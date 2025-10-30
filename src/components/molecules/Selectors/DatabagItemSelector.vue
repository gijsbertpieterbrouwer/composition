<template>
  <TickInputLabel>
    <slot />
    <div class="holder">
      <TickButton :title="$translate(LanguagePath.App_DatabagSelector_Button_Tooltip)" class="databagitem" icon="databagitem" @click.stop="togglePanel" v-if="allowCustomValue"
        :appearance="Appearance.secondary" :color="Color.contrast" :round="false" :size="Size.regular" />
      <TickInput :title="$translate(LanguagePath.App_DatabagSelector_Input_Tooltip)" :placeholder="placeHolderText" v-model="inputValue" class="toggle-button" ref="toggleButton" @click="clickInput"
        :disabled="disabled">
      </TickInput>
    </div>
  </TickInputLabel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";

import { computed } from "vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import { stringIsNullOrEmpty } from "@/helpers/stringHelper";
import DatabagItemsPanel from "@/components/panels/DatabagItemsPanel.vue";
import { LanguagePath, StorageLocation } from "@/TickApi";
import TickInput from "@/components/atoms/TickInput.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickInputLabel from "@/components/atoms/TickInputLabel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { translate } from "@/plugins/translatePlugin";

@Component({
  emits: ["update:modelValue"],
  components: {
    TickInput, TickButton, TickInputLabel
  },
})
export default class DatabagItemSelector extends Vue {
  Appearance = Appearance
  Size = Size
  Color = Color
  LanguagePath = LanguagePath

  @Prop() private modelValue: string;
  @Prop() private locations: StorageLocation[];
  @Prop() private defaultNewStorageLocation: StorageLocation;
  @Prop() private title: string;
  @Prop() private disabled: boolean;
  @Prop() private allowAsSubDialog: boolean;
  @Prop() private allowCustomValue: boolean;


  private activePanel = "";

  private get placeHolderText(): string {
    return this.allowCustomValue ?
      translate(LanguagePath.App_DatabagSelector_Input_AllowCustom_Placeholder)
      : translate(LanguagePath.App_DatabagSelector_Input_Placeholder);
  }

  private clickInput() {
    if (!this.allowCustomValue) { this.togglePanel(); }
  }

  private get inputValue() {
    return this.modelValue;
  }

  private set inputValue(to: string) {
    this.selectToken(to);
  }

  private selectToken(to: string) {
    this.$emit("update:modelValue", to);
  }

  private get hasValue() {
    return !stringIsNullOrEmpty(this.modelValue);
  }


  private togglePanel() {
    if (this.disabled) { return; }

    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private get tokenText() {
    return "{}"
  }

  private openPanel() {
    if (this.disabled) {
      return;
    }

    if (this.activePanel) {
      return;
    }
    const panelOptions: TickPanelOptions = {
      title: "DatabagItemsPanel",
      allowAsSubDialog: this.allowAsSubDialog,
      from: getRefElementDOMRect(this, "toggleButton")
    }

    const t = this.title;
    this.activePanel = mount(DatabagItemsPanel, {
      props: {
        panelOptions: panelOptions,
        modelValue: computed(() => this.modelValue),
        title: t,
        locations: this.locations,
        defaultNewStorageLocation: this.defaultNewStorageLocation
      },
      events: {
        close: () => {
          this.closePanel();
        },
        select: (to: string) => {
          this.selectToken(to);
        },

      },
      loadComponents: [TickSettingsPanel]
    });
  }

  private closePanel() {
    if (!this.activePanel) { return; }

    unmount(this.activePanel);
    this.activePanel = "";
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.holder {
  display: flex;
  gap: 5px;
  width: 100%;
  align-items: center;
}

.databagitem {
  width: 30px;
  height: 30px;
}

.toggle-button {
  padding: 4px;
  border-radius: 2px;
  min-height: 32px;
  transition: background-color 200ms ease;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-grow: 1;
  flex-wrap: wrap;
  @include neon-bg;


  &:hover:not([disabled]) {
    background-color: var(--c-base-200);
  }

  .empty-placeholder {
    padding: 0 4px;
    @include font-inter;
    font-weight: 500;
    letter-spacing: 0.02em;
    font-size: 10px;
    line-height: 16px;
    text-transform: capitalize;
    white-space: nowrap;

    border-radius: 2px;
    transition: all 0.3s ease;
    color: var(--c-contrast);
    display: inline-flex;
    gap: 4px;
    align-items: center;
    background-color: var(--c-base-300);

    .icon {
      width: 10px;
      height: 10px;
    }
  }
}
</style>
