<template>
  <div v-if="exists">
    <template v-if="asText">
      <span :title="name" class="channel-text" :class="{ 'inactive': !active }">
        <TickIcon class="icon" :name="channelIconName" v-if="channelIconName" />{{ this.name }}
      </span>
    </template>
    <template v-else>
      <span class="channel-label " :title="name" :class="this.sizeClass">
        <TickIcon class="icon" :name="channelIconName" v-if="channelIconName" />
        <span class="title">{{ this.name }}</span>
        <TickActiveIndicator class="indicator" :status="channelActiveStatus" />
      </span>
    </template>

  </div>
</template>

<script lang="ts">
import { TickChannelSummary } from "@/TickApi";
import TickIcon from "@/components/TickIcon.vue";
import TickActiveIndicator, { ActiveStatusEnum } from "@/components/atoms/TickActiveIndicator.vue";
import TickLabel from "@/components/atoms/TickLabel.vue";
import { getChannelIconName } from "@/helpers/enumsHelper";
import { stringIsNullOrEmpty } from "@/helpers/stringHelper";
import useUtilityDataStore from "@/store/utilitydata";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickCommunicationChannelDisplay from "../TickCommunicationChannelDisplay.vue";

export enum ChannelLabelSize {
  Normal = "normal",
  Large = "large",
}

@Component({
  emits: [],
  components: { TickLabel, TickIcon, TickActiveIndicator, TickCommunicationChannelDisplay },
})
export default class ChannelLabel extends Vue {
  ActiveStatusEnum = ActiveStatusEnum
  @Prop() private channelId!: string;
  @Prop({ default: false }) private asText: boolean;
  @Prop({ default: ChannelLabelSize.Normal }) private size: ChannelLabelSize;
  private channel: TickChannelSummary;

  private get active(): boolean {
    return this.channel?.enableInboundMessages && this.channel?.enableOutboundMessages;

  }
  private get channelActiveStatus(): ActiveStatusEnum {
    return this.channel?.enableInboundMessages && this.channel?.enableOutboundMessages
      ? ActiveStatusEnum.active
      : (this.channel?.enableInboundMessages || this.channel?.enableOutboundMessages) ? ActiveStatusEnum.partialActive : ActiveStatusEnum.inactive;
  }

  private get name(): string {
    return this.channel?.name;
  }

  private get sizeClass(): string {
    switch (this.size) {
      case ChannelLabelSize.Normal: return "";
      case ChannelLabelSize.Large: return "large";
      default: return "";
    }
  }


  private get channelIconName() {
    return getChannelIconName(this.channel?.communicationType);
  }

  // private get colorName(): ColorsEnum {
  //   switch (this.channel.communicationType) {
  //     case CommunicationType.ChatWidget:
  //       return ColorsEnum.Yellow;
  //     case CommunicationType.Email:
  //       return ColorsEnum.BoldPurple;
  //     case CommunicationType.FacebookMessenger:
  //       return ColorsEnum.SubtleBlue;
  //     case CommunicationType.Telegram:
  //       return ColorsEnum.Blue;
  //     default:
  //       return ColorsEnum.BoldBlue;
  //   }

  // }

  private get exists(): boolean {
    return !stringIsNullOrEmpty(this.channel?.id);
  }

  beforeMount() {
    this.channel = useUtilityDataStore().communicationChannel(this.channelId) || null
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.channel-text {
  @include font-inter;
  font-weight: 100;
  font-size: $text-size-regular;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;

  &.inactive {
    opacity: 0.5;
  }

  .icon {
    width: 12px;
    height: 12px;
  }

}



.channel-label {
  // @include neon-bg;
  @include font-inter;

  background-color: var(--c-base-500);
  color: var(--c-contrast);

  height: 45px;
  padding: 4px 16px;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  text-transform: capitalize;
  white-space: nowrap;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: $white;
  max-width: 200px;
  min-width: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  display: grid;
  grid-template-columns: auto auto;
  // grid-template-rows: auto auto;
  grid-template-areas:
    "icon title"
    "icon indicator";
  gap: 5px;
  column-gap: 10px;
  align-items: center;

  .icon {
    grid-area: icon;

  }

  .title {
    grid-area: title;
  }

  .indicator {
    grid-area: indicator;
  }

  &.large {
    height: 90px;
    padding: 10px 24px;
    max-width: 300px;
    min-width: 40px;
    font-size: 12px;
    align-items: start;

    .icon {
      align-items: start;
      width: 30px;
      height: 30px;
    }
  }


}
</style>
