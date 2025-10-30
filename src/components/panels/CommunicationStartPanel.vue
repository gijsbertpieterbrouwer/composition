<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>{{ $translate(LanguagePath.App_VoiceCallStartPanel_Title) }}</template>

    <template #actions>

    </template>
    <div class="content">

      <template v-if="hasTypeChannels">
        <div class="explanation">{{ $translate(LanguagePath.App_VoiceCallStartPanel_AskChannel_Explanation) }}</div>

        <div class="channels-wrapper">
          <!-- <ChannelLabel class="channel" v-for="channel in availableChannels" :key="channel.id" :channelId="channel.id" :size="ChannelLabelSize.Large" /> -->

          <WizardOptionButton class="create_action" @select="selectChannel(channel)" :selected="channel.id == selectedId" :name="channel.name" v-for="channel in availableChannels" :key="channel.id">

          </WizardOptionButton>

        </div>

      </template>
      <template v-else>

        <div class="explanation">{{ $translate(LanguagePath.App_CommunicationStartPanel_NoChannels_Explanation) }}</div>

      </template>


    </div>

    <template #footer>
      <div class="footer">
        <TickSwitch v-if="useDefault" v-model="saveAsDefault">{{ $translate(LanguagePath.App_Use_DontAskAgain) }}</TickSwitch>

        <TickButton v-if="hasTypeChannels" :disabled="!hasSelection" @click="use">{{ $translate(LanguagePath.App_Use) }}</TickButton>
        <TickAddCostItemButton icon="plus" v-else :requiredAuth="AuthorizationObjectType.TechnicalConfiguration" :costItem="SubscriptionCostItemType.Channel" :currentNr="this.allChannelsCount"
          @add="create" :title="LanguagePath.App_CommunicationStartPanel_NoChannels_Create_Title" />
      </div>
    </template>

  </TickDialogPanel>
</template>

<script lang="ts">
import TickAddCostItemButton from "@/components/atoms/TickAddCostItemButton.vue";
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import ChannelLabel, { ChannelLabelSize } from "@/components/molecules/channel/ChannelLabel.vue";
import { openChannelCreatorPanel } from "@/components/panels/ChannelCreatorPanel.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import useUtilityDataStore from "@/store/utilitydata";
import useVoiceStore from "@/store/voice";
import { AuthorizationObjectType, CommunicationType, LanguagePath, SubscriptionCostItemType, TickChannelSummary } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import WizardOptionButton from "../atoms/WizardOptionButton.vue";


const panelName = "CommunicationStartPanel";

export function openCommunicationStartPanel(communicationType: CommunicationType, onSelect: (d: communicationStartPanelSelectionData) => void) {
  mount(CommunicationStartPanel, {
    props: {
      communicationType: communicationType
    },
    events: {
      close: () => {
        unmount(panelName);
      },
      select: (data: communicationStartPanelSelectionData) => {
        if (onSelect) {
          onSelect(data);
        }

        unmount(panelName);
      }
    },
  }, panelName);
}

export interface communicationStartPanelSelectionData {
  channelId: string,
}

@Component({
  directives: { focus },
  emits: ["close", "select"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    ChannelLabel,
    TickSwitch,
    TickAddCostItemButton, WizardOptionButton
  },
})
export default class CommunicationStartPanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath
  ChannelLabelSize = ChannelLabelSize
  AuthorizationObjectType = AuthorizationObjectType
  SubscriptionCostItemType = SubscriptionCostItemType

  @Prop() private communicationType: CommunicationType;

  private saveAsDefault = false;
  private selectedChannel: TickChannelSummary = null;

  private get selectedId() {
    return this.selectedChannel?.id;
  }

  private selectChannel(to) {
    this.selectedChannel = to;
  }

  private get hasTypeChannels(): boolean {
    return this.availableChannels.length > 0;
  }
  private get hasSelection(): boolean {
    return this.selectedChannel != null;
  }
  private get allChannels() {
    return useUtilityDataStore().utilityData.communicationChannels;
  }

  private get allChannelsCount() {
    return this.allChannels.length;
  }

  private get availableChannels() {
    return this.allChannels.filter(p =>
      p.communicationType == this.communicationType
      && p.enableOutboundMessages) || [];
  }

  mounted() {
    this.selectedChannel = this.availableChannels.length > 0 ? this.availableChannels[0] : null;

    // if (this.availableChannels.length == 1) {
    //   this.close();
    // }
  }


  private create() {
    openChannelCreatorPanel();
  }

  private get useDefault(): boolean {
    return this.communicationType == CommunicationType.Phone
  }

  private use() {

    if (this.hasSelection && this.communicationType == CommunicationType.Phone) {
      useVoiceStore().setDefaultChannel(this.saveAsDefault ? this.selectedChannel?.id : null);
    }

    const selection: communicationStartPanelSelectionData = {
      channelId: this.selectedChannel?.id
    }


    this.$emit("select", selection);
  }


  private close() {
    this.$emit("close");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 600px;
  display: grid;
  gap: 30px;

  .explanation {
    font-size: $text-size-regular;
    font-style: italic;
  }

  .channels-wrapper {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

}

.footer {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
}
</style>
