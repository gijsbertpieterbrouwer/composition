<template>
  <TickSettingsPanel :panelOptions="panelOptions" class="flows-panel" @close="$emit('close')">
    <template #title>{{ $translate(LanguagePath.Flows) }}</template>

    <div class="content">
      <div class="title">{{ $translate(LanguagePath.App_ActiveFlowPanel_Title) }}</div>
      <div class="flow-item">
        <TickIcon name="flow" class="flow-icon" />
        <span class="name">{{ this.flow.name }}</span>
      </div>
      <div class="button-bar">
        <TickButton :size="ButtonSize.mini" :appearance="ButtonAppearance.secondary" :color="ButtonColor.contrast" @click="forceAbort">
          {{ $translate(LanguagePath.App_ActiveFlowPanel_ForceAbortFlow_Title) }}
        </TickButton>
      </div>
    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import { ComputedRef } from "vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import { LanguagePath } from "@/TickApi";
import TickButton, { Appearance as ButtonAppearance, Size as ButtonSize, Color as ButtonColor, } from "@/components/atoms/TickButton.vue";
import { focus } from "@/directives";
import useUtilityDataStore from "@/store/utilitydata";

@Component({
  directives: { focus },
  emits: ["update:modelValue", "close"],
  components: {
    TickSettingsPanel,
    TickInput,
    TickIcon,
    TickButton,
  },
})
export default class ActiveFlowPanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath;
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private modelValue!: ComputedRef<string>;

  private filterText = "";

  private get model() {
    return this.modelValue.value;
  }

  private get flow() {
    return useUtilityDataStore().utilityData.flowDefinitions.find(
      (f) => f.id === this.model
    ) || {};
  }

  private forceAbort() {
    this.$emit("update:modelValue", "");
    this.$emit("close");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 240px;
}

.flow-icon {
  color: var(--c-yellow-neon);
}

.title {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  letter-spacing: 0.04em;
  padding-bottom: 4px;
}

.flow-item {
  border-radius: 8px;
  display: flex;
  align-items: center;
  line-height: 16px;
  padding: 12px 8px;
  gap: 8px;
  width: calc(100% + 8px);
  margin: 0 -4px;
  background-color: var(--c-base-300);

  .name {
    display: block;
    flex-grow: 1;
  }
}

.button-bar {
  padding-top: 12px;
}
</style>
