<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>{{ $translate(LanguagePath.App_Add) }}</template>

    <template #actions>
    </template>
    <div class="content">

      <!-- <CommunicationChannelsSelector :availableCommunicationTypes="availableCommunicationTypes" emptyLabel="Channel" :closeAfterSelect="true" v-model="communicationChannelIds" /> -->
      <!-- <div>
        {{ this.communicatorId }}<br />
        {{ this.communicatorName }}<br />
        {{ this.communicatorAddress }}<br />
        {{ this.communicatorAddressId }}<br />
      </div> -->


      <CommunicatorSelector :allowAsSubDialog="true" @select="onSelectAddress" :startingAddress="address" :availableCommunicationTypes="availableCommunicationTypes" />
      <TickInput v-model="subject" :placeholder="$translate(LanguagePath.App_Ticket_CreatePanel_Subject_Placeholder)">{{ $translate(LanguagePath.App_Ticket_CreatePanel_Subject_Title) }}
      </TickInput>
      <TickTextarea v-model="note" :placeholder="$translate(LanguagePath.App_Ticket_CreatePanel_Note_Placeholder)" :minimumrows="5">{{ $translate(LanguagePath.App_Ticket_CreatePanel_Note_Title)
      }}
      </TickTextarea>

      <div class="flex-row">
        <LabelsSelector :allowAsSubDialog="true" v-model="labelIds"></LabelsSelector>
        <UsersAndTeamsSelector :allowAsSubDialog="true" v-model="assignments">{{ $translate(LanguagePath.App_Ticket_CreatePanel_Assignment_Title) }}</UsersAndTeamsSelector>
      </div>

      <TickSwitch v-model="allowStartFlows">{{ $translate(LanguagePath.App_Ticket_CreatePanel_Flows_AllowStart) }}</TickSwitch>

    </div>
    <template #footer>
      <TickButton @click="createTicket" :busy="busyAdding">{{ $translate(LanguagePath.App_Ticket_CreatePanel_CreateButton) }}</TickButton>
    </template>

  </TickDialogPanel>
</template>

<script lang="ts">
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import LabelsSelector from '@/components/molecules/Selectors/LabelsSelector.vue';
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import { stringIsNullOrEmpty, stringIsValidEmail } from "@/helpers/stringHelper";
import { checkIsAssignedToMe } from "@/helpers/ticketHelper";
import { debug } from "@/log";
import { notifyMessage } from "@/notify";
import { RouterToTicket } from "@/router";
import useTicketsStore from "@/store/tickets";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { AddTicketRequest, CommunicationType, LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickSelector from "../atoms/TickSelector.vue";
import TickSwitch from "../atoms/TickSwitch.vue";
import TickTextarea from "../atoms/TickTextarea.vue";
import TickEditorPanel from "../molecules/editor/TickEditorPanel.vue";
import CommunicationChannelsSelector from "../molecules/Selectors/CommunicationChannelsSelector.vue";
import CommunicatorSelector, { CommunicatorAddressOption } from "../molecules/Selectors/CommunicatorSelector.vue";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "../molecules/Selectors/UsersAndTeamsSelector.vue";

export function removeTicketCreatorPanel() {
  unmount("TicketCreatorPanel");
}

export function openTicketCreatorPanel(communicatorId?: string, routerToTicket?: boolean, address?: string) {

  mount(TicketCreatorPanel, {
    props: {
      communicatorId: communicatorId,
      address: address,
    },
    events: {
      close: (newTicketId: string) => {
        removeTicketCreatorPanel();
        if (routerToTicket == true) {
          RouterToTicket(newTicketId);
        }
      },
      // select: (d: DropdownOption) => {
      //   return d;
      // }
    },
  }, "TicketCreatorPanel");
}

@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    TickEditorPanel,
    CommunicatorSelector,
    TickSelector,
    TickTextarea,
    TickSwitch,
    LabelsSelector,
    UsersAndTeamsSelector,
    CommunicationChannelsSelector
  },
})
export default class TicketCreatorPanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath;
  @Prop() private communicatorId!: string;
  @Prop() private address!: string;

  private busyAdding = false;
  private note = "";
  private labelIds: string[] = [];

  private selectedCommunicatorId = "";
  private communicatorAddressId = "";
  private communicatorName = "";
  private communicatorAddress = "";

  private ignoreStartFlows = true;
  private assignUserIds: string[] = [];
  private assignTeamIds: string[] = [];
  private communicationChannelId: string = null;
  private subject = "";
  private forceNew = true;

  private get allowStartFlows() {
    return !this.ignoreStartFlows;
  }

  private set allowStartFlows(to: boolean) {
    this.ignoreStartFlows = !to;
  }

  private get availableCommunicationTypes(): CommunicationType[] {
    return [CommunicationType.Email, CommunicationType.Phone];
  }

  private onSelectAddress(to: CommunicatorAddressOption) {

    this.selectedCommunicatorId = to.communicator?.id;
    this.communicatorAddressId = to.communicatorAddressId;
    this.communicatorName = to.communicator?.name;
    this.communicatorAddress = to.communicatorAddress;
    this.communicationChannelId = to.communicationChannelId;
  }

  mounted() {
    this.assignUserIds.push(useUserStore().userId);
    this.selectedCommunicatorId = this.communicatorId;
  }

  // private get communicationChannelIds() {
  //   return this.communicationChannelId ? [this.communicationChannelId] : [];
  // }

  // private set communicationChannelIds(to: string[]) {
  //   this.communicationChannelId = to[to.length - 1];
  // }

  private get assignments(): UsersAndTeamsSelection {
    return {
      userIds: this.assignUserIds || [],
      teamIds: this.assignTeamIds || [],
    };
  }

  private set assignments(to: UsersAndTeamsSelection) {
    this.assignUserIds = to.userIds || [];
    this.assignTeamIds = to.teamIds || [];
  }



  private readyForSafe(): boolean {

    if (stringIsNullOrEmpty(this.subject)) { notifyMessage("Not saved", "Type a subject"); return false; }
    if (stringIsNullOrEmpty(this.note)) { notifyMessage("Not saved", "Type a note"); return false; }
    if (stringIsNullOrEmpty(this.communicationChannelId)) { notifyMessage("Not saved", "Select a channel first"); return false; }

    return true;
  }

  private createTicket() {
    if (!this.readyForSafe()) { return; }

    if (!this.communicatorAddressId) {
      let isValidAddress = true;
      const channel = useUtilityDataStore().communicationChannel(this.communicationChannelId);
      switch (channel.communicationType) {
        case CommunicationType.Email:
          isValidAddress = stringIsValidEmail(this.communicatorAddress);
          break;
        default:
          break;
      }

      if (!isValidAddress) {
        notifyMessage("Not saved", "Please provide a valid address");
        return;
      }
    }




    this.busyAdding = true;

    const ticketRequest: AddTicketRequest = {
      communicatorName: this.communicatorName,
      communicatorAddress: this.communicatorAddress,
      communicatorId: this.selectedCommunicatorId,
      communicatorAddressId: this.communicatorAddressId,
      communicationChannelId: this.communicationChannelId,
      labelDefinitionIds: this.labelIds,
      assignmentUserIds: this.assignUserIds,
      assignmentTeamIds: this.assignTeamIds,
      noteAsMarkdown: this.note,
      ignoreAutoStartingFlows: this.ignoreStartFlows,
      subject: this.subject,
      workspaceId: useUserStore().activeWorkspaceId,
      forceNew: this.forceNew,

    }

    useTicketsStore().addTicket(ticketRequest).then((newTicketId) => {
      if (checkIsAssignedToMe(ticketRequest.assignmentTeamIds, ticketRequest.assignmentUserIds)) {
        // wait for ticket..
        debug(`[Ticket:CREATE] For me, wait until created`);
        this.waitForTicket(newTicketId);
      } else {
        debug(`[Ticket:CREATE] not for me, close panel`);
        this.busyAdding = false
        this.close();
      }
    });

  }

  private waitTimer: unknown = null;
  private waitingTime = 100;
  private totalWaitingTimeAllowed = 10000;
  private totalWaitingTimPassed = 0;
  private waitForTicket(newTicketId: string) {

    this.waitTimer = setTimeout(() => {
      const summary = useTicketsStore().ticketSummary(newTicketId);
      if (summary) {
        this.busyAdding = false;
        this.close(newTicketId);
      } else {
        this.totalWaitingTimPassed += this.waitingTime;
        if (this.totalWaitingTimPassed > this.totalWaitingTimeAllowed) {
          // waited too long, just go further
          this.close();
        } else {
          this.waitForTicket(newTicketId);
        }
      }

    }, this.waitingTime);

    // this.close(newTicketId);
  }

  private close(newTicketId?: string) {
    this.$emit("close", newTicketId);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 700px;
  display: grid;
  gap: 10px;
}

.flex-row {
  display: flex;
  gap: 10px;
}
</style>
