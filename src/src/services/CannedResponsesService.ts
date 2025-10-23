import { debugApi } from '@/log';
import * as LOG from '@/log';
import { notifySaved } from '@/notify';
import { Delete, Get, Post } from "@/services/Server";
import URL from "@/services/urls";

import { ParsedCannedResponse, TickCannedResponseDefinition, TickCannedResponseSummary } from "@/TickApi";

export async function getAllCannedResponseDefinitionSummaries(workspaceId: string): Promise<TickCannedResponseSummary[]> {
  try {
    const response = await Get<TickCannedResponseSummary[]>(URL.getAllCannedResponseDefinitionSummaries + `/${workspaceId}`);
    debugApi(`[CannedResponse:FETCH]get definitions`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while retrieving definitions', error);
    throw new error();
  }
}

export async function getCannedResponseDefinition(id: string): Promise<TickCannedResponseDefinition> {
  try {
    const response = await Get<TickCannedResponseDefinition>(URL.getCannedResponseDefinition + `/${id}`);
    debugApi(`[CannedResponse:FETCH]get definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while retrieving definition', error);
    throw new error();
  }
}

export async function addCannedResponseDefinition(workspaceId: string): Promise<TickCannedResponseDefinition> {
  try {
    const response = await Post<TickCannedResponseDefinition>(URL.addCannedResponseDefinition + `/${workspaceId}`);
    debugApi(`[CannedResponse:ADD]Create task definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while creating definition', error);
    throw new error();
  }
}

export async function updateCannedResponseDefinition(request: TickCannedResponseDefinition): Promise<TickCannedResponseDefinition> {
  try {
    const response = await Post<TickCannedResponseDefinition>(URL.updateCannedResponseDefinition, request);
    notifySaved();
    debugApi(`[CannedResponse:UPDATE]Update a definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while updating definition', error);
    return null;
  }
}

export async function deleteCannedResponseDefinition(id: string): Promise<unknown> {
  try {
    const response = await Delete<TickCannedResponseDefinition>(URL.deleteCannedResponseDefinition + `/${id}`);
    debugApi(`[CannedResponse:Delete]Delete a definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while deleting definition', error);
    return null;
  }
}

export async function getParsedCannedResponse(ticketid: string, definitionId: string): Promise<ParsedCannedResponse> {
  try {
    const response = await Get<TickCannedResponseDefinition>(URL.getParsedCannedResponse + `/${ticketid}/${definitionId}`);
    debugApi(`[CannedResponse:Parse]Parse a definition`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while parsing definition', error);
    return null;
  }
}