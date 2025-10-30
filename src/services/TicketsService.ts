import { debugApi, error } from '@/log';
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";

import { AddExternalMessageRequest, AddExternalMessageResponse, AddMessageRequest, AddMessageResponse, AddNoteRequest, AddTicketRequest, AddTicketResponse, EditTicketRequest, GetTicketsRequest, GetTicketsResponse, SetIsTypingRequest, SetTicketAssignmentsRequest, SetTicketLabelsRequest, TicketDetails, TimelineDataItem } from "@/TickApi";
const serviceName = "TICKETS"
export function sortTimelineItems(items: TimelineDataItem[]): TimelineDataItem[] {
  return items.sort((a, b) => new Date(a.timelineDate).getTime() - new Date(b.timelineDate).getTime())
}

export async function getTickets(workspaceId: string, req: GetTicketsRequest): Promise<GetTicketsResponse | null> {

  try {
    const response = await Post<GetTicketsResponse>(URL.getTickets + `/${workspaceId}`, req);
    debugApi(`[${serviceName}:FETCH]Retrieved ${response.data.tickets?.length} summaries`)
    return response.data;
  } catch (err) {
    // TODO: services should throw errors
    error('error while fetching ', err);
    return null;
  }
}

export async function getTicketDetails(ticketIdId: string, updatesFrom: number) {

  try {
    const response = await Get<TicketDetails>(URL.getTicket + `/${ticketIdId}/${updatesFrom}`);
    debugApi(`[${serviceName}:FETCH]Retrieved ticket: ${response.data.title.length}  from ${updatesFrom}`)
    const ticket = response.data;
    ticket.timeline.items = sortTimelineItems(ticket.timeline?.items ?? []);
    return ticket;
  } catch (err) {
    // TODO: services should throw errors
    error('error while fetching', err);
    return null;
  }
}

export async function sendMessage(request: AddMessageRequest) {
  debugApi(`[${serviceName}:Message]sending message for id: ${request.ticketId}`)
  await Post<AddMessageResponse>(URL.sendTicketMessage, request).catch((err) => {
    error("error while sending message", err);
  });
}

export async function sendExternalMessage(request: AddExternalMessageRequest) {
  debugApi(`[${serviceName}:Message]sending external message for id: ${request.ticketId}`)
  await Post<AddExternalMessageResponse>(URL.sendExternalTicketMessage, request).catch((err) => {
    error("error while sending message", err);
  });
}
export async function sendInternalNote(request: AddNoteRequest) {
  debugApi(`[${serviceName}:Note]send note for id: ${request.ticketId}`)
  await Post<never>(URL.sendTicketNote, request).catch((err) => {
    error("error while sending message", err);
  });
}

export async function setIsTyping(request: SetIsTypingRequest) {
  debugApi(`[${serviceName}:SetIsTyping]set isTyping for: ${request.ticketId} to ${request.isTyping}`)
  await Post<never>(URL.setTicketIsTyping, request).catch((err) => {
    error("error while set istyping", err);
  });
}

export async function refreshMetadatacomponent(id: string) {
  debugApi(`[${serviceName}:Refresh]Refresh components for ticket with id: ${id}`)
  await Post<never>(URL.refreshTicketMetadatacomponent + `/${id}`).catch((err) => {
    error("error while refreshing metadatacomponent with message", err);
  });
}


export async function finishTicket(id: string) {
  debugApi(`[${serviceName}:Finish]finish : ${id}`)
  await Post<never>(URL.finishTicket + `/${id}`);
}

export async function startFlowForTicket(ticketId: string, flowDefinitionId: string) {
  debugApi(`[${serviceName}:START_FLOW]Start flow for id: ${ticketId}`)
  await Post<never>(URL.startFlowForTicket + `/${ticketId}/${flowDefinitionId}`);
}

export async function finishFlowsForTicket(ticketId: string) {
  debugApi(`[${serviceName}:FINISH_FLOW]Finish flows for id: ${ticketId}`)
  await Post<never>(URL.finishFlowsForTicket + `/${ticketId}`);
}

export async function editTicket(request: EditTicketRequest) {
  debugApi(`[${serviceName}:EDIT]edit id: ${request.ticketId}`)
  await Post<never>(URL.editTicket, request);
}

export async function editTicketLabels(request: SetTicketLabelsRequest) {
  debugApi(`[${serviceName}:LABELS]edit id: ${request.ticketId}`)
  await Post<never>(URL.editTicketLabels, request);
}

export async function editTicketAssignments(request: SetTicketAssignmentsRequest) {
  debugApi(`[${serviceName}:ASSIGNMENTS]edit id: ${request.ticketId}`)
  await Post<never>(URL.editTicketAssignments, request);
}


export async function AddTicket(request: AddTicketRequest): Promise<AddTicketResponse> {
  debugApi(`[${serviceName}:Add]add ticket`)
  const response = await Post<AddTicketResponse>(URL.addTicket, request);
  return response.data;
}