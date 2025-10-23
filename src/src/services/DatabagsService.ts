import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifyError, notifySaved } from "@/notify";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { TickDataBag, TickDatabagItemDefinition, TickDataBagSummary } from "@/TickApi";

const serviceName = "Databags";

export async function getDatabags(workspaceId: string) {

    try {
        const response = await Get<TickDataBagSummary[]>(URL.getDataBags + `/${workspaceId}`);
        debugApi(`[${serviceName}:Fetch]Get databag summaries => ${response.data.length} items found}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching databags', { workspaceId, error });
        throw new Error(`Error while fetching details for databags ${workspaceId}: ${JSON.stringify(error)}`);
    }
}

export async function getDetails(id: string) {
    debugApi(`[${serviceName}:Fetch]Get databag details ${id}}`);
    try {
        const response = await Get<TickDataBag>(URL.getDataBag.toString() + `/${id}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching databag', { id, error });
        throw new Error(`Error while fetching details for databag ${id}: ${JSON.stringify(error)}`);
    }
}



export async function updateDataBag(def: TickDataBag): Promise<TickDataBag> {
    debugApi(`[${serviceName}:Update]Update databag with id ${def.id}}`);
    try {
        const response = await Post<TickDataBag>(URL.updateDataBag.toString(), def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating databag', { error });
        throw new Error(`Error while updating a databag ${JSON.stringify(error)}`);
    }
}




export async function getDatabagItemDefinitions(workspaceId: string): Promise<TickDatabagItemDefinition[]> {
    debugApi(`[${serviceName}:Fetch all]Get databag item definitions ${workspaceId}}`);
    try {
        const response = await Get<TickDatabagItemDefinition[]>(URL.getDataBagItemDefinitions + `/${workspaceId}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching databag item definitions', { id: workspaceId, error });
        throw new Error(`Error while fetching databag item definitions${workspaceId}: ${JSON.stringify(error)}`);
    }
}



export async function updateDatabagItemDefinitions(workspaceId: string, defs: TickDatabagItemDefinition[]): Promise<unknown> {
    debugApi(`[${serviceName}:Update]Update databag item definitions}`);
    try {
        const response = await Post<unknown>(URL.updateDataBagItemDefinitions + `/${workspaceId}`, defs);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating databag item defintions', { error });
        throw new Error(`Error while updating item defintions ${JSON.stringify(error)}`);
    }
}

export async function addNewDatabagItemDefinition(workspaceId: string, def: TickDatabagItemDefinition): Promise<TickDatabagItemDefinition> {
    debugApi(`[${serviceName}:Create]Create databag item definition}`);
    try {
        const response = await Post<TickDatabagItemDefinition>(URL.addDataBagItemDefinition + `/${workspaceId}`, def);
        notifySaved();

        return response.data;
    } catch (error) {
        notifyError("Already in use", "The path is already in use");
        LOG.error('Error while creating databag item defintion', { error });
        //throw new Error(`Error while creating item defintion ${JSON.stringify(error)}`);
    }
}

