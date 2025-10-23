<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="note" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">
    <TickTokenizedContentViewer class="message" :content="message" />
  </ActionBase>

</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickIcon from "@/components/TickIcon.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import { BotNoteActionData, FlowComment, FlowDefinitionAction, TickFlowInstanceLog } from "@/TickApi";
import { BotActionSettings, MessageBotActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from 'vue-facing-decorator';
//import TickActionDraggableHandle from './TickActionDraggableHandle.vue';
import TickTokenizedContentViewer from '@/components/atoms/TickTokenizedContentViewer.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import ActionBase from '../ActionBase.vue';

@Component({
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, ThenHr, EditorMessage, ActionBase, TickTokenizedContentViewer },
})
export default class NoteAction extends Vue {
  EditorMessageType = EditorMessageType
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: BotActionSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;

  private get data() {
    return jsonProxy<MessageBotActionSettings>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private get dataForMessage(): BotNoteActionData {
    return this.data as never;
  }


  private get message() {
    return this.dataForMessage.message ? `"${this.dataForMessage.message}"` : "";
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
}

.message {
  font-style: italic;
  padding: 0 12px;
  color: var(--c-contrast-200);
  max-height: 120px;
  overflow: auto;
}
</style>
