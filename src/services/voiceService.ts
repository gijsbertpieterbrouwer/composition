import * as LOG from '@/log';
import { debugApi } from '@/log';
import { Post } from "@/services/Server";
import URL from "@/services/urls";

import { CallRequest, CreateCallRequest, EndVoiceRequest, LinkPhoneCallToTicketRequest, StartVoiceRequest, StartVoiceResponse, TickCallSummary, TicketSummary, TransferCallRequest } from "@/TickApi";

const service = 'VOICE'
export async function getVoiceConnectionTokenFromServer(req: StartVoiceRequest): Promise<StartVoiceResponse> {
  try {
    const response = await Post<StartVoiceResponse>(URL.getVoiceConnectionToken, req);
    debugApi(`[${service}:Fetch token]fetch voice connection token`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('fetch voice connection token', error);
    throw new Error();
  }
}

export async function startVoiceConnectionOnServer(req: StartVoiceRequest): Promise<unknown> {
  try {
    const response = await Post<unknown>(URL.startVoiceConnection, req);
    debugApi(`[${service}:START]start voice connection token`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Start voice connection ', error);
    throw new Error();
  }
}

export async function endVoiceConnectionOnServer(req: EndVoiceRequest): Promise<unknown> {
  try {
    const response = await Post<unknown>(URL.endVoiceConnection, req);
    debugApi(`[${service}:end]start voice connection`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while ending voice', error);
    throw new Error();
  }
}
export async function getVoiceCallInfoFromServer(req: CallRequest): Promise<TickCallSummary> {
  try {
    const response = await Post<TickCallSummary>(URL.getVoiceCallInfo, req);
    debugApi(`[${service}:INFO]Get call info`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while retrieving voice call info', error);
    throw new Error();
  }
}
export async function declineVoiceCallFromServer(req: CallRequest): Promise<unknown> {
  try {
    const response = await Post<unknown>(URL.declineVoiceCall, req);
    debugApi(`[${service}:DECLINE]Decline call`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while declining voice call', error);
    // throw new error();
  }
}
// export async function endVoiceCall(callId: string): Promise<unknown> {
//   try {
//     const response = await Post<unknown>(URL.endVoiceCall + `/${callId}`);
//     debugApi(`[${service}:ENDCALL]Ending call`);
//     return response.data;
//   } catch (error) {
//     // TODO: services should throw errors
//     LOG.error('Error while ending voice call', error);
//     // throw new error();
//   }
// }

export async function holdVoiceCallOnServer(callId: string, hold: boolean): Promise<unknown> {
  try {
    const response = await Post<unknown>(URL.holdVoiceCall + `/${callId}/${hold}`);
    debugApi(`[${service}:HOLD](un)Hold call`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while holding voice call', error);
    throw new Error();
  }
}

export async function transferVoiceCallOnServer(req: TransferCallRequest): Promise<unknown> {
  try {
    const response = await Post<unknown>(URL.transferVoiceCall, req);
    debugApi(`[${service}:TRANSFER]Transfering call`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while transfering voice call', error);
    throw new Error();
  }
}

export async function createVoiceCallOnServer(req: CreateCallRequest): Promise<TickCallSummary> {
  try {
    const response = await Post<TickCallSummary>(URL.createVoiceCall, req);
    debugApi(`[${service}:Create]Initiating call`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while creating voice call', error);
    throw new Error();
  }
}

export async function linkVoiceCallToTicketOnServer(req: LinkPhoneCallToTicketRequest): Promise<TicketSummary> {
  try {
    const response = await Post<TicketSummary>(URL.linkVoiceCallToTicket, req);
    debugApi(`[${service}:Link]Linking call to ticket`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while linking voice call to ticket', error);
    throw new Error();
  }
}