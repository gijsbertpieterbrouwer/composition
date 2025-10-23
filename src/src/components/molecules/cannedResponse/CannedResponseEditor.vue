<template>
  <div class="cannedResponse-editor">


    <TickScreen :loading="!loaded && this.data" :title="name" :actionsInFooter="actionsInFooter" :showScreenEstate="showScreenEstate">
      <template v-slot:actions>
        <TickButton v-if="allowEdit" @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
        <TickButton v-if="allowEdit" @click="save" :disabled="!readyForSave">{{ $translate(LanguagePath.App_Save) }}</TickButton>
      </template>

      <template v-slot:default>
        <TickEditorPanel>
          <template v-slot:explainer>

            {{ $translate(LanguagePath.App_CannedResponseEditor_Explanation) }}
          </template>

          <TickInput v-model="name" :disabled="disabled">{{ $translate(LanguagePath.App_Name) }}</TickInput>
          <!-- <TickTextArea v-model="message" :disabled="disabled">Message</TickTextArea> -->
          <TickTextArea v-if="disabled" v-model="message" :disabled="disabled">{{ $translate(LanguagePath.App_Message) }}</TickTextArea>

          <TickInputLabel v-else>{{ $translate(LanguagePath.App_Message) }}

            <TickEditor class="editor" v-model="message" :autoSize="true" :tokenizable="true" :location="tokenLocations" />
            <div class="controls" ref="container">

              <TickButton icon="file" :size="Size.regular" :appearance="Appearance.transparent" @click="toggleFilesPanel" :title="$translate(LanguagePath.Files)" />
              <div class="separator" />
              <TickButton icon="bold" :size="Size.regular" :appearance="Appearance.transparent" @click="emitter.emit(this.EditorEventType.toggleBold)" title="Bold" />
              <TickButton icon="italics" :size="Size.regular" :appearance="Appearance.transparent" @click="emitter.emit(this.EditorEventType.toggleItalics)" title="Italic" />
              <div class="separator" />
              <TickButton icon="orderedList" :size="Size.regular" :appearance="Appearance.transparent" @click="emitter.emit(this.EditorEventType.toggleOrderedList)" title="Ordered list" />
              <TickButton icon="unorderedList" :size="Size.regular" :appearance="Appearance.transparent" @click="emitter.emit(this.EditorEventType.toggleBulletList)" title="Bullet list" />
              <div class="separator" />
              <TickButton icon="code" :size="Size.regular" :appearance="Appearance.transparent" @click="emitter.emit(this.EditorEventType.toggleCode)" title="Code" />
              <TickButton icon="codeblock" :size="Size.regular" :appearance="Appearance.transparent" @click="emitter.emit(this.EditorEventType.toggleCodeBlock)" title="Code block" />

            </div>

          </TickInputLabel>

          <br />
          <!-- <TickDropdown v-if="!disabled" @select="addAttachment" :options="fileOptions" placeholder="Add attachment" /> -->
          <LabelList v-if="hasAttachments" emptyLabel="attachments" :labels="attachmentLabels" allowRemove="true" @remove="deleteAttachment" :disableToggle="true" :disableCollapse="true" />
        </TickEditorPanel>

      </template>
    </TickScreen>



  </div>
</template>

<script lang="ts">
import LabelList, { Label } from '@/components/atoms/LabelList.vue';
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickInputLabel from '@/components/atoms/TickInputLabel.vue';
import { TickPanelOptions } from '@/components/atoms/TickPanel.vue';
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import FilesSelectionPanel from '@/components/panels/FilesSelectionPanel.vue';
import emitter, { EditorEventType } from "@/helpers/editorEventBus";
import { getReadStorageLocationsForCannedResponse } from '@/helpers/enumsHelper';
import { mount, unmount } from '@/helpers/mountHelper';
import { onConfirmation } from '@/helpers/questionHelper';
import { getRefElementDOMRect } from '@/helpers/refHelpers';
import { debug } from '@/log';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import { AuthorizationObjectType, ColorsEnum, FileLink, LanguagePath, TickCannedResponseDefinition, TickLabelDefinition, WorkspaceFileSummary } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import TickEditor from '../ticket/TickEditor.vue';

@Component({
  emits: ["deleted", "saved"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, TickScreen, TickEditorPanel, TickDropdown, LabelList, TickEditor, TickInputLabel },
})
export default class CannedResponseEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  EditorEventType = EditorEventType
  LanguagePath = LanguagePath

  @Prop() private activeId!: string;
  @Prop({ default: false }) private actionsInFooter!: boolean;
  @Prop({ default: true }) private showScreenEstate!: boolean;

  private emitter = emitter; // used for click events in template

  private data: TickCannedResponseDefinition = null;
  private loaded = false;
  private activePanel = "";

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useManagingStore().getCannedResponse(id).then(data => {
      this.data = data;
      this.loaded = true;
    })
  }

  private get disabled() {
    return !this.allowEdit;
  }
  private get tokenLocations() {
    return getReadStorageLocationsForCannedResponse();
  }
  private get allowEdit() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Ticket)
  }

  mounted() {
    this.activate(this.activeId);
  }

  private toggleFilesPanel() {
    this.openFilesPanel();
  }


  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  private async openFilesPanel() {
    if (this.activePanel) { this.closePanel(); }

    const panelOptions: TickPanelOptions = {
      title: "files-panel",
      from: getRefElementDOMRect(this, "container")
    }


    this.activePanel = mount(FilesSelectionPanel, {
      props: {
        panelOptions: panelOptions,
        // modelValue: computed(() => fromOptions),
      },
      events: {
        close: () => {
          debug(`[Panel:Close]`);
          this.closePanel();
        },
        "update:modelValue": (to: FileLink, toSummary: WorkspaceFileSummary) => {

          this.addAttachment(toSummary?.id);
        },
      },
    });
  }

  private closePanel() {
    if (!this.activePanel) { return; }
    unmount(this.activePanel);
    this.activePanel = "";
  }

  private get name() {
    return this.data?.name;
  }

  private set name(to: string) {
    this.data.name = to;
  }

  private get message() {
    return this.data?.message;
  }

  private set message(to: string) {
    this.data.message = to;
  }


  private get readyForSave() {
    return true;
  }

  private get attachmentFileIds() {
    return this.data?.attachmentWorkspaceFileIds || [];
  }

  private save() {
    useManagingStore().saveCannedResponse(this.data.id);
    this.$emit("saved");
  }
  private remove() {
    onConfirmation(() => {

      useManagingStore().deleteCannedResponse(this.data.id);
      this.$emit("deleted");
    })


  }

  private addAttachment(to: string) {
    this.data.attachmentWorkspaceFileIds = this.data?.attachmentWorkspaceFileIds || [];

    if (this.data?.attachmentWorkspaceFileIds.some(p => p == to)) { return; }

    this.data.attachmentWorkspaceFileIds.push(to);
    //fixme: proxy needs to see array changes
    this.data.attachmentWorkspaceFileIds = this.data.attachmentWorkspaceFileIds.slice();
  }

  //AttachmentWorkspaceFiles
  private deleteAttachment(label: TickLabelDefinition) {
    const index = this.data.attachmentWorkspaceFileIds.findIndex(p => p === label.id);
    if (index > -1) {
      this.data.attachmentWorkspaceFileIds.splice(index, 1);
      //fixme: proxy needs to see array changes
      this.data.attachmentWorkspaceFileIds = this.data.attachmentWorkspaceFileIds.slice();
    }
  }
  private get fileOptions() {
    const labels = useUtilityDataStore().utilityData.files;
    let options = labels.map((item) => ({
      text: item.name,
      id: item.id,
    }))
    return options;
  }

  private get hasAttachments(): boolean {
    return this.data?.attachmentWorkspaceFileIds?.length > 0;
  }

  private get attachmentLabels() {
    const options = useUtilityDataStore().utilityData.files;
    const actionableItems = this.data.attachmentWorkspaceFileIds;
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

.editor {
  padding: 4px 4px 0 4px;
  border-radius: 4px;
  font-size: $text-size-regular;

  min-height: 500px;
  display: block;
  width: 100%;
  padding: 8px;

  background-color: var(--c-base-300);
  color: var(--c-contrast);
}

.controls {
  display: flex;
  align-items: center;
  margin-left: -4px;

  .plus-button {
    margin-right: 4px;
  }

  button:not(.plus-button) {
    opacity: 0.8;

    &:not([disabled]):hover {
      opacity: 1;
      background-color: var(--c-base-400);
    }
  }

  .separator {
    width: 1px;
    margin: 0 8px;
    background-color: var(--c-contrast);
    height: 20px;
    opacity: 0.4;
  }
}
</style>
