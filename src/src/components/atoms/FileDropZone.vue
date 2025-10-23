<template>
  <label :for="id">
    <!-- add `data-active` and the event listeners -->
    <div class="drop-zone" :class="{ active: this.active, disableUploaderView: this.disableUploaderView }" :data-active="active" @dragenter.prevent="setActive" @dragover.prevent="setActive"
      @dragleave.prevent="setInactive" @drop.prevent="onDrop">
      <div class="drop-message" v-if="!disableUploaderView">{{ this.getDropMessage }}</div>
      <!-- share state with the scoped slot -->
      <slot :dropZoneActive="active"></slot>
    </div>
    <input class="upload-button" type="file" :id="id" :disabled="disableClickToOpen" :accept="inputAccepts" v-bind:multiple="allowMultiple" @change="onInputChange" />
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import { debug } from "@/log";
import generateId from "@/helpers/guid";
import { translate } from "@/plugins/translatePlugin";
import { LanguagePath } from "@/TickApi";

@Component({
  emits: ["dropped", "active"],
  components: {},
})
export default class FileDropZone extends Vue {
  @Prop({ default: false }) private disableMultiple!: boolean;
  @Prop({ default: [] }) private accepts: string[];
  @Prop() private disableUploaderView!: boolean;
  @Prop() private disableClickToOpen!: boolean;
  @Prop() private title!: string;

  active = false;
  inActiveTimeout: number = null; //hold the timeout key

  private get id() {
    return generateId();
  }

  private get inputAccepts() {
    if (!this.accepts || !this.accepts.length) {
      return "";
    }

    return this.accepts.join(",");
  }

  private get allowMultiple() {
    return !this.disableMultiple;
  }

  private onDrop(e: DragEvent) {
    this.setInactive(); // add this line too
    this.addFiles([...(e.dataTransfer.files as never)]);
  }

  private addFiles(files: File[]) {
    if (files.length == 0) {
      return;
    }

    debug(
      `[FileDropper:Dropped]Dropping ${files.length} files (filter on: ${this.inputAccepts})`
    );

    // limit extension
    if (this.accepts && this.accepts.length) {
      files = files.filter((file) =>
        this.accepts.some((a) => file.name.endsWith(a))
      );
    }

    // limit number of files
    if (!this.allowMultiple && files.length > 1) {
      files = [files[0]];
      debug(`[FileDropper:Reducing]Reducing number of files => one is allowed`);
    }

    debug(`[FileDropper:Filtered]Admitting ${files.length} files`);

    this.$emit("dropped", files);
  }

  setActive() {
    this.active = true;
    this.$emit("active", true);
    clearTimeout(this.inActiveTimeout);
  }
  setInactive() {
    // wrap it in a `setTimeout`
    this.inActiveTimeout = window.setTimeout(() => {
      this.active = false;
      this.$emit("active", false);
    }, 50);
  }

  private get getDropMessage() {
    // return this.active ? "And drop them if you like" : "Drop files here or click to browse from your computer";

    if (this.active) {
      return this.allowMultiple
        ? translate(LanguagePath.App_FileDropzone_DropMessage_Active_Allow_Multiple)
        : translate(LanguagePath.App_FileDropzone_DropMessage_Active_Allow_Single);
    } else {
      if (this.title) { return this.title; }

      return this.allowMultiple
        ? translate(LanguagePath.App_FileDropzone_DropMessage_InActive_Allow_Multiple)
        : translate(LanguagePath.App_FileDropzone_DropMessage_InActive_Allow_Single);
    }
  }

  private preventDefaults(e: Event) {
    e.preventDefault();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onInputChange(e: any) {
    this.addFiles([...e.target.files]);
    e.target.value = null;
  }

  events = ["dragenter", "dragover", "dragleave", "drop"];

  mounted() {
    this.events.forEach((eventName) => {
      document.body.addEventListener(eventName, this.preventDefaults);
    });
  }

  unounted() {
    this.events.forEach((eventName) => {
      document.body.removeEventListener(eventName, this.preventDefaults);
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.upload-button {
  display: none;
}

.drop-zone {
  min-height: 30px;
  min-width: 30px;
  border-radius: 8px;
  font-style: italic;
  font-size: $text-size-regular;

  &:not(.disableUploaderView) {
    border: dotted 1px $grey400;
  }


  &.active {
    background-color: $grey200;
  }

  .drop-message {
    color: $grey600;
    padding: 5px;
    text-align: center;
    font-size: 16px;
    font-style: normal;

  }
}
</style>
