<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>{{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_Title) }}</template>

    <div class="content">
      <TickSelector v-model="taskDefinitionId" :options="taskOptions" />
      {{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_Assign_Title) }}
      <UsersAndTeamsSelector v-model="assignments" :overlapAfter="5" :allowAsSubDialog="true" />

      <TickTextarea v-model="note" v-handle v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Contact }">
        {{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_Note_Title) }}</TickTextarea>
      <TickInput v-model="futureStartDate" type="date" :min="minimalDateForFutureStartDate" :max="maxDateForFutureStartDate">
        {{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_StartDate_Title) }}</TickInput>

      <TickSwitch v-model="useOverdue">{{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_UseOverdue_Title) }}</TickSwitch>
      <div class="flexrow" v-if="useOverdue">
        {{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_UseOverdue_CompleteWithin_Title) }}
        <TickInput v-model="overdueAtPeriodCount" type="number" :max="100" :min="1" />
        <TickSelector v-model="overdueAtPeriod" :options="periodOptions" />
      </div>

    </div>
    <template #footer>
      <TickButton @click="createTaskInstance" :busy="busyAdding"> {{ $translate(LanguagePath.App_Add) }}</TickButton>
    </template>

  </TickDialogPanel>
</template>

<script lang="ts">
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus, handle, tokenize } from "@/directives";
import { dateCalculateFromNow, ensureIsDate, inputValueToServerDate, serverDateToInputValue } from "@/helpers/dateHelper";
import { getTaskPeriodTypeOptions, getTaskReadStorageLocations } from "@/helpers/enumsHelper";
import { mount, unmount } from "@/helpers/mountHelper";
import { notifyError } from "@/notify";
import useTasksStore from "@/store/tasks";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { LanguagePath, StorageLocation, TaskDefinitionPeriod, TickCreateTaskInstanceRequest } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickSelector from "../atoms/TickSelector.vue";
import TickSwitch from "../atoms/TickSwitch.vue";
import TickTextarea from "../atoms/TickTextarea.vue";
import TickEditorPanel from "../molecules/editor/TickEditorPanel.vue";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "../molecules/Selectors/UsersAndTeamsSelector.vue";


const taskInstanceCreatorPanelId = "taskInstanceCreatorPanel";

export function removeTaskInstanceCreatorPanel() {
  unmount(taskInstanceCreatorPanelId);
}

export function openTaskInstanceCreatorPanel(ticketId?: string) {
  mount(TaskInstanceCreatorPanel, {
    props: {
      ticketId: ticketId
    },
    events: {
      close: () => {
        removeTaskInstanceCreatorPanel();
      },
    },
  }, taskInstanceCreatorPanelId);
}

@Component({
  directives: { focus, handle, tokenize },
  emits: ["close"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    TickEditorPanel,
    UsersAndTeamsSelector,
    TickSelector,
    TickTextarea,
    TickSwitch,
  },
})
export default class TaskInstanceCreatorPanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath
  StorageLocation = StorageLocation;
  @Prop() private ticketId: string = null;
  @Prop() private communicatorId: string = null;

  private assignments: UsersAndTeamsSelection = { userIds: [], teamIds: [] };
  private taskDefinitionId = "";
  private note = "";
  private busyAdding = false;

  private overdueAtPeriod: TaskDefinitionPeriod = TaskDefinitionPeriod.Day;
  private overdueAtPeriodCount = 7;
  private useOverdue = false;

  private taskStartDate = "";

  private get readLocations() {
    return getTaskReadStorageLocations(false);
  }


  private get periodOptions() {
    return getTaskPeriodTypeOptions();
  }


  private get futureStartDate() {
    return serverDateToInputValue(this.taskStartDate);
  }

  private set futureStartDate(to: string) {
    this.taskStartDate = inputValueToServerDate(to);
  }



  private get minimalDateForFutureStartDate() {
    return serverDateToInputValue(dateCalculateFromNow(0, 0, 0));
  }

  private get maxDateForFutureStartDate() {
    return serverDateToInputValue(dateCalculateFromNow(0, 6, 0));
  }


  private get allTaskDefinitions() {
    return useUtilityDataStore().utilityData.taskDefinitions;
  }

  private get taskOptions() {
    const nofilterForTicketNeeded = this.ticketId == null;

    const tasks = this.allTaskDefinitions
    let options = tasks.filter(p => !p.flowRequired && (nofilterForTicketNeeded || !p.ticketRequired)).map((item) => ({
      text: item.name,
      value: item.id,
    }));

    if (options.length == 1) {
      this.taskDefinitionId = options[0].value;
    }

    return options;
  }

  private readyForSafe(): boolean {
    if (!this.taskDefinitionId) { notifyError("Not saved", "Select a task configuration first"); return false; }

    const hasAssignees = this.assignments.userIds.length > 0 || this.assignments.teamIds.length > 0;
    if (!hasAssignees) { notifyError("Not saved", "Add assignees to the task"); return false; }


    return true;
  }

  private createTaskInstance() {
    if (!this.readyForSafe()) { return; }

    this.busyAdding = true;
    const taskRequest: TickCreateTaskInstanceRequest = {
      assignedTeamIds: this.assignments.teamIds,
      assignedUserIds: this.assignments.userIds,
      workspaceId: useUserStore().activeWorkspaceId,
      taskDefinitionId: this.taskDefinitionId,
      forContextTicketId: this.ticketId,
      communicatorId: this.communicatorId,
      note: this.note,
      overdueSettings: {
        period: this.overdueAtPeriod,
        periodCount: this.overdueAtPeriodCount,
        useOverdue: this.useOverdue,
      },
      startDate: ensureIsDate(this.taskStartDate) ?? null,
    }

    useTasksStore().addTask(taskRequest).then(() => {
      this.busyAdding = false
      this.close();
    });
  }

  private close() {
    this.$emit("close");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 500px;
  display: grid;
  gap: 10px;


}

.flexrow {
  display: flex;
  gap: 5px;
  align-items: baseline;
  font-size: $text-size-regular;
}
</style>
