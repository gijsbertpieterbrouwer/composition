<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="search" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">
    <TickTokenizedContentViewer class="message" :content="message" />

    <div v-if="hasKnowledgebaseIds">
      {{ $translate(LanguagePath.App_FlowEditor_Knowledgebase_SearchIn) }}
      <LabelList v-if="knowledgebaseLabels.length" class="labellist" :labels="knowledgebaseLabels" :allowRemove="false" :disableCollapse="true" :disableToggle="true" />
    </div>
    <EditorMessage v-else :type="EditorMessageType.Warning" title="Select Knowledge base" message="Select a knowledge base to search in" />

    <div class="showAmount"> {{ $translate(LanguagePath.App_FlowEditor_Knowledgebase_ShowMaxResults_Title, [{ path: 'nr', value: this.showAmount }]) }}</div>

    <template #routes>
      <RouteOption :title="$translate(LanguagePath.App_FlowEditor_Knowledgebase_Route_NoArticleFound)" :isConnected="bypassIsConnected" :routeHandleId="optionHandleId('bypass')"
        :isFailureHandle="false" />

      <RouteOption v-if="hasAttempts" :title="$translate(LanguagePath.App_FlowEditor_ActionView_OnResponseTimeout)" :icon="'clock'" :isConnected="failureIsConnected"
        :routeHandleId="optionHandleId('failure')" :isFailureHandle="true" />

    </template>
  </ActionBase>
</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickIcon from "@/components/TickIcon.vue";
import { getConnectionHandleId } from "@/helpers/flowhelpers";
import { jsonProxy } from "@/helpers/jsonProxy";
import { BotSearchKnowledgeBaseActionData, ColorsEnum, FlowComment, FlowDefinitionAction, LanguagePath, TickFlowInstanceLog } from "@/TickApi";
import { BotActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from 'vue-facing-decorator';
//import TickActionDraggableHandle from './TickActionDraggableHandle.vue';
import LabelList, { Label } from '@/components/atoms/LabelList.vue';
import TickTokenizedContentViewer from '@/components/atoms/TickTokenizedContentViewer.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import useUtilityDataStore from '@/store/utilitydata';
import ActionBase from '../ActionBase.vue';
import RouteOption from '../RouteOption.vue';
import TickHandle from '../TickHandle.vue';


@Component({
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, ThenHr, EditorMessage, TickHandle, LabelList, ActionBase, RouteOption, TickTokenizedContentViewer },
})
export default class MessageSearchKnowledgeBaseAction extends Vue {
  EditorMessageType = EditorMessageType
  LanguagePath = LanguagePath
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: BotActionSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;

  private get data() {
    return jsonProxy<BotSearchKnowledgeBaseActionData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private addComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addComment", stepId, actionId, comment);
  }
  private resolveComments() {
    this.$emit("resolveComments", this.action.id);
  }
  private optionHandleId(option: string) {
    return getConnectionHandleId(this.stepId, this.action.id, option);
  }

  private get hasAttempts() {
    return this.data.awaitResponseSettings != null
      && this.data.awaitResponseSettings.active
      && this.data.awaitResponseSettings.attemptSettings != null
      && this.data.awaitResponseSettings.attemptSettings.length;

  }

  private get failureIsConnected() {
    return this.data.awaitResponseSettings != null && this.data.awaitResponseSettings.failureTargetStepId;
  }
  private get bypassIsConnected() {
    return this.data.bypassTargetStepId;
  }

  private get message() {
    return this.data.message ? `"${this.data.message}"` : "";
  }

  private get showAmount() {
    return this.data.showAmount || "";
  }

  private get hasKnowledgebaseIds() {
    return this.data.knowledgeBaseIds && this.data.knowledgeBaseIds.length;
  }

  private get knowledgebaseLabels() {
    const options = useUtilityDataStore().utilityData.knowledgeBases;
    const actionableItems = this.data.knowledgeBaseIds || [];
    if (!actionableItems) {
      return [];
    }

    var labels: Label[] = [];
    for (let i = 0; i < actionableItems.length; i++) {
      var kbId = actionableItems[i];

      let option = options.find((l) => l.id == kbId);
      if (option) {
        labels.push({
          id: option.id,
          name: option.name,
          color: ColorsEnum.BoldBlue,
        });
      }
    }

    return labels;
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.message {
  font-style: italic;
  padding: 0 12px;
  color: var(--c-contrast-200);
  max-height: 120px;
  overflow: auto;
}



.search-in {
  // display: flex;
  //gap: 10px;
  //padding: 0 12px;
}

.showAmount {
  font-style: italic;
  // padding: 0 12px;
}

.action-details {
  display: grid;
  gap: 10px;
}

.action {
  font-size: 14px;
  line-height: 16px;
  position: relative;
  padding: 0 12px;
  position: relative;
  display: grid;
  gap: 5px;

  .handle-targetstep {
    margin-left: 30px;
  }
}


.failureHandle {
  position: relative;
  left: calc(100% + 12px);
  right: -5px;
  bottom: 7px;
}






hr {
  border: none;
  margin: 12px 0 8px 0;
  padding: 0;
  height: 1px;
  background-color: $grey200;
}

.failureHandle {
  position: relative;
  left: calc(100% + 12px);
  right: -5px;
  bottom: 7px;
}
</style>
