import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifySaved } from "@/notify";
import { Delete, Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { ChartSerieData, CreateDataAdapterDefinitionRequest, ObjectRemovalProgress, TickApiAdapterDefinition, TickApiAdapterLog, TickApiAdapterLogSummary } from "@/TickApi";
import DataAdapterRtcHub from "./rtc/DataAdapterRtcHub";

const serviceName = "INTERNET-DOMAIN"

export async function getDetails(id: string) {

    try {
        const response = await Get<TickApiAdapterDefinition>(URL.getDataAdapter + `/${id}`);
        debugApi(`[${serviceName}}:Fetch]Get details for: ${response.data.name}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching adapter', { id, error });
        throw new Error(`Error while fetching details for ${id}: ${JSON.stringify(error)}`);
    }
}

export async function createAdapter(workspaceId: string, collectionId?: string, name?: string, copyOfId?: string): Promise<TickApiAdapterDefinition> {
    const params: CreateDataAdapterDefinitionRequest = {
        workspaceId: workspaceId,
        collectionId: collectionId,
        name: name,
        copyOfId: copyOfId

    };
    debugApi(`[${serviceName}:Create]Create empty adapter}`);
    try {
        const response = await Post<TickApiAdapterDefinition>(URL.createDataAdapter.toString(), params);
        return response.data;
    } catch (error) {
        LOG.error('Error while creating data adapter', { workspaceId, error });
        throw new Error(`Error while creating a adapter in workspace ${workspaceId}: ${JSON.stringify(error)}`);
    }
}


export async function updateAdapter(def: TickApiAdapterDefinition): Promise<TickApiAdapterDefinition> {

    debugApi(`[${serviceName}:Update]Update adapter ${def.id} and new name ${def.name} }`);
    try {
        const response = await Post<TickApiAdapterDefinition>(URL.updateDataAdapter.toString(), def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating data adapter', { error });
        throw new Error(`Error while updating a adapter ${JSON.stringify(error)}`);
    }
}

export async function deleteAdapter(id: string): Promise<ObjectRemovalProgress> {
    debugApi(`[${serviceName}:Delete]Delete adapter ${id} }`);
    try {
        const response = await Delete<ObjectRemovalProgress>(URL.deleteAdapter.toString() + `/${id}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while deleting data adapter', { error });
        throw new Error(`Error while deleting a adapter ${JSON.stringify(error)}`);
    }
}

export function tryAdapter(def: TickApiAdapterDefinition) {
    debugApi(`[${serviceName}:Try]Try adapter ${def.name} }`);
    DataAdapterRtcHub.tryDataAdapter(def);

}


export async function getAdapterRecentLogs(id: string) {
    try {

        const response = await Get<TickApiAdapterLogSummary[]>(URL.getDataAdapterLogs + `/${id}`);
        debugApi(`[${serviceName}:Fetch]Get logs adapter id: ${id}}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching adapter logs', { id, error });
        throw new Error(`Error while fetching logs for adapter ${id}: ${JSON.stringify(error)}`);
    }
}

export async function getAdapterLogDetails(id: string) {
    try {

        const response = await Get<TickApiAdapterLog>(URL.getDataAdapterLogDetails + `/${id}`);
        debugApi(`[${serviceName}:Fetch]Get logs details for id: ${id}}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching adapter log details', { id, error });
        throw new Error(`Error while fetching log details for log ${id}: ${JSON.stringify(error)}`);
    }
}


export async function getAdapterStatistics(
    workspaceId: string,
    adapterDefinitionId: string
) {
    debugApi(`[${serviceName}:STATS]Get stats for  ${adapterDefinitionId}`);
    try {
        const response = await Get<ChartSerieData[]>(
            URL.getDataAdapterLogStatistics + `/${workspaceId}/${adapterDefinitionId}`
        );
        return response.data;
    } catch (error) {
        LOG.error("Error while fetching Stats", { workspaceId, error });
        throw new Error(
            `Error while fetching details for Stats ${workspaceId}: ${JSON.stringify(
                error
            )}`
        );
    }
}
