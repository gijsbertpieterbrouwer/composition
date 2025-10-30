import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifySaved } from "@/notify";
import { Delete, Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { CreateEmptyEventSubscriptionRequest, TickEventSubscription, TickEventSubscriptionSummary, WorkspaceRequest } from "@/TickApi";


const serviceName = "EventSubscription"

export async function getAllEventSubscription(workspaceId: string): Promise<TickEventSubscriptionSummary[]> {
    const req: WorkspaceRequest = {
        workspaceId: workspaceId,
    }
    debugApi(`[${serviceName}:Fetch]Fetch all }`);
    try {
        const response = await Post<TickEventSubscriptionSummary[]>(URL.getEventSubscriptions, req);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching ${serviceName}', { workspaceId, error });
        throw new Error(`Error while fetching ${serviceName} in workspace ${workspaceId}: ${JSON.stringify(error)}`);
    }
}

export async function getEventSubscriptionDetails(id: string) {

    try {
        const response = await Get<TickEventSubscription>(URL.getEventSubscription + `/${id}`);
        debugApi(`[${serviceName}:Fetch]Get details for  id: ${response.data.name}}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching ${serviceName}', { id, error });
        throw new Error(`Error while fetching details for ${serviceName} ${id}: ${JSON.stringify(error)}`);
    }
}

export async function createEventSubscription(workspaceId: string): Promise<TickEventSubscription> {
    const params: CreateEmptyEventSubscriptionRequest = { workspaceId };
    debugApi(`[${serviceName}:Create]Create empty }`);
    try {
        const response = await Post<TickEventSubscription>(URL.createEventSubscription.toString(), params);
        return response.data;
    } catch (error) {
        LOG.error('Error while creating ${serviceName}', { workspaceId, error });
        throw new Error(`Error while creating a ${serviceName} in workspace ${workspaceId}: ${JSON.stringify(error)}`);
    }
}


export async function updateEventSubscription(def: TickEventSubscription): Promise<TickEventSubscription> {

    debugApi(`[${serviceName}:Update]Update ${serviceName} ${def.id} and new name ${def.name} }`);
    try {
        const response = await Post<TickEventSubscription>(URL.updateEventSubscription.toString(), def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating ${serviceName}', { error });
        throw new Error(`Error while updating  ${serviceName} ${JSON.stringify(error)}`);
    }
}

export async function deleteEventSubscription(id: string): Promise<unknown> {
    debugApi(`[${serviceName}:Delete]Delete ${serviceName} ${id} }`);
    try {
        const response = await Delete<unknown>(URL.deleteEventSubscription.toString() + `/${id}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while deleting ${serviceName}', { error });
        throw new Error(`Error while deleting ${serviceName} ${JSON.stringify(error)}`);
    }
}
