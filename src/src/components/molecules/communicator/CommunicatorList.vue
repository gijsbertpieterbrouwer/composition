<template>
  <div class="wrapper">
    <div class="header">
      <CommunicatorFiltersButton @filtersUpdated="filtersUpdated" :data="filters" />
      <CommunicatorListOptionsButton />
    </div>

    <div class="results-count">
      <BusyIndicator :loading="isLoading" />{{ this.resultsText }}
    </div>

    <ul class="list" v-if="hasAny">
      <CommunicatorListItem :selected="ItemIsSelected(communicator)" v-for="communicator in this.list" :key="communicator.id" :communicator="communicator" @select="selectItem(communicator)"
        :options="listOptions" />
      <div class="loadmore-wrapper">
        <TickButton v-if="hasMore" @click="loadMore" :busy="loadMoreBusy" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_LoadMore) }}</TickButton>
        <span v-else-if="hasAny" class="end-list">{{ $translate(LanguagePath.App_EndOfList) }}</span>
      </div>

    </ul>
    <div>

      <div class="addbutton">
        <TickButton v-if="canCreate" @click="startAddTask" :appearance="Appearance.primary" :color="Color.contrast" :size="Size.XXL" icon="plus" :round="true">
        </TickButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CommunicatorFilterOptions, LanguagePath, TickCommunicatorSummary } from '@/TickApi';
import BusyIndicator from '@/components/atoms/BusyIndicator.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';

import keyboard from '@/helpers/keyboard';
import { translate } from '@/plugins/translatePlugin';
import useCommunicatorsStore, { CommunicatorListOptions } from '@/store/communicators';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import CommunicatorListItem from './CommunicatorListItem.vue';
import CommunicatorFiltersButton from './panels/CommunicatorFiltersButton.vue';
import CommunicatorListOptionsButton from './panels/CommunicatorListOptionsButton.vue';

@Component({
  emits: ["select", "updateFilters", "loadMore"],
  components: { CommunicatorListItem, TickButton, CommunicatorFiltersButton, CommunicatorListOptionsButton, BusyIndicator }
})
export default class CommunicatorList extends Vue {
  Size = Size
  Color = Color
  Appearance = Appearance
  LanguagePath = LanguagePath
  @Prop() private filters: CommunicatorFilterOptions;
  @Prop() private activeId!: string;
  @Prop() private list!: TickCommunicatorSummary[];
  @Prop() private totalCount: number;
  @Prop() private loadMoreBusy: boolean;

  private activePanel = "";

  private loadMore() {
    this.$emit("loadMore");
  }

  private get canCreate() {
    return false;
  }

  // private get allTaskDefinitions() {
  //   return useUtilityDataStore().utilityData.taskDefinitions;
  // }


  private get listOptions(): CommunicatorListOptions {
    return useCommunicatorsStore().listOptions;
  }

  private filtersUpdated(newFilters?: CommunicatorFilterOptions) {
    this.$emit("updateFilters", newFilters);
  }

  private get hasAny() {
    return this.list.length;
  }

  private get listToShow() {
    return this.list || [];
  }

  private get hasMore() {
    return this.totalCount > this.listToShow.length;
  }

  private get nrOfResults() {
    return this.totalCount || 0;
  }

  private get isLoading() {
    return !this.loadMoreBusy && useCommunicatorsStore().isLoading;
  }

  private get resultsText() {
    if (this.isLoading) { return translate(LanguagePath.App_Searching) }
    return this.totalCount == 0 ? "" : translate(LanguagePath.App_Found_Title, { path: 'nr', value: this.totalCount.toString() })
  }

  private ItemIsSelected(item: TickCommunicatorSummary) {
    return this.activeId == item.id;
  }

  private keyboardIds: number[] = [];

  mounted() {
    this.keyboardIds.push(keyboard.on("PageUp", () => {
      if (this.currentTaskIndex < 1) { return; }

      const itemToShow = this.list[this.currentTaskIndex - 1];
      this.selectItem(itemToShow);
    }, {
      ignoreInputFieldEvents: true
    }));

    this.keyboardIds.push(keyboard.on("PageDown", () => {
      if (this.currentTaskIndex >= this.list.length - 1) { return; }

      const itemToShow = this.list[this.currentTaskIndex + 1];
      this.selectItem(itemToShow);
    }, {
      ignoreInputFieldEvents: true
    }));
  }

  private selectItem(task: TickCommunicatorSummary) {
    this.$emit('select', task)
  }

  beforeUnmount() {
    keyboard.off(this.keyboardIds);
  }

  private get currentTaskIndex() {
    const currentIndex = this.list.findIndex(p => p.id == this.activeId);
    return currentIndex;
  }

  private startAddTask() {
    alert("TODO: add");
  }






}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";



.wrapper {
  display: grid;
  gap: 5px;

  .header {
    display: grid;
    grid-template-columns: auto auto;
    padding: 1px;
  }


  .loadmore-wrapper {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    padding: 20px;

    .end-list {
      font-size: 0.6em;
      font-style: italic;
      opacity: 0.7;
    }
  }

  .results-count {
    font-size: 0.7em;
    opacity: 0.7;
    min-height: 25px;

  }

  .no-data {
    font-size: 0.7em;
    font-style: italic;
    opacity: 0.7;
  }
}



.list {
  display: grid;
  gap: 5px;
}

.addbutton {
  position: sticky;
  bottom: 20px;
  display: flex;
  justify-content: end;
}
</style>
