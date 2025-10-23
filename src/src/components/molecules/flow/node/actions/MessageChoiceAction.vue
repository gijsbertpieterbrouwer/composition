<template>

  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="message" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">

    <template #message>
      <template v-if="hasActionData">
        <TickTokenizedContentViewer class="message" :content="message" />
        <template v-if="optionsSource == OptionsSourceEnum.Databag">
          <TickIcon name="capture" />
          <TickTokenizedContentViewer :content="databagChoiceMessage" />
        </template>
      </template>
    </template>

    <EditorMessage v-if="!hasActionData" :type="EditorMessageType.Warning" title="Add options" message="Select from a predefined list or from a state." />

    <template #routes>
      <template v-if="hasActionData">

        <template v-if="optionsSource == OptionsSourceEnum.Options">

          <RouteOption :highlight="highlightRoute(route)" v-for="route in this.routes()" :key="route.id" :title="route.text" :icon="''" :isConnected="routeIsConnected(route)"
            :routeHandleId="optionHandleId(route)" :isFailureHandle="false" />
        </template>

        <RouteOption v-if="usesResponseTimeout" :title="$translate(LanguagePath.App_FlowEditor_ActionView_OnResponseTimeout)" :icon="'clock'" :isConnected="failureIsConnected"
          :routeHandleId="failureHandleId()" :isFailureHandle="true" />

      </template>

    </template>
  </ActionBase>
</template>

<script lang="ts">
import TickTokenizedContentViewer from '@/components/atoms/TickTokenizedContentViewer.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import TickIcon from "@/components/TickIcon.vue";
import { getConnectionHandleId } from "@/helpers/flowhelpers";
import { jsonProxy } from "@/helpers/jsonProxy";
import { ensureTokenBraces } from '@/helpers/tokenizationHelper';
import { translate } from '@/plugins/translatePlugin';
import { BotChoiceSettings, FlowComment, FlowDefinitionAction, FlowOptionsItemData, LanguagePath, OptionsSourceEnum, TickFlowInstanceLog } from "@/TickApi";
import { ChoiceBotActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ActionBase from '../ActionBase.vue';
import RouteOption from '../RouteOption.vue';
@Component({
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, EditorMessage, ActionBase, RouteOption, TickTokenizedContentViewer },
})
export default class MessageChoiceAction extends Vue {
  EditorMessageType = EditorMessageType;
  OptionsSourceEnum = OptionsSourceEnum;
  LanguagePath = LanguagePath
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: ChoiceBotActionSettings;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;


  private highlightRoute(route: FlowOptionsItemData): boolean {
    return this.selectedLog?.travelData?.breadCrumbs?.some(p =>
      p.sourceStepId == this.stepId
      && p.sourceActionId == this.action.id
      && p.sourceActionOptionId == route.id
    )
  }

  private addComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addComment", stepId, actionId, comment);
  }
  private resolveComments() {
    this.$emit("resolveComments", this.action.id);
  }
  private get hasAttempts() {
    return this.data.awaitResponseSettings != null && this.data.awaitResponseSettings.attemptSettings != null && this.data.awaitResponseSettings.attemptSettings.length;
  }

  private get failureIsConnected() {
    return this.data.awaitResponseSettings != null && this.data.awaitResponseSettings.failureTargetStepId;
  }

  private get data() {
    return jsonProxy<BotChoiceSettings>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private get usesResponseTimeout() {
    return this.data.awaitResponseSettings != null
      && this.data.awaitResponseSettings.active
      && this.data.awaitResponseSettings.attemptSettings != null
      && this.data.awaitResponseSettings.attemptSettings.length;
  }

  private routeIsConnected(route: FlowOptionsItemData) {

    return route.targetStepId && route.targetStepId != null;
  }

  private optionHandleId(route: FlowOptionsItemData) {
    const handleId = getConnectionHandleId(this.stepId, this.action.id, route.id);
    return handleId;
  }

  private failureHandleId() {
    const handleId = getConnectionHandleId(this.stepId, this.action.id, "failure");
    return handleId;
  }

  private get optionsSource() {
    return this.data.optionsSource;
  }

  private routes() {
    return this.data.options || [];
  }

  private get message() {
    return this.data.message ? `"${this.data.message}"` : "";
  }

  private get handleId() {
    return getConnectionHandleId(this.stepId, this.action.id);
  }

  private get hasActionData() {
    switch (this.data.optionsSource) {
      case OptionsSourceEnum.Options:
        return this.data.options && this.data.options.length > 0;
      case OptionsSourceEnum.Databag:
        return this.data.optionsStorageLocationPath
    }


    return false;
  }

  private get databagChoiceMessage() {
    if (this.data.optionsSource == OptionsSourceEnum.Options) { return "-"; }
    return translate(LanguagePath.App_FlowEditor_ActionView_MessageChoice_FromDatabag, [
      { path: 'optionsStorageLocationPath', value: ensureTokenBraces(this.data.optionsStorageLocationPath) },
      { path: 'answerStoragePath', value: ensureTokenBraces(this.data.answerStoragePath) },
    ]);
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

  .fail-targetstep {
    margin-left: 30px;
  }
}

.failureHandle {
  position: relative;
  left: calc(100% + 12px);
  right: -5px;
  bottom: 7px;
}


.routeHandle {
  position: relative;
  left: calc(100% + 12px);
  right: -5px;
  bottom: 7px;
}


.routes {
  margin-top: 20px;
  display: grid;
  gap: 5px;

  .route {}
}


.message {
  font-style: italic;
  padding: 0 12px;
  max-height: 120px;
  overflow: auto;
}
</style>
