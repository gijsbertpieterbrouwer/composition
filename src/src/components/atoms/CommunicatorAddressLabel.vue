<template>

  <div @click.stop="clickAddress" class="address" :class="{ 'interactive': allowClick }">
    <TickIcon class="icon" v-if="showIcon" :name="icon" />
    <TickAvatar v-else class="address-avatar" :sizePx="sizePx" :online="false" :fileId="address.avatarFileId" :name="''" /> <span class="address-name">
      {{ this.communicationName(address) }}</span>
  </div>

</template>

<script lang="ts">
import { getCommunicationAddressName } from "@/helpers/communicationsHelper";
import { getChannelIconName } from "@/helpers/enumsHelper";
import voiceEmitter, { VoiceEventType } from "@/helpers/voiceEventBus";
import { CommunicationType, CommunicatorAddress } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import CommunicatorPanel from "../panels/CommunicatorPanel.vue";
import UserPanel from "../panels/UserPanel.vue";
import TickIcon from "../TickIcon.vue";
import TickAvatar from "./TickAvatar.vue";

@Component({
  components: { TickAvatar, UserPanel, CommunicatorPanel, TickIcon },
})
export default class CommunicatorAddressLabel extends Vue {
  @Prop() private communicatorId: string;
  @Prop() private address: CommunicatorAddress;
  @Prop({ default: 20 }) private sizePx: number;

  private clickAddress() {
    if (!this.allowClick) { return; }

    switch (this.address.type) {
      case CommunicationType.Phone:
        this.onClickPhone();
        break;
    }
  }

  private onClickPhone() {
    voiceEmitter.emit(VoiceEventType.startPhoneCall, {
      phoneNumber: this.address.address,
      channelId: null,
      communicatorAddressId: this.address.id,
      communicatorId: this.communicatorId,
    });
  }

  private communicationName(address: CommunicatorAddress) {
    return getCommunicationAddressName(address);
  }
  private get allowClick() {
    const iconTypes: CommunicationType[] = [CommunicationType.Phone];
    return iconTypes.some(p => p == this.address.type)
  }
  private get showIcon() {
    const iconTypes: CommunicationType[] = [CommunicationType.Phone, CommunicationType.ChatWidget, CommunicationType.Email];
    return iconTypes.some(p => p == this.address.type)
  }

  private get icon() {
    return getChannelIconName(this.address.type);
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.address {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  padding: 2px 4px;

  &.interactive {
    &:hover {
      background-color: var(--c-base-300);
    }
  }

  .address-name {
    font-size: $text-size-regular;
  }

  .icon {
    width: 20px;
    height: 20px;

  }
}
</style>
