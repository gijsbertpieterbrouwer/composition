<template>
  <div class="content">
    <TicketHeader @complete="completeTicket" :ticketId="activeId" @toggleHideTrivial="toggleHideTrivial" :hideTrivialTimelineItems="hideTrivialTimelineItems" />
    <div class="timeline" v-scrollPositionInCss :key="activeId" @contextmenu.prevent="showContextMenu($event)">
      <component :ticket="ticket" v-for="(item, index) in this.timelineItems" :key="item.id" :is="getTimelineComponent(item)" :item="item" :formerItem="timelineItems[index - 1]"
        :hideIfTrivial="hideTrivialTimelineItems" />
      <div class="timeline-spacer" />
      <!-- <div class="timeline-more-indicator">
        <div class="timeline-more-indicator-inner">
          <div class="timeline-more-indicator-line" />
        </div>
      </div> -->
    </div>

    <div class="communication-center-container" v-if="allowEditTicket">
      <TicketCommunicationCenter :activeId="activeId" />
    </div>
  </div>
</template>

<script lang="ts">
import { AuthorizationObjectType, LanguagePath, TicketStatus, TimelineDataItem, TimelineDataItemType } from "@/TickApi";
import LabelsSelector from '@/components/molecules/Selectors/LabelsSelector.vue';
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import TicketCommunicationCenter from "@/components/molecules/ticket/TicketCommunicationCenter.vue";
import useTicketsStore from "@/store/tickets";
import { Component, Prop, Vue } from "vue-facing-decorator";

import TicketAssignment from "@/components/molecules/ticket/Timeline/TicketAssignment.vue";
import TicketMessage from "@/components/molecules/ticket/Timeline/TicketMessage.vue";
import TicketNote from "@/components/molecules/ticket/Timeline/TicketNote.vue";
import TicketSlaFailure from "@/components/molecules/ticket/Timeline/TicketSlaFailure.vue";
import TicketTaskWrapper from "@/components/molecules/ticket/Timeline/TicketTaskWrapper.vue";
import TicketLabel from "./Timeline/TicketLabel.vue";
import TicketSystemMessage from "./Timeline/TicketSystemMessage.vue";

// --

import TickIcon from "@/components/TickIcon.vue";
import TicketHeader from "@/components/molecules/ticket/TicketHeader.vue";
import { openContextDropdownPanel } from "@/components/panels/contextPanels/ContextDropdownPanel.vue";
import { scrollPositionInCss } from "@/directives";
import { getMainTicketMenuOptions } from "@/helpers/ticketHelper";
import { translate } from "@/plugins/translatePlugin";
import { markCommunicatorAsSpammer } from "@/services/CommunicatorsService";
import useUserStore from "@/store/user";
import useViewstateStore, { InterfaceStateType } from "@/store/viewstate";
import TicketBasicTimelineEvent from "./Timeline/TicketBasicTimelineEvent.vue";
import TicketPhoneCallLog from "./Timeline/TicketPhoneCallLog.vue";
//import { questIsFull } from "@/helpers/questHelper";

// FIXME: Ruben timeline line to communication center in a small timeline

@Component({
  directives: {
    scrollPositionInCss,
  },
  emits: ["exit"],
  components: {
    TicketMessage,
    TicketCommunicationCenter,
    TickScreen,
    LabelsSelector,
    TicketSlaFailure,
    TicketAssignment,
    TicketTaskWrapper,
    TicketNote,
    TicketLabel,
    TicketBasicTimelineEvent,
    TicketSystemMessage,
    TicketPhoneCallLog,
    //--
    TicketHeader,
    TickIcon,
  },
})
export default class TicketContent extends Vue {
  TimelineDataItemType = TimelineDataItemType;
  @Prop() private activeId!: string;

  private markAsSpammer() {
    markCommunicatorAsSpammer({
      communicatorId: this.ticket.primaryCommunicatorId,
      isSpammer: true,
    }).then(() => {
      useTicketsStore().finish(this.ticket.id);
    });
  }

  private showContextMenu(e: MouseEvent) {
    const editOptions = getMainTicketMenuOptions(this.ticket.id, this.ticket.status);
    if (this.allowEditTicket) {
      openContextDropdownPanel(e, editOptions, translate(LanguagePath.Ticket));
    }
    e.stopPropagation();
  }

  private completeTicket() {
    this.$emit("exit");
  }

  private get hideTrivialTimelineItems() {
    return useViewstateStore().has(InterfaceStateType.TicketHideTrivialTimelineItems);
  }

  private toggleHideTrivial() {
    useViewstateStore().toggle(InterfaceStateType.TicketHideTrivialTimelineItems);
  }

  private get loaded(): boolean {
    return this.ticket != null;
  }

  private get allowEdit() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Ticket);
  }

  private get finished() {
    return this.ticket?.status == TicketStatus.Finished && this.allowEdit;
  }

  private get allowEditTicket() {
    return !this.finished;
  }

  private get ticket() {
    return useTicketsStore().ticket(this.activeId);
  }

  private get timelineItems() {
    if (!this.loaded || !this.ticket.timeline || !this.ticket.timeline.items) {
      return [];
    }
    var response = this.ticket.timeline.items.sort(({ timelineDateAsTick: a }, { timelineDateAsTick: b }) => a - b);
    return [...response].reverse();
    //return response.reverse();
  }

  private getTimelineComponent(item: TimelineDataItem) {
    switch (item.type) {
      //case TimelineDataItemType.Group: return "TicketMessage";
      case TimelineDataItemType.Message:
        return "TicketMessage";
      case TimelineDataItemType.Assignment:
        return "TicketAssignment";
      case TimelineDataItemType.SlaFailure:
        return "TicketSlaFailure";
      case TimelineDataItemType.TaskInstance:
        return "TicketTaskWrapper";
      case TimelineDataItemType.Note:
        return "TicketNote";
      case TimelineDataItemType.Label:
        return "TicketLabel";
      case TimelineDataItemType.TicketEvent:
        return "TicketBasicTimelineEvent";
      case TimelineDataItemType.SystemMessage:
        return "TicketSystemMessage";
      case TimelineDataItemType.PhoneCall:
        return "TicketPhoneCallLog";

      default:
        "div";
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  padding: 32px 23px 0 8px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-areas: "header" "timeline" "communicationcenter";
  max-height: calc(100dvh - 8px);
  height: 100%;
}

.timeline-more-indicator {
  position: sticky;
  width: 100%;
  height: 0;
  z-index: 2;
  top: 0;

  .timeline-more-indicator-inner {
    height: 24px;
    width: 100%;
    background: linear-gradient(0deg,
        rgba(255, 255, 255, 0) 0%,
        var(--c-base-300) 50%);

    .timeline-more-indicator-line {
      height: 16px;
      width: 1.5px;
      background-color: var(--c-base-300);
      border-left: 1px dashed var(--c-contrast);
      transform: translateX(18px);
    }
  }
}



.timeline-spacer {
  border-left: 1px solid var(--c-ticket-timeline);
  transform: translateX(18px);
  flex-grow: 1;
  flex-shrink: 1;
}

.timeline {
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 8px;
  position: relative;
  display: flex;
  flex-direction: column-reverse;

  &:not([data-scrolling]) .timeline-more-indicator,
  &[data-scrolling][data-scrollpc="100"] .timeline-more-indicator {
    display: none;
  }
}

.communication-center-container {
  padding: 0 0 12px 16px;
}
</style>
@/store/tickets