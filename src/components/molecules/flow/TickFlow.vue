<template>
  <VueFlow ref="flow" @connect-start="onConnectStart" :max-zoom="10" :min-zoom="0.03" @connect-end="onConnectEnd" :zoomOnDoubleClick="false" :nodes="nodes" :edges="edges" :draggable="false"
    :nodes-draggable="allowEdit" :snapToGrid="false" :snapGrid="[2, 2]" :apply-default="false" :selectNodesOnDrag="true" @pane-ready="onPaneReady" @dblclick.prevent="addNode" @connect="onConnection"
    @nodesChange="nodesChanged" @paneClick="clearSelection" @contextmenu.prevent="showFlowContextMenu($event)">

    <template #edge-removable="data">
      <RemovableEdge v-bind="data" @removeConnection="onRemoveConnection" />
    </template>

    <template #node-start="data">
      <StartNode @addComment="addFlowComment" @resolveComments="resolveFlowComments" v-bind="data" :trigger="trigger" :startStepId="startStepId" :comments="comments" :name="flowName"
        :selected="startNodeIsSelected" :flow="flow" :selectedLog="selectedLog" />
    </template>

    <template #node-step="data">
      <StepNode v-bind="data" @stepActionIndexChange="onStepActionIndexChange" @addComment="addStepComment" @resolveComments="resolveStepComments" @addActionComment="addActionComment"
        @resolveActionComments="resolveActionComments" @addStepAction="onAddStepAction" @selectAction="onSelectAction" @selectStep="onSelectStep" :selectedActionId="selectedActionId"
        :disabled="!allowEditExecutingsettings" :selectedStepId="selectedStepId" :selectedLog="selectedLog" />
    </template>

    <!-- <Background :pattern-color="'#aaa'" gap="8" /> -->
  </VueFlow>
</template>

<script lang="ts">

import { Edge, Node, NodeChange, Connection as NodeConnection, OnConnectStartParams, VueFlow, VueFlowStore } from '@vue-flow/core';
import { Component, Prop, Vue } from "vue-facing-decorator";
// import { Background } from '@vue-flow/background'
import { DropdownOption } from '@/components/atoms/TickDropdown.vue';
import RemovableEdge from "@/components/molecules/flow/node/RemovableEdge.vue";
import StartNode from "@/components/molecules/flow/node/StartNode.vue";
import StepNode, { actionSelectionEvent, FlowStepEditorMessage, stepIndexChange, stepNodeData, } from "@/components/molecules/flow/node/StepNode.vue";
import { openContextDropdownPanel } from '@/components/panels/contextPanels/ContextDropdownPanel.vue';
import { getColorHex } from "@/helpers/colorsHelper";
import { actionCreationOption, Connection, stepHasStartConnection, } from "@/helpers/flowhelpers";
import useFlowStore from "@/store/flows";
import useUtilityDataStore from '@/store/utilitydata';
import { BotActionTypeEnum, ColorsEnum, CommunicationType, FlowActionType, FlowComment, FlowStep, FlowTriggerEnum, TickChannelSummary, TickFlowDefinition, TickFlowInstanceLog, UIPositionData, } from "@/TickApi";
import { MessageBotActionSettings } from '@/TickApiModels';
import { EditorMessageType } from '../EditorMessage.vue';



@Component({
  emits: [
    "clearselection",
    "stepselect",
    "stepdeselect",
    "stepadded",
    "stepmoved",
    "remove",
    "connectionadded",
    "connectionremoved",
    "stepActionIndexChange",
    "selectAction",
    "addStepAction",
    "addStepComment",
    "resolveStepComments",
    "addFlowComment",
    "resolveFlowComments",
    "addActionComment",
    "resolveActionComments",
  ],
  components: { VueFlow, RemovableEdge, StartNode, StepNode },
})
export default class TickFlow extends Vue {
  @Prop() private flow!: TickFlowDefinition;
  @Prop() private steps: Required<FlowStep>[];
  @Prop() private connections: Connection[];
  @Prop() private startPosition: Required<UIPositionData>;
  @Prop() private selectedActionId: string;
  @Prop() private selectedStepId: string;
  @Prop() private trigger!: FlowTriggerEnum;
  @Prop() private startStepId!: string;
  @Prop() private comments!: FlowComment[];
  @Prop() private allowEdit!: boolean;
  @Prop() private allowEditExecutingsettings!: boolean;
  @Prop() private flowName!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;

  private vueFlowRef: VueFlowStore = null;// https://vueflow.dev/guide/
  private vueFlowPaneREady = false;
  private startHandle: OnConnectStartParams = null;

  private edgeAnimationOffset = 0;

  centerOnStep(stepId: string) {
    //called from parent editor
    this.vueFlowRef.fitView({
      nodes: [stepId],
      duration: 1000, // use this if you want a smooth transition to the node
      padding: 1.5 // use this for some padding around the node

    })
  }

  private getPos(e: MouseEvent) {
    const position = this.vueFlowRef.screenToFlowCoordinate({
      x: e.clientX,
      y: e.clientY,
    });

    return position;

  }

  mounted() {
    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.vueFlowPaneREady) {
        const position = this.vueFlowRef.screenToFlowCoordinate({
          x: e.clientX,
          y: e.clientY,
        });

        useFlowStore().projectedMousePositionX = position.x;
        useFlowStore().projectedMousePositionY = position.y;
      }
    });

    this.onNextAnimationFrame();

  }

  private onNextAnimationFrame() {
    setTimeout(() => {
      this.edgeAnimationOffset++;
      this.onNextAnimationFrame();
    }, 20);
  }


  private showFlowContextMenu(e: MouseEvent) {
    if (!this.allowEdit) { return; }
    const options: DropdownOption[] = [
      {
        id: 'add',
        text: "Add new step",
        icon: 'plus',
        onSelect: () => {
          this.addNode(e);
        },
      }
    ]

    openContextDropdownPanel(e, options, "Flow menu");
    e.stopPropagation();
  }

  private get startNodeIsSelected() {
    return this.selectedStepId == "start";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onConnectStart(params: OnConnectStartParams) {
    this.startHandle = params
  }
  private onConnectEnd(e: MouseEvent) {
    // any step within bounds?
    const nodeEl = document.elementsFromPoint(e.clientX, e.clientY).find((el) => {
      return !!el.getAttribute('data-id')
    })

    // let go over another node? don't do anything 
    if (nodeEl) { return; }

    // const position = this.vueFlowRef.project({
    //   x: e.clientX - 250,
    //   y: e.clientY,
    // });
    const position = this.getPos(e);

    const sourceHandle = document.querySelectorAll(`[data-handleid='${this.startHandle.handleId}']`)[0]
    const isFailureHandle = sourceHandle.className.indexOf("isFailureHandle") > -1;

    this.$emit("stepadded", position, this.startHandle.handleId, isFailureHandle);
  }

  private clearSelection() {
    this.$emit("clearselection");
  }
  private resolveFlowComments() {
    this.$emit("resolveFlowComments");
  }
  private addFlowComment(to: FlowComment) {
    this.$emit("addFlowComment", to);
  }
  private addStepComment(stepId: string, comment: FlowComment) {
    this.$emit("addStepComment", stepId, comment);
  }
  private resolveStepComments(stepId: string) {
    this.$emit("resolveStepComments", stepId);
  }
  private addActionComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addActionComment", stepId, actionId, comment);
  }
  private resolveActionComments(stepId: string, actionId: string) {
    this.$emit("resolveActionComments", stepId, actionId);
  }

  private onRemoveConnection(id: string) {
    if (!this.allowEdit) { return; }
    var connectionToRemove = this.connections.find(
      (c) => id == `c||${c.source}||${c.target}`
    );
    this.$emit("connectionremoved", connectionToRemove);
  }

  private onPaneReady(instance: VueFlowStore) {
    this.vueFlowRef = instance;
    this.vueFlowPaneREady = true;
  }

  private nodeIsSelected(stepId: string): boolean {
    return this.selectedStepId == stepId;
  }
  private nodeIsInActiveLog(stepId: string): boolean {
    return this.selectedLog?.travelData?.breadCrumbs?.some(p => p.targetStepId == stepId);
  }
  private nodeZIndex(stepId: string): number {

    return (this.nodeIsInActiveLog(stepId) || this.nodeIsSelected(stepId)) ? 1000 : 1;
  }

  private get startingChannels(): TickChannelSummary[] {

    const response: TickChannelSummary[] = [];
    const startingChannelIds = this.flow?.startOnCommunicationChannelIds || [];
    for (let index = 0; index < startingChannelIds.length; index++) {
      const channelId = this.flow.startOnCommunicationChannelIds[index];
      const channel = useUtilityDataStore().communicationChannel(channelId);
      if (channel) {
        response.push(channel);
      }
    }

    return response;
  }


  private getStepWarnings(s: FlowStep): FlowStepEditorMessage[] {
    const response: FlowStepEditorMessage[] = [];
    const hasPhoneChannel = this.startingChannels.some(p => p.communicationType == CommunicationType.Phone);

    if (s.actions) {
      for (let index = 0; index < s.actions.length; index++) {
        const prevAction = index == 0 ? null : s.actions.find(p => p.index == index - 1);
        const action = s.actions.find(p => p.index == index);

        // check if previous action was a message, that gives issues
        if (hasPhoneChannel && prevAction && action) {
          if (prevAction.actionType == FlowActionType.BOT && action.actionType == FlowActionType.BOT) {
            const prevBotSettings = JSON.parse(prevAction?.actionSettingsJson || "{}") as MessageBotActionSettings;
            if (prevBotSettings.actionType == BotActionTypeEnum.Message) {
              response.push({
                title: "When sending a voice message and then directly another question or message the first message will not be heard. Fix this issue by merging the message and question together",
                message: "Phone channel issue",
                type: EditorMessageType.Warning,
                actionId: action.id,

              })
            }

          }


        }
      }

      return response;
    }
  }

  private get nodes() {
    if (!this.vueFlowPaneREady) { return []; }

    const r: Node[] = [];
    const startId = "start";
    r.push({
      id: startId,
      type: startId,
      position: this.startPosition,
      zIndex: this.nodeZIndex(startId),
    });


    this.steps.forEach((s, i) => {

      const stepData: stepNodeData = {
        step: s,
        hasStartConnection: stepHasStartConnection(s, this.connections),
        warnings: this.getStepWarnings(s),
      };

      r.push({
        id: s.id,
        zIndex: this.nodeZIndex(s.id),
        position: (s.uiPosition as Required<UIPositionData>) || {
          x: 80,
          y: 160 * (i + 1),
        },
        label: s.name,
        type: "step",
        data: stepData,
        dragHandle: ".header",
      });
    });


    return r;
  }

  private get edges(): Edge[] {


    if (!this.vueFlowPaneREady) { return []; }

    const edges = this.connections.map((c) => ({
      id: `c||${c.source}||${c.target}`,
      source: c.sourceStep,
      target: c.targetStep,

      sourceHandle: c.source,

      // label: 'test',
      markerEnd: undefined,
      markerStart: undefined,
      type: "removable",
      targetHandle: c.target,
      disabled: !this.allowEdit,

      style: () => this.calculateEdgeStyle(c),
    }));

    return edges
  }

  private getAnimationOffsetPx(): string {
    const divider = 2;
    const a = (this.edgeAnimationOffset / divider) * -1;
    return `${a}px`;
  }


  private calculateEdgeStyle(c: Connection) {
    return {
      stroke: c.color ?? getColorHex(ColorsEnum.Grey),
      "stroke-dasharray": c.animated ? "10,5,5, 10" : "5,5",
      "stroke-dashoffset": c.animated ? `${this.getAnimationOffsetPx()}` : 0,
      "stroke-width": c.animated ? 3 : 1,
      //filter: 'invert(100%)',
    };


    // if (c.color) {
    //   return {
    //     stroke: c.color ?? "",
    //     "stroke-dasharray": "5,5",
    //     "stroke-dashoffset": c.animated ? `${this.getAnimationOffsetPx()}` : 0,
    //     //filter: 'invert(100%)',
    //   };
    // } else {
    //   return {
    //     stroke: getColorHex(ColorsEnum.Grey),
    //     "stroke-dasharray": "5,5",
    //     "stroke-dashoffset": c.animated ? `${this.getAnimationOffsetPx()}` : 0,
    //     //filter: 'invert(100%)',
    //   };
    // }
  }

  private onAddStepAction(req: actionCreationOption) {
    this.$emit("addStepAction", req);
  }

  private onSelectAction(req: actionSelectionEvent) {
    this.$emit("selectAction", req);
  }

  private onSelectStep(id: string) {
    this.onSelectAction({
      actionId: null,
      stepId: id,
      fitView: false,
    })
  }

  private onStepActionIndexChange(req: stepIndexChange) {
    this.$emit("stepActionIndexChange", req);
  }

  private nodesChanged(to: NodeChange[]) {
    to.forEach((c) => {
      switch (c.type) {
        case "select":
          if (c.selected) {
            //this.onSelectStep(c.id);
            this.$emit("stepselect", c.id);
          } else {
            this.$emit("stepdeselect", c.id);
          }
          break;
        case "position":
          if (!c.position) {
            return;
          }
          this.$emit("stepmoved", { ...c.position, id: c.id });
          break;
        case "remove":
          // Prevent start node from being removed
          if (c.id === "start") {
            return;
          }
          this.$emit("remove", c.id);
          break;
      }
    });
  }

  private addNode(e: MouseEvent) {
    const nodeEl = document.elementsFromPoint(e.clientX, e.clientY).find((el) => {
      // letting connection loose over another step.. do nothing
      return !!el.getAttribute('data-id')
    })

    // double click on another node? dont do anything 
    if (nodeEl) { return; }


    const position = this.getPos(e);

    this.$emit("stepadded", position, null);
  }

  private onConnection(c: NodeConnection) {
    this.$emit("connectionadded", {
      source: c.sourceHandle,
      target: c.targetHandle,
    }, true);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>

<style lang="scss">
@import "@/styles/theme";

.vue-flow {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.vue-flow__container {
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
}

.vue-flow__transformationpane {
  pointer-events: none;
  transform-origin: 0 0;
  z-index: 2;
}

.vue-flow__pane {
  z-index: 1;
}

.vue-flow__viewport {
  z-index: 4;
}

.vue-flow__selectionpane {
  z-index: 5;
}

.vue-flow__selection {
  position: absolute;
  top: 0;
  left: 0;
}

.vue-flow__edges {
  overflow: visible;
  pointer-events: none;
}

.vue-flow__edge {
  pointer-events: visibleStroke;
}

// .edge-button-body {
//   background-color: transparent;
// }

.vue-flow__edge-removable:hover {
  .edgebutton {
    visibility: visible;
  }
}

.edgebutton {
  visibility: hidden;
  //border-radius: 999px;
  cursor: pointer;
  background-color: var(--c-base);
  //width: 30px;
  //height: 30px;
  //text-align: center;
  // color: black;
}

.edgebutton:hover {
  // background-color: white;
  // color: red;

  // transform:scale(1.2);
  // transition:all ease .5s;
  // box-shadow:0 0 0 2px #10b98180,0 0 0 4px #10b981
}

.vue-flow__edge.inactive {
  pointer-events: none;
}

@-webkit-keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

.vue-flow__edge-path {
  fill: none;
}

.vue-flow__edge-textwrapper {
  pointer-events: all;
}

.vue-flow__edge-text {
  pointer-events: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

.vue-flow .vue-flow__connectionline {
  z-index: 1001;
}

.vue-flow__connection {
  pointer-events: none;
}

.vue-flow__connection .animated {
  stroke-dasharray: 5;
  -webkit-animation: dashdraw 0.5s linear infinite;
  animation: dashdraw 0.5s linear infinite;
}

.vue-flow__connection-path {
  fill: none;
}

.vue-flow__nodes {
  pointer-events: none;
  transform-origin: 0 0;
}

.vue-flow__node {
  position: absolute;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  pointer-events: all;
  transform-origin: 0 0;
  box-sizing: border-box;
}

.vue-flow__nodesselection {
  z-index: 3;
  transform-origin: left top;
  pointer-events: none;
}

.vue-flow__nodesselection-rect {
  position: absolute;
  pointer-events: all;
  cursor: -webkit-grab;
  cursor: grab;
}

.vue-flow__handle {
  pointer-events: none;
}

.vue-flow__handle.connectable {
  pointer-events: all;
}

.vue-flow__edgeupdater {
  cursor: move;
  pointer-events: all;
}

//Connection between nodes
.vue-flow__edge-path {
  stroke: #b1b1b7;
  stroke-width: 1;
}

//Connection while being created
.vue-flow__connection-path {
  stroke: #b1b1b7;
  stroke-width: 1;
}

/* additional components */
// .vue-flow__controls {
//   position: absolute;
//   z-index: 5;
//   bottom: 10px;
//   left: 10px;
// }

// .vue-flow__controls-button {
//   width: 24px;
//   height: 24px;
//   border: none;
// }

// .vue-flow__controls-button svg {
//   width: 100%;
// }

// .vue-flow__minimap {
//   position: absolute;
//   z-index: 5;
//   bottom: 10px;
//   right: 10px;
// }

// --

.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: #555;
}

.vue-flow__edge.animated path {
  stroke-dasharray: 5;
  -webkit-animation: dashdraw 0.5s linear infinite;
  animation: dashdraw 0.5s linear infinite;
}

.vue-flow__edge.updating .vue-flow__edge-path {
  stroke: #777;
}



// .vue-flow__edge-text {
//   font-size: 10px;
// }

// .vue-flow__edge-textbg {
//   fill: #fff;
// }



// .vue-flow__nodesselection-rect {
//   //background: rgba(241, 3, 3, 0.8);
//   border: 1px dotted rgba(90, 116, 0, 0.8);
// }

// .vue-flow__handle:not(.off) {
//   // width: 10px;
//   // height: 10px;

//   // border: 2px solid $brand;
//   // border-radius: 100%;
// }</style>
