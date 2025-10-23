<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="navigate" :action="action" @addComment="addComment" @resolveComments="resolveComments"
    :isLastAction="isLastAction">
    <EditorMessage v-if="!hasActionData" :type="EditorMessageType.Warning" title="Add route(s)" message="Add routes to this action" />

    <template #routes>
      <template v-if="hasActionData">
        <RouteOption v-for="route in this.routes()" :key="route.id" :title="route.name" :icon="''" :isConnected="routeIsConnected(route)" :routeHandleId="optionHandleId(route)"
          :isFailureHandle="false" />
      </template>
    </template>
  </ActionBase>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickIcon from "@/components/TickIcon.vue";
import { getConnectionHandleId } from "@/helpers/flowhelpers";
import { ConditionalNavigateActionSettings } from "@/TickApiModels";
import { jsonProxy } from "@/helpers/jsonProxy";
import { FlowComment, FlowConditionData, FlowDefinitionAction, NextStepLogicConditionalNavigateData, TickFlowInstanceLog } from "@/TickApi";
import TickHandle from '../TickHandle.vue';
////import TickActionDraggableHandle from './TickActionDraggableHandle.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import ActionBase from '../ActionBase.vue';
import RouteOption from '../RouteOption.vue';

@Component(

  {
    emits: ["addComment", "resolveComments"],
    components: { TickIcon, ThenHr, TickHandle, EditorMessage, ActionBase, RouteOption },
  })
export default class ConditionalNavigateAction extends Vue {
  EditorMessageType = EditorMessageType;
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: ConditionalNavigateActionSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;

  private get data() {
    return jsonProxy<NextStepLogicConditionalNavigateData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }
  private addComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addComment", stepId, actionId, comment);
  }
  private resolveComments() {
    this.$emit("resolveComments", this.action.id);
  }
  private routeIsConnected(route: FlowConditionData) {
    return route.targetStepId != null && route.targetStepId != "";
  }

  private optionHandleId(route: FlowConditionData) {
    const handleId = getConnectionHandleId(this.stepId, this.action.id, route.id);
    return handleId;
  }

  private routes() {
    return this.data.navigateConditions || [];
  }

  private get hasActionData() {
    return this.data.navigateConditions && this.data.navigateConditions.length > 0;
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

.route-handle {
  position: relative;
  left: calc(100% + 12px);
  right: -5px;
  bottom: 7px;
}
</style>
