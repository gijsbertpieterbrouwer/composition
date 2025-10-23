<template>
  <MenuListItem @contextmenu.prevent="showContextMenu($event)" @select="select" :title="communicatorName" :subtitle="ticket.title" :selected="selected" :attention="attention">
    <TicketStatusLabel :status="status" v-if="showExplicitTicketStatus" />
    <LabelList v-if="showLabels" :labels="labels" :disableCollapse="false" :hideGrey="true" />
    <ChannelLabel :channelId="channelId" v-if="showChannel" class="channel-name" :asText="true" />
    <UsersAndTeamsSelector v-if="showAssignments" v-model="assignmentIds" emptyLabel="" :disabled="true" :overlapAfter="3" />
    <TypingIndicator v-if="showTypingInfo" :userIds="typingUsers" :communicatorIds="typingCommunicators" :hideSelf="true" :onlyShowLabel="true" />

    <template #indicators>
      <TicketSlaTimers v-if="showSlaTimers" :timers="ticketSlaTimers" />
    </template>
  </MenuListItem>
</template>

<script lang="ts">
import { ColorsEnum, LanguagePath, SlaTimer, TicketStatus, TicketSummary, TickLabelDefinition } from "@/TickApi";
import MenuListItem from "@/components/atoms/MenuListItem.vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "../Selectors/UsersAndTeamsSelector.vue";
import TicketSlaTimers from "./TicketSlaTimers.vue";

import LabelList, { Label } from "@/components/atoms/LabelList.vue";
import TypingIndicator from "@/components/atoms/TypingIndicator.vue";
import { openContextDropdownPanel } from "@/components/panels/contextPanels/ContextDropdownPanel.vue";
import { getMainTicketMenuOptions } from "@/helpers/ticketHelper";
import { translate } from "@/plugins/translatePlugin";
import { TicketListOptions } from "@/store/tickets";
import useUtilityDataStore from "@/store/utilitydata";
import ChannelLabel from "../channel/ChannelLabel.vue";
import TicketStatusLabel from "./TicketStatusLabel.vue";

@Component({
  emits: ["select"],
  components: { MenuListItem, TicketSlaTimers, UsersAndTeamsSelector, LabelList, TypingIndicator, ChannelLabel, TicketStatusLabel }
})
export default class TicketListItem extends Vue {
  @Prop() private ticket: Required<TicketSummary>;
  @Prop() private activeId!: string;
  @Prop() private options!: TicketListOptions;

  private showContextMenu(e: MouseEvent) {
    const editOptions = getMainTicketMenuOptions(this.ticket.id, this.ticket.status);

    openContextDropdownPanel(e, editOptions, translate(LanguagePath.Ticket));

    e.stopPropagation();
  }

  private get showCommunicatorName() {
    return this.options?.showCommunicatorName;
  }

  private get communicatorName() {
    return this.showCommunicatorName ? this.ticket?.primaryCommunicatorName || "-" : "";
  }

  private select() {
    this.$emit('select', this.ticket);
  }


  private get status(): TicketStatus {
    return this.ticket.status;
  }
  private get selected() {
    return this.activeId === this.ticket.id;
  }
  private get attention() {
    return this.ticket.status == TicketStatus.WaitingForTickUser;
  }

  private get channelName() {
    const channelId = this.ticket?.primaryCommunicationChannelId;
    const channel = useUtilityDataStore().communicationChannel(channelId);
    return channel ? channel.name : "";
  }

  private get channelId() {
    return this.ticket?.primaryCommunicationChannelId;
  }

  private get ticketSlaTimers(): SlaTimer[] {
    return this.ticket.slaTimers || [];

    // const nowTicks = useAppStore().nowUtcTicks

    // return [{
    //   countDownStartDateTicks: nowTicks - 5,
    //   dueDateTicks: nowTicks + 100, //getRandomInt(1, 120),
    //   slaDefinitionId: "test",
    //   slaInstanceId: "test",
    // }]
  }


  private get labels(): Label[] {
    const allLabels = useUtilityDataStore().utilityData.labelDefinitions || [];
    const ticketLabels: TickLabelDefinition[] = [];

    for (let i = 0; i < (this.labelIds || []).length; i++) {
      let label = allLabels.find((l) => l.id == this.labelIds[i]);

      const alreadyInList = ticketLabels.some(p => p.id == label?.id);
      if (label && !alreadyInList && !label.deleted && label.color != ColorsEnum.Grey) {
        ticketLabels.push(label);
      }
    }
    return ticketLabels;
  }

  private get labelIds() {
    return this.ticket?.labelDefinitionIds || [];
  }
  private get hasLabels() {
    return this.labels?.length > 0
  }
  private get showChannel() {
    return this.options?.showChannel;
  }
  private get showLabels() {
    return this.options?.showLabels && this.hasLabels;
  }
  private get showSlaTimers() {
    return this.options?.showSlaTimers;
  }
  private get showExplicitTicketStatus() {
    return this.options?.showExplicitTicketStatus;
  }


  private get showAssignments() {
    return this.options?.showAssignments && this.hasAssignments
  }

  private get hasAssignments() {
    return this.assignmentIds?.userIds?.length > 0 || this.assignmentIds?.teamIds?.length > 0;
  }

  private get assignmentIds(): UsersAndTeamsSelection {
    return {
      userIds: this.ticket?.assignedUserIds,
      teamIds: this.ticket?.assignedTeamIds,
    };
  }

  private get showTypingInfo() {
    return this.options?.showTypingIndicator;
  }

  private get typingUsers() {
    return this?.ticket?.isTyping?.userIds || [];
  }

  private get typingCommunicators() {
    return this?.ticket?.isTyping?.communicatorIds || [];
  }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.channel-name {

  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  text-transform: capitalize;
}
</style>
