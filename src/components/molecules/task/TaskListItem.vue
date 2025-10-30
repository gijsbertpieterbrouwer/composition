<template>
  <MenuListItem @select="$emit('select', this.task)" :title="title" :subtitle="subtitle" :selected="selected" :attention="false">
    <div v-if="showOverdue" class="overdue-date" :class="{ 'overdue': this.isOverdue }">{{ this.overdueDateText }}</div>
    <UsersAndTeamsSelector v-if="showAssignments" v-model="assignmentIds" emptyLabel="" :disabled="true" :overlapAfter="3" />
  </MenuListItem>
</template>

<script lang="ts">
import { TickTaskInstanceSummary } from "@/TickApi";
import LabelList from "@/components/atoms/LabelList.vue";
import MenuListItem from '@/components/atoms/MenuListItem.vue';
import TickAvatar from '@/components/atoms/TickAvatar.vue';
import { displayDateWithFormat, displayDistanceToNowDate } from '@/helpers/dateHelper';
import useAppStore from '@/store/app';
import { TaskListOptions } from '@/store/tasks';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from '../Selectors/UsersAndTeamsSelector.vue';

@Component({
  emits: ["select"],
  components: { LabelList, TickAvatar, MenuListItem, UsersAndTeamsSelector }
})
export default class TaskListitem extends Vue {
  @Prop() private task: Required<TickTaskInstanceSummary>;
  @Prop() private selected: boolean;
  @Prop() private options!: TaskListOptions;

  private get title() {
    return this.task.name
  }

  private get subtitle() {
    return this.showNote ? this.task?.note ?? "" : "";
  }

  private get showNote() {
    return this.options?.showNote;
  }

  private get showAssignments() {
    return this.options?.showAssignments && this.hasAssignments
  }

  private get hasAssignments() {
    return this.assignmentIds?.userIds?.length > 0 || this.assignmentIds?.teamIds?.length > 0;
  }

  private get assignmentIds(): UsersAndTeamsSelection {
    return {
      userIds: this.task?.assignedUserIds,
      teamIds: this.task?.assignedTeamIds,
    };
  }

  private get showOverdue() {
    return this.options?.showOverdueDate
  }

  private get nowUtcTicks() {
    return useAppStore().nowUtcTicks;
  }

  private get isOverdue() {
    //const nowUtc = this.nowUtcTicks;
    return this.task.overdueDateTicks < this.nowUtcTicks;
  }

  private get overdueDateText() {
    if (!this.isOverdue) {
      return displayDistanceToNowDate(this.task.overdueDate);
    }

    return displayDateWithFormat(this.task.overdueDate, 'MMM dd, yyyy HH:mm');
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.overdue-date {
  font-size: 10px;

  &.overdue {
    color: var(--c-red-night);
  }
}

.task-list-item {
  //overflow: hidden;
  background-color: $brand100;
}

.task-list-item-button {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px 28px 8px 8px;
  gap: 4px;
  color: $black;


  &.selected {
    //background-color: $brand100;
    box-shadow: 3px 0px 0px 0px #14b0e1;

  }

}



.title {
  font-size: 14px;
  line-height: 16px;
  padding: 2px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

}

.subtitle {
  display: flex;
  align-items: center;
  height: 28px;
}
</style>
