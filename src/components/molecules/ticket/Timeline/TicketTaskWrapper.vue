<template>
  <TimelineItem @click="navToItem" icon="task" :iconPaddingPx="10" :important="item.important">
    <div class="ticket-task-wrapper" :class="{ inline: this.showInline }">
      <div class="ticket-task-header">
        <span class="title">
          <template v-if="!showInline">{{ this.taskIcon }}</template>
          {{ this.taskName }}
        </span>
        <span class="subdued">{{ this.date }}</span>
      </div>
      <template v-if="showInline">
        <div class="wrapper">
          <TaskDetails @exit="exitTask" :activeId="data.id" :renderInline="true" :showScreenEstate="false" :padding="false" />
        </div>
      </template>
    </div>
  </TimelineItem>
</template>

<script lang="ts">
import {
  FormValidationResponse,
  TaskInstanceStatus,
  TimelineDataItem,
  TimelineTaskInstance,
} from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TaskDetails from "../../task/TaskDetails.vue";


import TimelineItem from "@/components/molecules/ticket/Timeline/TimelineItem.vue";
import useTasksStore from "@/store/tasks";

import { displayDistanceToNowDate } from "@/helpers/dateHelper";
import { RouterToTaskInstance } from "@/router";

// FIXME: Ruben sync tasks

@Component({
  components: { TaskDetails, TimelineItem },
})
export default class TicketTaskWrapper extends Vue {
  TaskInstanceStatus = TaskInstanceStatus;
  @Prop() private item: Required<TimelineDataItem>;

  private get data(): TimelineTaskInstance {
    return this.item.data;
  }

  private get date() {
    return displayDistanceToNowDate(this.item.timelineDate);
  }

  private exitTask(update: FormValidationResponse) {
    useTasksStore().patchTaskSummary(update.summary);
  }
  private navToItem() {
    RouterToTaskInstance(this.summary.id);
  }
  private get taskName() {
    return this.summary.name;
  }

  private get summary() {
    const timelineSummary = this.data.summary;
    if (!timelineSummary) {
      return null;
    }
    const realtimeSummary = useTasksStore().getSummary(this.data.id);

    return realtimeSummary || timelineSummary;
  }

  private get showInline(): boolean {
    if (!this.summary) {
      return false;
    }
    if (this.summary.isAsync) {
      return false;
    }

    if (this.summary.status == TaskInstanceStatus.Failed || this.summary.status == TaskInstanceStatus.Finished) {
      return false;
    }

    return true;
  }

  private get taskIcon(): string {
    if (!this.summary) {
      return "";
    }

    switch (this.summary.status) {
      case TaskInstanceStatus.Failed:
        return "❌";
      case TaskInstanceStatus.Finished:
        return "✅";
      case TaskInstanceStatus.InProgress:
        return "🏃";
      case TaskInstanceStatus.Todo:
        return "🕰️";
      default:
        return "";
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.ticket-task-wrapper {
  border-radius: 12px;
  padding: 8px 12px;
  max-width: 80%;

  &.inline {
    background-color: c("base-400");
  }

  &:not(.inline) {
    border: 1px solid c("base-400");
  }
}

.ticket-task-header {
  line-height: 20px;
  display: flex;
  gap: 16px;
  font-size: $text-size-regular;
}

.title {
  font-weight: 600;
}

.wrapper {
  padding-top: 16px;
}
</style>
