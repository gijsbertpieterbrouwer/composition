<template>
  <TickSettingsPanel :showFooter="showAdd" :panelOptions="panelOptions" class="labels-panel" @close="close">
    <template #title>{{ this.title }}</template>
    <template #actions>
      <TickButton v-if="allowAdd" @click="toggleAdd" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini">{{ this.toggleAddButton }}</TickButton>
    </template>
    <template #footer>
      <TickButton :busy="busyAdding" @click="add" :appearance="Appearance.primary" :color="Color.secondary" :size="Size.regular" :disabled="!readyForAdding">{{
        $translate(LanguagePath.App_Create)
      }}</TickButton>
    </template>

    <div class="content">
      <template v-if="showAdd">
        <div class="preview-panel">
          <TickLabel class="previewLabel" :size="LabelSize.large" :allowRemove="false" :disableCollapse="true" :disableToggle="true" :color="newColor" :name="newName" />
        </div>

        <TickInput class="name" v-model="newName" v-focus @keyup="newLabelKeyup" :placeholder="$translate(LanguagePath.App_Name)" :maxlength="40">{{ $translate(LanguagePath.App_Title) }}
        </TickInput>
        <TickColorsSwatch @select="selectNewColor" :selected="newColor" />

      </template>
      <template v-else>
        <TickInput class="filter-input" v-model="filterText" v-focus :placeholder="$translate(LanguagePath.App_Search)" />
        <div class="labels-list">
          <TickLabelDisplay class="label" :class="{ 'highlighted': this.isHighlighted(index) }" v-for="(label, index) in this.reducedFilteredLabels" :key="label.id" :label="label"
            :selected="model.indexOf(label.id) > -1" @toggle="toggleLabel" />
          <PanelReduceSwitch :reduce="reduceLabelResults" @toggle=this.toggleReduceLabels :nrHidden="nrOfHiddenLabels" :totalCount="filteredLabels.length" :maxNrOfItems="maxNrOfItems" />
        </div>

      </template>


    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import TickLabel, { Size as LabelSize } from "@/components/atoms/TickLabel.vue";
import { ComputedRef } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";

import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickLabelDisplay from "@/components/molecules/TickLabelDisplay.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { smartFilter } from "@/helpers/arrayHelper";
import { getColorName, getColorOptionsForUI } from "@/helpers/colorsHelper";
import keyboard from "@/helpers/keyboard";
import { translate } from "@/plugins/translatePlugin";
import useManagingStore from "@/store/managingStore";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { AuthorizationObjectType, ColorsEnum, LanguagePath } from "@/TickApi";
import TickColorsSwatch from "../atoms/TickColorsSwatch.vue";
import TickSelector from "../atoms/TickSelector.vue";
import PanelReduceSwitch from "./PanelReduceSwitch.vue";

// interface colorOption {
//   text: string,
//   value: ColorsEnum,
//   colorName: string,
//   selected: boolean,
// }

@Component({
  directives: { focus },
  emits: ["update:modelValue", "close"],
  components: {
    TickSettingsPanel,
    TickLabelDisplay,
    TickInput,
    PanelReduceSwitch,
    TickButton,
    TickSelector,
    TickLabel,
    TickColorsSwatch
  },
})
export default class LabelsPanel extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LabelSize = LabelSize
  LanguagePath = LanguagePath

  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private modelValue!: ComputedRef<string[]>;

  private resetColorValue = ColorsEnum.Yellow;
  private filterText = "";
  private showAdd = false

  private newName = "";
  private newColor = ColorsEnum.Yellow;
  private busyAdding = false;

  private colorOptions: ColorsEnum[][] = getColorOptionsForUI();


  private keyboardId!: number;
  private highlightedIndex = -1; // -1 is no highlight


  private close(byKeyboard: boolean) {
    this.$emit("close", byKeyboard);
  }

  private isHighlighted(index: number): boolean {
    return this.highlightedIndex == index;
  }
  private setHighLightIndex(newIndex: number) {
    if (this.showAdd) { return; }
    this.highlightedIndex = newIndex;

    if (this.highlightedIndex < -1) { this.highlightedIndex = this.reducedFilteredLabels.length - 1; }
    if (this.highlightedIndex > this.reducedFilteredLabels.length - 1) {
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
      if (this.showAdd) { return; }
      let selectedIndex = this.highlightedIndex;
      if (selectedIndex == -1) { selectedIndex = 0; }

      this.toggleLabel(this.reducedFilteredLabels[selectedIndex].id);
    },
      { ignoreInputFieldEvents: false });

  }

  private beforeUnmount() {
    keyboard.off(this.keyboardId);
  }


  private colorIsSelected(c: ColorsEnum) {
    return this.newColor == c;
  }

  private removeColor() {
    this.newColor = ColorsEnum.Grey;
  }

  private getColorName(c: ColorsEnum) {
    return getColorName(c);
  }

  private get readyForAdding() {
    return !this.busyAdding;
  }

  private get title() {
    return this.showAdd ? translate(LanguagePath.App_Add) : translate(LanguagePath.Labels)
  }

  private get allowAdd() {
    return useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration);
  }


  private selectNewColor(color?: ColorsEnum) {
    this.newColor = color;
  }

  private get toggleAddButton() {
    return this.showAdd ? translate(LanguagePath.App_Cancel) : translate(LanguagePath.App_Add);
  }
  private toggleAdd() {
    this.showAdd = !this.showAdd
  }

  private newLabelKeyup(e: KeyboardEvent) {
    switch (e.key) {
      case "Enter":
        this.add();
        break;
    }
  }

  private add() {
    if (this.busyAdding) { return; }
    this.busyAdding = true;
    const selectedColor = this.newColor

    useManagingStore().addLabel(this.newName || translate(LanguagePath.Label), selectedColor).then((newLabel) => {
      this.toggleLabel(newLabel.id);

    }).finally(() => {
      this.resetAdd();
    });
  }

  private resetAdd() {
    this.showAdd = false;
    this.newName = "";
    this.newColor = ColorsEnum.Grey;
    this.busyAdding = false;
  }

  // private get labelColorOptions() {
  //   const colors = Object.keys(ColorsEnum).filter((v) => isNaN(Number(v)));
  //   const list = colors.map((c) => ({
  //     text: c,
  //     value: (ColorsEnum as any)[c],
  //   }));

  //   return list;
  // }

  private get model() {
    return this.modelValue.value;
  }

  private maxNrOfItems = 10;
  private reduceLabelResults = true;

  private toggleReduceLabels() {
    this.reduceLabelResults = !this.reduceLabelResults;
  }
  private get nrOfHiddenLabels() {
    return this.filteredLabels.length - this.reducedFilteredLabels.length;
  }

  private get reducedFilteredLabels() {
    if (!this.reduceLabelResults) { return this.filteredLabels; }
    const items = this.filteredLabels;
    return items.slice(0, this.maxNrOfItems);
  }

  private get filteredLabels() {
    const allLabels = this.allLabels.sort((a, b) => a.name ? a.name.localeCompare(b.name) : 0)

    if (this.filterText) {

      return smartFilter(this.filterText, allLabels, {
        filterProps: ['name'],
      })


    } else {
      return allLabels;
    }

  }

  private get allLabels() {
    return useUtilityDataStore().utilityData.labelDefinitions.filter(p => !p.deleted);
  }

  private toggleLabel(id: string) {

    if (!id) { return; }
    if (this.model.includes(id)) {
      this.setLabels(this.model.slice().filter((l) => l !== id));
    } else {
      this.setLabels([...this.model.slice(), id]);
    }
  }


  private setLabels(to: string[]) {
    this.$emit("update:modelValue", to);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.label {
  width: 100%;

  &.highlighted {
    color: var(--c-contrast);
    background-color: var(--c-base-200);
  }
}


.labels-list {
  width: 100%;
}

.preview-panel {
  display: grid;
  align-content: center;
  justify-content: center;
  height: 75px;
  background-color: var(--c-base-300);
  padding-left: 10px;

  .previewLabel {
    width: 240px;
    display: block;
  }

}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;

}

.colors-wrapper {
  display: flex;
  gap: 7px;
  max-width: 300px;
  flex-wrap: wrap;

  .color-selector {
    @include neon-bg;
    height: 32px;
    width: 48px;
    border-radius: 4px;

    &.selected {
      outline-width: 2px;
      outline-style: solid;
      outline-color: var(--c-contrast);
    }


  }
}
</style>
