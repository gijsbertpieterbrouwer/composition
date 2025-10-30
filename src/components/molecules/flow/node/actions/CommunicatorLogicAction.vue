<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="contacts" :action="action" @addComment="addComment" @resolveComments="resolveComments"
    :isLastAction="isLastAction">

    <TickTokenizedContentViewer v-if="useSetName" class="message" :content="setNameText" />
    <div v-if="editCategory" class="flex-row">
      {{ categoryText }}
    </div>
    <div v-if="editColor" class="flex-row">
      {{ $translate(LanguagePath.Color) }}
      <TickColorSelector v-model="color" />
    </div>
    <div v-if="editAvatar" class="flex-row">
      {{ avatarText }}
    </div>

    <div>{{ setSpammerText }}</div>


    <!-- <EditorMessage v-if="!hasActionData" :type="EditorMessageType.Warning" title="No Title" message="Configure a new title to be used" /> -->
  </ActionBase>
</template>

<script lang="ts">
import LabelList from "@/components/atoms/LabelList.vue";
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickTokenizedContentViewer from '@/components/atoms/TickTokenizedContentViewer.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import TickColorSelector from "@/components/molecules/Selectors/TickColorSelector.vue";
import TickIcon from "@/components/TickIcon.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import { stringIsNullOrEmpty } from "@/helpers/stringHelper";
import { translate } from "@/plugins/translatePlugin";
import { ColorsEnum, CommunicatorLogicSettings, FlowActionCommunicatorSettings, FlowComment, FlowDefinitionAction, LabelActionType, LanguagePath, TickFlowInstanceLog } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ActionBase from '../ActionBase.vue';

@Component({
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, LabelList, ThenHr, EditorMessage, ActionBase, TickTokenizedContentViewer, TickColorSelector },
})
export default class CommunicatorLogicAction extends Vue {
  EditorMessageType = EditorMessageType
  LabelActionType = LabelActionType;
  LanguagePath = LanguagePath;
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: FlowActionCommunicatorSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;
  private get data() {
    return jsonProxy<CommunicatorLogicSettings>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private addComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addComment", stepId, actionId, comment);
  }
  private resolveComments() {
    this.$emit("resolveComments", this.action.id);
  }

  private get useSetName() {
    return this.data.useEditName && !stringIsNullOrEmpty(this.data.name);
  }
  private get setNameText() {
    return !stringIsNullOrEmpty(this.data.name)
      ? `${translate(LanguagePath.App_Rename)}: ${this.data.name}`
      : '';
  }

  private get setSpammerText(): string {
    if (!this.data.useSetSpammer) { return "" }
    return this.data.markAsSpammer ? translate(LanguagePath.App_CommunicatorPanel_MarkAsSpammer_Title) : translate(LanguagePath.App_CommunicatorPanel_UnMarkAsSpammer_Title)
  }

  private get editColor(): boolean {
    if (!this.data.useEditAvatarAndColor) { return false }
    if (!this.data.color) { return false; }
    return true
  }

  private get color(): ColorsEnum {
    return this.data.color;
  }

  private get editAvatar(): boolean {
    if (!this.data.useEditAvatarAndColor) { return false }
    if (!this.data.avatarFileId) { return false; }
    return true
  }
  private get avatarText(): string {
    if (!this.data.useEditAvatarAndColor) { return "" }
    return this.data.avatarFileId ? translate(LanguagePath.App_FlowEditor_Communicator_Avatar_Change_Title) : ""
  }

  private get editCategory(): boolean {
    if (!this.data.useSetCategory) { return false }
    return true
  }
  private get categoryText(): string {
    return translate(LanguagePath.App_FlowEditor_Communicator_Categories_Change_Title)
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.flex-row {
  display: flex;
  gap: 10px;
}
</style>
