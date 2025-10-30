<template>
  <div>
    <button class="toggle-button" ref="toggleButton" @click="togglePanel" :disabled="disabled">
      <ChannelLabel class="channel" v-for="id in this.channelIds" :key="id" :channelId="id" :size="this.size" />

      <div class="empty-placeholder" v-if="!hasChannels">
        <TickIcon name="channel" class="icon" />
        {{ this.formattedEmptyLabel }}
      </div>
    </button>
  </div>
</template>

<script lang="ts">
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import CommunicationChannelsPanel from "@/components/panels/CommunicationChannelsPanel.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { translate } from '@/plugins/translatePlugin';
import useUtilityDataStore from "@/store/utilitydata";
import { CommunicationType, LanguagePath } from "@/TickApi";
import { computed } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import ChannelLabel, { ChannelLabelSize } from "../channel/ChannelLabel.vue";
@Component({
  emits: ["update:modelValue"],
  components: {
    ChannelLabel
  },
})
export default class CommunicationChannelsSelector extends Vue {
  @Prop() private modelValue: string[];
  @Prop() private title: string;
  @Prop() private disabled: boolean;
  @Prop({ default: "" }) private emptyLabel: string;
  @Prop() private closeAfterSelect: boolean;
  @Prop() private availableCommunicationTypes: CommunicationType[];
  @Prop() private allowAsSubDialog: boolean;
  @Prop({ default: ChannelLabelSize.Normal }) private size: ChannelLabelSize;
  private activePanel = "";

  private get formattedEmptyLabel() {
    return this.emptyLabel || translate(LanguagePath.Channels)
  }

  private get hasChannels(): boolean {
    return this.channelIds.length >= 1;
  }

  private get availableChannels() {
    const channels = useUtilityDataStore().utilityData.communicationChannels;

    return channels;
  }

  private get channelIds() {
    return this.modelValue.filter(p => this.availableChannels.some(a => a.id == p)) || [];
  }

  private togglePanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.disabled) {
      return;
    }

    if (this.activePanel) {
      return;
    }
    const panelOptions: TickPanelOptions = {
      title: "CommunicationChannelsPanel",
      allowAsSubDialog: this.allowAsSubDialog,
      from: getRefElementDOMRect(this, "toggleButton")
    }

    this.activePanel = mount(CommunicationChannelsPanel, {
      props: {
        panelOptions: panelOptions,
        closeAfterSelect: this.closeAfterSelect,
        modelValue: computed(() => this.channelIds),
        title: this.title,
        availableCommunicationTypes: this.availableCommunicationTypes
      },
      events: {
        close: () => {
          this.closePanel();
        },
        "update:modelValue": (to: string[]) => {
          this.$emit("update:modelValue", to);
        },
      },
    });
  }

  private closePanel() {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.toggle-button {
  padding: 4px;
  border-radius: 2px;
  min-height: 32px;
  transition: background-color 200ms ease;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;

  &:hover:not([disabled]) {
    background-color: var(--c-base-300);
  }


  // .channel:not(:first-child) {
  //   // margin-left: -10px;
  // }

  .empty-placeholder {
    min-width: 80px;
    justify-content: center;
    padding: 0 4px;
    @include font-inter;
    font-weight: 500;
    letter-spacing: 0.02em;
    font-size: 10px;
    line-height: 16px;
    text-transform: capitalize;
    white-space: nowrap;

    border-radius: 2px;
    transition: all 0.3s ease;
    color: var(--c-contrast);
    display: inline-flex;
    gap: 4px;
    align-items: center;
    background-color: var(--c-base-300);

    .icon {
      width: 10px;
      height: 10px;
    }
  }
}
</style>
