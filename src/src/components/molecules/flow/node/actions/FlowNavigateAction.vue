<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="flow" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">
    <template v-if="hasFlow">
      <div>
        <TickFlowLabel :id="flowId" />
      </div>
    </template>
    <EditorMessage v-else :type="EditorMessageType.Warning" title="Select a flow" message="Select an flow to be executed" />
  </ActionBase>


</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import { FlowComment, FlowDefinitionAction, NavToSubflowSettings, TickFlowInstanceLog } from "@/TickApi";
import { FlowNavigationFlowLogicActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from 'vue-facing-decorator';
//import TickActionDraggableHandle from './TickActionDraggableHandle.vue';
import TickFlowLabel from '@/components/atoms/TickFlowLabel.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import ActionBase from '../ActionBase.vue';

@Component({
  emits: ["addComment", "resolveComments"],
  components: { ThenHr, EditorMessage, TickFlowLabel, ActionBase },
})
export default class FlowNavigateAction extends Vue {
  EditorMessageType = EditorMessageType;
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: FlowNavigationFlowLogicActionSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;
  private get data() {
    return jsonProxy<NavToSubflowSettings>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }
  private addComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addComment", stepId, actionId, comment);
  }
  private resolveComments() {
    this.$emit("resolveComments", this.action.id);
  }

  // private get handleId() {
  //   return getConnectionHandleId(this.stepId, this.action.id);
  // }

  private get flowId() {
    return this.data.targetFlowDefinitionId;
  }

  private get hasFlow() {
    return this.data.targetFlowDefinitionId != null;
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



  .data-name {
    color: $brand2;
  }
}
</style>
