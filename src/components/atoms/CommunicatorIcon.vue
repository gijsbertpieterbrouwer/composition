<template>
  <button class="button" @click="togglePanel" ref="toggleButton" :disabled="disabled">
    <TickAvatar :name="nameForAvatar" :fileId="fileId" :sizePx="avatarSize" :color="color" />
    <span class="name" v-if="showName">{{ this.name }}</span>
  </button>
</template>

<script lang="ts">
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { ColorsEnum, CommunicatorAddress, TickCommunicator, TickTicketCommunicator } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import CommunicatorPanel, { openCommunicatorPanel } from "../panels/CommunicatorPanel.vue";
import UserPanel from "../panels/UserPanel.vue";
import TickIcon from "../TickIcon.vue";
import TickAvatar from "./TickAvatar.vue";

@Component({
  components: { TickAvatar, UserPanel, CommunicatorPanel, TickIcon },
})
export default class CommunicatorIcon extends Vue {
  @Prop({ default: "" }) private communicator?: TickCommunicator | TickTicketCommunicator;
  @Prop() private address: CommunicatorAddress;
  @Prop() private sizePx: number;
  @Prop() private disabled: boolean;
  @Prop() private showName: boolean;

  //private activePanel = "";


  private get avatarSize() {
    return this.sizePx || 20;
  }

  private get color() {
    return this.communicator?.color || ColorsEnum.Grey;
  }

  private get nameForAvatar() {
    return this.communicator?.name || "No Name";
  }
  private get name() {
    return this.communicator?.name || "";
  }

  private get fileId() {
    return this?.address?.avatarFileId || this.communicator?.avatarFileId;
  }

  private togglePanel() {
    openCommunicatorPanel(this.communicator, this.address, getRefElementDOMRect(this, "toggleButton"));
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.button {
  // border-radius: 100%;
  display: flex;
  gap: 5px;
  align-items: center;

  .name {
    text-transform: capitalize;
  }
}
</style>
