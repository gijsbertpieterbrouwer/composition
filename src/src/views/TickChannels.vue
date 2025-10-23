<template>
  <template v-if="hasActiveItem">
    <ChannelEditor :activeId="selectedItemId" @saved="onChannelSaved" @deleted=this.onChannelDeleted />
  </template>
  <template v-else>
    <TickScreen icon="channel" :title="$translate(LanguagePath.Channels)">
      <template v-slot:actions>
        <TickAddCostItemButton :requiredAuth="AuthorizationObjectType.TechnicalConfiguration" :costItem="SubscriptionCostItemType.Channel" :currentNr="this.currentNr" @add="createEmptyChannelAction"
          :title="LanguagePath.App_Add" />


      </template>

      <template v-slot:default>
        <TickEditorPanel v-if="!hasInboundChannels" name="No inbound channels found">
          <TickIcon name="warning" />
          {{ $translate(LanguagePath.App_Channels_NoData) }}
        </TickEditorPanel>

        <div class="list">
          <TickListItem :icon="channelIconName(item)" :name="item.name" @select="selectItem(item)" v-for="item in this.channels" :key="item.id">
            <span class="active-indicator" :class="subClass(item)"> {{ this.getStatusTitle(item) }}</span> <span class="channel-type">by {{
              this.getChannelName(item) }}</span>
          </TickListItem>
        </div>

      </template>

    </TickScreen>

  </template>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-facing-decorator';

import TickAddCostItemButton from '@/components/atoms/TickAddCostItemButton.vue';
import TickButton from "@/components/atoms/TickButton.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import ChannelEditor from '@/components/molecules/channel/ChannelEditor.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import { openChannelCreatorPanel } from '@/components/panels/ChannelCreatorPanel.vue';
import TickIcon from '@/components/TickIcon.vue';
import { getColorName } from '@/helpers/colorsHelper';
import { getChannelIconName, getChannelStatusText } from '@/helpers/enumsHelper';
import { TickRouteParams, ViewName } from '@/router';
import useChannelsStore from '@/store/channels';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, ColorsEnum, CommunicationType, LanguagePath, SubscriptionCostItemType, TickChannelSummary } from '@/TickApi';
@Component({
  directives: {},
  components: { ChannelEditor, TickButton, TickScreen, TickListItem, TickEditorPanel, TickDropdown, TickIcon, TickAddCostItemButton },
})
export default class TickChannels extends Vue {
  LanguagePath = LanguagePath;
  AuthorizationObjectType = AuthorizationObjectType;
  SubscriptionCostItemType = SubscriptionCostItemType;
  private selectedItemId = "";

  private get addAllowedInPlan() {
    const currentNr = this.channels.length;
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.Channel, currentNr)
  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private selectItem(item: TickChannelSummary) {
    this.$router.push({ params: { ...this.$route.params, id: item.id } })
  }

  private onChannelSaved() {
    //
  }

  private get currentNr(): number {
    return this.channels.length;
  }

  private onChannelDeleted() {
    this.$router.push({ name: ViewName.Channels })
  }
  private get channels() {
    return useChannelsStore().summaries.sort((a, b) => a.name.localeCompare(b.name)) || [];
  }


  private get hasInboundChannels() {
    return this.channels.some(p => p.enableInboundMessages)
  }

  private createEmptyChannelAction() {
    this.createEmptyChannel();
  }

  private async createEmptyChannel() {
    openChannelCreatorPanel();
  }

  private channelIconName(channel: TickChannelSummary): string {
    return getChannelIconName(channel.communicationType);
  }

  private getChannelName(channel: TickChannelSummary) {
    switch (channel.communicationType) {
      case CommunicationType.ChatWidget: return "Tick";
      case CommunicationType.Email: return "SendGrid";
      case CommunicationType.FacebookMessenger: return "Meta";
      case CommunicationType.Telegram: return "Telegram";
      case CommunicationType.Phone: return "Phone";
      default: return "";
    }


    //return this.channelTypeOptions.find(p => p.id == channel.communicationType).text;
  }

  private subClass(channel: TickChannelSummary) {
    if (channel.enableInboundMessages && channel.enableOutboundMessages) {
      return getColorName(ColorsEnum.Lime);
    }

    if (channel.enableInboundMessages) {
      return getColorName(ColorsEnum.Orange);
    }

    if (channel.enableOutboundMessages) {
      return getColorName(ColorsEnum.Sky);
    }


    return getColorName(ColorsEnum.Grey);
  }

  private getStatusTitle(channel: TickChannelSummary) {
    return getChannelStatusText(channel);
  }

  private get allowAdd() {
    return useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration) && this.addAllowedInPlan;
  }

  mounted() {
    useChannelsStore().use();

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  overflow: hidden;
}

.channel-type {
  display: inline-block;
  padding: 2px;
  background-color: var(--c-contrast);
  padding: 0 4px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  white-space: nowrap;
  border-radius: 2px;
  color: var(--c-base);
  margin-right: 5px;
}

.channel {
  display: block;
  width: 400px;
  background-color: #fff;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid $grey300;


}

.active-indicator {
  display: inline-block;
  padding: 2px;
  background-color: $grey400;
  padding: 0 4px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  white-space: nowrap;
  border-radius: 2px;
  color: #fff;
  margin-right: 5px;
  margin-left: 5px;
  @include neon-bg;
}

// .active {
//   color: var(--c-morning-light);
//   background-color: var(--c-lime-neon)
// }

// .inactive {
//   background-color: $grey400;
// }

// .partial {
//   background-color: $grey800;
// }</style>
