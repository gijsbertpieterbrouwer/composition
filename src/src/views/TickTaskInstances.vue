<template>
  <TickFocusScreen :noSidebar="true">
    <TaskDetails v-if="hasActiveItem" @exit="exitTaskDetails" class="details" :activeId="selectedItemId" />
    <template v-else>
      <div class="no-data">
        <HappyIndicator :text="'No open tasks assigned to you or your teams, way to go!'" />
      </div>
    </template>

    <template #list>
      <TaskList :activeId="selectedItemId" class="list" @select="selectItem" :taskFilters="taskFilters" @updateFilters="updateFilters" :loadMoreBusy="loadMoreBusy" :totalCount="taskSummariesCount"
        :list="taskSummaries" @loadMore="loadMoreTasks" />
    </template>
    <template #sidebar>
    </template>
  </TickFocusScreen>
</template>

<script lang="ts">
import HappyIndicator from '@/components/atoms/HappyIndicator.vue';
import TickFocusScreen from '@/components/atoms/TickFocusScreen.vue';
import TaskDetails from '@/components/molecules/task/TaskDetails.vue';
import TaskList from '@/components/molecules/task/TaskList.vue';
import { focus } from "@/directives";
import { TickRouteParams } from '@/router';
import useTasksStore from '@/store/tasks';
import { GetTasksResponse, TaskFilterOptions, TickTaskInstanceSummary } from '@/TickApi';
import { Component, Vue, Watch } from 'vue-facing-decorator';

@Component({
  directives: { focus },
  components: { TaskList, TaskDetails, TickFocusScreen, HappyIndicator },
})
export default class TickTaskInstances extends Vue {
  private selectedItemId = "";
  private loadMoreBusy = false;
  private filteredTasksLoaded = false;

  private get taskFilters() {
    return useTasksStore().taskFilters;
  }

  private updateFilters(to?: TaskFilterOptions) {
    useTasksStore().taskFilters = to;
    this.fetchTasksByFilter(false);
  }


  private get filteredListResponse(): GetTasksResponse {
    return useTasksStore().taskListResponse;
  }

  private get taskSummaries(): TickTaskInstanceSummary[] {
    return this.filteredListResponse?.tasks || [];
  }
  private get taskSummariesCount(): number {
    return this.filteredListResponse?.totalCount || this.taskSummaries?.length;
  }

  // private get summaries(): TickTaskInstanceSummary[] {
  //   return useTasksStore().taskSummaries || [];
  // }

  // private get list(): TickTaskInstanceSummary[] {
  //   return this.summaries.filter(p => p.status !== TaskInstanceStatus.Failed && p.status !== TaskInstanceStatus.Finished)
  // }


  private loadMoreTasks() {
    this.fetchTasksByFilter(true);
  }

  private fetchTasksByFilter(isPaging: boolean) {
    if (isPaging) { this.loadMoreBusy = true; }

    this.filteredTasksLoaded = isPaging ? false : true;
    const filters = isPaging ? useTasksStore().taskListResponse?.usedFilters : this.taskFilters;

    useTasksStore().use(filters, isPaging).then(() => {
      this.filteredTasksLoaded = true;
      this.loadMoreBusy = false;
    });

  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }


  private mounted() {
    this.fetchTasksByFilter(false);

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  private exitTaskDetails() {
    this.activateItem(null);
  }


  private selectItem(item: TickTaskInstanceSummary) {
    this.activateItem(item.id);
  }

  private activateItem(id: string) {
    this.$router.push({ params: { ...this.$route.params, id: id } });
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  padding-top: 40px;
}

.no-data {
  display: grid;
  place-items: center;
  padding: 120px;
}
</style>
