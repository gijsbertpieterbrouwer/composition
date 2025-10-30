import { debug } from "@/log";
import useCollectionsStore from "@/store/collections";
import useFlowStore from "@/store/flows";
import { AddActionCommentRequest, AddFlowCommentRequest, AddStepCommentRequest, CreateFlowDefinitionActionRequest, CreateFlowStepRequest, DeleteActionRequest, DeleteFlowDefinitionRequest, DeleteFlowStepRequest, MoveActionRequest, MoveActionResponse, ObjectRemovalProgress, ResolveActionCommentsRequest, ResolveFlowCommentsRequest, ResolveStepCommentsRequest, RestoreFlowDefinitionRequest, SetFlowActiveStatusRequest, SetFlowActiveStatusResponse, TickFlowDefinitionMetaData, UIPositionData, UpdateActionRequest, UpdateFlowStepActionResponse, UpdateFlowStepPositionRequest, UpdateFlowStepRequest, UpdateFlowStepResponse, UpdateFlowStepTargetRequest } from "@/TickApi";
import { RtcHubInstance } from "./RtcHubInstance";

export interface ActionWithIndex {
  actionId: string;
  index: number;
}

class FlowRtcHub extends RtcHubInstance {
  protected rtcName = "flowRTC";

  protected subscribeToEvents() {
    debug(`[Flow RTC:Subscribe] subscribed to details`);

    this.on("UpdateFlowActive", (update: SetFlowActiveStatusResponse) => {

      useFlowStore().patchFlowActive(update.flowVersionId, update.active);
    });

    this.on("CreateFlowComment", (update: AddStepCommentRequest) => {
      useFlowStore().patchFlowComment(update.flowVersionId, update);
    });

    this.on("ResolveFlowComments", (update: ResolveFlowCommentsRequest) => {
      useFlowStore().removeFlowComments(update.flowVersionId);
    });

    this.on("UpdateFlowMetaData", (update: TickFlowDefinitionMetaData) => {
      useFlowStore().patchFlow(update);
    });

    this.on("DeleteFlow", (update: DeleteFlowDefinitionRequest) => {
      useFlowStore().deleteFlow(update.flowVersionId);
    });

    this.on("DeleteFlowProgress", (update: ObjectRemovalProgress) => {
      useCollectionsStore().deleteFromRTC(update);
      //TODO: if update contains messages (or failure) => notify client
    });

    this.on("CreateFlowStep", (update: UpdateFlowStepResponse) => {
      useFlowStore().patchStep(update.flowVersionId, update.step);
    });

    this.on("UpdateFlowStep", (update: UpdateFlowStepResponse) => {
      useFlowStore().patchStep(update.flowVersionId, update.step);

    });

    this.on("UpdateFlowStepPosition", (update: UpdateFlowStepPositionRequest) => {
      useFlowStore().patchStepPosition(update.flowVersionId, update.stepId, update.position);
    });

    this.on("DeleteFlowStep", (update: DeleteFlowStepRequest) => {
      useFlowStore().deleteStep(update.flowVersionId, update.stepId);
    });

    // --

    this.on("CreateFlowStepAction", (update: UpdateFlowStepActionResponse) => {
      useFlowStore().patchAction(update.flowVersionId, update.stepId, update.action);
    });

    this.on("UpdateFlowStepAction", (update: UpdateFlowStepActionResponse) => {
      useFlowStore().patchAction(update.flowVersionId, update.stepId, update.action);
    });

    this.on("StepMoved", (update: MoveActionResponse) => {
      for (let index = 0; index < update.affectedSteps.length; index++) {
        const stepUpdate = update.affectedSteps[index];
        useFlowStore().patchActionIndexes(update.flowVersionId, stepUpdate.stepId, stepUpdate.actionIndexes);
      }

      //TODO: call vue flow to update the nodes internally => https://vueflow.dev/guide/node.html#dynamic-handle-positions-adding-handles-dynamically

    });

    this.on("DeleteFlowStepAction", (update: DeleteActionRequest) => {
      useFlowStore().deleteAction(update.flowVersionId, update.stepId, update.actionId);
    });
  }

  protected startSubscription(FlowVersionId: string) {
    this.call("SubscribeToFlowEditor", {
      FlowVersionId: FlowVersionId,
      Active: true,
    });
  }

  protected endSubscription(FlowVersionId: string) {
    this.call("SubscribeToFlowEditor", {
      FlowVersionId: FlowVersionId,
      Active: false,
    });
  }
  private normalizePosition(pos: UIPositionData | undefined): UIPositionData {
    if (!pos) { pos = { x: 0, y: 0 }; }
    return {
      x: Math.round(pos.x || 0),
      y: Math.round(pos.y || 0),
    }
  }




  public addStep(params: CreateFlowStepRequest) {
    params.position = this.normalizePosition(params.position);
    this.call("CreateStep", params);
  }
  public addFlowComment(params: AddFlowCommentRequest) {
    this.call("AddFlowComment", params);
  }
  public addStepComment(params: AddStepCommentRequest) {
    //useFlowStore().patchFlowStepComment(params.flowVersionId, params);
    this.call("AddStepComment", params);
  }
  public addActionComment(params: AddActionCommentRequest) {
    this.call("AddActionComment", params);
  }
  public resolveFlowComments(params: ResolveFlowCommentsRequest) {
    this.call("ResolveFlowComments", params);
  }
  public resolveStepComments(params: ResolveStepCommentsRequest) {
    this.call("ResolveStepComments", params);
  }
  public resolveActionComments(params: ResolveActionCommentsRequest) {
    this.call("ResolveActionComments", params);
  }


  public updateFlow(flow: TickFlowDefinitionMetaData) {
    this.call("UpdateFlowMetaData", flow);

  }

  public updateStep(params: UpdateFlowStepRequest) {
    params.position = this.normalizePosition(params.position);
    this.call("UpdateStep", params);
  }
  public updateStepTargetStep(params: UpdateFlowStepTargetRequest) {
    this.call("UpdateStepTargetStep", params);
  }
  public updateStepPosition(params: UpdateFlowStepPositionRequest) {
    params.position = this.normalizePosition(params.position);
    this.call("UpdateStepPosition", params);
  }

  public deleteStep(params: DeleteFlowStepRequest) {
    this.call("DeleteStep", params);
  }

  public addAction(params: CreateFlowDefinitionActionRequest) {
    this.call("CreateAction", params);
  }

  public updateAction(params: UpdateActionRequest) {
    this.call("UpdateAction", params);
  }

  public moveAction(params: MoveActionRequest) {
    this.call("MoveAction", params);
  }

  public deleteAction(params: DeleteActionRequest) {
    this.call("DeleteAction", params);
  }

  public deleteFlow(params: DeleteFlowDefinitionRequest) {
    this.call("DeleteFlow", params);
  }
  public restoreFlow(params: RestoreFlowDefinitionRequest) {
    this.call("RestoreFlow", params);
  }
  public setFlowActive(params: SetFlowActiveStatusRequest) {
    this.call("SetFlowActive", params);
  }
}

export default new FlowRtcHub();
