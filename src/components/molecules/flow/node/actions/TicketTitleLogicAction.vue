<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="edit" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">

    <template #message>
      <template v-if="hasActionData">
        <TickTokenizedContentViewer :content="title" />
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
import { FlowComment, FlowDefinitionAction, LabelActionType, TicketLogicTitleActionData, TickFlowInstanceLog, } from "@/TickApi";
import { TicketTitleActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from 'vue-facing-decorator';
////import TickActionDraggableHandle from './TickActionDraggableHandle.vue';
import TickTokenizedContentViewer from '@/components/atoms/TickTokenizedContentViewer.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import ActionBase from '../ActionBase.vue';

@Component({
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, LabelList, ThenHr, EditorMessage, ActionBase, TickTokenizedContentViewer },
})
export default class TicketTitleLogicAction extends Vue {
  EditorMessageType = EditorMessageType
  LabelActionType = LabelActionType;
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: TicketTitleActionSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;
  private get data() {
    return jsonProxy<TicketLogicTitleActionData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private get hasActionData() {
    return this.data.title;
  }

  private get title() {
    return this.data.title;
  }
  private addComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addComment", stepId, actionId, comment);
  }
  private resolveComments() {
    this.$emit("resolveComments", this.action.id);
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
</style>
