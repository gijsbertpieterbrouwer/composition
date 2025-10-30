<template>
  <TickScreen :loading="!loaded" :title="editorTitle">
    <template v-slot:actions>
      <TickButton @click="remove" v-if="editallowed" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
      <TickButton @click="save" :disabled="!readyForSave" v-if="editallowed">{{ $translate(LanguagePath.App_Save) }}</TickButton>
    </template>
    <template v-slot:default>
      <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)">
        <div class="general ">
          <TickInput v-model="fileName" :placeholder="$translate(LanguagePath.App_Name)" :disabled="!editallowed">{{ $translate(LanguagePath.App_Name) }}</TickInput>
        </div>

        <FileDataUploaderZone @uploadsCompleted="uploadsCompleted" :fileType="FileSourceType.WorkspaceFile" :disableMultiple="true" />
      </TickEditorPanel>

      <TickEditorPanel :name="$translate(LanguagePath.App_FileEditor_Preview_Title)">
        <Attachment :attachmentLink="fileLink" />
      </TickEditorPanel>
    </template>
  </TickScreen>
</template>

<script lang="ts">

import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import Attachment from '@/components/molecules/ticket/Timeline/Attachment.vue';
import useFilesStore from '@/store/files';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, FileLink, FileSourceType, LanguagePath, TickWorkspaceFile } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import FileDataUploaderZone from './FileDataUploaderZone.vue';

@Component({
  emits: ["deleted", "saved"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, ThenHr, TickScreen, TickEditorPanel, TickSelector, Attachment, FileDataUploaderZone },
})
export default class FileEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  FileSourceType = FileSourceType
  LanguagePath = LanguagePath

  @Prop() private activeId!: string;
  private file: TickWorkspaceFile = null;
  private loaded = false;

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useFilesStore().get(id).then(file => {
      this.file = file;
      this.loaded = true;
    })
  }

  private get allowDelete() {
    return true;
  }

  private get editallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace)
  }

  private uploadsCompleted(data: FileLink[]) {
    if (!data || !data.length) { return; }
    this.file.fileDataId = data[0].fileDataId;
    this.file.fileLink = data[0];
  }


  private get editorSubTitle() {
    return "edit this file";
  }
  private get fileName() {
    return this.file?.name;
  }
  private get editorTitle() {
    return this.fileName
  }

  private get readyForSave() {
    return true;
  }

  mounted() {
    this.activate(this.activeId);
  }

  private get fileLink() {
    return this.file?.fileLink;
  }



  private remove() {

    useFilesStore().delete(this.activeId).then(() => {
      //if (progress.removalStatus != RemovalStatus.Failed) {
      this.$emit("deleted");
      // } else {
      //  showObjectRemovalProgressPanel(progress)
      // }
    });

  }


  private save() {
    useFilesStore().save(this.activeId).then(() => {
      this.$emit("saved");
    });
  }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
