<template>
  <div class="active-flow-selector">
    <button class="toggle-button" ref="toggleButton" @click="togglePanel" :class="{ 'flow-active': !!this.modelValue }" :disabled="disabled">
      <span class="flow-label flow-active" v-if="!!this.modelValue">
        <TickIcon class="icon" name="flow" />
        {{ $translate(LanguagePath.App_FlowSelector_HasActiveFlow) }}
      </span>
      <span class="flow-label no-flow-active" v-else>
        <TickIcon name="flow" class="icon" />
        {{ $translate(LanguagePath.App_FlowSelector_NoActiveFlow) }}
      </span>
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import TickIcon from "@/components/TickIcon.vue";
import FlowsPanel from "@/components/panels/FlowsPanel.vue";
import ActiveFlowPanel from "@/components/panels/ActiveFlowPanel.vue";
import { computed } from "vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import { LanguagePath } from "@/TickApi";

@Component({
  emits: ["update:modelValue"],
  components: {
    TickIcon, FlowsPanel
  },
})
export default class TicketActiveFlowSelector extends Vue {
  LanguagePath = LanguagePath
  @Prop() private modelValue!: string;
  @Prop() private disabled!: boolean;

  private activePanel = "";

  private togglePanel() {
    if (this.disabled) { return; }
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.activePanel) {
      return;
    }
    const panelOptions: TickPanelOptions = {
      title: "ActiveFlowPanel",
      from: getRefElementDOMRect(this, "toggleButton")
    }

    this.activePanel = mount(this.modelValue ? ActiveFlowPanel : FlowsPanel, {
      props: {
        allowNonProduction: false,
        panelOptions: panelOptions,
        modelValue: computed(() => this.modelValue),
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
  padding: 8px 4px;
  border-radius: 2px;
  height: 32px;
  transition: background-color 200ms ease;
  display: flex;



  &:not(:disabled):hover {
    background-color: var(--c-base-200);
  }

  &.flow-active {
    padding: 4px;
    border-radius: 99px;
  }
}

.flow-label {
  display: grid;
  place-items: center;
  line-height: 16px;
  font-weight: 500;
  border-radius: 99px;
  padding: 0 8px 0 6px;
  background-color: var(--c-base-300);

  &.flow-active {
    display: flex;
    gap: 4px;
    font-size: $text-size-regular;
    border: 2px solid var(--c-yellow-neon);
    color: var(--c-yellow-text);

    .icon {
      width: 12px;
      height: 12px;
    }
  }

  &.no-flow-active {
    font-size: 10px;

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
