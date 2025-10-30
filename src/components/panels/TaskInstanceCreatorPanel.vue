<template>
  <TickDialogPanel class="panel" @close="close">
    <template #title">{{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_Title) }}</template>

    <div class="content">
      <TickSelector v-model="taskDefinitionId" :options="taskOptions" />
      {{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_Assign_Title) }}
      <UsersAndTeamsSelector v-model="assignments" :overlapAfter="5" :allowAsSubDialog="true" />

      <TickTextarea v-model="note" v-handle v-tokenize="{ locations: readLocations, defaultNewStorageLocation: StorageLocation.Contact }">
        {{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_Note_Title) }}
      </TickTextarea>

      <TickInput v-model="futureStartDate" type="date" :min="minimalDateForFutureStartDate" :max="maxDateForFutureStartDate">
        {{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_StartDate_Title) }}
      </TickInput>

      <TickSwitch v-model="useOverdue">{{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_UseOverdue_Title) }}</TickSwitch>
      <div class="flexrow" v-if="useOverdue">
        {{ $translate(LanguagePath.App_TaskInstanceCreatorPanel_UseOverdue_CompleteWithin_Title) }}
        <TickInput v-model="overdueAtPeriodCount" type="number" :max="100" :min="1" />
        <TickSelector v-model="overdueAtPeriod" :options="periodOptions" />
      </div>
    </div>

    <template #footer>
      <TickButton @click="createTaskInstance" :busy="busyAdding">
        {{ $translate(LanguagePath.App_Add) }}
      </TickButton>
    </template>
  </TickDialogPanel>
</template>

<script lang="ts">
import TickButton from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { focus, handle, tokenize } from "@/directives";
import { dateCalculateFromNow, ensureIsDate, inputValueToServerDate, serverDateToInputValue } from "@/helpers/dateHelper";
import { getTaskPeriodTypeOptions, getTaskReadStorageLocations } from "@/helpers/enumsHelper";
import { notifyError } from "@/notify";
import useTasksStore from "@/store/tasks";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { LanguagePath, StorageLocation, TaskDefinitionPeriod, TickCreateTaskInstanceRequest } from "@/TickApi";
import { computed, defineComponent, ref } from "vue";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "../molecules/Selectors/UsersAndTeamsSelector.vue";

export default defineComponent({
  name: "TaskInstanceCreatorPanel",
  directives: { focus, handle, tokenize },
  emits: ["close"],
  props: {
    ticketId: { type: String, default: null },
    communicatorId: { type: String, default: null },
  },
  setup(props, { emit }) {
    const assignments = ref<UsersAndTeamsSelection>({ userIds: [], teamIds: [] });
    const taskDefinitionId = ref("");
    const note = ref("");
    const busyAdding = ref(false);
    const overdueAtPeriod = ref(TaskDefinitionPeriod.Day);
    const overdueAtPeriodCount = ref(7);
    const useOverdue = ref(false);
    const taskStartDate = ref("");

    const readLocations = computed(() => getTaskReadStorageLocations(false));
    const periodOptions = computed(() => getTaskPeriodTypeOptions());

    const futureStartDate = computed({
      get: () => serverDateToInputValue(taskStartDate.value),
      set: (val: string) => { taskStartDate.value = inputValueToServerDate(val); },
    });

    const minimalDateForFutureStartDate = computed(() => serverDateToInputValue(dateCalculateFromNow(0, 0, 0)));
    const maxDateForFutureStartDate = computed(() => serverDateToInputValue(dateCalculateFromNow(0, 6, 0)));

    const allTaskDefinitions = computed(() => useUtilityDataStore().utilityData.taskDefinitions);

    const taskOptions = computed(() => {
      const nofilterForTicketNeeded = props.ticketId === null;
      const tasks = allTaskDefinitions.value;
      const options = tasks
        .filter(p => !p.flowRequired && (nofilterForTicketNeeded || !p.ticketRequired))
        .map(item => ({ text: item.name, value: item.id }));

      // auto-select if only one option
      if (options.length === 1) taskDefinitionId.value = options[0].value;

      return options;
    });

    function readyForSafe() {
      if (!taskDefinitionId.value) {
        notifyError("Not saved", "Select a task configuration first");
        return false;
      }

      const hasAssignees = assignments.value.userIds.length > 0 || assignments.value.teamIds.length > 0;
      if (!hasAssignees) {
        notifyError("Not saved", "Add assignees to the task");
        return false;
      }

      return true;
    }

    async function createTaskInstance() {
      if (!readyForSafe()) return;

      busyAdding.value = true;
      const taskRequest: TickCreateTaskInstanceRequest = {
        assignedTeamIds: assignments.value.teamIds,
        assignedUserIds: assignments.value.userIds,
        workspaceId: useUserStore().activeWorkspaceId ?? "",
        taskDefinitionId: taskDefinitionId.value,
        forContextTicketId: props.ticketId,
        communicatorId: props.communicatorId,
        note: note.value,
        overdueSettings: {
          period: overdueAtPeriod.value,
          periodCount: overdueAtPeriodCount.value,
          useOverdue: useOverdue.value,
        },
        startDate: ensureIsDate(taskStartDate.value) ?? null,
      };

      await useTasksStore().addTask(taskRequest);
      busyAdding.value = false;
      emit("close");
    }

    function close() {
      emit("close");
    }

    return {
      assignments,
      taskDefinitionId,
      note,
      busyAdding,
      overdueAtPeriod,
      overdueAtPeriodCount,
      useOverdue,
      taskStartDate,
      readLocations,
      periodOptions,
      futureStartDate,
      minimalDateForFutureStartDate,
      maxDateForFutureStartDate,
      taskOptions,
      createTaskInstance,
      close,
      StorageLocation,
      LanguagePath,
    };
  },
});
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
