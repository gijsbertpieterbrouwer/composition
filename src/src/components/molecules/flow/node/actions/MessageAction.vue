<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="message" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">

    <template #message>
      <template v-if="hasData">
        <TickTokenizedContentViewer class="message" :content="message" />
        <LabelList v-if="attachmentLabels.length" class="labellist" :labels="attachmentLabels" :allowRemove="false" :disableCollapse="true" :disableToggle="true" />
      </template>
    </template>

    <EditorMessage v-if="!hasData" :type="EditorMessageType.Warning" title="Type a message" message="Without a message or attachment there is nothing to sent" />

  </ActionBase>
</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickIcon from "@/components/TickIcon.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import { BotMessageActionData, ColorsEnum, FlowComment, FlowDefinitionAction, TickFlowInstanceLog } from "@/TickApi";
import { BotActionSettings, MessageBotActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from 'vue-facing-decorator';
//import TickActionDraggableHandle from './TickActionDraggableHandle.vue';
import LabelList, { Label } from '@/components/atoms/LabelList.vue';
import TickTokenizedContentViewer from '@/components/atoms/TickTokenizedContentViewer.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import { stringIsNullOrEmpty } from '@/helpers/stringHelper';
import useUtilityDataStore from '@/store/utilitydata';
import ActionBase from '../ActionBase.vue';

@Component({
  directives: {},
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, ThenHr, EditorMessage, LabelList, ActionBase, TickTokenizedContentViewer },
})
export default class MessageAction extends Vue {
  EditorMessageType = EditorMessageType;
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
  private addComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addComment", stepId, actionId, comment);
  }
  private resolveComments() {
    this.$emit("resolveComments", this.action.id);
  }
  private get hasData() {
    return !stringIsNullOrEmpty(this.dataForMessage.message);
  }

  private get dataForMessage(): BotMessageActionData {
    return this.data as never;
  }

  private get message() {
    return this.dataForMessage.message ? `"${this.dataForMessage.message}"` : "";
  }

  private get attachmentLabels() {
    const options = useUtilityDataStore().utilityData.files;
    const actionableItems = this.dataForMessage.attachmentWorkspaceFiles;
    if (!actionableItems) {
      return [];
    }

    var labels: Label[] = [];
    for (let i = 0; i < actionableItems.length; i++) {
      var attachment = actionableItems[i];

      let option = options.find((l) => l.id == attachment);
      if (option) {
        labels.push({
          id: option.id,
          name: option.name,
          color: ColorsEnum.Grey,
        });
      }
    }

    return labels;
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

  .message {
    font-style: italic;
    padding: 0 12px;
    color: var(--c-contrast-200);

    max-height: 120px;
    overflow: auto;
  }
}
</style>
