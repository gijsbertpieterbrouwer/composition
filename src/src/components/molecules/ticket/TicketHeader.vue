<template>
  <TimelineItem class="ticket-header" icon="ticket" :continuousLine="false">
    <div class="ticket-header-content" :title="stateTitle">
      <div class="subtitle">
        <span class="ticket-start">
          <span class="accented starter-name" ref="communicator-button" @click="openCommunicatorPanel">{{ primaryCommunicatorName }}</span>

          <span class="pre-title">&nbsp;{{ $translate(LanguagePath.App_Ticket_Header_PreTitle) }}&nbsp;<span class="text-selectable accented static-name" @click="copyStaticName">{{
            this.staticName }}</span></span>

        </span>
        <span class="timestamp" :title="formattedStartDate">
          {{ this.formattedStartDate }}
        </span>


      </div>
      <TickButton v-if="isLoaded" :icon="toggleImportantIcon" class="settings" @click="toggleHideTrivial" :title="toggleImportantText" :appearance="ButtonAppearance.transparent" :round="true"
        :size="ButtonSize.regular" :color="ButtonColor.contrast" />

      <BusyIndicator v-else :loading="!isLoaded" class="settings" />


      <TickHeading @click="editName" size="large" class="title">
        {{ this.title }}

      </TickHeading>
      <div class="state" :class="{ 'finished': this.isFinished }">

        <TicketActiveFlowSelector v-if="availableInPlan(SubscriptionCostItemType.Flow)" v-model="activeFlowId" :disabled="!allowEdit" />
        <UsersAndTeamsSelector v-if="availableInPlan(SubscriptionCostItemType.User) || this.availableInPlan(SubscriptionCostItemType.Teams)" v-model="assignmentIds"
          :emptyLabel="$translate(LanguagePath.App_Ticket_Header_NoAssignments)" :disabled="!allowEdit" :overlapAfter="3" />
        <LabelsSelector v-if="availableInPlan(SubscriptionCostItemType.Labels)" v-model="labelIds" :hideGrey="true" :emptyLabel="$translate(LanguagePath.App_Ticket_Header_NoLabels)"
          :disabled="!allowEdit" />







      </div>
      <div class="actions">
        <!-- <template v-if="isLoaded"> -->
        <!-- <TickButton class="complete-button" v-if="!isFinished" :size="ButtonSize.mini" :color="ButtonColor.contrast" @click="finish">{{
            $translate(LanguagePath.App_Ticket_Header_CompleteButton_Complete) }}
          </TickButton> -->

        <TickComboButton v-if="!isFinished" @click="finish" :options="ticketMainOptions" :size="ButtonSize.mini" :color="ButtonColor.contrast">{{
          $translate(LanguagePath.App_Ticket_Header_CompleteButton_Complete) }}
        </TickComboButton>

        <span v-else class="action-info ">
          <Ticklabel class="status-label" :name="$translate(LanguagePath.App_Ticket_Header_CompleteButton_Completed)" :color="ColorsEnum.BoldLime" :size="LabelSize.large" :disableCollapse="true"
            :disableToggle="true" />

        </span>
        <!-- </template>
<template v-else>
          <span class="action-info">{{ $translate(LanguagePath.App_Loading) }}</span>
        </template> -->
      </div>
    </div>
  </TimelineItem>
</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import TickButton, {
  Appearance as ButtonAppearance,
  Color as ButtonColor,
  Size as ButtonSize,
} from "@/components/atoms/TickButton.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TimelineItem from "@/components/molecules/ticket/Timeline/TimelineItem.vue";
import useTicketsStore from "@/store/tickets";
import { Component, Prop, Vue } from "vue-facing-decorator";

import { ColorsEnum, LanguagePath, SubscriptionCostItemType, TicketStatus } from "@/TickApi";
import BusyIndicator from "@/components/atoms/BusyIndicator.vue";
import TickComboButton from "@/components/atoms/TickComboButton.vue";
import { DropdownOption } from "@/components/atoms/TickDropdown.vue";
import Ticklabel, { Size as LabelSize } from "@/components/atoms/TickLabel.vue";
import LabelsSelector from '@/components/molecules/Selectors/LabelsSelector.vue';
import TicketActiveFlowSelector from "@/components/molecules/ticket/TicketActiveFlowSelector.vue";
import { openCommunicatorPanel } from "@/components/panels/CommunicatorPanel.vue";
import { displayDistanceToNowDate } from "@/helpers/dateHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { copyToClipboard } from "@/helpers/stringHelper";
import { getMainTicketMenuOptions, renameTicket } from "@/helpers/ticketHelper";
import { translate } from "@/plugins/translatePlugin";
import useUserStore from "@/store/user";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "../Selectors/UsersAndTeamsSelector.vue";

@Component({
  emits: ["toggleHideTrivial", "complete"],
  components: {
    TickHeading,
    TickIcon,
    TimelineItem,
    LabelsSelector,
    UsersAndTeamsSelector,
    TicketActiveFlowSelector,
    TickButton,
    BusyIndicator,
    Ticklabel,
    TickComboButton

  },
})
export default class TicketHeader extends Vue {
  ButtonSize = ButtonSize;
  ButtonAppearance = ButtonAppearance;
  ButtonColor = ButtonColor;
  SubscriptionCostItemType = SubscriptionCostItemType;
  LanguagePath = LanguagePath;
  ColorsEnum = ColorsEnum;
  LabelSize = LabelSize;

  @Prop() private hideTrivialTimelineItems?: boolean;
  @Prop() private ticketId?: string;

  private openCommunicatorPanel() {
    const c = this.ticket?.communicators.find(p => p.primary);
    if (!c) { return; }
    openCommunicatorPanel(c, null, getRefElementDOMRect(this, "communicator-button"));
  }


  private get ticketMainOptions(): DropdownOption[] {
    const editOptions = getMainTicketMenuOptions(this.ticketId, this.ticketStatus);
    return editOptions;
  }


  private availableInPlan(costItem?: SubscriptionCostItemType) {
    return useUserStore().allowedView(null, costItem);
  }

  private toggleHideTrivial() {
    this.$emit("toggleHideTrivial");
  }

  private get stateTitle() {
    return this.isFinished ? translate(LanguagePath.App_Ticket_Header_Tooltip_Completed) : null;
  }
  private get isLoaded() {
    return this.ticket != null;
  }

  private get title(): string {
    return this.ticket
      ? this.ticket?.title
      : this.summary?.title;
  }
  private get toggleImportantIcon() {
    return this.hideTrivialTimelineItems ? "eye-off" : "eye";
  }

  private get toggleImportantText() {
    return this.hideTrivialTimelineItems ? translate(LanguagePath.App_Ticket_Header_ShowImportant_All) : translate(LanguagePath.App_Ticket_Header_ShowImportant_ImportantOnly);
  }

  private get ticketStatus(): TicketStatus {
    return this.ticket
      ? this.ticket?.status
      : this.summary?.status;
  }

  private get isFinished() {
    return this.ticketStatus == TicketStatus.Finished;
  }

  private get allowEdit() {
    return !this.isFinished;
  }

  private get staticName() {
    return this.ticket
      ? this.ticket?.staticName?.toLocaleUpperCase()
      : this.summary?.staticName?.toUpperCase();
  }

  private copyStaticName() {
    copyToClipboard(this.staticName);
  }


  private get primaryCommunicatorName() {
    return this.ticket
      ? this.ticket?.primaryCommunicatorName
      : this.summary?.primaryCommunicatorName;
    //return this.ticket?.primaryCommunicatorName || "";
  }

  private get ticket() {
    return useTicketsStore().ticket(this.ticketId);
  }

  private get summary() {
    return useTicketsStore().ticketSummary(this.ticketId);
  }

  private editName() {
    renameTicket(this.ticket.id);
  }

  private get startDate() {
    return this.ticket?.creationDate || "";
  }

  private get formattedStartDate() {
    return displayDistanceToNowDate(this.startDate);
  }

  private get activeFlowId() {
    return this.ticket?.currentFlowInstanceDefinitionId;
  }

  private set activeFlowId(to) {
    useTicketsStore().setTicketFlow(this.ticketId, to);
  }

  private get labelIds() {
    return this.ticket ? this.ticket?.labelDefinitionIds : this.summary?.labelDefinitionIds;
  }

  private set labelIds(to) {
    useTicketsStore().setTicketLabels(this.ticketId, to);
  }

  private get assignmentIds(): UsersAndTeamsSelection {
    return {
      userIds: this.ticket ? this.ticket?.assignedUserIds : this.summary?.assignedUserIds,
      teamIds: this.ticket ? this.ticket?.assignedTeamIds : this.summary?.assignedTeamIds,
    };
  }

  private set assignmentIds({ userIds, teamIds }) {
    useTicketsStore().setTicketAssignments(this.ticketId, {
      userIds,
      teamIds,
    });
  }



  private finish() {
    useTicketsStore().finish(this.ticketId);
    this.$emit("complete");
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.loading-placeholder {
  //height: 32px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: $text-size-regular;
  align-content: center;
}


.ticket-header {
  .ticket-header-content {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas: "subtitle settings" "title title" "state actions";
    gap: 0 16px;
    flex-grow: 1;


    .subtitle {
      grid-area: subtitle;
      line-height: 20px;
      font-size: $text-size-regular;
      display: flex;
      gap: 5px;
      color: var(--c-contrast-200);


      .pre-title {
        text-transform: Lowercase;
      }

      .starter-name {
        text-transform: capitalize;

        &:hover {
          color: $brand
        }

      }

      .ticket-start span:not(.accented),
      .timestamp {
        // opacity: 0.6;
        color: var(--c-contrast-200);
      }

      .accented {
        font-weight: 600;
      }

      .static-name {
        text-transform: capitalize;

        &:hover {
          color: $brand
        }
      }


    }

    .settings {
      grid-area: settings;
      font-size: $text-size-regular;
      opacity: 0.6;
      justify-self: end;
      min-height: 28px;
    }

    .title {
      grid-area: title;
    }

    .state {
      grid-area: state;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      font-size: $text-size-regular;
      align-content: center;

      &.finished {
        opacity: 1;
      }

    }

    .actions {
      grid-area: actions;
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: flex-end;
      flex-shrink: 0;
      padding: 4px 0;


      .complete-button {
        white-space: nowrap;
        align-self: flex-start;
      }

      .action-info {
        font-size: 0.7em;
        //opacity: 0.7;
        font-style: italic;

        .status-label {
          font-style: normal;
        }
      }
    }


  }
}
</style>
