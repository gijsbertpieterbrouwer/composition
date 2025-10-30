import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifySaved } from "@/notify";
import { Delete, Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { IntegrationType, TickWorkspaceIntegration, TickWorkspaceIntegrationProgress } from "@/TickApi";

const serviceName = "WorkspaceIntegrations";

export async function getWorkspaceIntegrations(workspaceId: string): Promise<TickWorkspaceIntegration[]> {

    try {
        const response = await Get<TickWorkspaceIntegration[]>(URL.getWorkspaceIntegrations + `/${workspaceId}`);
        debugApi(`[${serviceName}:Fetch]Get ${serviceName} => ${response.data.length} items found}`);
        return response.data;
    } catch (error) {
        LOG.error(`Error while fetching ${serviceName}`, { workspaceId, error });
        throw new Error(`Error while fetching  ${serviceName} ${workspaceId}: ${JSON.stringify(error)}`);
    }
}



export async function addWorkspaceIntegration(workspaceId: string, type: IntegrationType, integrationData?: object): Promise<TickWorkspaceIntegrationProgress> {
    debugApi(`[${serviceName}:Update]Update databag item definitions}`);
    try {
        const response = await Post<TickWorkspaceIntegrationProgress>(URL.createWorkspaceIntegration + `/${workspaceId}/${type}`, integrationData);
        //notifySaved();
        return response.data;
    } catch (error) {
        LOG.error(`Error while creating ${serviceName}`, { error });
        throw new Error(`Error while creating${serviceName} ${JSON.stringify(error)}`);
    }
}

export async function activateSlackWorkspaceIntegration(tenantid: string, id: string, code: string): Promise<TickWorkspaceIntegrationProgress> {
    debugApi(`[${serviceName}:Create]Create ${serviceName} item}`);
    try {
        const response = await Post<TickWorkspaceIntegrationProgress>(URL.activateSlackWorkspaceIntegration + `/${tenantid}/${id}/${code}`);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error(`Error while activating slack  ${serviceName}`, { error });
        throw new Error(`Error while activating slack  ${serviceName} ${JSON.stringify(error)}`);
    }
}

export async function activateShopifyWorkspaceIntegration(tenantid: string, id: string, code: string): Promise<TickWorkspaceIntegrationProgress> {
    debugApi(`[${serviceName}:Create]Create ${serviceName} item}`);
    try {
        const response = await Post<TickWorkspaceIntegrationProgress>(URL.activateShopifyWorkspaceIntegration + `/${tenantid}/${id}/${code}`);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error(`Error while activating shopify  ${serviceName}`, { error });
        throw new Error(`Error while activating shopify  ${serviceName} ${JSON.stringify(error)}`);
    }
}

export async function deleteWorkspaceIntegration(id: string): Promise<unknown> {
    debugApi(`[${serviceName}:Delete]Delete ${serviceName}}`);
    try {
        const response = await Delete<unknown>(URL.deleteWorkspaceIntegration + `/${id}`,);
        //notifySaved();
        return response.data;
    } catch (error) {
        LOG.error(`Error while delerting ${serviceName}`, { error });
        throw new Error(`Error while deleting${serviceName} ${JSON.stringify(error)}`);
    }
}

export async function testWorkspaceIntegration(id: string): Promise<TickWorkspaceIntegrationProgress> {
    debugApi(`[${serviceName}:TEST]TEST ${serviceName} item}`);
    try {
        const response = await Post<TickWorkspaceIntegrationProgress>(URL.testWorkspaceIntegration + `/${id}`);
        //notifySaved();
        return response.data;
    } catch (error) {
        LOG.error(`Error while testing  ${serviceName}`, { error });
        throw new Error(`Error while testing  ${serviceName} ${JSON.stringify(error)}`);
    }
}
