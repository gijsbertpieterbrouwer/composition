<template>
  <TickDialogPanel @close="cancel" :panelOptions="panelOptions" :position="position" class="panel">
    <template v-slot:title>
      {{ $translate(LanguagePath.Files) }}
    </template>
    <template v-slot:footer>

      <TickButton @click="cancel" class="outline">{{ $translate(LanguagePath.App_Done) }}</TickButton>
      <span class="uploaded">{{ uploadedText }}</span>
    </template>


    <FileDropZone @dropped="addFiles">
      <div class="dropContent">
        <TickUploadableFile :file="file" v-for="file in this.files" :key="file.id" />
      </div>
    </FileDropZone>

  </TickDialogPanel>
</template>

<script lang="ts">
import TickButton from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickPanel, { Position, TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickScreen from "../editor/TickScreen.vue";

import useFilesStore from "@/store/files";
import TickUploadableFile from "./TickUploadableFile.vue";

import FileDropZone from "@/components/atoms/FileDropZone.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import generateId from "@/helpers/guid";
import { LanguagePath } from "@/TickApi";

@Component({
  emits: ["exit", "uploadsCompleted"],
  components: {
    TickPanel,
    TickDialogPanel,
    TickButton,
    TickInput,
    TickScreen,
    FileDropZone,
    TickUploadableFile,
  },
})
export default class FilesUploadPanel extends Vue {
  LanguagePath = LanguagePath
  @Prop() private position!: Position;
  group = "workspacefiles_" + generateId();

  private get panelOptions(): TickPanelOptions {
    return {
      title: "workspaceFiles",
      allowAsSubDialog: true,
      showAsModal: true,
    }
  }

  private fileUploadStarted(fileId: string) {
    const file = this.getUploadFile(fileId);
    return file ? file.uploadStarted : false;
  }

  private getFileProgress(fileId: string) {
    const file = this.getUploadFile(fileId);
    return file ? file.percentageUploaded : 0;
  }

  private getUploadFile(fileId: string) {
    const file = useFilesStore().getFileUpload(fileId);
    return file;
  }

  private get files() {
    return (
      useFilesStore().uploadableFiles.filter((p) => p.group == this.group) || []
    );
  }

  private uploadedCounter = 0;
  private get uploadedText() {
    if (this.uploadedCounter == 0) { return ""; }
    return `${this.uploadedCounter} uploaded`;
  }
  private addFiles(newFiles: []) {
    useFilesStore().startUpload(this.group, newFiles).then((data) => {
      this.$emit("uploadsCompleted", data);
      this.uploadedCounter += data.length;
    });

    // useFilesStore()
    //   .startUploadFileData(this.group, newFiles, FileSourceType.WorkspaceFile)
    //   .then((data) => {
    //     this.$emit("uploadsCompleted", data);
    //   });
  }

  private removeFile(index: number) {
    this.files.splice(index, 1);
  }

  private cancel() {
    this.$emit("exit");
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.dropContent {
  display: grid;
  padding: 10px;
  gap: 5px;
  width: 600px;
  max-height: 40vh;
  min-height: 20vh;
  overflow-y: auto;
}

.uploaded {
  font-size: $text-size-regular;

}
</style>
