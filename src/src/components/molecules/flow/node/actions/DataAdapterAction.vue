<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="adapter" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">
    <template #routes>
      <RouteOption v-if="hasAdapter" :title="'On failure'" :icon="'nocloud'" :isConnected="failureIsConnected" :routeHandleId="optionHandleId('failure')" :isFailureHandle="true" />
    </template>


    <EditorMessage v-if="!hasAdapter" :type="EditorMessageType.Warning" title="Select adapter" message="Select an adapter in order to execute this action" />
  </ActionBase>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickIcon from "@/components/TickIcon.vue";
import { getConnectionHandleId } from "@/helpers/flowhelpers";
import { ApiDataAdapterActionSettings } from "@/TickApiModels";
import { jsonProxy } from "@/helpers/jsonProxy";
import { ApiAdapterSettingsData, FlowComment, FlowDefinitionAction, TickFlowInstanceLog } from "@/TickApi";
import useUtilityDataStore from '@/store/utilitydata';
import TickHandle from '../TickHandle.vue';
////import TickActionDraggableHandle from './TickActionDraggableHandle.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import ActionBase from '../ActionBase.vue';
import RouteOption from '../RouteOption.vue';

@Component({
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, ThenHr, TickHandle, EditorMessage, ActionBase, RouteOption },
})
export default class DataAdapterAction extends Vue {
  EditorMessageType = EditorMessageType;
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: ApiDataAdapterActionSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;
  private addComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addComment", stepId, actionId, comment);
  }

  private resolveComments() {

    this.$emit("resolveComments", this.action.id);
  }

  private get data() {
    return jsonProxy<ApiAdapterSettingsData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private get failureIsConnected() {
    return this.data.failTargetStepId != null && this.data.failTargetStepId != "";
  }

  private get adapterMessage() {
    if (!this.data.apiAdapterDefinitionId) {
      return "No adapter selected";
    }
    const adapter = useUtilityDataStore().adapter(this.data.apiAdapterDefinitionId);
    return `Execute API-adapter: ${adapter.name}`;
  }

  private optionHandleId(option: string) {
    return getConnectionHandleId(this.stepId, this.action.id, option);
  }

  private get handleId() {
    return getConnectionHandleId(this.stepId, this.action.id);
  }

  private get hasAdapter() {
    return this.data.apiAdapterDefinitionId != null;
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
</style>
