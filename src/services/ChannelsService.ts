import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifySaved } from "@/notify";
import { Delete, Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { AvailablePhoneNumberData, EmailChannelSettings, GetEmptyChannelRequest, TickChannel, TickChannelSummary, ValidateEmailSettingsResponse, ValidateTelegramTokenResponse, ValidateTwilioPhoneTokenResponse, WorkspaceRequest } from "@/TickApi";


export async function getChannels(workspaceId: string) {
    const params: WorkspaceRequest = { workspaceId };
    debugApi(`[Channels:Fetch]Get channel summaries`);

    try {
        const response = await Get<TickChannelSummary[]>(URL.getChannels, { params });
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching channels', { workspaceId, error });
        throw new Error(`Error while fetching details for channels ${workspaceId}: ${JSON.stringify(error)}`);
    }
}

export async function getDetails(id: string) {
    debugApi(`[Channels:Fetch]Get channel details fro channel ${id}`);
    try {
        const response = await Get<TickChannel>(URL.getChannel.toString() + `/${id}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching channel', { id, error });
        throw new Error(`Error while fetching details for channel ${id}: ${JSON.stringify(error)}`);
    }
}
export async function validateTelegramToken(id: string, token: string) {
    debugApi(`[Channels:Validate]Validate for telegram`);
    try {
        const response = await Get<ValidateTelegramTokenResponse>(URL.validateTelegramToken.toString() + `/${id}/${token}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while checking token', { token, error });
        throw new Error(`Error while checking token ${token}: ${JSON.stringify(error)}`);
    }
}

export async function validateTwilioPhoneToken(id: string, acountSId: string, token: string) {
    debugApi(`[Channels:Validate]Validate for Twilio`);
    try {
        const response = await Get<ValidateTwilioPhoneTokenResponse>(URL.validatePhoneToken.toString() + `/${id}/${acountSId}/${token}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while checking token', { token, error });
        throw new Error(`Error while checking token ${token}: ${JSON.stringify(error)}`);
    }
}

export async function validateEmailSettings(id: string, settings: EmailChannelSettings) {
    debugApi(`[Channels:Validate]Validate for email`);
    try {
        const response = await Post<ValidateEmailSettingsResponse>(URL.validateEmailSettings.toString() + `/${id}`, settings);
        return response.data;
    } catch (error) {
        LOG.error('Error while checking emailsettings', { error });
        throw new Error(`Error while checking token: ${JSON.stringify(error)}`);
    }
}
export async function getEmptyChannel(req: GetEmptyChannelRequest): Promise<TickChannel> {

    debugApi(`[Channels:Post]Create new empty channel`);
    try {
        const response = await Post<TickChannel>(URL.getUnsavedChannel.toString(), req);
        return response.data;
    } catch (error) {
        LOG.error('Error while creating an empty channel', { error });
        throw new Error(`Error while creating an empty channel in workspace ${req.workspaceId}: ${JSON.stringify(error)}`);
    }
}
export async function createChannel(def: TickChannel): Promise<TickChannel> {
    debugApi(`[Channels:Post]Create new channel`);
    try {
        const response = await Post<TickChannel>(URL.createChannel.toString(), def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while creating channel', { error });
        throw new Error(`Error while creating a channel ${JSON.stringify(error)}`);
    }
}
export async function updateChannel(def: TickChannel): Promise<TickChannel> {
    debugApi(`[Channels:Post]Update channel ${def.name} with id: ${def.id}`);
    try {
        const response = await Post<TickChannel>(URL.updateChannel.toString(), def);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating channel', { error });
        throw new Error(`Error while updating a channel ${JSON.stringify(error)}`);
    }
}

export async function deleteChannel(id: string): Promise<unknown> {
    debugApi(`[Channels:Delete]deleting channel with id: ${id}`);
    try {
        const response = await Delete<unknown>(URL.deleteChannel.toString() + `/${id}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while deleting channel', { error });
        throw new Error(`Error while deleting a channel ${JSON.stringify(error)}`);
    }
}



export async function getAvailablePhoneNumbers(countrycode: string) {
    debugApi(`[Channels:PHoneNumbers]Get available phone numbers`);
    try {
        const response = await Post<AvailablePhoneNumberData[]>(URL.getAvailablePhoneNumbers.toString() + `/${countrycode}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while checking ', { countrycode, error });
        throw new Error(`Error while checking  ${countrycode}: ${JSON.stringify(error)}`);
    }
}


