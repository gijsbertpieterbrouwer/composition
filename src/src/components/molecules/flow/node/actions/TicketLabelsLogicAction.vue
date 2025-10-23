<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="label" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">
    <template v-if="hasActionData">
      <template v-if="hasLabels(LabelActionType.Remove)">
        <div class="item">
          <TickIcon class="icon" name="minus" />

          <LabelList class="labels" :labels="labels(LabelActionType.Remove)" />
        </div>
      </template>
      <template v-if="hasLabels(LabelActionType.Add)">
        <div class="item">
          <TickIcon class="icon" name="plus" />
          <LabelList class="labels" :labels="labels(LabelActionType.Add)" />
        </div>
      </template>
    </template>
    <EditorMessage v-else :type="EditorMessageType.Warning" title="No labels to be added/removed" message="Configure labels to be added or removed" />

  </ActionBase>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { getConnectionHandleId } from "@/helpers/flowhelpers";
import { TicketLabelsLogicActionSettings } from "@/TickApiModels";
import { jsonProxy } from "@/helpers/jsonProxy";
import { FlowComment, FlowDefinitionAction, LabelActionType, TicketLogicLabelsActionData, TickLabelDefinition, LanguagePath, TickFlowInstanceLog } from "@/TickApi";
import LabelList from "@/components/atoms/LabelList.vue";
import useUtilityDataStore from '@/store/utilitydata';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import ActionBase from '../ActionBase.vue';
import TickIcon from '@/components/TickIcon.vue';

@Component({
  emits: ["addComment", "resolveComments"],
  components: { LabelList, EditorMessage, ActionBase, TickIcon },
})
export default class TicketLabelsLogicAction extends Vue {
  EditorMessageType = EditorMessageType
  LabelActionType = LabelActionType;
  LanguagePath = LanguagePath
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: TicketLabelsLogicActionSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;
  private get data() {
    return jsonProxy<TicketLogicLabelsActionData>(this.settings.actionDataJson || "{}", (json) => {
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
    return this.data.labelActions.length;
  }

  private hasLabels(type: LabelActionType) {
    return this.data.labelActions.filter((la) => la.action == type).length > 0
  }

  private labels(type: LabelActionType) {
    const allLabels = useUtilityDataStore().utilityData.labelDefinitions;
    const labelsToRemove = this.data.labelActions.filter((la) => la.action == type);
    const ticketLabels: TickLabelDefinition[] = [];

    for (let i = 0; i < labelsToRemove.length; i++) {
      var action = labelsToRemove[i];
      let label = allLabels.find(l => l.id == action.labelDefinitionId);

      if (label) {
        ticketLabels.push(label);
      }
    }
    return ticketLabels;
  }


  private get handleId() {
    return getConnectionHandleId(this.stepId, this.action.id);
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

  .labels {
    display: inline-flex;
  }

  .item {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }


}
</style>
