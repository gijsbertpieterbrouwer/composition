import * as LOG from '@/log';
import { debugApi } from '@/log';
import { Post } from "@/services/Server";
import URL from "@/services/urls";

import { ExchangeCreatorRequest, ExchangeSetupManifest } from "@/TickApi";

const service = 'Exchange'
export async function createUnsavedManifest(req: ExchangeCreatorRequest): Promise<ExchangeSetupManifest> {
  try {
    const response = await Post<ExchangeSetupManifest>(URL.createUnsavedManifest, req);
    debugApi(`[${service}:Create new (unsaved) manifest]`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('create unsaved manifest error', error);
    //throw new error();
  }
}

export async function saveManifest(req: ExchangeSetupManifest): Promise<ExchangeSetupManifest> {
  try {
    const response = await Post<ExchangeSetupManifest>(URL.createManifest, req);
    debugApi(`[${service}:Create new manifest]`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('create manifest error', error);
    //throw new error();
  }
}

