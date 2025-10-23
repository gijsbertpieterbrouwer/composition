import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifySaved } from "@/notify";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import {
  AddSlaDefinitionRequest,
  TickSlaDefinitionData,
  TickSlaDefinitionSummary,
  IChartData,
} from "@/TickApi";
import { AxiosResponse } from "axios";

export async function getSlaDefinitions(workspaceId: string) {
  try {
    const response = await Get<TickSlaDefinitionSummary[]>(
      URL.getSlas + `/${workspaceId}`
    );
    debugApi(`[SLA:FETCH]Retrieved ${response.data.length} sla's`);
    return response.data;
  } catch (error) {
    LOG.error("Error while fetching SLAs", { workspaceId, error });
    throw new Error(
      `Error while fetching details for SLAs ${workspaceId}: ${JSON.stringify(
        error
      )}`
    );
  }
}

export async function addSlaDefinition(
  def: AddSlaDefinitionRequest
): Promise<TickSlaDefinitionSummary> {
  debugApi(`[SLA:Create]Create new SLA`);
  try {
    const response = await Post<TickSlaDefinitionSummary>(
      URL.createSla.toString(),
      def
    );
    return response.data;
  } catch (error) {
    LOG.error("Error while creating sla", { error });
    throw new Error(`Error while creating a sla ${JSON.stringify(error)}`);
  }
}
export async function getSlaDefinitionDetails(id: string) {
  try {
    const response = await Get<TickSlaDefinitionData>(
      URL.getSla.toString() + `/${id}`
    );
    debugApi(`[SLA:Fetch]Get SLA details => ${response.data.name}`);
    return response.data;
  } catch (error) {
    LOG.error("Error while fetching sla", { id, error });
    throw new Error(
      `Error while fetching details forsla ${id}: ${JSON.stringify(error)}`
    );
  }
}

export async function updateSlaDefinition(
  def: TickSlaDefinitionData
): Promise<TickSlaDefinitionData> {
  debugApi(`[SLA:Update]Update SLA  ${def.id} new name => ${def.name}`);
  try {
    const response = await Post<TickSlaDefinitionData>(
      URL.updateSla.toString(),
      def
    );
    notifySaved();
    return response.data;
  } catch (error) {
    LOG.error("Error while updating sla", { error });
    throw new Error(`Error while updating sla ${JSON.stringify(error)}`);
  }
}

export async function deleteSlaDefinition(id: string): Promise<AxiosResponse> {
  debugApi(`[SLA:Delete]Delete SLA  ${id}`);
  try {
    const response = await Post(URL.deleteSla.toString() + `/${id}`);
    return response;
  } catch (error) {
    LOG.error("Error while deleting a SLA", { error });
    throw new Error(`Error while deleting a SLA ${JSON.stringify(error)}`);
  }
}

export async function getSlaStatistics(
  workspaceId: string,
  slaDefinitionId: string
) {
  debugApi(`[SLA:STATS]Get stats for SLA  ${slaDefinitionId}`);
  try {
    const response = await Get<IChartData>(
      URL.getSlaStats + `/${workspaceId}/${slaDefinitionId}`
    );
    return response.data;
  } catch (error) {
    LOG.error("Error while fetching SLAs", { workspaceId, error });
    throw new Error(
      `Error while fetching details for SLAs ${workspaceId}: ${JSON.stringify(
        error
      )}`
    );
  }
}
