import * as LOG from "@/log";
import { notifySaved } from "@/notify";
import { Get, Post, Put } from "@/services/Server";
import URL from "@/services/urls";
import { AuthorizationObjectType, WorkspaceAuthorization } from "@/TickApi";



export async function getWorkspaceAuthorizations(workspaceId: string): Promise<WorkspaceAuthorization[]> {
    try {
        const response = await Get<WorkspaceAuthorization[]>(URL.getWorkspaceAuthorizations + `/${workspaceId}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while getting workspace authorizations', { error });
        throw new Error(`Error while getting workspace authorizations ${JSON.stringify(error)}`);
    }
}

export async function updateWorkspaceAuthorizations(workspaceId: string, req: WorkspaceAuthorization[]): Promise<WorkspaceAuthorization[]> {
    try {
        const response = await Put<WorkspaceAuthorization[]>(URL.updateWorkspaceAuthorizations + `/${workspaceId}`, req);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while setting workspace authorizations', { error });
        throw new Error(`Error while setting workspace authorizations ${JSON.stringify(error)}`);
    }
}


export async function getWorkspaceObjectAuthorizations(workspaceId: string, objectType: AuthorizationObjectType, objectId: string): Promise<WorkspaceAuthorization[]> {
    try {
        const response = await Get<WorkspaceAuthorization[]>(URL.getWorkspaceObjectAuthorizations + `/${workspaceId}/${objectType}/${objectId}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while getting workspace object authorizations', { error });
        throw new Error(`Error while getting workspace object authorizations ${JSON.stringify(error)}`);
    }
}

export async function saveWorkspaceObjectAuthorizations(objectType: AuthorizationObjectType, objectId: string, req: WorkspaceAuthorization[]): Promise<unknown> {
    try {
        const response = await Post<unknown>(URL.updateWorkspaceObjectAuthorizations + `/${objectType}/${objectId}`, req);
        return response.data;
    } catch (error) {
        LOG.error('Error while saving workspace object authorizations', { error });
        throw new Error(`Error while saving workspace object authorizations ${JSON.stringify(error)}`);
    }
}
