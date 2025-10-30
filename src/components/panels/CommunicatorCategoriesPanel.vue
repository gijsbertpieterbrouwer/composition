<!-- Used for dropdown list selector -->

<template>
  <TickSettingsPanel :panelOptions="panelOptions" class="users-and-teams-panel" @close="close">
    <template #title>{{ this.titleText }}</template>

    <div class="content">
      <TickInput class="filter-input" v-model="filterText" v-focus :placeholder="$translate(LanguagePath.App_Search)" />

      <TickCommunicatorCategoryDisplay class="assignable" :class="{ 'highlighted': this.isHighlighted(index) }" :allowRemove="false" v-for="(category, index) in this.reducedFilteredItems"
        :key="category.id" :selected="model.indexOf(category.id) > -1" :category="category" @toggle="toggleItem" />

      <PanelReduceSwitch :reduce="reduceItemResults" @toggle=this.toggleReduce :nrHidden="nrOfHiddenItems" :totalCount="filteredItems.length" :maxNrOfItems="maxNrOfItems" />
    </div>

  </TickSettingsPanel>
</template>

<script lang="ts">
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickAssigneeDisplay from "@/components/molecules/TickAssigneeDisplay.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { smartFilter } from "@/helpers/arrayHelper";
import keyboard from "@/helpers/keyboard";
import useUtilityDataStore from "@/store/utilitydata";
import { AssigneeTypeEnum, LanguagePath } from "@/TickApi";
import { ComputedRef } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickCommunicatorCategoryDisplay from "../molecules/communicator/TickCommunicatorCategoryDisplay.vue";
import PanelReduceSwitch from "./PanelReduceSwitch.vue";

@Component({
  directives: { focus },
  emits: ["update:modelValue", "close"],
  components: {
    TickSettingsPanel,
    TickAssigneeDisplay,
    TickInput,
    PanelReduceSwitch,
    TickCommunicatorCategoryDisplay
  },
})
export default class CommunicatorCategoriesPanel extends Vue {
  AssigneeTypeEnum = AssigneeTypeEnum;
  @Prop() private title: string;
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private modelValue!: ComputedRef<string[]>;
  @Prop() private closeAfterSelect: boolean;

  LanguagePath = LanguagePath
  private filterText = "";
  private maxNrOfItems = 5;
  private reduceItemResults = true;

  private keyboardId!: number;
  private highlightedIndex = -1; // -1 is no highlight

  private setHighLightIndex(newIndex: number) {
    this.highlightedIndex = newIndex;

    if (this.highlightedIndex < -1) { this.highlightedIndex = this.reducedFilteredItems.length - 1; }
    if (this.highlightedIndex > this.reducedFilteredItems.length - 1) {
      this.highlightedIndex = 0;  // back to first item in list
    }
  }


  mounted() {
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

      this.toggleItem(this.reducedFilteredItems[selectedIndex].id);
    },
      { ignoreInputFieldEvents: false });


  }

  beforeUnmount() {
    keyboard.off(this.keyboardId);
  }


  private isHighlighted(index: number): boolean {
    return this.highlightedIndex == index;
  }

  private toggleReduce() {
    this.reduceItemResults = !this.reduceItemResults;
  }


  private get titleText() {
    return this.title || "Categories"
  }

  private get model() {
    return this.modelValue.value || [];
  }

  private get nrOfHiddenItems() {
    return this.filteredItems.length - this.reducedFilteredItems.length;
  }


  private get reducedFilteredItems() {
    if (!this.reduceItemResults) { return this.filteredItems; }

    const items = this.filteredItems;
    return items.slice(0, this.maxNrOfItems);
  }


  private get filteredItems() {
    const items = smartFilter(this.filterText, this.allCategories, {
      filterProps: ['name'],
    });


    return items;
  }

  private get allCategories() {
    const items = useUtilityDataStore().utilityData.communicatorCategoryDefinitions || []
    return items;
  }


  private close() {
    this.$emit('close');
  }

  private toggleItem(id: string) {
    if (this.model.includes(id)) {
      this.setCategories(
        this.model.slice().filter((l) => l !== id)
      );
    } else {
      this.setCategories(
        [...this.model.slice(), id]
      );
    }
  }

  private setCategories(toIds: string[]) {
    this.$emit("update:modelValue", toIds);

    if (toIds.length) {
      if (this.closeAfterSelect) {
        this.close();
      }
    }
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.assignable {
  width: 100%;

  &.highlighted {
    background-color: var(--c-base-200);
  }
}

.moreitems-message {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  font-style: italic;
}

.title {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  letter-spacing: 0.04em;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
