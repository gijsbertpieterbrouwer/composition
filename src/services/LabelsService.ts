import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifySaved } from "@/notify";
import { Post, Get } from "@/services/Server";
import URL from "@/services/urls";
import { AddLabelRequest, TickLabelDefinition, UpdateLabelsRequest } from "@/TickApi";


export async function updateLabels(def: UpdateLabelsRequest) {
    debugApi(`[Labels:Update]Update ${def.labels.length} labels}`);
    try {
        const response = await Post(URL.updateLabels, def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating labels', { error });
        throw new Error(`Error while updating labels ${JSON.stringify(error)}`);
    }
}

export async function getLabels(workspaceId: string) {
    try {
        const response = await Get<TickLabelDefinition[]>(URL.getLabels + `/${workspaceId}`);
        debugApi(`[Labels:Fetch]Get ${response.data.length} labels}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching labels', { workspaceId, error });
        throw new Error(`Error while fetching details for labels ${workspaceId}: ${JSON.stringify(error)}`);
    }
}

export async function addLabel(def: AddLabelRequest): Promise<TickLabelDefinition> {
    debugApi(`[Labels:ADD]Add label}`);
    try {
        const response = await Post(URL.addLabel, def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while adding labels', { error });
        throw new Error(`Error while adding labels ${JSON.stringify(error)}`);
    }
}


