<template>
  <div class="attachment">
    <TickFilePreview :warning="warning" :name="name" :url="downloadUrl" :disablePreview="disablePreview" />
  </div>
</template>

<script lang="ts">
import TickFilePreview from "@/components/atoms/TickFilePreview.vue";
import UserIcon from "@/components/atoms/UserIcon.vue";
import TickIcon from "@/components/TickIcon.vue";
import { FileLink } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";


@Component({
  emits: [],
  components: { UserIcon, TickIcon, TickFilePreview },
})
export default class Attachment extends Vue {
  @Prop() private attachmentLink!: FileLink;

  private get disablePreview() {
    return this.attachmentLink?.disablePreview || false;
  }

  private get downloadUrl() {
    return this.attachmentLink?.url;
  }

  private get name() {
    return this.attachmentLink?.name;
  }
  private get warning() {
    return this.attachmentLink?.warning;
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.attachment {
  // padding-bottom: 5px;

  .download-link {
    border-radius: 6px;
    background-color: var(--c-base-200);
    color: var(--c-contrast);
    display: inline-flex;
    padding: 5px;
    cursor: pointer;

    svg {
      margin-right: 5px;
    }
  }

  .preview-holder {
    padding: 5px;
    background-color: var(--c-base-200);
    border-radius: 12px;
    max-width: 30vw;
    overflow: hidden;

    .preview {
      border-radius: 6px;
      max-height: 20vw;
      max-width: 28vw;

    }
  }
}
</style>