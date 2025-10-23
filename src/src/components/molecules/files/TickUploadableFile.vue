<template>

  <div class="dropped-file" :class="{ hasError: this.hasError }">
    <div class="name"><span class="file-name">{{ this.file.name }} ({{ this.getSize }})</span><span class="error-message" v-if="hasError">{{ this.errorMessage }}</span> </div>

    <progress class="progress" v-if="fileUploadStarted" :value="getFileProgress" max="100">{{ this.getFileProgress }}% </progress>

    <!-- <div class="actions">
      <TickButton @click.prevent="removeFile" class="delete small">Remove</TickButton>
    </div> -->


  </div>

</template>

<script lang="ts">
import TickButton from '@/components/atoms/TickButton.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickPanel from "@/components/atoms/TickPanel.vue";
import { calcSizeString } from '@/helpers/fileHelper';
import { UploadableFile } from '@/store/files';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickScreen from '../editor/TickScreen.vue';

@Component({
  emits: ["exit"],
  components: { TickPanel, TickButton, TickInput, TickScreen, },
})
export default class TickUploadableFile extends Vue {
  @Prop() private file!: UploadableFile;

  private get fileUploadStarted() {
    //const file = this.getUploadFile(fileId);
    return this.file.uploadStarted;
  }

  private get getFileProgress() {
    return this.file.percentageUploaded;
  }

  // private getUploadFile(fileId) {
  //   const file = useFilesStore().getFileUpload(fileId);
  //   return file;
  // }

  private get getSize() {
    return calcSizeString(this.file.file.size, 0);
  }

  private get hasError(): boolean {
    return this.file.errorMessage != null && this.file.errorMessage != "";
  }

  private get errorMessage() {
    return this.file.errorMessage;
  }


  // private removeFile() {
  //   this.$emit("remove", this.file);
  // }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.dropped-file {
  border: solid 1px $grey400;
  border-radius: 4px;
  display: grid;
  gap: 5px;
  padding: 2px 4px;
  font-size: 14px;
  grid-template-columns: 1fr auto auto;
  grid-template-rows: auto;
  grid-template-areas: "name progress actions";
  align-items: center;

  &.hasError {
    .file-name {
      text-decoration: line-through;
      color: $grey400;
    }
  }

  .error-message {
    color: $error;
    font-weight: 600;
    margin-left: 5px;
  }

  .name {
    grid-area: name;

    &:first-letter {
      text-transform: uppercase;
    }
  }

  .progress {
    grid-area: progress;
    accent-color: $success;

  }

  .actions {
    grid-area: actions;

    .delete {
      float: right;

    }
  }

}
</style>
