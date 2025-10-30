import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifyError, notifySaved } from "@/notify";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { CreateCommunicatorCategoryDefinitionRequest, FormValidationResponse, GetCommunicatorsRequest, GetCommunicatorsResponse, LanguagePath, MarkSpammerRequest, MergeCommunicatorsRequest, MetaDataComponentCommunicatorInfoData, SearchCommunicatorAddressRequest, TickCommunicator, TickCommunicatorCategoryDefinition, TickCommunicatorCategoryDefinitionSummary, TickCommunicatorWorkingData } from "@/TickApi";

const serviceName = "Communicators";

export async function mergeCommunicators(req: MergeCommunicatorsRequest): Promise<unknown> {
    debugApi(`[${serviceName}:Merge]merging communicators`);
    try {
        const response = await Post<unknown>(URL.mergeCommunicators, req);
        return response.data;
    } catch (error) {
        LOG.error('Error while merging communicators', { error });
        throw new Error(`Error while merging communicators ${JSON.stringify(error)}`);
    }
}

export async function markCommunicatorAsSpammer(req: MarkSpammerRequest): Promise<unknown> {
    debugApi(`[${serviceName}:MARK-SPAMMER]marking communicator as spammer`);
    try {
        const response = await Post<unknown>(URL.markCommunicatorAsSpammer, req);
        return response.data;
    } catch (error) {
        LOG.error('Error while marking communicator as spammer', { error });
        throw new Error(`Error while marking communicator as spammer ${JSON.stringify(error)}`);
    }
}

export async function updateCommunicator(req: TickCommunicator): Promise<unknown> {
    debugApi(`[${serviceName}:Update]updating communicator`);
    try {
        const response = await Post<unknown>(URL.updateCommunicator, req);
        return response.data;
    } catch (error) {
        LOG.error('Error while updating communicator', { error });
        throw new Error(`Error while updating communicator ${JSON.stringify(error)}`);
    }
}

export async function searchCommunicatorAddress(req: SearchCommunicatorAddressRequest): Promise<TickCommunicator[]> {
    debugApi(`[${serviceName}:SEARCH]searching communicator`);
    try {
        const response = await Post<TickCommunicator[]>(URL.searchCommunicatorAddress, req);
        return response.data;
    } catch (error) {
        LOG.error('Error while searching communicator', { error });
        throw new Error(`Error while searching communicator ${JSON.stringify(error)}`);
    }
}

export async function getCommunicators(workspaceId: string, req: GetCommunicatorsRequest): Promise<GetCommunicatorsResponse> {

    try {
        const response = await Post<GetCommunicatorsResponse>(URL.getCommunicators + `/${workspaceId}`, req);
        debugApi(`[${serviceName}:FETCH]Retrieved ${response?.data?.communicators?.length} summaries`)
        return response.data;
    } catch (err) {
        // TODO: services should throw errors
        LOG.error('Error while fetching communicators', { workspaceId, err });
        throw new Error();
    }
}

export async function getCommunicator(id: string): Promise<TickCommunicatorWorkingData> {

    try {
        const response = await Post<TickCommunicatorWorkingData>(URL.getCommunicator + `/${id}`);
        debugApi(`[${serviceName}:FETCH]Retrieved ${response.data.name} `)
        return response.data;
    } catch (err) {
        // TODO: services should throw errors
        LOG.error('Error while fetching communicator', { id, err });
        throw new Error();
    }
}


export async function updateCommunicatorDetails(req: TickCommunicatorWorkingData): Promise<FormValidationResponse[]> {
    debugApi(`[${serviceName}:Update]updating communicator`);
    try {
        const response = await Post<FormValidationResponse[]>(URL.updateCommunicatorDetails + `/${req.id}`, req);
        if (response.data.some(p => !p.isValid)) {
            notifyError("not saved", LanguagePath.App_CommunicatorDetails_Editor_ValidationIssue);
        } else {
            notifySaved();
        }
        return response.data;
    } catch (error) {
        LOG.error('Error while updating communicator', { error });
        throw new Error(`Error while updating communicator ${JSON.stringify(error)}`);
    }
}

export async function updateCommunicatorFromMetaDataComponent(ticketId: string, metadataComponentDefinitionId: string, communicatorId: string, req: MetaDataComponentCommunicatorInfoData): Promise<MetaDataComponentCommunicatorInfoData> {
    debugApi(`[${serviceName}:Update]updating communicator`);
    try {
        const response = await Post<MetaDataComponentCommunicatorInfoData>(URL.updateCommunicatorFromMetaDataComponent + `/${ticketId}/${metadataComponentDefinitionId}/${communicatorId}`, req);
        if (!response?.data?.formValidationResponse?.isValid) {
            notifyError("not saved", LanguagePath.App_CommunicatorDetails_Editor_ValidationIssue);
        } else {
            notifySaved();
        }
        return response.data;
    } catch (error) {
        LOG.error('Error while updating communicator', { error });
        throw new Error(`Error while updating communicator ${JSON.stringify(error)}`);
    }
}

export async function getCommunicatorCategories(workspaceId: string): Promise<TickCommunicatorCategoryDefinitionSummary[]> {

    try {
        const response = await Get<TickCommunicatorCategoryDefinitionSummary[]>(URL.getCommunicatorCategories + `/${workspaceId}`);
        debugApi(`[${serviceName}:FETCH]Retrieved ${response.data.length} `)
        return response.data;
    } catch (err) {
        // TODO: services should throw errors
        LOG.error('Error while fetching communicator categories', { id: workspaceId, err });
        throw new Error();
    }
}

export async function getCommunicatorCategoryDefinition(workspaceId: string, id: string): Promise<TickCommunicatorCategoryDefinition> {

    try {
        const response = await Post<TickCommunicatorCategoryDefinition>(URL.getCommunicatorCategory + `/${workspaceId}/${id}`);
        debugApi(`[${serviceName}:FETCH]Retrieved ${response.data?.name} `)
        return response.data;
    } catch (err) {
        // TODO: services should throw errors
        LOG.error('Error while fetching communicator category', { id: workspaceId, err });
        throw new Error();
    }
}

export async function saveCommunicatorCategoryDefinition(req: TickCommunicatorCategoryDefinition): Promise<TickCommunicatorCategoryDefinition> {

    try {
        const response = await Post<TickCommunicatorCategoryDefinition>(URL.updateCommunicatorCategory, req);
        debugApi(`[${serviceName}:UPDATE]Updated category ${response.data?.name} `)
        notifySaved();
        return response.data;
    } catch (err) {
        // TODO: services should throw errors
        LOG.error('Error while updating communicator category', { err });
        throw new Error();
    }
}

export async function deleteCommunicatorCategoryDefinition(req: TickCommunicatorCategoryDefinition): Promise<unknown> {

    try {
        const response = await Post<unknown>(URL.deleteCommunicatorCategory, req);
        debugApi(`[${serviceName}:DELETE]Updated category ${req.id} `)
        return response.data;
    } catch (err) {
        // TODO: services should throw errors
        LOG.error('Error while deleting communicator category', { err });
        throw new Error();
    }
}
export async function createCommunicatorCategory(req: CreateCommunicatorCategoryDefinitionRequest): Promise<TickCommunicatorCategoryDefinitionSummary> {

    try {
        const response = await Post<TickCommunicatorCategoryDefinitionSummary>(URL.createCommunicatorCategory, req);
        debugApi(`[${serviceName}:CREATE]Create category  `)
        return response.data;
    } catch (err) {
        // TODO: services should throw errors
        LOG.error('Error while creating communicator category', { err });
        throw new Error();
    }
}