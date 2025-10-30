/* eslint-disable @typescript-eslint/no-unused-vars */
import { AddMessageRequestReceiver, AddTicketRequest, AssignmentFilterEnum, CommunicationType, EditTicketRequest, FileLink, GetTicketsRequest, GetTicketsResponse, MetaDataComponentDeletion, MetaDataComponentUpdate, SetTicketAssignmentsRequest, SetTicketLabelsRequest, TicketDetails, TicketFilterOptions, TicketFilterTicketStatusEnum, TicketStatus, TicketSummaries, TicketSummary, TimelineDataItem, } from "@/TickApi";
import type { UsersAndTeamsSelection } from "@/components/molecules/Selectors/UsersAndTeamsSelector.vue";
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
  ticketListResponse: GetTicketsResponse | null;
  ticketListResponseIsLoading: boolean;

  drafts: TicketDraft[];
  draftsIsTypingTimer: number | null;
  activeTicketId: string | null;
  ticketFilters: TicketFilterOptions | null;
  listOptions: TicketListOptions;

  nrOfOpenTicketsAssignedToMe: number | null;
}

interface Getters extends _GettersTree<State> {
  activeTicket(state: State): Required<TicketDetails> | null;
  ticket: (state: State) => (id: string) => TicketDetails | null;
  ticketSummary: (state: State) => (id: string) => TicketSummary | null;
  ticketIsAssignedToMe: (state: State) => (ticketId: string) => boolean;
  getTickets: (state: State) => (ids: string[]) => TicketDetails[];
  ticketDraft: (state: State) => (id: string) => TicketDraft | null;

}

interface Actions {
  useCounter(workspaceId: string): void;
  use(filters: TicketFilterOptions | null, isPaging: boolean): Promise<GetTicketsResponse | null>;
  pollUpdates(ticketId: string | null): void;
  activateTicket(ticketId: string | undefined | null): void;
  removeTicket(ticketId: string): void;
  patchTimeline(ticketId: string, items: TimelineDataItem[]): void;
  setTicketFlow(ticketId: string, to: string): void;
  setTicketLabels(ticketId: string, labelDefinitionIds: string[]): void;
  setTicketAssignments(ticketId: string, to: UsersAndTeamsSelection): void;
  patchTicketFlow(ticketId: string, currentFlowInstanceDefinitionId: string): void;
  patchMetaDataComponent(ticketId: string, data: MetaDataComponentUpdate): void;
  removeMetaDataComponents(ticketId: string, data: MetaDataComponentDeletion): void;
  patchTicket(serverData: TicketDetails): void;
  patchSummary(ticket: TicketSummary): void;
  patchSummaries(tickets: TicketSummaries): void;
  finish(id: string): void;
  startFlow(ticketId: string, flowDefinitionId: string): void;
  finishFlows(ticketId: string): void;
  edit(request: EditTicketRequest): void;
  updateLabels(request: SetTicketLabelsRequest): void;
  updateAssignments(request: SetTicketAssignmentsRequest): void;
  setUserIsTyping(ticketId: string, isTyping: boolean): void;
  ensureTicketDraft(ticket: TicketDetails): void;
  addTicket(req: AddTicketRequest): Promise<string | null>;
  mergeCommunicator(slaveId: string, masterId: string, masterName: string): Promise<unknown>;
}

function findTicket(tickets: TicketDetails[], ticketId: string | null): TicketDetails | null {
  return tickets.find((q) => q.id === ticketId) ?? null;
}

function patchTicketOrSummary(ticket: TicketDetails | TicketSummary | null, delta: TicketSummary) {
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
      activeTicketId: null,
      ticketFilters: null,
      nrOfOpenTicketsAssignedToMe: null,
    }),
    getters: {
      activeTicket: (state) =>
        findTicket(state.tickets, state?.activeTicketId) as Required<TicketDetails>,
      ticket(state) {
        return (id: string) => (state.tickets as TicketDetails[]).find((p) => p.id == id) ?? null;
      },
      ticketSummary(state) {
        return (ticketId: string) => {
          return (state.ticketListResponse as GetTicketsResponse | null)?.tickets?.find((q) => q.id == ticketId) ?? null;
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
          this.ensureTicketDraft(this.ticket(id) as TicketDetails);
          return (state.drafts as TicketDraft[]).find((p) => p.ticketId == id) ?? null;
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
        if (serverData) {
          this.nrOfOpenTicketsAssignedToMe = serverData.totalCount;
        }
      },
      async mergeCommunicator(slaveId: string, masterId: string, masterName: string) {
        await mergeCommunicators({
          communicatorId: slaveId,
          masterCommunicatorId: masterId,
        });

        //invalidate ticket from this slave communicator 
        const slaveTickets = (this.tickets as TicketDetails[]).filter((p) => p.primaryCommunicatorId == slaveId);
        const activeSlaveTicket = slaveTickets.find(p => p.id == this.activeTicketId);

        for (let index = 0; index < slaveTickets.length; index++) {
          const t = slaveTickets[index];
          t.primaryCommunicatorId = masterId;
          t.primaryCommunicatorName = masterName;
          t.editDateTicks = undefined;
        }

        const currentTicketList = (this.ticketListResponse as GetTicketsResponse | null);
        if (currentTicketList) {
          const slaveTicketSummaries = currentTicketList.tickets?.filter((p) => p.primaryCommunicatorId == slaveId) ?? [];

          for (let index = 0; index < slaveTicketSummaries.length; index++) {
            const summary = slaveTicketSummaries[index];
            summary.editDateTicks = undefined;
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
      async use(filters: TicketFilterOptions | null, isPaging: boolean) {
        //if (!filters) { filters = { assignedTo: AssignmentFilterEnum.Me }; }
        this.ticketListResponseIsLoading = true;
        const workspaceId = useUserStore().activeWorkspaceId ?? "";
        const current = (this.ticketListResponse as GetTicketsResponse | null);
        const skip = isPaging ? current?.tickets?.length : undefined
        const take = defaultListSize;

        const req: GetTicketsRequest = {
          filters: filters ?? undefined,
          skip: skip,
          take: take,

        }

        const serverData = await getTickets(workspaceId, req);
        this.ticketListResponseIsLoading = false;
        if (!serverData) { return null; }

        if (!req.filters) {
          this.nrOfOpenTicketsAssignedToMe = serverData.totalCount;
        }

        // paging => add to list, else => replace list
        if (!serverData.skip) {
          this.ticketListResponse = serverData;
        } else {
          // patch 
          const currentTake = current?.take || 0;
          const currentSkip = current?.skip || 0;
          if (current) {
            current.skip = currentSkip; // keep original
            current.take = currentTake + (serverData?.take || 0);
            current.tickets = patchMultipleInMetaDataList(serverData.tickets, current.tickets || [], null) as TicketSummary[];
            current.totalCount = serverData.totalCount;
          }
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
            if (ticket) {
              this.patchTicket(ticket);
            }
          });

        } else {
          debug(`[Ticket:POLL] No poll needed, RTC is active`)
        }

      },
      async addTicket(req: AddTicketRequest): Promise<string | null> {
        const r = await AddTicket(req);
        this.useCounter(useUserStore().activeWorkspaceId ?? "");
        return r.ticketId ?? null;
      },
      async finish(ticketId: string) {
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
          this.useCounter(useUserStore().activeWorkspaceId ?? "");
        });

      },
      async startFlow(ticketId: string, flowDefinitionId: string) {
        startFlowForTicket(ticketId, flowDefinitionId);
      },
      async finishFlows(ticketId: string) {
        finishFlowsForTicket(ticketId);
      },
      async edit(request: EditTicketRequest) {
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
      async updateLabels(request: SetTicketLabelsRequest) {
        editTicketLabels(request);
      },
      async updateAssignments(request: SetTicketAssignmentsRequest) {
        editTicketAssignments(request);
      },

      async activateTicket(ticketId: string | undefined) {
        if (this.activeTicketId) {
          debug(`[Ticket:deactivate] deactivate ${this.activeTicketId}`);
          ticketRtcHub.unsubscribe();
        }
        this.activeTicketId = ticketId ?? null;

        if (!ticketId) {
          return;
        }

        debug(`[Ticket:activate] activate ${this.activeTicketId}`);

        //Subscribe for realtime
        ticketRtcHub.subscribe(ticketId);


        const existingTicket = this.ticket(ticketId) as TicketDetails;
        const updatesFrom = existingTicket?.editDateTicks || 0

        await getTicketDetails(ticketId, updatesFrom).then((ticket) => {
          if (ticket) {
            this.patchTicket(ticket);
            this.ensureTicketDraft(ticket);
          }
        });

      },
      patchSummaries(deltas: TicketSummaries) {
        if (!deltas?.items?.length) { return; }
        for (let index = 0; index < deltas?.items?.length; index++) {
          const delta = deltas.items[index];
          if (delta) {
            this.patchSummary(delta);
          }
        }

      },
      patchSummary(delta: TicketSummary) {
        if (!delta) { return; }

        // patch Summary AND details object
        const ticketId = delta.id;
        const currentTicketList = (this.ticketListResponse as GetTicketsResponse | null);
        if (!currentTicketList) { return; }

        const ticketDetails = this.ticket(ticketId);

        // update communicator name in open tickets
        if (ticketDetails && ticketDetails.primaryCommunicatorName != delta.primaryCommunicatorName) {

          // patch ticket details
          const ticketsWithSameCommunicator = (this.tickets as TicketDetails[]).filter(p => p.communicators.some(a => a.id == delta.primaryCommunicatorId));

          for (let index = 0; index < ticketsWithSameCommunicator.length; index++) {
            const ticketWithSameCommunicator = ticketsWithSameCommunicator[index];

            const communicator = ticketWithSameCommunicator.communicators.find(p => p.id == delta.primaryCommunicatorId);
            if (communicator) communicator.name = delta.primaryCommunicatorName;
          }

        }



        patchTicketOrSummary(ticketDetails, delta as TicketSummary);

        const ticketSummary = this.ticketSummary(ticketId) as TicketSummary;
        patchTicketOrSummary(ticketSummary, delta as TicketSummary);

        const hasSummary = ticketSummary != null;

        if (!currentTicketList.usedFilters) {

          if (!hasSummary) {
            //If not filtering => check if it should by added to the list

            const isForMe = delta.assignedUserIds.some(p => useUserStore().isSelf(p))
            const ws = useUserStore().activeWorkspace;
            const isForMyTeams = delta.assignedTeamIds.some(p => ws?.memberOfTeamIds?.some(m => m == p));

            if (isForMe || isForMyTeams) {
              currentTicketList.tickets?.push(delta as TicketSummary);
              currentTicketList.totalCount++;

              this.nrOfOpenTicketsAssignedToMe = currentTicketList.tickets?.length ?? 0;
            }


          } else {
            // if completed, get out of list
            if (delta.status == TicketStatus.Finished) {
              currentTicketList.tickets = currentTicketList.tickets?.filter((q) => q.id != ticketId) ?? [];
              currentTicketList.totalCount--;
            }
          }

        }

      },
      ensureTicketDraft(ticket: TicketDetails | undefined) {
        if (!ticket) { return; }

        //Add draft if not present
        const existingDraft = (this.drafts as TicketDraft[]).find(p => p.ticketId == ticket.id);
        const isValidDraft = (existingDraft?.receivers?.length ?? 0) > 0;

        if (!existingDraft || !isValidDraft) {
          this.drafts = (this.drafts as TicketDraft[]).filter((q) => q.ticketId != ticket.id);

          const publicReceivers: AddMessageRequestReceiver[] = [];
          let primary = ticket?.communicators?.find(p => p.id == ticket.primaryCommunicatorId);
          if (!primary) { primary = ticket?.communicators[0]; }

          if (primary) {
            const primaryAddress = primary.addresses.find(p => p.id == ticket.primaryCommunicatorAddressId);
            if (primaryAddress) {
              publicReceivers.push({
                name: primary.name,
                address: primaryAddress.address,
                communicationChannelId: ticket.primaryCommunicationChannelId,
                communicatorAddressId: primaryAddress?.id,
                communicatorId: primary?.id,
                communicationType: primaryAddress.type,
              });
            }
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
      removeTicket(ticketId: string) {
        if (this.activeTicketId === ticketId) {
          this.activeTicketId = null;
          ticketRtcHub.unsubscribe();
        }

        const currentTicketList = (this.ticketListResponse as GetTicketsResponse | null);
        if (currentTicketList) {
          currentTicketList.tickets = currentTicketList?.tickets?.filter((q) => q.id != ticketId) ?? [];
        }
      },
      patchMetaDataComponent(ticketId: string, data: MetaDataComponentUpdate) {
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
      removeMetaDataComponents(ticketId: string, data: MetaDataComponentDeletion) {
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

        const currentTicketList = (this.ticketListResponse as GetTicketsResponse | null);
        const ticketSummary = currentTicketList?.tickets?.find(p => p.id == ticketId);
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

        const currentTicketList = (this.ticketListResponse as GetTicketsResponse | null);
        const ticketSummary = currentTicketList?.tickets?.find(p => p.id == ticketId);
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
      patchTimeline(ticketId: string, items: TimelineDataItem[]) {
        if (!items || !items.length) {
          return;
        }
        const ticket = this.ticket(ticketId) as TicketDetails;

        if (!ticket) {
          warn(`Can't patch  ${ticketId} because it is not full .`);
          return;
        }
        debug(`[Ticket:timeline] Updating timeline with: ${items.length} items`);

        const existingItems = ticket?.timeline?.items?.slice() ?? [];

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

        let primaryReceiver: AddMessageRequestReceiver | null = null;
        const primary = serverData.communicators?.find(p => p.id == serverData.primaryCommunicatorId);
        if (primary) {
          const primaryAddress = primary.addresses.find(p => p.id == serverData.primaryCommunicatorAddressId);

          primaryReceiver = {
            name: primary.name,
            address: primaryAddress?.address ?? null,
            communicationChannelId: serverData.primaryCommunicationChannelId ?? undefined,
            communicatorAddressId: primaryAddress?.id ?? null,
            communicatorId: primary.id ?? null,
            communicationType: primaryAddress?.type ?? CommunicationType.Unknown,
          };

          if (existingDraft && !existingDraft?.receivers?.some(p => p.communicatorAddressId == primaryReceiver?.communicatorAddressId)) {
            if (primaryReceiver) {
              existingDraft.receivers.push(primaryReceiver);
            }
          }

        }

        this.patchTimeline(existingTicket.id, serverData.timeline.items ?? []);

        const existingTimeline = existingTicket.timeline;

        this.tickets = patchMetaDataList(serverData, this.tickets, maxDetailsListItems);
        const newTicket = (this.tickets as TicketDetails[]).find(p => p.id == serverData.id);
        if (newTicket) {
          newTicket.timeline = existingTimeline;
        }
      },
      setUserIsTyping(ticketId: string, isTyping: boolean) {
        const existingDraft = (this.drafts as TicketDraft[]).find(p => p.ticketId == ticketId);
        if (!existingDraft) { return; }
        if (this.draftsIsTypingTimer) {
          clearTimeout(this.draftsIsTypingTimer as unknown as number);
        }
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
          }, 5000) as unknown as number;
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
        pick: ["activeTicketId"],
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
