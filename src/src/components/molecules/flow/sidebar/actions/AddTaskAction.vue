<template>
  <div class="action">

    <SidebarPanel id="task-task" :name="$translate(LanguagePath.App_FlowEditor_SideBar_AddTask_Task_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_AddTask_Task_Explanation) }}
      </template>
      <TickSelector v-model="setTask" :disabled="disabled" :options="taskOptions" />
      <TickSwitch :disabled="disabled" v-model="sync"> {{ $translate(LanguagePath.App_FlowEditor_SideBar_AddTask_WaitForFinish) }}</TickSwitch>
    </SidebarPanel>

    <SidebarPanel id="task-assign" :name="$translate(LanguagePath.App_FlowEditor_SideBar_AddTask_Assign_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_AddTask_Assign_Explanation) }}
      </template>
      <UsersAndTeamsSelector v-model="assignments" :disabled="disabled" :overlapAfter="5" />
    </SidebarPanel>

    <SidebarPanel id="task-note" :name="$translate(LanguagePath.App_FlowEditor_SideBar_AddTask_Note_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_AddTask_Note_Explanation) }}
      </template>

      <TickTextarea :disabled="disabled" v-model="note" v-handle v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }" />
    </SidebarPanel>

    <SidebarPanel id="task-timing" :name="$translate(LanguagePath.App_FlowEditor_SideBar_AddTask_Timing_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_AddTask_Timing_Explanation) }}
      </template>

      <TickSwitch v-model="delayStart"> {{ $translate(LanguagePath.App_FlowEditor_SideBar_AddTask_Timing_Delay_Title) }}</TickSwitch>
      <div class="flexrow" v-if="delayStart">
        <TickInput v-model="delayStartPeriodCount" type="number" />
        <TickSelector v-model="delayStartPeriod" :options="periodOptions" />
      </div>

      <TickSwitch v-model="useOverdue">{{ $translate(LanguagePath.App_FlowEditor_SideBar_AddTask_Timing_UseOverdue_Title) }}</TickSwitch>
      <div class="flexrow" v-if="useOverdue">
        <TickInput v-model="overdueAtPeriodCount" type="number" />
        <TickSelector v-model="overdueAtPeriod" :options="periodOptions" />
      </div>
    </SidebarPanel>

    <DocuHolder class="docuHolder" :group="docuBlocks" />
  </div>
</template>

<script lang="ts">
import { AddTaskSettingsData, DocumentationGroup, FlowDefinitionAction, LanguagePath, StorageLocation, TaskDefinitionPeriod } from "@/TickApi";
import { AddTaskActionSettings } from "@/TickApiModels";
import LabelList from "@/components/atoms/LabelList.vue";
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "@/components/molecules/Selectors/UsersAndTeamsSelector.vue";
import DocuHolder from "@/components/molecules/docublocks/DocuHolder.vue";
import { handle, tokenize } from '@/directives';
import { areEqual } from "@/helpers/arrayHelper";
import { getTaskPeriodTypeOptions, getTaskReadStorageLocations } from "@/helpers/enumsHelper";
import { jsonProxy } from "@/helpers/jsonProxy";
import useUtilityDataStore from "@/store/utilitydata";
import { Component, Prop, Vue, Watch } from "vue-facing-decorator";

@Component({
  directives: { handle, tokenize },
  emits: ["remove", "update"],
  components: {
    SidebarPanel,
    TickSelector,
    LabelList,
    TickSwitch,
    UsersAndTeamsSelector,
    DocuHolder,
    TickTextarea,
    TickInput
  },
})
export default class AddTaskAction extends Vue {
  LanguagePath = LanguagePath
  StorageLocation = StorageLocation;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: AddTaskActionSettings;
  @Prop() private disabled!: boolean;

  private get readLocations() {
    return getTaskReadStorageLocations(true);
  }

  private get docuBlocks(): DocumentationGroup[] {
    const r: DocumentationGroup[] = []
    r.push(DocumentationGroup.FlowEditorFlowActionTask)

    return r;
  }

  private get periodOptions() {
    return getTaskPeriodTypeOptions();
  }
  private get data() {
    return jsonProxy<AddTaskSettingsData>(
      this.settings.actionDataJson || "{}",
      (json) => {
        this.settings.actionDataJson = json;
      }
    );
  }

  private get hasTaskChosen() {
    return this.data.taskDefinitionId != null;
  }

  private get setTask() {
    return this.data.taskDefinitionId;
  }

  private set setTask(input: string) {
    this.data.taskDefinitionId = input;
  }

  private get sync() {
    return !this.data.useAsync;
  }

  private set sync(to: boolean) {
    this.data.useAsync = !to;
  }

  private get note() {
    return this.data.note;
  }

  private set note(to: string) {
    this.data.note = to;
  }

  private get delayStart(): boolean {
    return this.data?.startSettings?.delayStart;
  }

  private set delayStart(to: boolean) {
    this.data.startSettings = {
      delayStart: to,
      period: this.delayStartPeriod,
      periodCount: this.delayStartPeriodCount
    }

  }

  private get delayStartPeriodCount() {
    return this.data?.startSettings?.periodCount ?? 1;
  }

  private set delayStartPeriodCount(to: number) {
    this.data.startSettings = {
      delayStart: this.delayStart,
      period: this.delayStartPeriod,
      periodCount: to
    }
  }
  private get delayStartPeriod() {
    return this.data?.startSettings?.period ?? TaskDefinitionPeriod.Day;
  }

  private set delayStartPeriod(to: TaskDefinitionPeriod) {
    this.data.startSettings = {
      delayStart: this.delayStart,
      period: to,
      periodCount: this.delayStartPeriodCount
    }
  }

  private get overdueAtPeriod() {
    return this.data?.overdueSettings?.period ?? TaskDefinitionPeriod.Day;
  }

  private set overdueAtPeriod(to: TaskDefinitionPeriod) {
    this.data.overdueSettings = {
      useOverdue: this.useOverdue,
      period: to,
      periodCount: this.delayStartPeriodCount
    }
  }

  private get overdueAtPeriodCount() {
    return this.data?.overdueSettings?.periodCount ?? 1;
  }

  private set overdueAtPeriodCount(to: number) {
    this.data.overdueSettings = {
      useOverdue: this.useOverdue,
      period: this.overdueAtPeriod,
      periodCount: to
    }
  }
  private get useOverdue() {
    return this.data?.overdueSettings?.useOverdue ?? false;
  }

  private set useOverdue(to: boolean) {
    this.data.overdueSettings = {
      useOverdue: to,
      period: this.overdueAtPeriod,
      periodCount: this.overdueAtPeriodCount
    }
  }

  private get assignments(): UsersAndTeamsSelection {
    return {
      userIds: this.data.assignedUserIds,
      teamIds: this.data.assignedTeamIds,
    }
  }

  private set assignments(to: UsersAndTeamsSelection) {

    if (!areEqual(this.data?.assignedUserIds, to?.userIds)) {
      this.data.assignedUserIds = to.userIds;
    }
    if (!areEqual(this.data?.assignedTeamIds, to?.teamIds)) {
      this.data.assignedTeamIds = to.teamIds;
    }
  }

  private get taskOptions() {
    const adapters = useUtilityDataStore().utilityData.taskDefinitions;
    let options = adapters.map((item) => ({
      text: item.name,
      value: item.id,
    }));

    return options;
  }

  @Watch("data.taskDefinitionId")
  private taskDefinitionChanged() {
    const task = useUtilityDataStore().task(this.data.taskDefinitionId);

    const newRoutes = task.actionSummaries.map((item) => ({
      taskActionId: item.id,
      targetStepId: null,
      targetStatus: item.targetStatus,
    }));

    this.data.actionRoutes = newRoutes;
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.docuHolder {
  height: auto;
  margin-top: 100px;
}

.flexrow {
  display: flex;
  gap: 5px;
}
</style>
