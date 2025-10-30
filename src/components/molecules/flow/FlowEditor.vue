<template>
  <SectionWithSidebar class="flow-editor" :collapsible="true" :sidebarHeader="false" :collapsed="sidebarCollapsed" @toggle="toggleSidebarCollapsed" orientation="ltr" :color="SidebarColor.Secondary"
    toggleLocation="bottom">
    <div class="top-bar no-connection color-red" v-if="!hasRealtimeConnection">
      <TickIcon name="warning" /> {{ $translate(LanguagePath.App_NoConnection_Title) }}
    </div>

    <ObjectDeletedOverlay v-if="flowDeleted">
      <div>{{ $translate(LanguagePath.App_FlowEditor_Deleted_Title) }} &nbsp;<TickButton @click="restoreDeletedFlow">Restore</TickButton>
      </div>
    </ObjectDeletedOverlay>

    <div @click="stopLog" class="recording-wrapper color-red" v-if="selectedLog">
      {{ $translate(LanguagePath.App_FlowEditor_ActiveLog_Title) }}
      <TickIcon name="close" />
    </div>

    <TickFlow ref="tickflow" v-if="flow && this.flowLoaded" :selectedLog="selectedLog" :allowEdit="allowEditFlow" :allowEditExecutingsettings="allowEditFlowExecutingSettings"
      :trigger="getFlowTrigger()" :steps="steps" :connections="connections" :startPosition="startPosition" @clearselection="onClearSelection" @stepselect="selectStep" @stepdeselect="stepDeselected"
      @stepadded="stepAdded" @stepmoved="stepMoved" @connectionadded="connectionAdded" @connectionremoved="connectionRemoved" @stepActionIndexChange="stepActionIndexChange"
      @addStepAction="addStepAction" @selectAction="selectAction" :selectedActionId="selectedStepActionId" :selectedStepId="selectedStepId" :startStepId="startingStepId"
      @addFlowComment="addFlowComment" @addStepComment="addStepComment" @addActionComment="addActionComment" @resolveFlowComments="resolveFlowComments" @resolveStepComments="resolveStepComments"
      @resolveActionComments="resolveActionComments" :comments=this.flowComments :flowName="flowName" :flow="flow" />

    <template #sidebar>
      <div class="sidebar-content" v-if="!sidebarCollapsed">
        <FlowProperties :selectedLogId="selectedLogId" @logShowTravel="onInstanceLogShowTravel" @selectAction="selectAction" @navigateToFlow="navigateToFlow" v-if="flowStartSelected" :flow="flow"
          @delete="deleteFlow" :disabled="!allowEditFlow" :allowEditFlow="allowEditFlow" />
        <StepProperties v-else-if="!selectedStepActionId" :step="selectedStep" :actionId="selectedStepActionId" :flowId="flow.id" :flowVersionId="flow.versionId"
          :disabled="!allowEditFlowExecutingSettings" @onColorChange="setStepColor" @onNameChange="onStepNameChange" />
        <ActionProperties v-else :step="selectedStep" :actionId="selectedStepActionId" :flowId="flow.id" :flowVersionId="flow.versionId" :disabled="!allowEditFlowExecutingSettings"
          @onNameChange="onActionNameChange" @noteChange="onActionNoteChange" @delete="onActionDelete" @duplicate="onDuplicateAction" />
      </div>
    </template>

  </SectionWithSidebar>
</template>

<script lang="ts">
import ObjectDeletedOverlay from '@/components/atoms/ObjectDeletedOverlay.vue';
import SectionWithSidebar, { SidebarColor } from "@/components/atoms/SectionWithSidebar.vue";
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import FlowProperties from "@/components/molecules/flow/sidebar/FlowProperties.vue";
import StepProperties from "@/components/molecules/flow/sidebar/StepProperties.vue";
import TickFlow from "@/components/molecules/flow/TickFlow.vue";
import TickIcon from "@/components/TickIcon.vue";
import { clone } from '@/helpers/cloneHelper';
import { getDebounced } from "@/helpers/debounce";
import { actionCreationOption, calculateConnections, connect, Connection, disconnect, NodeMoveParams, parseConnectionHandleId, patchFlowMetadata } from "@/helpers/flowhelpers";
import generateId from '@/helpers/guid';
import keyboard from "@/helpers/keyboard";
import { onConfirmation } from '@/helpers/questionHelper';
import { copyToClipboard } from '@/helpers/stringHelper';
import { translate } from '@/plugins/translatePlugin';
import FlowRtcHub from "@/services/rtc/FlowRtcHub";
import useAppStore from "@/store/app";
import useFlowStore from "@/store/flows";
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import useViewstateStore, { InterfaceStateType } from '@/store/viewstate';
import { AuthorizationObjectType, ColorsEnum, FlowComment, FlowDefinitionAction, FlowStep, LanguagePath, TickFlowDefinition, TickFlowDefinitionMetaData, TickFlowInstanceLog, TickFlowInstanceLogSummary, UIPositionData } from "@/TickApi";
import { Component, Vue } from 'vue-facing-decorator';
import { actionSelectionEvent, stepIndexChange } from './node/StepNode.vue';
import ActionProperties from './sidebar/ActionProperties.vue';

enum CopyAbleFlowObjectType {
  FlowStep = 0,
  FlowAction = 1,
}

interface CopyAbleFlowObject {
  type: CopyAbleFlowObjectType;
  dataJson: string;
}


@Component({
  emits: ["exit", "navigateToFlow"],
  components: {
    FlowProperties, SectionWithSidebar, StepProperties, ActionProperties, TickFlow, TickIcon, ObjectDeletedOverlay, TickButton
  },
})
export default class FlowEditor extends Vue {
  SidebarColor = SidebarColor;
  LanguagePath = LanguagePath;
  Appearance = Appearance;
  Size = Size;
  Color = Color;

  private selectedStepId: string | null = null;
  private selectedStepActionId: string | null = null;

  private selectedLog: TickFlowInstanceLog = null;

  private stopLog() {
    this.selectedLog = null;
  }
  private get selectedLogId() {
    return this.selectedLog?.id;
  }

  private onInstanceLogShowTravel(log: TickFlowInstanceLogSummary) {
    if (this.selectedLogId == log.id) { this.stopLog(); return; }

    // if another flow => redirect
    if (log.flowDefinitionId != this.flow.id || log.flowDefinitionVersionId != this.flow.versionId) {
      this.navigateToFlow({
        id: log.flowDefinitionId,
        versionId: log.flowDefinitionVersionId,
        instanceId: log.id,
      })
      return;
    }

    this.loadLog(log.id);
  }

  private loadLog(id: string) {
    useFlowStore().getLogDetails(id).then((d) => {
      this.selectedLog = d;
    });
  }

  private selectStep(to: string) {
    if (to == this.selectedStepId) { return; }
    this.selectedStepId = to;
    this.selectedStepActionId = null;
  }

  private debouncedStepPositionUpdate!: (args: NodeMoveParams) => void;
  private debouncedStepUpdate!: (args: FlowStep) => void;
  private debouncedStepActionUpdate!: (args: FlowDefinitionAction) => void;

  private get flowComments() {
    return this.flow.comments || [];
  }
  private get flowStartSelected() {
    return !this.selectedStepId || this.selectedStepId == 'start';
  }

  private get startingStepId() {
    return this.flow ? this.flow.startStepId : null;
  }

  private restoreDeletedFlow() {
    FlowRtcHub.restoreFlow({
      flowDefinitionId: this.flow.id,
      flowVersionId: this.flow.versionId,
    });
  }

  private deleteFlow() {
    onConfirmation(() => {
      FlowRtcHub.deleteFlow({
        flowDefinitionId: this.flow.id,
        flowVersionId: this.flow.versionId,
      });
      this.exitFlow();
    }, translate(LanguagePath.App_FlowEditor_Delete_Confirmation))
    // if (!askConfirmation(translate(LanguagePath.App_FlowEditor_Delete_Confirmation))) { return; }



  }

  private exitFlow() {
    this.$emit("exit");
  }

  private get flowDeleted() {
    return this.flow && this.flow.isDeleted;
  }
  private get executionEnvironmentId() {
    return this.flow ? this.flow.executionEnvironmentId : null;
  }

  private navigateToFlow(flow: { id: string, versionId: string, instanceId?: string }) {
    this.$emit("navigateToFlow", flow);
  }


  private get allowEditFlow() {
    return this.flow
      && !this.flow.isDeleted
      && useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration)
      && !this.selectedLogId;
  }

  private get isInProduction() {
    const env = useUtilityDataStore().executionEnvironment(this.flow.executionEnvironmentId);
    return (env) ? env.isProduction : false;
  }

  private get allowEditFlowExecutingSettings() {
    return this.allowEditFlow && !this.isInProduction;
  }



  private get hasRealtimeConnection() {
    return useAppStore().rtcConnected;
  }

  private getFlowTrigger() {
    return this.flow.trigger;
  }

  private onClearSelection() {
    this.selectedStepId = null;
    this.selectedStepActionId = null;
  }

  private get flow(): TickFlowDefinition {
    return useFlowStore().activeFlow;
  }

  private get flowActive(): boolean {
    return this.flow.active;
  }

  private get flowName(): string {
    return this.flow ? this.flow.name : "";
  }

  private set flowName(name: string) {
    this.patchFlowMetadata({ name });
  }


  private get flowLoaded() {
    return useFlowStore().activeFlowLoaded;
  }

  private get steps() {
    return this.flow.steps || [];
  }

  private get startPosition() {
    return this.flow.settingsNodePosition;
  }




  private get connections(): Connection[] {
    return calculateConnections(this.flow, this.selectedLog?.travelData);
  }

  private get sidebarCollapsed() {
    return useViewstateStore().has(InterfaceStateType.FlowSideBarCollapsed);
  }

  private toggleSidebarCollapsed() {
    useViewstateStore().toggle(InterfaceStateType.FlowSideBarCollapsed);
  }

  private get selectedStep(): FlowStep {
    if (this.selectedStepId === null) { return undefined; }
    if (this.selectedStepId === "start") { return { id: "start", name: "Flow start" }; }
    return this.flow.steps.find((g) => g.id === this.selectedStepId);
  }

  private setStepColor(to: ColorsEnum) {

    (this.selectedStep as FlowStep).color = to;  //optimistic
    this.debouncedStepUpdate(this.selectedStep);
  }

  private onStepNameChange(to: string) {
    this.selectedStep.name = to; // optimistic
    this.debouncedStepUpdate(this.selectedStep);
  }

  private onDuplicateAction(action: FlowDefinitionAction) {
    const copy = clone<FlowDefinitionAction>(action);
    copy.id = generateId();


    FlowRtcHub.addAction({
      actionType: copy.actionType,
      template: copy,
      flowVersionId: this.flow.versionId,
      index: copy.index,
      newActionId: copy.id,
      stepId: this.selectedStepId,
    });

  }



  private onCopySelection(deleteSelection: boolean) {
    const action = this.selectedAction;
    const step = this.selectedStep;

    if (action) {
      const actionCopy = clone<FlowDefinitionAction>(action);
      actionCopy.id = generateId();

      const actionCopyData: CopyAbleFlowObject = {
        type: CopyAbleFlowObjectType.FlowAction,
        dataJson: JSON.stringify(actionCopy),
      }


      copyToClipboard(actionCopyData);
    }
    else if (step) {
      const stepCopy = clone<FlowStep>(step);
      stepCopy.id = generateId();
      if (step.actions) {
        for (let index = 0; index < step.actions.length; index++) {
          const action = step.actions[index];
          action.id = generateId();
        }
      }


      const actionCopyData: CopyAbleFlowObject = {
        type: CopyAbleFlowObjectType.FlowStep,
        dataJson: JSON.stringify(stepCopy),
      }

      copyToClipboard(actionCopyData);
    }

    if (deleteSelection) {
      this.onRemoveSelection();
    }
  }

  private isCopyAbleData(item: CopyAbleFlowObject): boolean {
    if (item && item.type != undefined && item.dataJson) {
      return true;
    } else {
      return false;
    }
  }

  private onPasteSelection() {
    if (!navigator.clipboard) { return; }

    navigator.clipboard.readText().then((json) => {
      try {


        var copyData = JSON.parse(json) as CopyAbleFlowObject;
        if (!this.isCopyAbleData(copyData)) { return; }

        switch (copyData.type) {
          case CopyAbleFlowObjectType.FlowAction:
            return this.onPasteAction(copyData.dataJson);
          case CopyAbleFlowObjectType.FlowStep:
            return this.onPasteStep(copyData.dataJson);
          default:
            return;
        }
      } catch (error) {
        //do nothing
      }

    });

  }

  private onPasteAction(json) {
    const actionCopy = JSON.parse(json) as FlowDefinitionAction;
    actionCopy.id = generateId();

    if (this.selectedStep) {

      FlowRtcHub.addAction({
        actionType: actionCopy.actionType,
        template: actionCopy,
        flowVersionId: this.flow.versionId,
        index: actionCopy.index,
        newActionId: actionCopy.id,
        stepId: this.selectedStepId,
      });
    } else {
      // no step selection, lets create on with the stap already in it

      const newFlowStep: FlowStep = {
        id: generateId(),
        name: "",
        actions: [actionCopy],
        color: null,
        comments: [],
        targetStepId: null,
        uiPosition: this.getCurrentUIPosition(),
      }

      this.stepAdded({
        x: newFlowStep.uiPosition.x,
        y: newFlowStep.uiPosition.y,
      }, null, false, newFlowStep)

    }
  }

  private getCurrentUIPosition(): UIPositionData {
    return {
      x: useFlowStore().projectedMousePositionX - 370,
      y: useFlowStore().projectedMousePositionY - 90,
    }
  }

  private onPasteStep(json) {
    const stepCopy = JSON.parse(json) as FlowStep;
    stepCopy.id = generateId();
    stepCopy.uiPosition = this.getCurrentUIPosition();


    if (stepCopy.actions) {
      for (let index = 0; index < stepCopy.actions.length; index++) {
        const action = stepCopy.actions[index];
        action.id = generateId();
      }
    }

    this.stepAdded({
      x: stepCopy.uiPosition.x,
      y: stepCopy.uiPosition.y,
    }, null, false, stepCopy)


  }



  private onActionDelete(stepId: string, actionId: string) {
    onConfirmation(() => {
      const step = this.flow.steps.find((g) => g.id === stepId);
      step.actions = step.actions.filter((a) => a.id != actionId);

      FlowRtcHub.deleteAction({
        flowVersionId: this.flow.versionId,
        stepId: stepId,
        actionId: actionId,
      });

      if (this.selectedStepActionId == actionId) {
        this.selectedStepActionId = null;
      }
    });


  }

  private get selectedAction(): FlowDefinitionAction {
    if (this.selectedStepId === null) { return undefined; }
    if (this.selectedStepId === "start") { return undefined; }
    const step = this.flow.steps.find((g) => g.id === this.selectedStepId);
    const actions = step.actions || [];
    return actions.find((p) => p.id == this.selectedStepActionId);
  }

  private onActionNameChange(to: string) {
    this.selectedAction.name = to;
    this.debouncedStepActionUpdate(this.selectedAction);
  }

  private onActionNoteChange(to: string) {
    this.selectedAction.note = to;
    this.debouncedStepActionUpdate(this.selectedAction);
  }

  private stepAdded(position: Required<UIPositionData>, sourceHandleId?: string, isFailureHandle?: boolean, template?: FlowStep) {
    if (!this.allowEditFlow) { return; }
    // if has selection, do nothing
    //if (this.selectedStep) { return; }

    const newId = generateId();
    position.x = Math.round(position.x);
    position.y = Math.round(position.y)
    let color: ColorsEnum = null;

    var sourceConnectionHandle = parseConnectionHandleId(sourceHandleId);


    const sourceStep = this.flow.steps?.find(p => p.id == sourceConnectionHandle.stepId);
    if (sourceStep) {
      color = sourceStep.color;
    }

    if (sourceHandleId && isFailureHandle) {
      color = ColorsEnum.Red;
    }

    FlowRtcHub.addStep({
      flowVersionId: this.flow.versionId,
      position: position,
      stepId: newId,
      color: color,
      template: template,
    });

    if (sourceHandleId) {
      this.connectionAdded({
        source: sourceHandleId,
        target: newId,
        sourceStep: null,
        targetStep: null,
        animated: false,
      }, false)
    } else if (!this.flow.steps || !this.flow.steps.length) {
      this.patchFlowMetadata({ startStepId: newId });
    }

    //preselect step in advance
    this.selectStep(newId);

  }

  private stepMoved(move: NodeMoveParams) {
    const position: UIPositionData = { x: move.x, y: move.y };
    if (move.id === "start") {
      useFlowStore().patchFlowSettingsNodePosition(this.flow.versionId, position);
      this.patchFlowMetadata({ settingsNodePosition: { x: move.x, y: move.y } });
      return;
    }
    // moving steps feels sluggish when server is slow, so update UI first and server later
    useFlowStore().patchStepPosition(this.flow.versionId, move.id, position);

    this.debouncedStepPositionUpdate(move);
  }



  private addFlowComment(to: FlowComment) {
    if (!this.flow.comments) { this.flow.comments = []; }
    this.flow.comments.push(to);

    FlowRtcHub.addFlowComment({
      flowVersionId: this.flow.versionId,
      comment: to,
    });
  }
  private resolveFlowComments() {
    this.flow.comments = [];
    FlowRtcHub.resolveFlowComments({
      flowVersionId: this.flow.versionId,
    });
  }

  private addStepComment(stepId: string, to: FlowComment) {
    const step = this.flow.steps.find(p => p.id == stepId);
    if (!step.comments) { step.comments = []; }
    step.comments.push(to);

    FlowRtcHub.addStepComment({
      flowVersionId: this.flow.versionId,
      stepId: stepId,
      comment: to,
    });
  }
  private resolveStepComments(stepId: string) {
    const step = this.flow.steps.find(p => p.id == stepId);
    step.comments = [];

    FlowRtcHub.resolveStepComments({
      flowVersionId: this.flow.versionId,
      stepId: stepId,
    });
  }

  private addActionComment(stepId: string, actionId: string, to: FlowComment) {
    const step = this.flow.steps.find(p => p.id == stepId);
    const action = step.actions.find(p => p.id == actionId);
    if (!action.comments) { action.comments = []; }
    action.comments.push(to);

    FlowRtcHub.addActionComment({
      flowVersionId: this.flow.versionId,
      stepId: stepId,
      actionId: actionId,
      comment: to,
    });
  }
  private resolveActionComments(stepId: string, actionId: string) {
    const step = this.flow.steps.find(p => p.id == stepId);
    const action = step.actions.find(p => p.id == actionId);

    action.comments = [];

    FlowRtcHub.resolveActionComments({
      flowVersionId: this.flow.versionId,
      stepId: stepId,
      actionId: actionId,
    });
  }



  private onRemoveSelection() {
    if (!this.allowEditFlow) { return; }

    // RemoveSelection
    const action = this.selectedAction;
    const step = this.selectedStep;
    if (action) {
      FlowRtcHub.deleteAction({
        flowVersionId: this.flow.versionId,
        stepId: this.selectedStepId,
        actionId: action.id,
      });
      //deselect action
      this.selectedStepActionId = null;

    } else if (step) {

      if (step.id == "start") {
        this.deleteFlow();

      } else {



        if (this.flow.startStepId === this.selectedStepId) {
          this.patchFlowMetadata({ startStepId: null });
        }

        FlowRtcHub.deleteStep({
          flowVersionId: this.flow.versionId,
          stepId: this.selectedStepId,
        });

        //deselect action
        this.selectedStepActionId = null;
        this.selectedStepId = null;
      }
    }


  }

  private stepDeselected(id: string) {
    if (this.selectedStepId === id) {
      this.selectedStepId = null;
      this.selectedStepActionId = null;
    }
  }

  private addStepAction(req: actionCreationOption) {
    var newActionId = generateId();

    this.selectedStepActionId = newActionId;
    this.selectedStepId = req.stepId;

    FlowRtcHub.addAction({
      flowVersionId: this.flow.versionId,
      stepId: req.stepId,
      actionType: req.actionType,
      subActionType: req.subActionType,
      newActionId: newActionId,
    });
  }

  private selectAction(req: actionSelectionEvent) {
    this.selectedStepId = req.stepId;
    this.selectedStepActionId = req.actionId;

    if (req.fitView) {
      const vueFlow = this.$refs.tickflow as TickFlow
      vueFlow.centerOnStep(req.stepId);
    }
  }


  private stepActionIndexChange(req: stepIndexChange) {
    FlowRtcHub.moveAction({
      flowVersionId: this.flow.versionId,
      stepId: req.stepId,
      targetStepId: req.newStepId,
      actionId: req.actionId,
      index: req.newIndex,
    });
    //this.$emit('updateNodeInternals');
  }

  private connectionAdded(connection: Connection, validate?: boolean) {
    if (!this.allowEditFlow) { return; }
    if (connection.source === "start") {
      this.patchFlowMetadata({ startStepId: connection.target });
      return;
    }

    const { step, action } = connect(this.steps, connection.source, connection.target, validate);

    if (action) {
      FlowRtcHub.updateAction({
        flowVersionId: this.flow.versionId,
        stepId: step.id,
        actionId: action.id,
        name: action.name,
        settingsJson: action.actionSettingsJson,
      });
    } else {
      // update step (connection added)
      FlowRtcHub.updateStepTargetStep({
        flowVersionId: this.flow.versionId,
        stepId: step.id,
        targetStepId: step.targetStepId
      })
    }

  }

  private connectionRemoved(connection: Connection) {
    if (!this.allowEditFlow) { return; }

    if (connection.source === "start") {
      this.patchFlowMetadata({ startStepId: null });
      return;
    }

    const { step, action } = disconnect(this.steps, connection.source);
    if (action) {
      FlowRtcHub.updateAction({
        flowVersionId: this.flow.versionId,
        stepId: step.id,
        actionId: action.id,
        name: action.name,
        settingsJson: action.actionSettingsJson,
      });
    } else {
      // update step (connection added)
      FlowRtcHub.updateStepTargetStep({
        flowVersionId: this.flow.versionId,
        stepId: step.id,
        targetStepId: null
      })
    }
  }

  private patchFlowMetadata(delta: Partial<TickFlowDefinitionMetaData>) {
    if (this.allowEditFlow) {
      patchFlowMetadata(this.flow, delta);
    }
  }


  private onPressEscape() {
    if (this.selectedLog) {
      this.stopLog();
    } else {
      this.onClearSelection()
    }
  }

  private keyboardIds: number[] = [];

  mounted() {
    this.keyboardIds.push(keyboard.on("esc", () => { this.onPressEscape(); }, { ignoreInputFieldEvents: true }));
    this.keyboardIds.push(keyboard.on("Backspace", () => { this.onRemoveSelection(); }, { ignoreInputFieldEvents: true }));
    this.keyboardIds.push(keyboard.on("del", () => { this.onRemoveSelection(); }, { ignoreInputFieldEvents: true }));
    this.keyboardIds.push(keyboard.on("ctrl+c", () => { this.onCopySelection(false); }, { ignoreInputFieldEvents: true }));
    this.keyboardIds.push(keyboard.on("ctrl+x", () => { this.onCopySelection(true); }, { ignoreInputFieldEvents: true }));
    this.keyboardIds.push(keyboard.on("ctrl+v", () => { this.onPasteSelection(); }, { ignoreInputFieldEvents: true }));


    const params = this.$route.params;
    if (params.instanceId) {
      this.loadLog(params.instanceId as string);
    }
  }

  private beforeUnmount() {
    keyboard.off(this.keyboardIds);
  }


  beforeMount() {
    this.debouncedStepUpdate = getDebounced<FlowStep>((update: FlowStep) => {
      FlowRtcHub.updateStep({
        flowVersionId: this.flow.versionId,
        stepId: update.id,
        name: update.name,
        color: update.color,
        position: update.uiPosition,
      });
    });

    this.debouncedStepActionUpdate = getDebounced<FlowDefinitionAction>((update: FlowDefinitionAction) => {
      FlowRtcHub.updateAction({
        flowVersionId: this.flow.versionId,
        stepId: this.selectedStepId,
        actionId: this.selectedStepActionId,
        name: update.name,
        note: update.note,
      });
    });

    this.debouncedStepPositionUpdate = getDebounced<NodeMoveParams>((move: NodeMoveParams) => {
      FlowRtcHub.updateStepPosition({
        flowVersionId: this.flow.versionId,
        stepId: move.id,
        position: { x: move.x, y: move.y },
      });
    });


  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.recording-wrapper {
  @include neon-bg;
  @include font-inter;


  margin-left: calc(50vw - 400px);
  border-radius: 0 0 16px 16px;
  padding: 5px 50px;
  width: 400px;
  align-content: center;
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: space-between;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;
}

.sidebar-content {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;

  padding: 20px 0 0 30px;
}

.hasRTC {
  font-style: italic;
  font-size: $text-size-regular;
}

.top-bar {
  left: calc(35% - 200px);
  width: calc(40%);
  position: absolute;
  color: #fff;
  text-align: center;
  // padding-top: 2px;
  // padding-bottom: 2px;
  font-size: small;
  z-index: 999;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  border-radius: 0 0 16px 16px;
  padding: 5px 50px;


  &.no-connection {
    @include neon-bg;
    //background-color: #720e0e;
  }

}


// .step-name-input {
//   cursor: text;
// }</style>
