<template>
  <FileDropZone :title=this.title @active="onActiveChange" :disableClickToOpen="disableClickToOpen" :disableUploaderView="disableUploaderView" @dropped="addFiles" :disableMultiple="disableMultiple"
    :accepts="accepts">
    <template v-if="!disableUploaderView">
      <div class="dropContent">
        <slot />
        <TickUploadableFile :file="file" v-for="file in this.files" :key="file.id" />

      </div>
    </template>
    <template v-else>
      <slot />
    </template>

  </FileDropZone>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import useFilesStore from "@/store/files";
import TickUploadableFile from "./TickUploadableFile.vue";
import generateId from "@/helpers/guid";
import FileDropZone from "@/components/atoms/FileDropZone.vue";
import { FileSourceType } from "@/TickApi";

@Component({
  emits: ["uploadsCompleted", "active", "setGroup"],
  components: { FileDropZone, TickUploadableFile },
})
export default class FileDataUploaderZone extends Vue {
  @Prop({ default: FileSourceType.Attachment })
  private fileType!: FileSourceType;
  @Prop({ default: false }) private disableMultiple!: boolean;
  @Prop({ default: "" }) private accepts!: string[];
  @Prop() private disableUploaderView!: boolean;
  @Prop() private disableClickToOpen!: boolean;
  @Prop() private title!: string;

  private group = "";

  mounted() {
    this.group = "filedatas_" + generateId();
    this.$emit("setGroup", this.group);
  }

  private onActiveChange(val: boolean) {
    this.$emit("active", val);
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

  private addFiles(newFiles: []) {
    useFilesStore()
      .startUploadFileData(this.group, newFiles, this.fileType)
      .then((data) => {
        this.$emit("uploadsCompleted", data);
      });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.dropContent {
  display: grid;
  padding: 10px;
  gap: 5px;

  max-height: 40vh;
  min-height: 100px;
  overflow-y: auto;
}
</style>
