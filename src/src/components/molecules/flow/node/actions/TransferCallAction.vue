<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="phone" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">

    <template #routes>
      <RouteOption v-if="hasActionData" :title="'On failure'" :icon="'phonemissed'" :isConnected="failureIsConnected" :routeHandleId="optionHandleId('failure')" :isFailureHandle="true" />
    </template>

    <template #message>
      <div class="skip-message">{{ $translate(LanguagePath.App_FlowEditor_Special_TransferCall_SkipMessage) }}</div>
      <template v-if="hasActionData">
        <TickTokenizedContentViewer :content="message" />
      </template>
    </template>


    <EditorMessage v-if="!hasActionData" :type="EditorMessageType.Warning" title="No Title" message="Configure a new title to be used" />
  </ActionBase>
</template>

<script lang="ts">
import LabelList from "@/components/atoms/LabelList.vue";
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickIcon from "@/components/TickIcon.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import { FlowActionSpecialSettings, FlowComment, FlowDefinitionAction, LabelActionType, LanguagePath, SpecialTransferCallSettings, TickFlowInstanceLog } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';
////import TickActionDraggableHandle from './TickActionDraggableHandle.vue';
import TickTokenizedContentViewer from '@/components/atoms/TickTokenizedContentViewer.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import { getConnectionHandleId } from "@/helpers/flowhelpers";
import ActionBase from '../ActionBase.vue';
import RouteOption from "../RouteOption.vue";

@Component({
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, LabelList, ThenHr, EditorMessage, ActionBase, TickTokenizedContentViewer, RouteOption },
})
export default class TransferCallAction extends Vue {
  EditorMessageType = EditorMessageType
  LabelActionType = LabelActionType;
  LanguagePath = LanguagePath;
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: FlowActionSpecialSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;
  private get data() {
    return jsonProxy<SpecialTransferCallSettings>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private addComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addComment", stepId, actionId, comment);
  }
  private resolveComments() {
    this.$emit("resolveComments", this.action.id);
  }

  private get hasActionData() {
    return this.data.message;
  }

  private get message() {
    return this.data.message;
  }

  private optionHandleId(option: string) {
    return getConnectionHandleId(this.stepId, this.action.id, option);
  }
  private get failureIsConnected() {
    return this.data.failTargetStepId != null && this.data.failTargetStepId != "";
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


  .skip-message {
    font-weight: 200;
    font-style: normal;
    padding-bottom: 20px;
    padding-left: 20px;
  }

}
</style>
