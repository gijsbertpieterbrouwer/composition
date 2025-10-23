<template>
  <div class="action">
    <SidebarPanel id="message-message" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Message_Title)">
      <TickTextarea v-model.lazy="message" :disabled="disabled" class="message" v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }"
        :placeholder="$translate(LanguagePath.App_FlowEditor_SideBar_Message_MarkDown_Placeholder)" />

      <div class="attachments">
        <TickDropdown @click="closeFileDropper" ref="addButton" icon="file" @action="selectDropdownAction" v-if="!disabled" @select="addAttachment" :options="fileOptions" placeholder="Add"
          :noresults="$translate(LanguagePath.App_FlowEditor_SideBar_Message_AttachmentsSelector_NoResults)" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini"
          :actionButtons="chooseAttachmentActions" />

        <LabelList v-if="attachmentLabels.length" class="labellist" :labels="attachmentLabels" :allowRemove="!disabled" @remove="deleteAttachment" :disableCollapse="true" :disableToggle="true" />
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
import LabelList, { Label } from "@/components/atoms/LabelList.vue";
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from "@/components/atoms/TickDropdown.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import FilesUploadPanel from "@/components/molecules/files/FilesUploadPanel.vue";
import StorageInput from "@/components/molecules/flow/sidebar/actions/molecules/StorageInput.vue";
import { DropdownActionButton } from "@/components/panels/DropdownPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { tokenize } from '@/directives';
import { getFlowReadStorageLocations } from "@/helpers/enumsHelper";
import { jsonProxy } from "@/helpers/jsonProxy";
import { mount, unmount } from "@/helpers/mountHelper";
import getRefElement from "@/helpers/refHelpers";
import { translate } from "@/plugins/translatePlugin";
import useUtilityDataStore from "@/store/utilitydata";
import {
  BotMessageActionData,
  ColorsEnum,
  FlowDefinitionAction,
  LanguagePath,
  OptionsSourceEnum,
  StorageLocation,
  TickLabelDefinition,
  TickWorkspaceFile,
  UserTypeEnum,
} from "@/TickApi";
import { BotActionSettings, MessageBotActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from "vue-facing-decorator";
import ActionDelayBeforeNextMsEditor from "./molecules/ActionDelayBeforeNextMsEditor.vue";

@Component({
  directives: { tokenize },
  emits: ["remove", "update"],
  components: {
    StorageInput,
    TickIcon,
    TickCheckbox,
    TickTextarea,
    TickSelector,
    TickDropdown,
    LabelList,
    SidebarPanel,
    TickInput,
    ActionDelayBeforeNextMsEditor,
    FilesUploadPanel,
    TickSwitch
  },
})
export default class MessageAction extends Vue {
  OptionsSourceEnum = OptionsSourceEnum;
  Appearance = Appearance
  Color = Color
  Size = Size
  StorageLocation = StorageLocation
  LanguagePath = LanguagePath
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: BotActionSettings;
  @Prop() private disabled!: boolean;

  private get readLocations() {
    return getFlowReadStorageLocations();
  }

  private selectDropdownAction(action: DropdownActionButton) {
    this.togglePanelFor("addButton")
  }

  private closeFileDropper() {
    this.closeActivePanel();
  }

  private activePanel = {
    group: "",
    panelId: "",
    conditionId: "",
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
    const control = getRefElement(this, id);
    const rect = control.getBoundingClientRect();
    const paddingTop = window.getComputedStyle(control).getPropertyValue('padding-top');

    return mount(FilesUploadPanel, {
      props: {
        ...props,
        // position: {
        //   right: `${window.innerWidth - Math.ceil(rect.left + rect.width)}px`, // 4px because it looks better
        //   top: `${Math.floor(rect.height) + Math.floor(rect.top) + parseInt(paddingTop) + 4}px`,
        // }
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
  private get data() {
    return jsonProxy<MessageBotActionSettings>(
      this.settings.actionDataJson || "{}",
      (json) => {
        this.settings.actionDataJson = json;

      }
    );
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

  private get dataForMessage(): BotMessageActionData {
    return this.data as never;
  }

  private get message() {
    return this.dataForMessage.message || "";
  }

  private set message(to) {
    this.dataForMessage.message = to;
  }
  private get botOptions() {
    const labels = useUtilityDataStore().utilityData.users.filter(p => p.userType == UserTypeEnum.Bot);
    let options = labels.map((item) => ({
      text: item.name,
      value: item.id,
    }));
    return options;
  }


  private get chooseAttachmentActions(): DropdownActionButton[] {
    return [{
      id: 'add',
      text: translate(LanguagePath.App_Add),
    }]
  }

  private addAttachment(to: string) {
    if (!this.dataForMessage.attachmentWorkspaceFiles || this.dataForMessage.attachmentWorkspaceFiles.length == 0) {
      this.dataForMessage.attachmentWorkspaceFiles = [to];
    } else {

      // if already contains, ignore
      if (this.dataForMessage.attachmentWorkspaceFiles.some((p) => p == to)) {
        return;
      }

      this.dataForMessage.attachmentWorkspaceFiles.push(to);
      //fixme: proxy needs to see array changes
      this.dataForMessage.attachmentWorkspaceFiles = this.dataForMessage.attachmentWorkspaceFiles.slice();

    }
  }

  //AttachmentWorkspaceFiles
  private deleteAttachment(label: TickLabelDefinition) {
    const index = this.dataForMessage.attachmentWorkspaceFiles.findIndex(
      (p) => p === label.id
    );
    if (index > -1) {
      this.dataForMessage.attachmentWorkspaceFiles.splice(index, 1);
      //fixme: proxy needs to see array changes
      this.dataForMessage.attachmentWorkspaceFiles =
        this.dataForMessage.attachmentWorkspaceFiles.slice();
    }
  }

  private get fileOptions() {
    const labels = useUtilityDataStore().utilityData.files;
    let options = labels.map((item) => ({
      text: item.name,
      id: item.id,
    }));
    return options;
  }

  private get attachmentLabels() {
    const options = useUtilityDataStore().utilityData.files;
    const actionableItems = this.dataForMessage.attachmentWorkspaceFiles;
    if (!actionableItems) {
      return [];
    }

    var labels: Label[] = [];
    for (let i = 0; i < actionableItems.length; i++) {
      var attachment = actionableItems[i];

      let option = options.find((l) => l.id == attachment);
      if (option) {
        labels.push({
          id: option.id,
          name: option.name,
          color: ColorsEnum.Grey,
          //colorName: LabelColor.Grey,
        });
      }
    }

    return labels;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.attachments {
  margin-top: 10px;
}
</style>
