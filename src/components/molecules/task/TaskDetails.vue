<template>
  <TickScreen :loading="isLoading" :actionsInFooter="renderInline" :disablePadding="!padding" :title="title">
    <template v-slot:subtitle>
      <TickButton v-if="showTaskEditButton" @click="navigateToTaskDefinition" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">
        {{ $translate(LanguagePath.App_TaskInstanceEditor_EditTaskDefinition_Title) }}</TickButton>

      <TickButton v-if="showTicketButton" @click="navigateToTicket" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">
        {{ $translate(LanguagePath.App_TaskInstanceEditor_TicketButton_Title) }}</TickButton>

      <span class="creator-wrapper"> {{ $translate(LanguagePath.App_TaskInstanceEditor_IniatedBy_Title) }}
        <TickInitiator :data="taskCreator" :sizePx="20" />
      </span>

      <span v-if="!taskIsUnfinished && this.taskFinisher" class="completer-wrapper">{{ $translate(LanguagePath.App_TaskInstanceEditor_CompletedBy_Title) }}
        <TickInitiator :data="taskFinisher" :sizePx="20" />
      </span>

    </template>
    <template v-slot:actions>
      <template v-if="taskIsUnfinished">
        <TickButton v-if="showSaveButton" :appearance="Appearance.secondary" :color="Color.contrast" @click="saveTask"
          :title="$translate(LanguagePath.App_TaskInstanceEditor_SaveButton_Tooltip_Title)">
          {{ $translate(LanguagePath.App_Save) }}
        </TickButton>
        <template v-if="hasActions">
          <TickButton :appearance="Appearance.primary" @click="finishTask(action)" v-for="action in this.actions" :key="action.id" :color="getActionColor(action)">{{
            action.name }}
          </TickButton>
        </template>
        <template v-else>
          <TickButton @click="finishTask(null)">{{ $translate(LanguagePath.App_TaskInstanceEditor_GenericFinishButton_Title) }}</TickButton>
        </template>

      </template>
      <template v-else>
        <!-- <span class="completed">{{ $translate(LanguagePath.App_TaskInstanceEditor_CompletedBy_Title) }} </span> -->
        <Ticklabel class="status-label" :name="$translate(LanguagePath.App_TaskInstanceEditor_Completed_Title)" :color="ColorsEnum.BoldLime" :size="LabelSize.large" :disableCollapse="true"
          :disableToggle="true" />
      </template>

    </template>
    <template v-slot:default>
      <div class="wrapper">
        <div class="note" v-if="task?.note">
          <TickInitiator :data="taskCreator" :sizePx="20" />:&nbsp;{{ this.task?.note }}
        </div>

        <!-- <div v-if="task?.description">
          <TickHeading>{{ $translate(LanguagePath.App_Description) }}</TickHeading>
          {{ this.task?.description }}
        </div> -->

        <TickFormInstance :disabled="!canEditTaskInstance" :form="task?.form" :validationResponse="validationResponse" v-if="hasForm" />
      </div>
    </template>
  </TickScreen>
</template>

<script lang="ts">
import { AuthorizationObjectType, ColorsEnum, FormValidationResponse, LanguagePath, TaskAction, TaskInstanceStatus, TickTaskWorkingData } from "@/TickApi";
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickHeading from "@/components/atoms/TickHeading.vue";
import Ticklabel, { Size as LabelSize } from "@/components/atoms/TickLabel.vue";
import { RouterToTaskDefinition, RouterToTicket } from '@/router';
import useTasksStore from '@/store/tasks';
import useUserStore from '@/store/user';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';

import TickInitiator from '../TickInitiator.vue';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import TickFormInstance from "../form/form/TickFormInstance.vue";

@Component({
  emits: ["select", "exit"],
  components: { TickScreen, TickEditorPanel, TickButton, TickFormInstance, TickHeading, TickInitiator, Ticklabel }
})
export default class TaskDetails extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  ColorsEnum = ColorsEnum
  LabelSize = LabelSize
  @Prop() private activeId!: string;
  @Prop({ default: false }) private renderInline!: boolean;
  @Prop({ default: true }) private padding!: boolean;

  private task: TickTaskWorkingData = null;
  private validationResponse: FormValidationResponse = null;
  private loaded = false;

  private get isLoading(): boolean {
    return this.loaded == false;
  }

  private get canEditTaskInstance(): boolean {
    return this.loaded && this.taskIsUnfinished && useUserStore().allowedEdit(AuthorizationObjectType.TaskInstance)
  }

  private get showSaveButton(): boolean {
    return this.task?.form?.tiles?.length > 0 || false;
  }

  private get taskCreator() {
    return this.task?.summary?.createdBy ?? null;
  }

  private get taskFinisher() {
    return this.task?.summary?.finishedBy ?? null;
  }
  private get title() {
    return (this.renderInline) ? undefined : this.task?.title || "";
  }

  private get showTaskEditButton() {
    return !this.renderInline && useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration)
  }

  private get showTicketButton() {
    return this.task?.ticketId && !this.renderInline && useUserStore().allowedView(AuthorizationObjectType.Ticket, null)
  }

  private get taskIsUnfinished(): boolean {
    if (!this.task) { return false; }
    const summary = this.task?.summary;
    if (!summary) { return false; }
    if (summary.status == TaskInstanceStatus.Finished || summary.status == TaskInstanceStatus.Failed) {
      return false;
    }

    return true;
  }

  private navigateToTaskDefinition() {
    if (!this.task?.taskDefinitionId) { return; }
    RouterToTaskDefinition(this.task?.taskDefinitionId);
  }

  private navigateToTicket() {
    if (!this.task?.ticketId) { return; }
    RouterToTicket(this.task?.ticketId);
  }

  private get hasForm() {
    return this.task?.form != null && this.task?.form?.tiles != null && this.task?.form?.tiles?.length;
  }

  private get hasActions() {
    return this.actions.length;
  }

  private get actions() {
    return this.task.actionOptions || []
  }

  private saveTask() {
    this.updateTask(null, null);
  }


  // private cancelTask() {
  //   this.updateTask(TaskInstanceStatus.Failed, null);
  // }
  private getActionColor(action?: TaskAction) {
    return (action.targetStatus == TaskInstanceStatus.Failed) ? Color.failure : Color.contrast;
  }

  private finishTask(action?: TaskAction) {

    if (action) {
      this.updateTask(action.targetStatus, action.id);
    } else {
      this.updateTask(TaskInstanceStatus.Finished, null);
    }
  }

  private updateTask(newStatus?: TaskInstanceStatus, actionId?: string) {
    if (actionId) {
      this.task.chosenActionId = actionId;
    }

    if (newStatus) {
      this.task.chosenStatus = newStatus;
    }

    useTasksStore().updateTask(this.task.taskInstanceId).then((d) => {
      this.validationResponse = d;

      if (d.isValid == true) {
        this.$emit("exit", d);
      }
    });
  }

  @Watch("activeId")
  private async activate(id: string) {
    if (!id) { return; }
    this.loaded = false;
    useTasksStore().getTask(id).then(task => {
      this.task = task;
      this.loaded = true;
    });
  }

  mounted() {
    this.activate(this.activeId);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  display: grid;
  gap: 10px;
  padding: 10px;
  font-size: $text-size-regular;

}

.completed {
  font-size: 0.7em;
  opacity: 0.7;
  font-style: italic;
  display: flex;
  gap: 5px;
  align-items: center;
}

.creator-wrapper,
.completer-wrapper {
  display: inline-flex;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
  gap: 5px;
}



.note {
  font-style: italic;
  padding: 10px;
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap: 5px;
}
</style>
