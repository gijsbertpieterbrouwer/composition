<template>
  <div class="action">

    <SidebarPanel id="message-message" :name="$translate(LanguagePath.App_FlowEditor_SideBar_InternalNote_Title)">
      <TickTextarea v-model.lazy="message" :disabled="disabled" class="message" v-handle v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }" />

      <div class="attachments">
        <TickDropdown v-if="!disabled" @select="addAttachment" @action="selectDropdownAction" :options="fileOptions"
          :placeholder="$translate(LanguagePath.App_FlowEditor_SideBar_InternalNote_Attachments_Placeholder)"
          :noresults="$translate(LanguagePath.App_FlowEditor_SideBar_InternalNote_Attachments_NoResults)" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular"
          :actionButtons="chooseAttachmentActions" />

        <LabelList v-if="attachmentLabels.length" class="labellist" :labels="attachmentLabels" :allowRemove="true" @remove="deleteAttachment" />
      </div>
    </SidebarPanel>

    <SidebarPanel id="message-sender" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_Title)">
      <TickSwitch v-model="useCustomSender" :disabled="disabled">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_UseCustom_Title) }}</TickSwitch>
      <TickSelector v-if="useCustomSender" v-model="customSendByUserId" :options="userOptions" :disabled="disabled" />
      <span v-else>{{ $translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_NoCustom_Title) }}</span>
    </SidebarPanel>

    <ActionDelayBeforeNextMsEditor v-model="delayMs" :disabled="disabled" />
  </div>
</template>

<script lang="ts">
import { BotNoteActionData, ColorsEnum, FlowDefinitionAction, LanguagePath, StorageLocation, TickLabelDefinition, TickWorkspaceFile, UserTypeEnum } from "@/TickApi";
import { BotActionSettings, NoteBotActionSettings } from "@/TickApiModels";
import TickIcon from "@/components/TickIcon.vue";
import LabelList, { Label } from '@/components/atoms/LabelList.vue';
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import FilesUploadPanel from "@/components/molecules/files/FilesUploadPanel.vue";
import { DropdownActionButton } from "@/components/panels/DropdownPanel.vue";
import { handle, tokenize } from '@/directives';
import { getFlowReadStorageLocations } from '@/helpers/enumsHelper';
import { jsonProxy } from "@/helpers/jsonProxy";
import { mount, unmount } from "@/helpers/mountHelper";
import { translate } from "@/plugins/translatePlugin";
import useUtilityDataStore from '@/store/utilitydata';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ActionDelayBeforeNextMsEditor from './molecules/ActionDelayBeforeNextMsEditor.vue';

@Component({
  directives: { handle, tokenize },
  emits: ["remove", "update"],
  components: { SidebarPanel, TickIcon, TickCheckbox, TickTextarea, TickSelector, TickDropdown, LabelList, TickSwitch, ActionDelayBeforeNextMsEditor },
})
export default class NoteAction extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  StorageLocation = StorageLocation
  LanguagePath = LanguagePath
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: BotActionSettings;
  @Prop() private disabled!: boolean;

  private activePanel = {
    group: "",
    panelId: "",
    conditionId: "",
  }

  private get chooseAttachmentActions(): DropdownActionButton[] {
    return [{
      id: 'add',
      text: translate(LanguagePath.App_Add),
    }]
  }
  private selectDropdownAction(action: DropdownActionButton) {
    this.togglePanelFor("addButton")
  }

  private togglePanelFor(fromRef: string) {
    const isCurrentActivePanel = (this.activePanel.group === fromRef);
    this.closeActivePanel();

    if (isCurrentActivePanel) {
      return;
    }

    this.activePanel.group = fromRef;
    this.activePanel.panelId = this.openPanel(fromRef, {});
  }


  beforeUnmount() {
    this.closeActivePanel();
  }

  private closeActivePanel() {
    if (this.activePanel.panelId) {
      unmount(this.activePanel.panelId);
    }

    this.activePanel.group = "";
    this.activePanel.panelId = "";

  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openPanel(id: string, props?: Record<string, any>) {


    return mount(FilesUploadPanel, {
      props: {
        ...props,

      },
      events: {
        exit: () => {
          this.closeActivePanel();
          // useCollectionsStore().use();

        },
        uploadsCompleted: (added: TickWorkspaceFile[]) => {
          if (added && added.length) {
            for (let index = 0; index < added.length; index++) {
              const file = added[index];
              this.addAttachment(file.id);
            }
          }
        },


      }
    });
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

  private get data() {
    return jsonProxy<NoteBotActionSettings>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }


  private set useCustomSender(to: boolean) {
    this.dataForMessage.useCustomSender = to
  }
  private get useCustomSender(): boolean {
    return this.dataForMessage.useCustomSender;
  }

  private set customSendByUserId(to: string) {
    this.dataForMessage.customSendByUserId = to
  }
  private get customSendByUserId(): string {
    return this.dataForMessage.customSendByUserId;
  }

  private get userOptions() {
    const labels = useUtilityDataStore().utilityData.users.filter(p => !p.deleted);
    let options = labels.map((item) => ({
      text: item.name,
      value: item.id,
    }))
    return options;
  }


  private get dataForMessage(): BotNoteActionData {
    return this.data as never;
  }

  private get message() {
    return this.dataForMessage.message || "";
  }

  private set message(to) {
    this.dataForMessage.message = to;
  }


  private addAttachment(to: string) {
    this.dataForMessage.attachmentWorkspaceFiles = this.dataForMessage.attachmentWorkspaceFiles || [];

    if (this.dataForMessage.attachmentWorkspaceFiles.some(p => p == to)) { return; }

    this.dataForMessage.attachmentWorkspaceFiles.push(to);
    //fixme: proxy needs to see array changes
    this.dataForMessage.attachmentWorkspaceFiles = this.dataForMessage.attachmentWorkspaceFiles.slice();
  }

  //AttachmentWorkspaceFiles
  private deleteAttachment(label: TickLabelDefinition) {
    const index = this.dataForMessage.attachmentWorkspaceFiles.findIndex(p => p === label.id);
    if (index > -1) {
      this.dataForMessage.attachmentWorkspaceFiles.splice(index, 1);
      //fixme: proxy needs to see array changes
      this.dataForMessage.attachmentWorkspaceFiles = this.dataForMessage.attachmentWorkspaceFiles.slice();
    }
  }

  private get botOptions() {
    const labels = useUtilityDataStore().utilityData.users.filter(p => p.userType == UserTypeEnum.Bot);
    let options = labels.map((item) => ({
      text: item.name,
      value: item.id,
    }))
    return options;
  }

  private get fileOptions() {
    const labels = useUtilityDataStore().utilityData.files;
    let options = labels.map((item) => ({
      text: item.name,
      id: item.id,
    }))
    return options;
  }

  private get attachmentLabels() {
    const options = useUtilityDataStore().utilityData.files;
    const actionableItems = this.dataForMessage.attachmentWorkspaceFiles;
    if (!actionableItems) { return []; }

    var labels: Label[] = [];
    for (let i = 0; i < actionableItems.length; i++) {

      var attachment = actionableItems[i];

      let option = options.find(l => l.id == attachment);
      if (option) {
        labels.push({
          id: option.id,
          name: option.name,
          color: ColorsEnum.Grey,
          //colorName: LabelColor.Grey,
        })
      }
    }

    return labels;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.attachments {
  margin-top: 30px;
}
</style>
