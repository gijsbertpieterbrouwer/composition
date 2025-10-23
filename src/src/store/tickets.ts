/* eslint-disable @typescript-eslint/no-unused-vars */
import { AddMessageRequestReceiver, AddTicketRequest, AssignmentFilterEnum, EditTicketRequest, FileLink, GetTicketsRequest, GetTicketsResponse, MetaDataComponentDeletion, MetaDataComponentUpdate, SetTicketAssignmentsRequest, SetTicketLabelsRequest, TicketDetails, TicketFilterOptions, TicketFilterTicketStatusEnum, TicketStatus, TicketSummaries, TicketSummary, TimelineDataItem, } from "@/TickApi";
import { UsersAndTeamsSelection } from "@/components/molecules/Selectors/UsersAndTeamsSelector.vue";
import { defaultListSize, delimitList, maxDetailsListItems, patchMetaDataList, patchMultipleInMetaDataList } from "@/helpers/arrayHelper";
import { checkIsAssignedToMe } from "@/helpers/ticketHelper";
import { debug, warn } from "@/log";
import { mergeCommunicators } from "@/services/CommunicatorsService";
import { AddTicket, editTicket, editTicketAssignments, editTicketLabels, finishFlowsForTicket, finishTicket, getTicketDetails, getTickets, setIsTyping, sortTimelineItems, startFlowForTicket, } from "@/services/TicketsService";
import ticketRtcHub from "@/services/rtc/TicketRtcHub";
import { _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import useAppStore from "./app";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";





export enum MessageSendingType {
  Public = "public",
  Internal = "internal",
  External = "external",
}

export interface TicketDraft {
  ticketId: string;
  messageMarkDown: string;
  messageHtml: string;
  isTyping: boolean;
  messageAttachmentFileIds: FileLink[];
  messageUsedCannedResponseId: string;
  messageSendingType: MessageSendingType;
  receivers: AddMessageRequestReceiver[];
  externalReceivers: AddMessageRequestReceiver[];
  subject: string;
}

export interface TicketListOptions {
  showChannel: boolean,
  showAssignments: boolean,
  showExplicitTicketStatus: boolean,
  showLabels: boolean,
  showSlaTimers: boolean,
  showTypingIndicator: boolean,
  showCommunicatorName: boolean,
}

interface State {
  loaded: boolean;

  tickets: TicketDetails[];
  ticketListResponse: GetTicketsResponse;
  ticketListResponseIsLoading: boolean;

  drafts: TicketDraft[]
  draftsIsTypingTimer: unknown;
  activeticketId: string | null;
  ticketFilters: TicketFilterOptions;
  listOptions: TicketListOptions,

  nrOfOpenTicketsAssignedToMe: number;
}

interface Getters extends _GettersTree<State> {
  activeTicket(state: State): Required<TicketDetails>;
  ticket: (state: State) => (id: string) => TicketDetails;
  ticketSummary: (state: State) => (id: string) => TicketSummary;
  ticketIsAssignedToMe: (state: State) => (ticketId: string) => boolean;
  getTickets: (state: State) => (ids: string[]) => TicketDetails[];
  ticketDraft: (state: State) => (id: string) => TicketDraft;

}

interface Actions {
  useCounter(workspaceId: string): void;
  use(filters: TicketFilterOptions, isPaging: boolean): Promise<GetTicketsResponse>;
  pollUpdates(ticketId: string): void;
  activateTicket(ticketId: string): void;
  removeTicket(ticketId: string): void;
  patchTimeline(ticketId: string, items: TimelineDataItem[]): void;
  setTicketFlow(ticketId: string, to: string): void;
  setTicketLabels(ticketId: string, labelDefinitionIds: string[]): void;
  setTicketAssignments(ticketId: string, to: UsersAndTeamsSelection): void;
  patchTicketFlow(ticketId: string, currentFlowInstanceDefinitionId: string): void;
  patchMetaDataComponent(ticketId: string, data: MetaDataComponentUpdate): void;
  removeMetaDataComponents(ticketId: string, data: MetaDataComponentDeletion): void;
  patchTicket(serverData: TicketDetails): void;
  patchSummary(ticket: Required<TicketSummary>): void;
  patchSummaries(tickets: TicketSummaries): void;
  finish(id: string): void;
  startFlow(ticketId: string, flowDefinitionId: string): void;
  finishFlows(ticketId: string): void;
  edit(request: EditTicketRequest): void;
  updateLabels(request: SetTicketLabelsRequest): void;
  updateAssignments(request: SetTicketAssignmentsRequest): void;
  setUserIsTyping(ticketId: string, isTyping: boolean): void;
  ensureTicketDraft(ticket: TicketDetails): void;
  addTicket(req: AddTicketRequest): Promise<string>;
  mergeCommunicator(slaveId: string, masterId: string, masterName: string): Promise<unknown>;
}

function findTicket(tickets: TicketDetails[], ticketId: string): TicketDetails | undefined {
  return tickets.find((q) => q.id === ticketId);
}

function patchTicketOrSummary(ticket: TicketDetails | TicketSummary, delta: TicketSummary) {
  if (!ticket || !delta) { return; }
  ticket.isTyping = delta.isTyping;
  ticket.assignedTeamIds = delta.assignedTeamIds;
  ticket.assignedUserIds = delta.assignedUserIds;
  ticket.labelDefinitionIds = delta.labelDefinitionIds;
  ticket.primaryCommunicatorName = delta.primaryCommunicatorName;

  //SLA
  ticket.slaDefinitionIds = delta.slaDefinitionIds;
  ticket.slaTimers = delta.slaTimers || [];
  ticket.status = delta.status || ticket.status;
  ticket.title = delta.title || ticket.title;
  ticket.editDateTicks = delta.editDateTicks || ticket.editDateTicks;
}


const useTicketsStore = defineStore<"tickets", State, Getters, Actions>(
  "tickets",
  {
    state: () => ({
      listOptions: {
        showChannel: false,
        showAssignments: false,
        showLabels: false,
        showSlaTimers: true,
        showTypingIndicator: false,
        showCommunicatorName: true,
        showExplicitTicketStatus: false,
      },
      loaded: false,
      tickets: [],
      ticketListResponse: null,
      ticketListResponseIsLoading: false,
      drafts: [],
      draftsIsTypingTimer: null,
      activeticketId: null,
      ticketFilters: null,
      nrOfOpenTicketsAssignedToMe: null,
    }),
    getters: {
      activeTicket: (state) =>
        findTicket(state.tickets,
          state.activeticketId
        ) as Required<TicketDetails>,
      ticket(state) {
        return (id: string) =>
          (state.tickets as TicketDetails[]).find((p) => p.id == id);
      },
      ticketSummary(state) {
        return (ticketId: string) => {
          return (state.ticketListResponse as GetTicketsResponse)?.tickets?.find((q) => q.id == ticketId);
        }
      },
      ticketIsAssignedToMe(state) {
        return (ticketId: string) => {

          const ticket = this.ticket(ticketId) as TicketDetails;
          const summary = this.ticketSummary(ticketId) as TicketSummary

          if (!ticket && !summary) { return false; }

          if (ticket && checkIsAssignedToMe(ticket.assignedTeamIds, ticket.assignedUserIds)) { return true; }
          if (summary && checkIsAssignedToMe(summary.assignedTeamIds, summary.assignedUserIds)) { return true; }

          return false;
        }
      },

      getTickets(state) {
        return (ids: string[]) =>
          (state.tickets || [] as TicketDetails[]).filter((p) => ids.some(a => a == p.id));
      },
      ticketDraft(state) {
        return (id: string) => {
          this.ensureTicketDraft(this.ticket(id));
          return (state.drafts as TicketDraft[]).find((p) => p.ticketId == id);
        }
      },
    },
    actions: {
      async useCounter(workspaceId: string) {
        const serverData = await getTickets(workspaceId, {
          take: 0,
          skip: 0,
          filters: {
            assignedTo: AssignmentFilterEnum.Me,
            status: TicketFilterTicketStatusEnum.Open,
          }
        });

        this.nrOfOpenTicketsAssignedToMe = serverData.totalCount;
      },
      async mergeCommunicator(slaveId: string, masterId: string, masterName: string) {
        await mergeCommunicators({
          communicatorId: slaveId,
          masterCommunicatorId: masterId,
        });

        //invalidate ticket from this slave communicator 
        const slaveTickets = (this.tickets as TicketDetails[]).filter((p) => p.primaryCommunicatorId == slaveId);
        const activeSlaveTicket = slaveTickets.find(p => p.id == this.activeticketId);

        for (let index = 0; index < slaveTickets.length; index++) {
          const t = slaveTickets[index];
          t.primaryCommunicatorId = masterId;
          t.primaryCommunicatorName = masterName;
          t.editDateTicks = null;
        }

        const currentTicketList = (this.ticketListResponse as GetTicketsResponse);
        if (currentTicketList) {
          const slaveTicketSummaries = currentTicketList.tickets.filter((p) => p.primaryCommunicatorId == slaveId);

          for (let index = 0; index < slaveTicketSummaries.length; index++) {
            const summary = slaveTicketSummaries[index];
            summary.editDateTicks = null;
            summary.primaryCommunicatorId = masterId;
            summary.primaryCommunicatorName = masterName;
          }
        }


        // if on ticket details => refresh

        if (activeSlaveTicket != null) {
          this.activateTicket(activeSlaveTicket.id);
        }




        return;
      },
      async use(filters?: TicketFilterOptions, ispaging?: boolean) {
        //if (!filters) { filters = { assignedTo: AssignmentFilterEnum.Me }; }
        this.ticketListResponseIsLoading = true;
        const workspaceId = useUserStore().activeWorkspaceId;
        const current = (this.ticketListResponse as GetTicketsResponse);
        const skip = ispaging ? current.tickets?.length : null
        const take = defaultListSize;

        const req: GetTicketsRequest = {
          filters: filters,
          skip: skip,
          take: take,

        }


        const serverData = await getTickets(workspaceId, req);
        this.ticketListResponseIsLoading = false;
        if (!serverData) { return; }

        if (!req.filters) {
          this.nrOfOpenTicketsAssignedToMe = serverData.totalCount;
        }

        // paging => add to list, else => replace list
        if (!serverData.skip) {
          this.ticketListResponse = serverData;
        } else {
          // patch 
          const currentTake = current.take || 0;
          const currentSkip = current.skip || 0;
          current.skip = currentSkip; // keep original
          current.take = currentTake + (serverData?.take || 0);
          current.tickets = patchMultipleInMetaDataList(serverData.tickets, current.tickets || [], null) as TicketSummary[];
          current.totalCount = serverData.totalCount;
        }

        this.loaded = true;

        return serverData;
      },

      async pollUpdates(ticketId: string) {
        if (!ticketId) { return; }
        const hasRTC = useAppStore().rtcConnected;

        if (!hasRTC) {
          debug(`[Ticket:POLL] NO RTC => Poll for updates`)
          const existingTicket = this.ticket(ticketId);
          const updatesFrom = existingTicket?.editDateTicks || 0;

          await getTicketDetails(ticketId, updatesFrom).then((ticket) => {
            this.patchTicket(ticket);
          });

        } else {
          debug(`[Ticket:POLL] No poll needed, RTC is active`)
        }

      },
      async addTicket(req: AddTicketRequest): Promise<string> {
        const r = await AddTicket(req);
        this.useCounter(useUserStore().activeWorkspaceId);
        return r.ticketId;
      },
      async finish(ticketId) {
        //optimistic
        const existingTicket = this.ticket(ticketId) as TicketDetails;
        if (existingTicket) {
          existingTicket.status = TicketStatus.Finished;
        }

        const summary = this.ticketSummary(ticketId) as TicketSummary;
        if (summary) {
          summary.status = TicketStatus.Finished;
        }

        finishTicket(ticketId).then(() => {
          this.useCounter(useUserStore().activeWorkspaceId);
        });

      },
      async startFlow(ticketId, flowDefinitionId) {
        startFlowForTicket(ticketId, flowDefinitionId);
      },
      async finishFlows(ticketId) {
        finishFlowsForTicket(ticketId);
      },
      async edit(request) {
        editTicket(request);
        const existingTicket = this.ticket(request.ticketId);
        if (existingTicket) {
          existingTicket.title = request.title || existingTicket.title;

          const existingTicketSummary = this.ticketSummary(request.ticketId) as TicketSummary;
          if (existingTicketSummary) {
            existingTicketSummary.title = existingTicket.title;
          }
        }

      },
      async updateLabels(request) {
        editTicketLabels(request);
      },
      async updateAssignments(request) {
        editTicketAssignments(request);
      },

      async activateTicket(ticketId) {
        if (this.activeticketId) {
          debug(`[Ticket:deactivate] deactivate ${this.activeticketId}`);
          ticketRtcHub.unsubscribe();
        }
        this.activeticketId = ticketId;

        if (!ticketId) {
          return;
        }

        debug(`[Ticket:activate] activate ${this.activeticketId}`);

        //Subscribe for realtime
        ticketRtcHub.subscribe(ticketId);


        const existingTicket = this.ticket(ticketId) as TicketDetails;
        const updatesFrom = existingTicket?.editDateTicks || 0

        await getTicketDetails(ticketId, updatesFrom).then((ticket) => {
          this.patchTicket(ticket);
          this.ensureTicketDraft(ticket);
        });

      },
      patchSummaries(deltas) {

        for (let index = 0; index < deltas?.items?.length; index++) {
          const delta = deltas.items[index];
          this.patchSummary(delta);
        }

      },
      patchSummary(delta) {
        if (!delta) { return; }

        // patch Summary AND details object
        const ticketId = delta.id;
        const currentTicketList = (this.ticketListResponse as GetTicketsResponse);
        if (!currentTicketList) { return; }

        const ticketDetails = this.ticket(ticketId);

        // update communicator name in open tickets
        if (ticketDetails && ticketDetails.primaryCommunicatorName != delta.primaryCommunicatorName) {

          // patch ticket details
          const ticketsWithSameCommunicator = (this.tickets as TicketDetails[]).filter(p => p.communicators.some(a => a.id == delta.primaryCommunicatorId));

          for (let index = 0; index < ticketsWithSameCommunicator.length; index++) {
            const ticketWithSameCommunicator = ticketsWithSameCommunicator[index];

            const communicator = ticketWithSameCommunicator.communicators.find(p => p.id == delta.primaryCommunicatorId);
            communicator.name = delta.primaryCommunicatorName;
            // for (let cIndex = 0; cIndex < ticketWithSameCommunicator.communicators.length; cIndex++) {
            //   const communicator = ticketWithSameCommunicator.communicators[cIndex];

            // }

          }

        }



        patchTicketOrSummary(ticketDetails, delta);

        const ticketSummary = this.ticketSummary(ticketId) as TicketSummary;
        patchTicketOrSummary(ticketSummary, delta);





        const hasSummary = ticketSummary != null;

        if (!currentTicketList.usedFilters) {

          if (!hasSummary) {
            //If not filtering => check if it should by added to the list

            const isForMe = delta.assignedUserIds.some(p => useUserStore().isSelf(p))
            const ws = useUserStore().activeWorkspace;
            const isForMyTeams = delta.assignedTeamIds.some(p => ws.memberOfTeamIds.some(m => m == p));

            if (isForMe || isForMyTeams) {
              currentTicketList.tickets.push(delta);
              currentTicketList.totalCount++;

              this.nrOfOpenTicketsAssignedToMe = currentTicketList.tickets.length;
            }


          } else {
            // if completed, get out of list
            if (delta.status == TicketStatus.Finished) {
              currentTicketList.tickets = currentTicketList.tickets.filter((q) => q.id != ticketId);
              currentTicketList.totalCount--;
            }
          }

        }

      },
      ensureTicketDraft(ticket: TicketDetails) {
        if (!ticket) { return; }


        //Add draft if not present
        const existingDraft = (this.drafts as TicketDraft[]).find(p => p.ticketId == ticket.id);

        const isValidDraft = existingDraft?.receivers?.length > 0;

        if (!existingDraft || !isValidDraft) {
          this.drafts = (this.drafts as TicketDraft[]).filter((q) => q.ticketId != ticket.id);

          const publicReceivers: AddMessageRequestReceiver[] = [];
          let primary = ticket?.communicators?.find(p => p.id == ticket.primaryCommunicatorId);
          if (!primary) { primary = ticket?.communicators[0]; }

          if (primary) {
            const primaryAddress = primary.addresses.find(p => p.id == ticket.primaryCommunicatorAddressId);
            publicReceivers.push({
              name: primary.name,
              address: primaryAddress.address,
              communicationChannelId: ticket.primaryCommunicationChannelId,
              communicatorAddressId: primaryAddress?.id,
              communicatorId: primary?.id,
              communicationType: primaryAddress.type,
            });
          }

          const newDraft: TicketDraft = {
            messageAttachmentFileIds: [],
            messageMarkDown: "",
            messageHtml: "",
            messageUsedCannedResponseId: "",
            ticketId: ticket.id,
            messageSendingType: MessageSendingType.Public,
            receivers: publicReceivers,
            externalReceivers: [],
            isTyping: false,
            subject: "",
          }


          this.drafts.push(newDraft);
          delimitList(this.drafts, maxDetailsListItems);

        }
      },
      removeTicket(ticketId) {
        if (this.activeticketId === ticketId) {
          this.activeticketId = null;
          ticketRtcHub.unsubscribe();
        }

        const currentTicketList = (this.ticketListResponse as GetTicketsResponse);
        if (currentTicketList) {
          currentTicketList.tickets = currentTicketList.tickets.filter((q) => q.id != ticketId);
        }
      },
      patchMetaDataComponent(ticketId, data: MetaDataComponentUpdate) {
        if (data == null) {
          return;
        }
        const ticket = this.ticket(ticketId) as TicketDetails;

        if (!ticket) {
          warn(`Can't patch ${ticketId} because it is not loaded.`);
          return;
        }

        const index =
          ticket.metaDataComponents == null
            ? -1
            : ticket.metaDataComponents.findIndex(
              (s) =>
                s.ticketMetaDataComponentId === data.ticketMetaDataComponentId
            );
        if (index === -1) {
          debug(
            `[Ticket:metadata components] Adding metadata component ${data.componentName}`
          );
          ticket.metaDataComponents.push(data);
        } else {
          debug(
            `[Ticket:metadata components] Patching metadata component ${data.componentName}`
          );
          ticket.metaDataComponents.splice(index, 1, data);
        }
      },
      removeMetaDataComponents(ticketId, data: MetaDataComponentDeletion) {
        if (data == null) {
          return;
        }
        const ticket = this.ticket(ticketId) as TicketDetails;

        if (!ticket) {
          warn(`[Ticket:remove metadata components]Can't remove metadata components ${ticketId} because it is not loaded.`);
          return;
        }

        debug(`[Ticket:remove metadata components] Removing ${data.ticketMetaDataComponentIds.length} components`);
        ticket.metaDataComponents = ticket.metaDataComponents.filter(
          (p) =>
            !data.ticketMetaDataComponentIds.some(
              (a) => a == p.ticketMetaDataComponentId
            )
        );
      },
      setTicketFlow(ticketId: string, to: string) {
        const ticket = this.ticket(ticketId) as TicketDetails;

        debug(`[Ticket:Flow] Updating flow`);

        //server
        if (!to && ticket.currentFlowInstanceDefinitionId) {
          this.finishFlows(ticket.id);
        } else if (to) {
          this.startFlow(ticket.id, to);
        }

        //optimistic
        ticket.currentFlowInstanceDefinitionId = to;


      },
      setTicketLabels(ticketId: string, labelDefinitionIds: string[]) {
        const ticket = this.ticket(ticketId) as TicketDetails;
        if (!ticket) {
          warn(`Can't patch ${ticketId} because it is not loaded.`);
          return;
        }

        debug(`[Ticket:Flow] Updating labels`);
        ticket.labelDefinitionIds = labelDefinitionIds;

        const currentTicketList = (this.ticketListResponse as GetTicketsResponse);
        const ticketSummary = currentTicketList.tickets?.find(p => p.id == ticketId);
        const hasSummary = ticketSummary != null;

        if (hasSummary) {
          ticketSummary.labelDefinitionIds = labelDefinitionIds;
        }

        //to server
        this.updateLabels({
          labelDefinitionIds: labelDefinitionIds,
          ticketId: ticket.id,
          workspaceId: ticket.workspaceId,
        });
      },
      setTicketAssignments(ticketId: string, to: UsersAndTeamsSelection) {
        const ticket = this.ticket(ticketId) as TicketDetails;
        if (!ticket) {
          warn(`Can't patch ${ticketId} because it is not a full one.`);
          return;
        }

        debug(`[Ticket:Flow] Updating assignments`);

        //optimistic
        ticket.assignedTeamIds = to.teamIds;
        ticket.assignedUserIds = to.userIds;

        const currentTicketList = (this.ticketListResponse as GetTicketsResponse);
        const ticketSummary = currentTicketList.tickets?.find(p => p.id == ticketId);
        const hasSummary = ticketSummary != null;

        if (hasSummary) {
          ticketSummary.assignedTeamIds = to.teamIds;
          ticketSummary.assignedUserIds = to.userIds;
        }

        //server
        this.updateAssignments({
          ticketId: ticket.id,
          workspaceId: ticket.workspaceId,
          userIds: to.userIds,
          teamIds: to.teamIds,
        });


      },
      patchTicketFlow(ticketId: string, currentFlowInstanceDefinitionId: string) {
        const ticket = this.ticket(ticketId) as TicketDetails;

        if (!ticket) {
          warn(`Can't patch ${ticketId} because it is not full `);
          return;
        }
        debug(`[Ticket:Flow] Updating  flow`);

        ticket.currentFlowInstanceDefinitionId = currentFlowInstanceDefinitionId;
      },
      patchTimeline(ticketId, items) {
        if (!items || !items.length) {
          return;
        }
        const ticket = this.ticket(ticketId) as TicketDetails;

        if (!ticket) {
          warn(`Can't patch  ${ticketId} because it is not full .`);
          return;
        }
        debug(`[Ticket:timeline] Updating timeline with: ${items.length} items`);

        const existingItems = ticket.timeline.items.slice();

        items.forEach((item) => {
          const existingItem = existingItems.find((q) => q.id === item.id);
          if (existingItem) {
            for (const key in item) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (existingItem as any)[key] = (item as any)[key];
            }
          } else {
            existingItems.push(item);
          }
        });

        ticket.timeline.items = sortTimelineItems(existingItems);
      },
      patchTicket(serverData: TicketDetails) {
        if (!serverData) { return; }
        // serverData has all new items based on creationdate

        const existingTicket = this.ticket(serverData.id) as TicketDetails;

        // not known => insert
        if (!existingTicket) {
          this.tickets = patchMetaDataList(serverData, this.tickets, maxDetailsListItems);
          return;
        }



        // update draft info
        const existingDraft = (this.drafts as TicketDraft[]).find(p => p.ticketId == serverData.id);

        let primaryReceiver: AddMessageRequestReceiver = null;
        const primary = serverData.communicators?.find(p => p.id == serverData.primaryCommunicatorId);
        if (primary) {
          const primaryAddress = primary.addresses.find(p => p.id == serverData.primaryCommunicatorAddressId);

          primaryReceiver = {
            name: primary.name,
            address: primaryAddress.address,
            communicationChannelId: serverData.primaryCommunicationChannelId,
            communicatorAddressId: primaryAddress.id,
            communicatorId: primary.id,
            communicationType: primaryAddress.type,
          };

          if (existingDraft && !existingDraft?.receivers?.some(p => p.communicatorAddressId == primaryReceiver.communicatorAddressId)) {
            existingDraft.receivers.push(primaryReceiver);
          }

        }

        this.patchTimeline(existingTicket.id, serverData.timeline.items);

        const existingTimeline = existingTicket.timeline;

        this.tickets = patchMetaDataList(serverData, this.tickets, maxDetailsListItems);
        const newTicket = (this.tickets as TicketDetails[]).find(p => p.id == serverData.id);

        newTicket.timeline = existingTimeline;
      },
      setUserIsTyping(ticketId: string, isTyping: boolean) {
        const existingDraft = (this.drafts as TicketDraft[]).find(p => p.ticketId == ticketId);
        if (!existingDraft) { return; }
        clearTimeout(this.draftsIsTypingTimer);

        if (existingDraft.isTyping == isTyping) { return; }
        existingDraft.isTyping = isTyping;

        const receivers = existingDraft.messageSendingType == MessageSendingType.Public ? existingDraft?.receivers : [];

        setIsTyping({
          isTyping: isTyping,
          ticketId: ticketId,
          receivers: receivers,

        });


        if (isTyping) {
          this.draftsIsTypingTimer = setTimeout(() => {
            existingDraft.isTyping = false;

            setIsTyping({
              isTyping: false,
              ticketId: ticketId,
              receivers: receivers,
            })
          }, 5000);
        }

      },

    },
    persist: [
      {
        pick: ["tickets"],
        key: PiniaStoragePath.tickets,// "tick-tickets",
        storage: getTickStorage(PiniaStorageType.Session),
        //storage: sessionStorage,
      },
      {
        pick: ["ticketListResponse"],
        key: PiniaStoragePath.ticketsListResponse,// "tick-ticketsListResponse",
        //storage: sessionStorage,
        storage: getTickStorage(PiniaStorageType.Session),
      },
      {
        pick: ["drafts"],
        key: PiniaStoragePath.ticketsDrafts,// "tick-tickets-drafts",
        //storage: sessionStorage,
        storage: getTickStorage(PiniaStorageType.Session),

      },
      {
        pick: ["ticketFilters"],
        key: PiniaStoragePath.ticketsFilters,// "tick-tickets-filters",
        //storage: sessionStorage,
        storage: getTickStorage(PiniaStorageType.Session),
      },
      {
        pick: ["draftsIsTypingTimer"],
        key: PiniaStoragePath.ticketsDraftsIsTypingTimer,// "tick-tickets-drafts-draftsIsTypingTimer",
        //storage: sessionStorage,
        storage: getTickStorage(PiniaStorageType.Session),
      },
      {
        pick: ["activeticketId"],
        key: PiniaStoragePath.ticketsActiveticketId,// "tick-tickets-activeticketId",
        //storage: sessionStorage,
        storage: getTickStorage(PiniaStorageType.Session),
      },
      {
        pick: ["listOptions"],
        key: PiniaStoragePath.ticketsListOptions,// "tick-tickets-listOptions",
        //storage: sessionStorage,
        storage: getTickStorage(PiniaStorageType.Session),
      },
      {
        pick: ["nrOfOpenTicketsAssignedToMe"],
        key: PiniaStoragePath.ticketsNrOfOpenTicketsAssignedToMe,//"tick-tickets-nrOfOpenTicketsAssignedToMe",
        //storage: sessionStorage,
        storage: getTickStorage(PiniaStorageType.Session),
      },
    ],
  }
);

// Rewritten to use defineStore API, typed state/getters/actions, and persist array as in tickets.ts

export default useTicketsStore;
