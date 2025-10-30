import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifySaved } from "@/notify";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { CreateWorkspaceRequest, SetupWorkspaceRequest, TickWorkspace, TickWorkspaceLog, TickWorkspaceUtilityData, UpdateWorkspaceRequest, UpdateWorkspaceResponse } from "@/TickApi";


export async function GetUtilityData(workspaceId: string) {
    debugApi(`[UTILITY:Fetch]Get utility data for workspace ${workspaceId}`);

    if (!workspaceId) {
        LOG.error('[UTILITY:FETCH]]NO workspace given as parameter', {});
        return;
    }

    //const token = useAppStore().token;

    try {
        const response = await Get<TickWorkspaceUtilityData>(URL.getUtilityData + `/${workspaceId}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching utility data', { workspaceId, error });
        throw new Error(`Error while fetching utility data for workspace ${workspaceId}: ${JSON.stringify(error)}`);
    }
}

export async function addWorkspace(req: CreateWorkspaceRequest): Promise<TickWorkspace> {
    try {
        const response = await Post<TickWorkspace>(URL.createWorkspace, req);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while creating workspace', { error });
        throw new Error(`Error while creating a workspace ${JSON.stringify(error)}`);
    }
}

export async function updateWorkspace(req: UpdateWorkspaceRequest): Promise<UpdateWorkspaceResponse> {
    try {
        const response = await Post<UpdateWorkspaceResponse>(URL.updateWorkspace, req);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating workspace', { error });
        throw new Error(`Error while updating a workspace ${JSON.stringify(error)}`);
    }
}


export async function setupWorkspace(req: SetupWorkspaceRequest): Promise<unknown> {
    try {
        const response = await Post<unknown>(URL.setupWorkspace, req);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while setting up workspace', { error });
        throw new Error(`Error while setting up a workspace ${JSON.stringify(error)}`);
    }
}


export async function getWorkspaceLogs(workspaceId: string | null, page: number, pageAmount: number) {
    debugApi(`[WorkspaceLogs:Fetch]Get workspace logs for id: ${workspaceId}`);

    if (!workspaceId) {
        LOG.error('[WorkspaceLogs:FETCH]]NO workspace given as parameter', {});
        return;
    }
    try {
        const response = await Get<TickWorkspaceLog[]>(URL.workspaceLogs + `/${workspaceId}/${page}/${pageAmount}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching workspace logs', { workspaceId, error });
        throw new Error(`Error while fetching workspace logs for workspace ${workspaceId}: ${JSON.stringify(error)}`);
    }
}