<template>
  <TickInputLabel>
    <slot />
    <button class="toggle-button" ref="toggleButton" @click="togglePanel" :disabled="disabled">
      <CommunicatorCategoryLabel v-for="id in this.categoryIds" :key="id" :categoryId="id" />

      <div class="empty-placeholder" v-if="!hasCategories">
        {{ this.formattedEmptyLabel }}
      </div>
    </button>
  </TickInputLabel>
</template>

<script lang="ts">
import TickInputLabel from "@/components/atoms/TickInputLabel.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import CommunicatorCategoriesPanel from "@/components/panels/CommunicatorCategoriesPanel.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { translate } from '@/plugins/translatePlugin';
import useUtilityDataStore from "@/store/utilitydata";
import { LanguagePath } from "@/TickApi";
import { computed } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import CommunicatorCategoryLabel from "../communicator/CommunicatorCategoryLabel.vue";
@Component({
  emits: ["update:modelValue"],
  components: {
    CommunicatorCategoryLabel, TickInputLabel
  },
})
export default class CommunicatorCategoriesSelector extends Vue {
  @Prop() private modelValue: string[];
  @Prop() private title: string;
  @Prop() private disabled: boolean;
  @Prop({ default: "" }) private emptyLabel: string;
  @Prop() private closeAfterSelect: boolean;
  @Prop() private allowAsSubDialog: boolean;
  private activePanel = "";

  private get formattedEmptyLabel() {
    return this.emptyLabel || translate(LanguagePath.CommunicatorCategories)
  }

  private get hasCategories(): boolean {
    return this.categoryIds.length >= 1;
  }


  private get availableCategories() {
    const list = useUtilityDataStore().utilityData.communicatorCategoryDefinitions
      .sort(({ weight: a }, { weight: b }) => a - b);
    return list;
  }

  private get categoryIds() {
    return this.modelValue.filter(p => this.availableCategories.some(a => a.id == p)) || [];
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
      title: "CommunicatorCategoriesPanel",
      allowAsSubDialog: this.allowAsSubDialog,
      from: getRefElementDOMRect(this, "toggleButton")
    }

    this.activePanel = mount(CommunicatorCategoriesPanel, {
      props: {
        panelOptions: panelOptions,
        closeAfterSelect: this.closeAfterSelect,
        modelValue: computed(() => this.categoryIds),
        title: this.title,
      },
      events: {
        close: () => {
          this.closePanel();
        },
        "update:modelValue": (to: string[]) => {
          this.$emit("update:modelValue", to);
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

.toggle-button {
  padding: 4px;
  border-radius: 2px;
  min-height: 32px;
  transition: background-color 200ms ease;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;

  &[disabled] {
    opacity: 0.5;
    filter: grayscale(50);
  }

  &:hover:not([disabled]) {
    background-color: var(--c-base-300);
  }


  .empty-placeholder {
    min-width: 80px;
    justify-content: center;
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
