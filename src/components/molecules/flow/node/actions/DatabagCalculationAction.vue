<template>

  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="databag" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">

    <TickTokenizedContentViewer class="message" :content="summaryText" />
  </ActionBase>

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickIcon from "@/components/TickIcon.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import { DatabagCalculateSettingsData, FlowActionDatabagSettings, FlowComment, FlowDefinitionAction, LanguagePath, TickFlowInstanceLog } from "@/TickApi";
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import { getDatabagCalculateOperatorOptions } from '@/helpers/enumsHelper';
import ActionBase from '../ActionBase.vue';
import { translate } from '@/plugins/translatePlugin';
import TickTokenizedContentViewer from '@/components/atoms/TickTokenizedContentViewer.vue';
import { ensureTokenBraces } from '@/helpers/tokenizationHelper';

@Component({
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, ThenHr, EditorMessage, ActionBase, TickTokenizedContentViewer },
})
export default class DatabagCalculationAction extends Vue {
  EditorMessageType = EditorMessageType
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: FlowActionDatabagSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;
  private get data() {
    return jsonProxy<DatabagCalculateSettingsData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }


  private get operatorOptions() {
    return getDatabagCalculateOperatorOptions();
  }



  private get summaryText() {
    const input1 = this.data?.referenceInput1 ?? "0";
    const input2 = this.data?.referenceInput2 ?? "0";

    const operator = this.operatorOptions.find(p => p.value == this.data?.operator)?.text ?? "?"

    const storageLocation = this.data?.storeStoragePath;
    const summary = translate(LanguagePath.App_FlowEditor_ActionView_DatabagCalculation_Calculus, [
      { path: 'input1', value: ensureTokenBraces(input1) },
      { path: 'operator', value: operator },
      { path: 'input2', value: ensureTokenBraces(input2) },
      { path: 'storageLocation', value: ensureTokenBraces(storageLocation) },
    ]);

    return summary.toLowerCase();
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
}
</style>
