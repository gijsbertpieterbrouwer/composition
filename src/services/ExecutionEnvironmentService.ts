import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifyMessage } from "@/notify";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { AddExecutionEnvironmentRequest, MetaDataItem, TickExecutionEnvironment, TickExecutionEnvironmentSummary, } from "@/TickApi";
import { AxiosResponse } from "axios";


export async function getEnvironments(workspaceId: string) {
    try {
        const response = await Get<TickExecutionEnvironmentSummary[]>(URL.getEnvironments + `/${workspaceId}`);
        debugApi(`[Environments:Fetch]Get all environments}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching environments', { workspaceId, error });
        throw new Error(`Error while fetching environments ${workspaceId}: ${JSON.stringify(error)}`);
    }
}

export async function getEnvironmentDetails(id: string) {
    try {
        debugApi(`[Environments:Fetch]Get environment details for id: ${id}}`);
        const response = await Get<TickExecutionEnvironment>(URL.getEnvironment.toString() + `/${id}`);

        return response.data;
    } catch (error) {
        LOG.error('Error while fetching environment', { id, error });
        throw new Error(`Error while fetching details for environment ${id}: ${JSON.stringify(error)}`);
    }
}


export async function updateEnvironment(def: TickExecutionEnvironment): Promise<TickExecutionEnvironment> {
    debugApi(`[Environments:Update]Update environment id: ${def.id} and new name ${def.name}}`);
    try {
        const response = await Post<TickExecutionEnvironment>(URL.updateEnvironment.toString(), def);
        //notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating environment', { error });
        throw new Error(`Error while updating an environment ${JSON.stringify(error)}`);
    }
}

export async function addEnvironment(def: AddExecutionEnvironmentRequest): Promise<MetaDataItem> {
    debugApi(`[Environments:Create]Create environment with name: ${def.name} }`);
    try {
        const response = await Post<MetaDataItem>(URL.createEnvironment.toString(), def);
        return response.data;
    } catch (error) {
        LOG.error('Error while creating environment', { error });
        throw new Error(`Error while creating a environment ${JSON.stringify(error)}`);
    }
}

export async function deleteEnvironment(id: string): Promise<AxiosResponse> {
    debugApi(`[Environments:Delete]Delete environment with id: ${id} }`);
    try {
        const response = await Post(URL.deleteEnvironment.toString() + `/${id}`);
        return response;
    } catch (error) {
        LOG.error('Error while deleting environment', { error });
        throw new Error(`Error while deleting a environment ${JSON.stringify(error)}`);
    }
}


export async function setEnvironmentAsProduction(id: string): Promise<AxiosResponse> {
    debugApi(`[Environments:Update]Update environment with id: ${id} to be the production one }`);
    try {
        const response = await Post(URL.setEnvironmentAsProduction.toString() + `/${id}`);
        notifyMessage("Success", "Successfully set to production");
        return response;
    } catch (error) {
        LOG.error('Error while setAsProduction environment', { error });
        throw new Error(`Error while setAsProduction a environment ${JSON.stringify(error)}`);
    }
}

export async function setEnvironmentAsCreator(id: string): Promise<AxiosResponse> {
    debugApi(`[Environments:Update]Update environment with id: ${id} to be the creator default one }`);
    try {
        const response = await Post(URL.setEnvironmentAsCreator.toString() + `/${id}`);
        notifyMessage("Success", "Successfully set as default fro creation");
        return response;
    } catch (error) {
        LOG.error('Error while setEnvironmentAsCreator environment', { error });
        throw new Error(`Error while setEnvironmentAsCreator a environment ${JSON.stringify(error)}`);
    }
}



