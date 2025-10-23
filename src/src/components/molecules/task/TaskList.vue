<template>
  <div class="wrapper">
    <div class="header">
      <TaskFiltersButton @filtersUpdated="filtersUpdated" :data="taskFilters" />
      <TaskListOptionsButton />
    </div>

    <div class="results-count">
      <BusyIndicator :loading="isLoading" />{{ this.resultsText }}
    </div>

    <ul class="list" v-if="hasAny">
      <TaskListItem :selected="ItemIsSelected(task)" v-for="task in this.list" :key="task.id" :task="task" @select="selectItem(task)" :options="listOptions" />
      <div class="loadmore-wrapper">
        <TickButton v-if="hasMore" @click="loadMore" :busy="loadMoreBusy" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_LoadMore) }}</TickButton>
        <span v-else-if="hasAny" class="end-list">{{ $translate(LanguagePath.App_EndOfList) }}</span>
      </div>

    </ul>
    <div>

      <div class="addbutton">
        <TickButton v-if="hasTaskCreationOptions" @click="startAddTask" :appearance="Appearance.primary" :color="Color.contrast" :size="Size.XXL" icon="plus" :round="true">
        </TickButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TaskListItem from "@/components/molecules/task/TaskListItem.vue";
import SectionWithSidebar from "@/components/atoms/SectionWithSidebar.vue";
import useTasksStore, { TaskListOptions } from '@/store/tasks';
import { TaskFilterOptions, LanguagePath, TickTaskInstanceSummary } from '@/TickApi';
import keyboard from '@/helpers/keyboard';
import TickButton, { Color, Size, Appearance } from '@/components/atoms/TickButton.vue';
import TaskInstanceCreatorPanel from '@/components/panels/TaskInstanceCreatorPanel.vue';
import { mount, unmount } from '@/helpers/mountHelper';
import TaskFiltersButton from './panels/TaskFiltersButton.vue';
import TaskListOptionsButton from './panels/TaskListOptionsButton.vue';
import BusyIndicator from '@/components/atoms/BusyIndicator.vue';
import useUtilityDataStore from "@/store/utilitydata";
import { translate } from '@/plugins/translatePlugin';

@Component({
  emits: ["select", "updateFilters", "loadMore"],
  components: { TaskListItem, SectionWithSidebar, TickButton, TaskFiltersButton, TaskListOptionsButton, BusyIndicator }
})
export default class TaskList extends Vue {
  Size = Size
  Color = Color
  Appearance = Appearance
  LanguagePath = LanguagePath
  @Prop() private taskFilters: TaskFilterOptions;
  @Prop() private activeId!: string;

  @Prop() private list!: TickTaskInstanceSummary[];
  @Prop() private totalCount: number;
  @Prop() private loadMoreBusy: boolean;


  private activePanel = "";

  private loadMore() {
    this.$emit("loadMore");
  }

  private get hasTaskCreationOptions() {
    return this.taskOptions.length > 0;
  }

  private get allTaskDefinitions() {
    return useUtilityDataStore().utilityData.taskDefinitions;
  }

  private get taskOptions() {

    const tasks = this.allTaskDefinitions
    let options = tasks.filter(p => !p.flowRequired && !p.ticketRequired).map((item) => ({
      text: item.name,
      value: item.id,
    }));

    return options;
  }


  private get listOptions(): TaskListOptions {
    return useTasksStore().listOptions;
  }

  private filtersUpdated(newFilters?: TaskFilterOptions) {
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
    return !this.loadMoreBusy && useTasksStore().taskListResponseIsLoading;
  }

  private get resultsText() {
    if (this.isLoading) { return translate(LanguagePath.App_Searching) }
    return this.totalCount == 0 ? "" : translate(LanguagePath.App_Found_Title, { path: 'nr', value: this.totalCount.toString() })
  }

  // private get summaries(): TickTaskInstanceSummary[] {
  //   return useTasksStore().taskSummaries || [];
  // }

  // private get list(): TickTaskInstanceSummary[] {
  //   return this.summaries.filter(p => p.status !== TaskInstanceStatus.Failed && p.status !== TaskInstanceStatus.Finished)
  // }

  private ItemIsSelected(item: TickTaskInstanceSummary) {
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

  private selectItem(task: TickTaskInstanceSummary) {
    this.$emit('select', task)
  }

  private beforeUnmount() {
    keyboard.off(this.keyboardIds);
  }

  private get currentTaskIndex() {
    const currentIndex = this.list.findIndex(p => p.id == this.activeId);
    return currentIndex;
  }

  private startAddTask() {
    this.togglePanel();
  }



  private togglePanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.activePanel) { return; }

    this.activePanel = mount(TaskInstanceCreatorPanel, {
      props: {

      },
      events: {
        close: () => {
          this.closePanel();
        },
      },
    });
  }

  private closePanel() {
    unmount(this.activePanel);
    this.activePanel = "";
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
