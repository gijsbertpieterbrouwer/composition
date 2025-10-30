import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifySaved } from "@/notify";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { AdapterComponentPresentationTypeEnum, ComponentDataSourceTypeEnum, MetaDataItem, TickComponentPresentationTypeEnum, TickMetaDataComponent } from "@/TickApi";



export async function addMetaDataComponent(workspaceId: string, type: ComponentDataSourceTypeEnum, subType: AdapterComponentPresentationTypeEnum | TickComponentPresentationTypeEnum): Promise<MetaDataItem> {
    debugApi(`[Metadata component:Create]Create new component for workspace ${workspaceId} with type ${type} and sub type: ${subType}`);
    try {
        const response = await Post<MetaDataItem>(URL.createMetaDataComponent.toString() + `/${workspaceId}/${type}/${subType}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while creating meta data component', { error });
        throw new Error(`Error while creating a meta data component ${JSON.stringify(error)}`);
    }
}
export async function getMetaDataComponentDetails(id: string) {
    try {

        const response = await Get<TickMetaDataComponent>(URL.getMetaDataComponent.toString() + `/${id}`);
        debugApi(`[Metadata component:Fetch]Get component details  => ${response.data.name}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching meta data component', { id, error });
        throw new Error(`Error while fetching details for meta data component ${id}: ${JSON.stringify(error)}`);
    }
}

export async function updateMetaDataComponent(def: TickMetaDataComponent): Promise<TickMetaDataComponent> {
    debugApi(`[Metadata component:Update]Update component ${def.id}  new name=> ${def.name}`);
    try {
        const response = await Post<TickMetaDataComponent>(URL.updateMetaDataComponent.toString(), def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating meta data component', { error });
        throw new Error(`Error while updating an meta data component ${JSON.stringify(error)}`);
    }
}

export async function deleteMetaDataComponent(id: string): Promise<unknown> {
    debugApi(`[Metadata component:Delete]Delete component ${id}`);
    try {
        const response = await Post<unknown>(URL.deleteMetaDataComponent.toString() + `/${id}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while deleting meta data component', { error });
        throw new Error(`Error while deleting a meta data component ${JSON.stringify(error)}`);
    }
}

