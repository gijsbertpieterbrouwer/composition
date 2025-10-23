<template>
  <div class="previewer">
    <template v-if="hasWarning">

      <div class="download-link no-link">
        <TickIcon name="warning" /> {{ this.name }} ({{ this.warningMessage }})
      </div>

    </template>

    <template v-else-if="hasImagePreview">
      <a :href="downloadUrl" target="_blank">
        <div class="preview-holder">
          <img class="preview" :src="downloadUrl" />
        </div>
      </a>
    </template>

    <template v-else-if="hasAudioPreview">
      <div class="preview-holder">
        <audio controls :src="downloadUrl"></audio>
      </div>
    </template>
    <template v-else-if="hasVideoPreview">
      <div class="preview-holder">

        <video width="400" controls>
          <source :src="downloadUrl">
          Your browser does not support HTML video.
        </video>
      </div>
    </template>

    <template v-else>
      <a :href="downloadUrl" target="_blank">
        <div class="download-link">
          <TickIcon name="file" /> {{ this.name }}
        </div>
      </a>

    </template>

  </div>
</template>

<script lang="ts">
import UserIcon from "@/components/atoms/UserIcon.vue";
import TickIcon from "@/components/TickIcon.vue";
import { getPreviewableAudioExtensions, getPreviewableImageExtensions, getPreviewableVideoExtensions, pathHasPreviewer } from "@/helpers/fileHelper";
import { stringIsNullOrEmpty } from "@/helpers/stringHelper";
import { Component, Prop, Vue } from "vue-facing-decorator";


@Component({
  emits: [],
  components: { UserIcon, TickIcon },
})
export default class TickFilePreview extends Vue {
  @Prop() private url!: string;
  @Prop() private name!: string;
  @Prop() private warning!: string;
  @Prop() private disablePreview!: boolean;

  private get downloadUrl() {
    return this.url;
  }

  private get hasImagePreview() {
    return this.hasPreview(getPreviewableImageExtensions());
  }

  private get hasAudioPreview() {
    return this.hasPreview(getPreviewableAudioExtensions());
  }

  private get hasVideoPreview() {
    return this.hasPreview(getPreviewableVideoExtensions());
  }

  private get warningMessage() {
    return this.warning;
  }

  private get hasWarning() {
    return !stringIsNullOrEmpty(this.warningMessage)
  }

  private hasPreview(formats: string[]): boolean {
    if (this.hasWarning) { return false; }
    if (this.disablePreview) { return false; }
    return pathHasPreviewer(this.url, formats);

  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.previewer {
  //padding-bottom: 5px;

  .download-link {
    border-radius: 6px;
    background-color: var(--c-base-200);
    color: var(--c-contrast);
    display: inline-flex;
    padding: 5px;

    &:not(.no-link) {
      cursor: pointer;
    }

    svg {
      margin-right: 5px;
    }
  }

  .preview-holder {
    padding: 1px;
    //background-color: var(--c-base-200);
    border-radius: 12px;
    max-width: 100%;
    overflow: hidden;

    .preview {
      border-radius: 6px;
      max-height: 20vw;
      max-width: 100%;



    }

    audio {
      //filter: sepia(20%) saturate(70%) grayscale(1) contrast(99%) invert(12%);
      //width: 200px;
      height: 35px;
    }
  }
}
</style>