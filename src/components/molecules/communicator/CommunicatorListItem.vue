<template>
  <MenuListItem @select="$emit('select', this.communicator)" :title="title" :subtitle="subtitle" :selected="selected" :attention="false">
    <!-- <div v-if="showOverdue" class="overdue-date" :class="{ 'overdue': this.isOverdue }">{{ this.overdueDateText }}</div> -->
    <!-- <UsersAndTeamsSelector v-if="showAssignments" v-model="assignmentIds" emptyLabel="" :disabled="true" :overlapAfter="3" /> -->
  </MenuListItem>
</template>

<script lang="ts">
import { TickCommunicatorSummary } from "@/TickApi";
import LabelList from "@/components/atoms/LabelList.vue";
import MenuListItem from '@/components/atoms/MenuListItem.vue';
import TickAvatar from '@/components/atoms/TickAvatar.vue';
import { TaskListOptions } from '@/store/tasks';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import UsersAndTeamsSelector from '../Selectors/UsersAndTeamsSelector.vue';

@Component({
  emits: ["select"],
  components: { LabelList, TickAvatar, MenuListItem, UsersAndTeamsSelector }
})
export default class CommunicatorListItem extends Vue {
  @Prop() private communicator: Required<TickCommunicatorSummary>;
  @Prop() private selected: boolean;
  @Prop() private options!: TaskListOptions;

  private get title() {
    return "";//this.communicator.name || "-"
  }

  private get subtitle() {
    return this.communicator.name;//"";// this.showNote ? this.communicator?.id ?? "" : "";
  }

  private get showNote() {
    return this.options?.showNote;
  }

  // private get showAssignments() {
  //   return this.options?.showAssignments && this.hasAssignments
  // }

  // private get hasAssignments() {
  //   return this.assignmentIds?.userIds?.length > 0 || this.assignmentIds?.teamIds?.length > 0;
  // }

  // private get assignmentIds(): UsersAndTeamsSelection {
  //   return {
  //     userIds: this.communicator?.assignedUserIds,
  //     teamIds: this.communicator?.assignedTeamIds,
  //   };
  // }

  // private get showOverdue() {
  //   return this.options?.showOverdueDate
  // }

  // private get nowUtcTicks() {
  //   return useAppStore().nowUtcTicks;
  // }

  // private get isOverdue() {
  //   //const nowUtc = this.nowUtcTicks;
  //   return this.communicator.overdueDateTicks < this.nowUtcTicks;
  // }

  // private get overdueDateText() {
  //   if (!this.isOverdue) {
  //     return displayDistanceToNowDate(this.communicator.overdueDate);
  //   }

  //   return displayDateWithFormat(this.communicator.overdueDate, 'MMM dd, yyyy HH:mm');
  // }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
