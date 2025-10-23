import * as LOG from '@/log';
import { debugApi } from '@/log';
import { Get } from "@/services/Server";
import URL from "@/services/urls";

import { SearchResponse } from "@/TickApi";

export async function searchAll(workspaceId: string, query: string): Promise<SearchResponse> {
  try {
    const response = await Get<SearchResponse>(URL.omniSearch + `/${workspaceId}?query=${query}`);
    debugApi(`[Search:FETCH]find answers from Tick for query ${query}`);
    return response.data;
  } catch (error) {
    // TODO: services should throw errors
    LOG.error('Error while searching', error);
    // throw new error();
  }
}
