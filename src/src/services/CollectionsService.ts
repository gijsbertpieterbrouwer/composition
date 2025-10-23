import * as LOG from "@/log";
import { debugApi } from "@/log";
import { Post } from "@/services/Server";
import URL from "@/services/urls";
import { CreateCollectionRequest, DeleteCollectionRequest, DeleteConfirmationInfo, GetAsCollectionRequest, GetCollectionResponse, MoveCollectionRequest, MoveObjectToCollectionRequest, UpdateCollectionRequest } from "@/TickApi";


export async function GetCollections(workspaceId: string) {
    const params: GetAsCollectionRequest = { workspaceId };
    debugApi(`[Collections:Fetch]get all collections`);
    try {
        const response = await Post<GetCollectionResponse>(URL.getCollections, params);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching collections', { workspaceId, error });
        throw new Error(`Error while fetching collections for workspace ${workspaceId}: ${JSON.stringify(error)}`);
    }
}

export async function MoveCollectionObject(req: MoveObjectToCollectionRequest) {
    debugApi(`[Collections:Move object]Move object ${req.versionGroupId} to collection ${req.newCollectionId}`);
    try {
        const response = await Post<unknown>(URL.moveCollectionObject, req);
        return response.data;
    } catch (error) {
        LOG.error('Error while moving object', { error });
        throw new Error(`Error while moving object`);
    }
}

export async function UpdateCollection(req: UpdateCollectionRequest) {
    debugApi(`[Collections:Update collection]Update collection with id: ${req.collectionId} to have name: ${req.name}`);
    try {
        const response = await Post<unknown>(URL.updateCollection, req);
        return response.data;
    } catch (error) {
        LOG.error('Error while moving object', { error });
        throw new Error(`Error while moving object`);
    }
}

export async function MoveCollection(req: MoveCollectionRequest) {
    debugApi(`[Collections:Move collection]Move collection with id: ${req.collectionId} to : ${req.newParentId || 'root'}`);
    try {
        const response = await Post<unknown>(URL.moveCollection, req);
        return response.data;
    } catch (error) {
        LOG.error('Error while moving collection', { error });
        throw new Error(`Error while moving collection`);
    }
}

export async function CreateCollection(req: CreateCollectionRequest) {
    debugApi(`[Collections:Create collection]Create collection with name: ${req.name}}`);
    try {
        const response = await Post<unknown>(URL.createCollection, req);
        return response.data;
    } catch (error) {
        LOG.error('Error while creating collection', { error });
        throw new Error(`Error while creating collection`);
    }
}

export async function DeleteCollection(req: DeleteCollectionRequest) {
    debugApi(`[Collections:Delete collection]Delete collection with id: ${req.collectionId}}  (Confirmed:${req.confirmed})`);
    try {
        const response = await Post<DeleteConfirmationInfo>(URL.deleteCollection, req);
        return response.data;
    } catch (error) {
        LOG.error('Error while deleting collection', { error });
        throw new Error(`Error while deleting collection`);
    }
}