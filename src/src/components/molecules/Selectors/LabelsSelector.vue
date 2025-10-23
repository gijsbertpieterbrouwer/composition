<template>
  <div class="labels-selector">
    <button class="toggle-button" ref="toggleButton" @click="togglePanel" :disabled="disabled">
      <LabelList :labels="labels" :disableCollapse="true" :hideGrey="hideGrey" :emptyLabel="emptyLabel" />
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickIcon from "@/components/TickIcon.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import BusyIndicator from "@/components/atoms/BusyIndicator.vue";
import LabelList from "@/components/atoms/LabelList.vue";
import LabelsPanel from "@/components/panels/LabelsPanel.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { TickLabelDefinition } from "@/TickApi";
import { computed } from "vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import useUtilityDataStore from "@/store/utilitydata";

@Component({
  components: { LabelList, TickIcon, TickCheckbox, BusyIndicator },
  emits: ["update:modelValue"],
})
export default class LabelsSelector extends Vue {
  @Prop() private modelValue!: string[];
  @Prop() private disabled: boolean;
  @Prop() private hideGrey: boolean;
  @Prop() private emptyLabel: boolean;
  @Prop() private allowAsSubDialog: boolean;
  private activePanel = "";

  private get labels() {
    const allLabels = useUtilityDataStore().utilityData.labelDefinitions || [];
    const ticketLabels: TickLabelDefinition[] = [];

    for (let i = 0; i < (this.modelValue || []).length; i++) {
      let label = allLabels.find((l) => l.id == this.modelValue[i]);

      const alreadyInList = ticketLabels.some(p => p.id == label?.id);
      if (label && !alreadyInList) {
        ticketLabels.push(label);
      }
    }
    return ticketLabels;
  }

  private set labels(to) {
    if (this.disabled == true) { return; }
    this.$emit("update:modelValue", to.map((l) => l.id));
  }

  private togglePanel() {
    if (this.disabled == true) { return; }

    if (this.activePanel) {
      this.closePanel(false);
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.activePanel) {
      return;
    }
    // const control = getRefElement(this, "toggleButton");
    // const rect = control.getBoundingClientRect();

    const panelOptions: TickPanelOptions = {
      title: "LabelsSelector",
      from: getRefElementDOMRect(this, "toggleButton"),
      allowAsSubDialog: this.allowAsSubDialog,
    }

    this.activePanel = mount(LabelsPanel, {
      props: {
        panelOptions: panelOptions,
        modelValue: computed(() => this.modelValue),
      },
      events: {
        close: (byKeyboard: boolean) => {
          this.closePanel(byKeyboard);
        },
        "update:modelValue": (to: string[]) => {
          this.$emit("update:modelValue", to);
        },
      },
    });
  }

  private closePanel(byKeyboard: boolean) {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";

    if (byKeyboard == true) {
      (this.$refs.toggleButton as HTMLElement)?.focus();
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.toggle-button {
  padding: 8px 4px;
  border-radius: 2px;
  min-height: 32px;
  transition: background-color 200ms ease;

  &:not(:disabled):hover {
    background-color: var(--c-base-200);
  }


}
</style>
