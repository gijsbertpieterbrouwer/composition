<template>

  <div class="workspace-icon">

    <TickAvatar v-if="this.fileId || this.name" :sizePx="sizePx" :online="false" :fileId="fileId" :name="name" :color="color" />
    <div v-else class="logo" :style="{
      width: this.sizeAsPixels,
      height: this.sizeAsPixels,
    }">
      <TickIcon name="camera" />
    </div>
  </div>

</template>

<script lang="ts">
import useUserStore from "@/store/user";
import { Component, Prop, Vue } from "vue-facing-decorator";

import { ColorsEnum } from "../../TickApi";
import UserPanel from "../panels/UserPanel.vue";
import TickIcon from "../TickIcon.vue";
import TickAvatar from "./TickAvatar.vue";
import TickInputLabel from "./TickInputLabel.vue";

@Component({
  components: { TickAvatar, UserPanel, TickIcon, TickInputLabel },
})
export default class WorkspaceIcon extends Vue {
  @Prop({ default: "" }) private workspaceId!: string;
  @Prop({ default: "" }) private overrideFileId!: string;
  @Prop() private sizePx: number;
  @Prop() private disabled: boolean;
  @Prop() private showName: boolean;
  @Prop() private name: string;

  private activePanel = "";

  private get fileId() {
    return this.overrideFileId || this.workspace?.iconFileId;
  }

  private get sizeAsPixels() {
    return `${this.sizePx}px`;
  }


  private get color(): ColorsEnum {
    return this.workspace?.color;
  }

  private get workspace() {
    return useUserStore().getWorkspace(this.workspaceId);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.workspace-icon {
  position: relative;
  display: inline-block;

  .button {
    // border-radius: 100%;
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    align-items: center;
  }
}

.logo {
  display: grid;
  border: 1px solid var(--c-base-100);
  border-radius: 999px;
  padding: 10px;
  height: 100px;
  width: 100px;
  align-content: center;
  justify-content: center;
}
</style>
