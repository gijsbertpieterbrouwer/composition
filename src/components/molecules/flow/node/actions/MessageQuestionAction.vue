<template>
  <ActionBase :warnings="warnings" :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="message" :action="action" @addComment="addComment" @resolveComments="resolveComments"
    :isLastAction="isLastAction">
    <TickTokenizedContentViewer class="message" :content="message" />

    <div class="reply-capture" v-if="usesCapture">
      <div class="title">
        <TickIcon name="capture" />
        {{ this.replyParsing }}
      </div>
    </div>

    <template #routes>

      <template v-if="hasActionData">
        <RouteOption v-for="route in this.routes()" :key="route.id" :title="route.name" :icon="''" :isConnected="routeIsConnected(route)" :routeHandleId="optionHandleId(route.id)"
          :isFailureHandle="false" />
      </template>

      <RouteOption v-if="hasAttempts" :title="$translate(LanguagePath.App_FlowEditor_OnResponseTimeout)" :icon="'clock'" :isConnected="failureIsConnected" :routeHandleId="optionHandleId('failure')"
        :isFailureHandle="true" />
    </template>
  </ActionBase>

</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickTokenizedContentViewer from '@/components/atoms/TickTokenizedContentViewer.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import TickIcon from "@/components/TickIcon.vue";
import { getConnectionHandleId, replyParsingLabel } from "@/helpers/flowhelpers";
import { jsonProxy } from "@/helpers/jsonProxy";
import { BotTextualQuestionActionData, FlowComment, FlowConditionData, FlowDefinitionAction, LanguagePath, TickFlowInstanceLog } from "@/TickApi";
import { BotActionSettings, TextualQuestionBotActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ActionBase from '../ActionBase.vue';
import RouteOption from '../RouteOption.vue';
import { FlowStepEditorMessage } from "../StepNode.vue";
import TickHandle from '../TickHandle.vue';

@Component({
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, ThenHr, EditorMessage, TickHandle, ActionBase, RouteOption, TickTokenizedContentViewer },
})
export default class MessageQuestionAction extends Vue {
  EditorMessageType = EditorMessageType
  LanguagePath = LanguagePath
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: BotActionSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;
  @Prop() private warnings: FlowStepEditorMessage[];

  private get data() {
    return jsonProxy<TextualQuestionBotActionSettings>(this.settings.actionDataJson || "{}", (json) => {
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

  private routeIsConnected(route: FlowConditionData) {
    return route.targetStepId != null && route.targetStepId != "";
  }
  private routes() {
    return this.dataForTextualQuestion.navigateConditions || [];
  }

  private get hasActionData() {
    return this.dataForTextualQuestion.navigateConditions && this.dataForTextualQuestion.navigateConditions.length > 0;
  }

  private get usesCapture() {
    return this.dataForTextualQuestion.saveAnswer;
  }

  private get hasAttempts() {
    return this.dataForTextualQuestion.awaitResponseSettings != null
      && this.dataForTextualQuestion.awaitResponseSettings.active
      && this.dataForTextualQuestion.awaitResponseSettings.attemptSettings != null
      && this.dataForTextualQuestion.awaitResponseSettings.attemptSettings.length;
  }

  private get failureIsConnected() {
    return this.dataForTextualQuestion.awaitResponseSettings != null && this.dataForTextualQuestion.awaitResponseSettings.failureTargetStepId;
  }


  private get dataForTextualQuestion(): BotTextualQuestionActionData {
    return this.data as never;
  }


  private get message() {
    return this.dataForTextualQuestion.message ? `"${this.dataForTextualQuestion.message}"` : "";
  }

  private get replyParsing() {
    return replyParsingLabel(this.settings, this.dataForTextualQuestion);
  }

  // private get replyStorage() {
  //   if (this.action.settings.action !== BotActionType.TextualQuestion) { return ""; }

  //   const storage = this.action.settings.answerStorage;
  //   let value = storage.value;

  //   if (storage.location) {
  //     const locationTypes = Object.entries(StorageLocation);
  //     const type = locationTypes.find((l) => l[1] === parseInt(storage.location.toString()))[0].toLowerCase();
  //     const location = (storage.location) ? `${type}.` : "";
  //     value = `${location}${storage.value}`;
  //   }

  //   return `as { ${value} }`;
  // }
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


.message {
  font-style: italic;
  padding: 0 12px;
  max-height: 120px;
  overflow: auto;
}


hr {
  border: none;
  margin: 12px 0 8px 0;
  padding: 0;
  height: 1px;
  background-color: $grey200;
}

.reply-capture {
  padding: 0 12px;
  position: relative;

  .title {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .sub {
    padding-left: 22px;
  }
}

// .handle {
//   position: absolute;
//   right: -6px;
//   top: calc(50% - 3px);
// }</style>
