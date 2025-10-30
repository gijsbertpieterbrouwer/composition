<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="task" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">


    <template v-if="hasTask">

      <div>{{ taskMessage }}</div>
      <EditorMessage v-if="showTimingWarning" :type="EditorMessageType.Message" title="Timing"
        message="Please be aware that the task is set for a future date while the flow is waiting for the task to complete." />

      <template v-if="hasAssignments">
        <div class="flex-row">
          <TickIcon name="plus" />
          <UsersAndTeamsSelector v-model="assignments" :disabled="true" :overlapAfter="3" />
        </div>
      </template>
      <EditorMessage v-else :type="EditorMessageType.Warning" title="Assign" message="Please assign the task to at least one user or team." />


      <template v-if="!async">

        <!-- <div v-for="(route, index) in this.routes()" :key="index">
          <div>{{ this.routeName(route) }}</div>
          <TickHandle class="route-handle" :id="optionHandleId(route)" :isConnected="routeIsConnected(route)" />

        </div> -->
      </template>
      <template v-else> {{ $translate(LanguagePath.App_FlowEditor_ActionView_AddTask_IsAsync_Title) }}</template>
    </template>

    <EditorMessage v-else :type="EditorMessageType.Warning" title="Select a task" message="Select a task to be added" />


    <template #routes>
      <template v-if="!async">
        <RouteOption v-for="route in this.routes()" :key="route.taskActionId" :title="routeName(route)" :icon="''" :isConnected="routeIsConnected(route)" :routeHandleId="optionHandleId(route)"
          :isFailureHandle="false" />
      </template>
    </template>

  </ActionBase>
</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickIcon from "@/components/TickIcon.vue";
import { getConnectionHandleId } from "@/helpers/flowhelpers";
import { jsonProxy } from "@/helpers/jsonProxy";
import useUtilityDataStore from "@/store/utilitydata";
import {
  ActionRoute, AddTaskSettingsData, FlowComment,
  FlowDefinitionAction,
  LanguagePath,
  TaskInstanceStatus,
  TickFlowInstanceLog,
  TickTaskDefinitionSummary
} from "@/TickApi";
import { AddTaskActionSettings, } from "@/TickApiModels";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickHandle from "../TickHandle.vue";
//import TickActionDraggableHandle from "../TickActionDraggableHandle.vue";
import LabelList from "@/components/atoms/LabelList.vue";
import EditorMessage, { EditorMessageType } from "@/components/molecules/EditorMessage.vue";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "@/components/molecules/Selectors/UsersAndTeamsSelector.vue";
import TeamLabel from "@/components/molecules/team/TeamLabel.vue";
import { translate } from '@/plugins/translatePlugin';
import ActionBase from "../ActionBase.vue";
import RouteOption from "../RouteOption.vue";
@Component({
  emits: ["addComment", "resolveComments"],
  components: {
    TickIcon,
    ThenHr,
    TickHandle,
    // 
    LabelList,
    TeamLabel,
    UsersAndTeamsSelector,
    EditorMessage,
    ActionBase,
    RouteOption
  },
})
export default class AddTaskAction extends Vue {
  EditorMessageType = EditorMessageType;
  LanguagePath = LanguagePath
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: AddTaskActionSettings;
  @Prop({ default: false }) private selected!: boolean;

  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop() private selectedLog: TickFlowInstanceLog;

  private get data() {
    return jsonProxy<AddTaskSettingsData>(
      this.settings.actionDataJson || "{}",
      (json) => {
        this.settings.actionDataJson = json;
      }
    );
  }

  private addComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addComment", stepId, actionId, comment);
  }
  private resolveComments() {
    this.$emit("resolveComments", this.action.id);
  }
  private get async() {
    return this.data.useAsync;
  }

  private routeIsConnected(route: ActionRoute): boolean {
    return route.targetStepId != null && route.targetStepId != "";
  }
  private routeIsFailure(route: ActionRoute): boolean {
    return route.targetStatus == TaskInstanceStatus.Failed;
  }

  private get showTimingWarning(): boolean {
    if (this.data?.startSettings?.delayStart && !this.data?.useAsync) {
      return true;
    }
    return false;
  }

  private get taskMessage() {
    if (!this.data?.taskDefinitionId) {
      return "";
    }
    return translate(LanguagePath.App_FlowEditor_ActionView_AddTask_HasTask_Title, [{ path: 'name', value: this.selectedTask?.name }]);
  }

  private routeName(option: ActionRoute | string) {
    if (!this.selectedTask) {
      return "";
    }
    if (typeof option == "string") {
      return translate(LanguagePath.App_FlowEditor_ActionView_AddTask_OnCancelRoute_Title);
    } else {
      const route =
        (this.selectedTask.actionSummaries || []).find(
          (p) => p.id == option.taskActionId
        ) || {};
      return route?.name || translate(LanguagePath.App_FlowEditor_ActionView_AddTask_Route_Anonymous);
    }
  }

  private optionHandleId(option: ActionRoute | string) {
    if (typeof option == "string") {
      return getConnectionHandleId(this.stepId, this.action.id, option);
    } else {
      return getConnectionHandleId(
        this.stepId,
        this.action.id,
        option.taskActionId
      );
    }
  }

  private get handleId() {
    return getConnectionHandleId(this.stepId, this.action.id);
  }

  private get hasTask() {
    return this.data.taskDefinitionId != null;
  }

  private get selectedTask(): TickTaskDefinitionSummary {
    const task = useUtilityDataStore().task(this.data.taskDefinitionId);
    return task;
  }

  private get assignments(): UsersAndTeamsSelection {
    return {
      userIds: this.data?.assignedUserIds || [],
      teamIds: this.data?.assignedTeamIds || [],
    }
  }

  private routes() {
    return this.data.actionRoutes || [];
  }

  private get hasAssignments() {
    const userIds = this.data?.assignedUserIds || [];
    const teamIds = this.data?.assignedTeamIds || [];

    return userIds.length || teamIds.length;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.action {
  font-size: 14px;
  line-height: 16px;
  position: relative;
  padding: 0 12px;
  position: relative;
}

.route-handle {
  position: relative;
  left: calc(100% + 12px);
  right: -5px;
  bottom: 7px;
}



.flex-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
</style>
