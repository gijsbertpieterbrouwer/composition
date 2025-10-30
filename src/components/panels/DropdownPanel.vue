<template>
  <TickSettingsPanel class="dropdownpanel" :panelOptions="panelOptions" @close="$emit('close')">
    <template #title>{{ this.title }}</template>
    <template #actions>

      <TickButton v-for="action in this.actionButtons" :key="action.id" @click="selectAction(action)" :size="Size.mini" :color="Color.contrast" :appearance="Appearance.secondary"> {{ action.text
      }}
      </TickButton>


    </template>
    <div class="content">
      <TickInput class="filter-input" v-if="showFilter" v-model="filterText" v-focus :placeholder="$translate(LanguagePath.App_Search)" />
      <div class="no-results" v-if="!options || !this.options.length">{{ this.noresults }}</div>

      <div class="list">
        <template v-for="(item, index) in this.reducedFilteredItems" :key="item.id">
          <template v-if="item.type == DropdownOptionType.normal || !item.type">
            <button class="item" :class="{ 'highlighted': this.isHighlighted(index) }" @click="selectItem(item)">
              <TickIcon class="icon" v-if="item.icon" :name="item.icon" />
              <span class="name">{{ item.text }}</span>
            </button>
          </template>

          <template v-else>
            <div class="spacer"> <span class="name">{{ item.text }}</span></div>
          </template>
        </template>

        <PanelReduceSwitch :reduce="reduceLabelResults" @toggle=this.toggleReduceItems :nrHidden="nrOfHiddenItems" :totalCount="filteredItems.length" :maxNrOfItems="maxNrOfItems" />
      </div>
    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { smartFilter } from "@/helpers/arrayHelper";
import keyboard from "@/helpers/keyboard";
import { LanguagePath } from "@/TickApi";
import { ComputedRef } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickButton, { Appearance, Color, Size } from "../atoms/TickButton.vue";
import { DropdownOption, DropdownOptionType } from "../atoms/TickDropdown.vue";
import TickIcon from "../TickIcon.vue";
import PanelReduceSwitch from "./PanelReduceSwitch.vue";

export interface DropdownActionButton {
  id: string;
  text: string;
}


@Component({
  directives: { focus },
  emits: ["update:modelValue", "close", "action", "select"],
  components: {
    TickSettingsPanel,
    TickIcon,
    TickInput,
    PanelReduceSwitch,
    TickButton
  },
})
export default class DropdownPanel extends Vue {
  Size = Size;
  Color = Color;
  Appearance = Appearance;
  DropdownOptionType = DropdownOptionType;
  LanguagePath = LanguagePath
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop({ default: [] }) private options!: DropdownOption[];
  @Prop() private title!: string;
  @Prop() private noFilter!: boolean;
  @Prop() private modelValue!: ComputedRef<string>;
  @Prop({ default: "Nothing found" }) private noresults!: string;
  @Prop({ default: true }) private sort!: string;


  @Prop({ default: [] }) private actionButtons!: DropdownActionButton[];
  private filterText = "";

  private keyboardId!: number;
  private highlightedIndex = -1; // -1 is no highlight

  private isHighlighted(index: number): boolean {
    return this.highlightedIndex == index;
  }

  private get showFilter() {
    return !this.noFilter && (this.options && this.options.length);
  }

  private selectAction(action: DropdownActionButton) {

    this.$emit("action", action)
  }

  private get model() {
    return this.modelValue.value;
  }

  private maxNrOfItems = 15;
  private reduceLabelResults = true;

  private toggleReduceItems() {
    this.reduceLabelResults = !this.reduceLabelResults;
  }
  private get nrOfHiddenItems() {
    return this.filteredItems.length - this.reducedFilteredItems.length;
  }

  private get reducedFilteredItems() {
    if (!this.reduceLabelResults) { return this.filteredItems; }
    const items = this.filteredItems;
    return items.slice(0, this.maxNrOfItems);
  }

  private get filteredItems() {
    const allItems = this.allItems

    if (this.filterText) {

      return smartFilter(this.filterText, allItems, {
        filterProps: ['text'],
      })

    } else {
      return allItems;
    }

  }

  private get allItems() {
    return this.options;
  }


  private selectItem(to: DropdownOption) {
    if (to.onSelect) { to.onSelect(); }
    this.$emit("update:modelValue", to);
    this.$emit("select", to);
    this.$emit("close");
  }

  private setHighLightIndex(newIndex: number) {
    this.highlightedIndex = newIndex;

    if (this.highlightedIndex < -1) { this.highlightedIndex = this.reducedFilteredItems.length - 1; }
    if (this.highlightedIndex > this.reducedFilteredItems.length - 1) {
      this.highlightedIndex = 0;  // back to first item in list
    }
  }

  // private keyup(e: KeyboardEvent) {
  //   switch (e.key) {
  //     case "Enter":
  //       if (this.filteredItems.length === 1) {
  //         this.selectItem(this.filteredItems[0]);
  //       }
  //       break;
  //   }
  // }


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

      this.selectItem(this.reducedFilteredItems[selectedIndex]);
    },
      { ignoreInputFieldEvents: false });

  }

  private beforeUnmount() {
    keyboard.off(this.keyboardId);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  min-width: 200px;
  border-radius: 4px;
  overflow: hidden;
  display: grid;
  gap: 4px;

  .spacer {
    height: 16px;
    border-bottom: solid 1px var(--c-menu-border);
    margin-bottom: 10px;
    margin-top: 20px;

    .name {
      position: absolute;
      transform: translateY(9px);
      background: var(--c-panel-background);
      padding: 0px 5px;
      font-weight: 600;
      border-radius: 8px;
      font-size: 0.8em;
    }

  }

  .item {
    font-size: $text-size-regular;
    display: flex;
    align-items: center;
    line-height: 16px;
    padding: 6px 12px;
    gap: 8px;
    width: calc(100% + 8px);
    transition: background-color 200ms ease;
    margin: 0 -4px;
    //background-color: var(--c-base-200);

    .icon {
      max-width: 20px;
      max-height: 20px;
    }

    .name {
      display: block;
      flex-grow: 1;
    }

    &:hover {
      color: var(--c-contrast);
      background-color: var(--c-base-300);
    }

    &.highlighted {
      color: var(--c-contrast);
      background-color: var(--c-base-200);
    }

  }

}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .no-results {
    text-align: center;
    font-style: italic;
    font-size: 0.8em;
  }


}
</style>
