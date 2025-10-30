<template>
  <div class="action">


    <SidebarPanel id="message-question" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Knowledgebase_Title)">
      <TickTextarea v-model="message" class="message" :disabled="disabled" v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }"
        :placeholder="$translate(LanguagePath.App_FlowEditor_SideBar_Knowledgebase_Markdown_Placeholder)" />
    </SidebarPanel>
    <SidebarPanel id="message-sender" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_Title)">
      <TickSwitch v-model="useCustomSender" :disabled="disabled">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_UseCustom_Title) }}</TickSwitch>
      <TickSelector v-if="useCustomSender" v-model="customSendByUserId" :options="userOptions" :disabled="disabled" />
      <span v-else>{{ $translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_NoCustom_Title) }}</span>
    </SidebarPanel>

    <SidebarPanel id="message-kb" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Knowledgebase_KnowledgeBaseSelection_Title)">

      <TickDropdown v-if="!disabled" @select="addKnowledgeBase" :options="knowledgeBaseOptions"
        :placeholder="$translate(LanguagePath.App_FlowEditor_SideBar_Knowledgebase_KnowledgeBaseSelection_NoData_Title)"
        :noresults="$translate(LanguagePath.App_FlowEditor_SideBar_Knowledgebase_KnowledgeBaseSelection_NoKnowledgebases_Title)" :appearance="Appearance.secondary" :color="Color.contrast"
        :size="Size.regular" />

      <LabelList v-if="knowledgeBaseLabels.length" class="labellist" :labels="knowledgeBaseLabels" :allowRemove="true" :disableCollapse="true" :disableToggle="true" @remove="removeKnowledgeBase" />
      <TickInput :min="1" :max="10" type="number" v-model="showAmount">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Knowledgebase_MaxNrResults_Title) }}</TickInput>
      <TickInput v-model="buttonText">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Knowledgebase_ReadArticle_Title) }}</TickInput>

    </SidebarPanel>

    <SidebarPanel id="message-response" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Response_Echo_Title)">
      <template #header>

      </template>
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_Response_Echo_Explanation) }}
      </template>

      <TickSwitch v-model="useResponseEcho" :disabled="disabled" />
      <template v-if="useResponseEcho">
        <TickTextarea v-model="validEcho" :disabled="disabled" v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }"> {{
          $translate(LanguagePath.App_FlowEditor_SideBar_Knowledgebase_Echo_OnValidAnswer_Title) }}</TickTextarea>
      </template>

      <TickTextarea v-model="noSearchResultsMessage" placeholder="when no articles found" :disabled="disabled"
        v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }"> {{ $translate(LanguagePath.App_FlowEditor_SideBar_Knowledgebase_Echo_NoArticlesFound_Title) }}
      </TickTextarea>

    </SidebarPanel>
    <ActionDelayBeforeNextMsEditor v-model="delayMs" :disabled="disabled" />


    <SidebarPanel id="message-await" :name="$translate(LanguagePath.App_FlowEditor_SideBar_AwaitAttempt_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_AwaitAttempt_Explanation) }}
      </template>

      <BotWaitingForAnswerEditor v-model="awaitSettings" :disabled="disabled" />
    </SidebarPanel>
  </div>
</template>

<script lang="ts">
import LabelList, { Label } from '@/components/atoms/LabelList.vue';
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import StorageInput from "@/components/molecules/flow/sidebar/actions/molecules/StorageInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import { tokenize } from '@/directives';
import { getFlowReadStorageLocations } from '@/helpers/enumsHelper';
import { jsonProxy } from "@/helpers/jsonProxy";
import useUtilityDataStore from '@/store/utilitydata';
import { BotSearchKnowledgeBaseActionData, BotWaitingForResponseSettings, ColorsEnum, FlowDefinitionAction, KnowledgeBaseTypeEnum, LanguagePath, StorageLocation, TickKnowledgeBaseSummary, TickLabelDefinition, ValidationTypeEnum } from "@/TickApi";
import { BotActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ActionDelayBeforeNextMsEditor from './molecules/ActionDelayBeforeNextMsEditor.vue';
import BotWaitingForAnswerEditor from './molecules/BotWaitingForAnswerEditor.vue';
@Component({
  directives: { tokenize },
  emits: ["remove", "update"],
  components: { TickSwitch, SidebarPanel, StorageInput, TickIcon, TickCheckbox, TickTextarea, TickInput, TickSelector, BotWaitingForAnswerEditor, TickDropdown, LabelList, ActionDelayBeforeNextMsEditor },
})
export default class MessageSearchKnowledgeBaseAction extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  StorageLocation = StorageLocation
  LanguagePath = LanguagePath
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: BotActionSettings;
  @Prop() private disabled!: boolean;

  ValidationTypeEnum = ValidationTypeEnum;
  private get data() {
    return jsonProxy<BotSearchKnowledgeBaseActionData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }


  private get delaySeconds() {
    return this.delayMs ? this.delayMs / 1000 : 0;
  }
  private set delaySeconds(to: number) {
    this.delayMs = to ? to * 1000 : 0;
  }

  private get delayMs() {
    return this.settings.delayMsAfterExecute
  }
  private set delayMs(to: number) {
    this.settings.delayMsAfterExecute = to;
  }

  private get readLocations() {
    return getFlowReadStorageLocations();
  }

  private set useCustomSender(to: boolean) {
    this.data.useCustomSender = to
  }
  private get useCustomSender(): boolean {
    return this.data.useCustomSender;
  }

  private set customSendByUserId(to: string) {
    this.data.customSendByUserId = to
  }
  private get customSendByUserId(): string {
    return this.data.customSendByUserId;
  }

  private get userOptions() {
    const labels = useUtilityDataStore().utilityData.users.filter(p => !p.deleted);
    let options = labels.map((item) => ({
      text: item.name,
      value: item.id,
    }))
    return options;
  }


  private get awaitSettings() {
    return this.data.awaitResponseSettings;
  }

  private set awaitSettings(to: BotWaitingForResponseSettings) {
    this.data.awaitResponseSettings = to;
  }
  private get buttonText() {
    return this.data.readArticleButtonText || "";
  }

  private set buttonText(to) {
    this.data.readArticleButtonText = to;
  }

  private get showAmount() {
    return this.data.showAmount || 0;
  }

  private set showAmount(to) {
    this.data.showAmount = to;
  }
  private get message() {
    return this.data.message || "";
  }

  private set message(to) {
    this.data.message = to;
  }

  private get validEcho() {
    return this.data.validEcho;
  }
  private set validEcho(to: string) {
    this.data.validEcho = to;
  }

  private get noSearchResultsMessage() {
    return this.data.noResultsMessage;
  }
  private set noSearchResultsMessage(to: string) {
    this.data.noResultsMessage = to;
  }


  private get useResponseEcho() {
    return this.data.useAnswerEcho || false;
  }
  private set useResponseEcho(to: boolean) {
    this.data.useAnswerEcho = to;
  }



  private addKnowledgeBase(to: string) {
    if (!this.data.knowledgeBaseIds || this.data.knowledgeBaseIds.length == 0) {
      this.data.knowledgeBaseIds = [to];
    } else {

      // if already contains, ignore
      if (this.data.knowledgeBaseIds.some((p) => p == to)) {
        return;
      }

      this.data.knowledgeBaseIds.push(to);
      //fixme: proxy needs to see array changes
      this.data.knowledgeBaseIds = this.data.knowledgeBaseIds.slice();

    }
  }

  //AttachmentWorkspaceFiles
  private removeKnowledgeBase(label: TickLabelDefinition) {
    const index = this.data.knowledgeBaseIds.findIndex(
      (p) => p === label.id
    );
    if (index > -1) {
      this.data.knowledgeBaseIds.splice(index, 1);
      //fixme: proxy needs to see array changes
      this.data.knowledgeBaseIds = this.data.knowledgeBaseIds.slice();
    }
  }

  private get knowledgeBaseOptions() {
    const labels: TickKnowledgeBaseSummary[] = (useUtilityDataStore().utilityData.knowledgeBases || []).filter(p => p.type == KnowledgeBaseTypeEnum.Public);
    let options = labels.map((item) => ({
      text: item.name,
      id: item.id,
    }));
    return options;
  }

  private get knowledgeBaseLabels() {
    const options = useUtilityDataStore().utilityData.knowledgeBases
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

.flex-row {
  display: flex;
  gap: 5px;
}

.flex-grid {
  display: grid;
  gap: 2px;
}
</style>
