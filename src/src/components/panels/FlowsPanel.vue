<template>
  <TickSettingsPanel :panelOptions="panelOptions" class="flows-panel" @close="close">
    <template #title> {{ $translate(LanguagePath.Flows) }} </template>

    <div class="content">
      <template v-if="allowedView">
        <template v-if="allFlows.length">
          <TickInput class="filter-input" v-model="filterText" v-focus :placeholder="$translate(LanguagePath.App_Search)" />
          <div class="flows-list">
            <button class="flow-item" :class="{ 'highlighted': this.isHighlighted(index) }" v-for="(flow, index) in this.reducedFilteredFlows" :key="flow.id" @click="selectFlow(flow.id)">
              <TickIcon name="flow" class="flow-icon" />
              <span class="name">{{ flow.name }}</span>
              <TickIcon name="play" class="play-icon" />
            </button>
            <PanelReduceSwitch :reduce="reduceFlowResults" @toggle=this.toggleReduceFlows :nrHidden="nrOfHiddenFlows" :totalCount="filteredFlows.length" :maxNrOfItems="maxNrOfItems" />
          </div>
        </template>
        <template v-else>
          <div class="no-data"> {{ this.noFlowsMessage }}</div>
        </template>
      </template>

      <template v-else>
        <SalesUpSellViaFeatureBlock @close="close" :type="SubscriptionCostItemType.Flow" />
      </template>
    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import useUtilityDataStore from "@/store/utilitydata";
import { smartFilter } from "@/helpers/arrayHelper";
import PanelReduceSwitch from "./PanelReduceSwitch.vue";
import { LanguagePath, SubscriptionCostItemType, TickFlowDefinitionSummary } from "@/TickApi";
import keyboard from "@/helpers/keyboard";
import useUserStore from "@/store/user";
import SalesUpSellViaFeatureBlock from "../molecules/sales/SalesUpSellViaFeatureBlock.vue";
import { translate } from "@/plugins/translatePlugin";

@Component({
  directives: { focus },
  emits: ["update:modelValue", "close"],
  components: {
    TickSettingsPanel,
    TickInput,
    TickIcon,
    PanelReduceSwitch,
    SalesUpSellViaFeatureBlock
  },
})
export default class FlowsPanel extends Vue {
  SubscriptionCostItemType = SubscriptionCostItemType;
  LanguagePath = LanguagePath

  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private allowNonProduction: boolean;
  @Prop() private disableIds: string[];

  private filterText = "";
  private keyboardId!: number;
  private highlightedIndex = -1; // -1 is no highlight

  private get allowedView() {
    return useUserStore().allowedInPlan(SubscriptionCostItemType.Flow);
  }

  private close() {
    this.$emit('close')
  }
  private isHighlighted(index: number): boolean {
    return this.highlightedIndex == index;
  }
  private setHighLightIndex(newIndex: number) {
    this.highlightedIndex = newIndex;

    if (this.highlightedIndex < -1) { this.highlightedIndex = this.reducedFilteredFlows.length - 1; }
    if (this.highlightedIndex > this.reducedFilteredFlows.length - 1) {
      this.highlightedIndex = 0;  // back to first item in list
    }
  }

  private mounted() {

    this.keyboardId = keyboard.on("Down", () => {
      this.setHighLightIndex(this.highlightedIndex + 1);
    },
      { ignoreInputFieldEvents: false });

    this.keyboardId = keyboard.on("Up", () => {
      this.setHighLightIndex(this.highlightedIndex - 1);
    },
      { ignoreInputFieldEvents: false });


    this.keyboardId = keyboard.on("Enter", () => {
      let selectedIndex = this.highlightedIndex;
      if (selectedIndex == -1) { selectedIndex = 0; }

      this.selectFlow(this.reducedFilteredFlows[selectedIndex].id);
    },
      { ignoreInputFieldEvents: false });

  }

  private beforeUnmount() {
    keyboard.off(this.keyboardId);
  }

  private get noFlowsMessage() {

    if (this.allowNonProduction) {
      return translate(LanguagePath.App_FlowsPanel_NoData);
    } else {
      return translate(LanguagePath.App_FlowsPanel_NoData);
    }

  }

  private get allFlows(): TickFlowDefinitionSummary[] {

    const prodEnvironment = useUtilityDataStore().utilityData.executionEnvironments.find(p => p.isProduction);

    return useUtilityDataStore().utilityData.flowDefinitions.filter(
      (f) => (!this.disableIds || !this.disableIds.some(p => p == f.id)) && (prodEnvironment == null || this.allowNonProduction || f.activeInExecutionEnvironmentIds.some(p => p == prodEnvironment.id))
    );

  }

  private selectFlow(to: string) {
    this.$emit("update:modelValue", to);
    this.$emit("close");
  }

  private maxNrOfItems = 10;
  private reduceFlowResults = true;

  private toggleReduceFlows() {
    this.reduceFlowResults = !this.reduceFlowResults;
  }
  private get nrOfHiddenFlows() {
    return this.filteredFlows.length - this.reducedFilteredFlows.length;
  }

  private get reducedFilteredFlows() {
    if (!this.reduceFlowResults) { return this.filteredFlows; }
    const items = this.filteredFlows;
    return items.slice(0, this.maxNrOfItems);
  }

  private get filteredFlows() {
    return smartFilter(this.filterText, this.allFlows, {
      filterProps: ['name'],
    })

  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.no-data {
  font-style: italic;
  width: 240px;
  height: 100px;
  opacity: 0.7;

  display: grid;
  justify-content: center;
  align-content: center;
}

.flows-list {
  width: 100%;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flow-icon {
  color: var(--c-yellow-neon);
}

.play-icon {
  opacity: 0.6;
  transition: opacity 200ms ease;
}

.flow-item {
  display: flex;
  align-items: center;
  line-height: 16px;
  padding: 12px 8px;
  gap: 8px;
  width: calc(100% + 8px);
  transition: background-color 200ms ease;
  margin: 0 -4px;
  border-radius: 4px;

  .name {
    display: block;
    flex-grow: 1;
  }

  &:hover {
    color: var(--c-contrast);
    background-color: var(--c-base-300);

    .play-icon {
      opacity: 1;
    }
  }

  &.highlighted {
    color: var(--c-contrast);
    background-color: var(--c-base-200);
  }


}
</style>
