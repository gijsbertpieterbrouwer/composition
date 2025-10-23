import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifyMessage } from "@/notify";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { CopyToEnvironmentRequest, CreateFlowDefinitionRequest, SearchFlowInstancesRequest, TickFlowDefinition, TickFlowInstanceLog, TickFlowInstanceLogSummary } from "@/TickApi";
const serviceName = "FLOW"
export async function getDetails(id: string, versionId: string) {
    try {
        const response = await Get<TickFlowDefinition>(URL.getFlow + `/${id}/${versionId}`);
        debugApi(`[${serviceName}:Fetch]Get flow ${id} => ${response.data.name}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching flows', { id, error });
        throw new Error(`Error while fetching flow details for flow ${id}: ${JSON.stringify(error)}`);
    }
}

export async function createFlow(request: CreateFlowDefinitionRequest): Promise<TickFlowDefinition> {
    debugApi(`[${serviceName}:Create]Create new empty flow`);
    try {
        const response = await Post<TickFlowDefinition>(URL.createFlow.toString(), request);
        return response.data;
    } catch (error) {
        LOG.error('Error while creating flow', { error });
        throw new Error(`Error while creating a flow in workspace ${request.workspaceId}: ${JSON.stringify(error)}`);
    }
}

export async function copyFlowToEnvironment(request: CopyToEnvironmentRequest): Promise<TickFlowDefinition> {
    debugApi(`[${serviceName}:Copy]Copy flow with versionId ${request.flowVersionId} to environment ${request.executionEnvironmentId}`);
    try {
        const response = await Post<TickFlowDefinition>(URL.copyFlowToEnvironment.toString(), request);
        notifyMessage("Success", "Successfully sent to environment");
        return response.data;
    } catch (error) {
        LOG.error('Error while copy flow to environment', { request, error });
        throw new Error(`Error while creating a flow copy in environment ${request.executionEnvironmentId}: ${JSON.stringify(error)}`);
    }
}

export async function getFlowInstanceSearchLogs(req: SearchFlowInstancesRequest) {
    try {
        const response = await Post<TickFlowInstanceLogSummary[]>(URL.getFlowInstanceLogsByQuery, req);
        debugApi(`[${serviceName}:Fetch]Get logs  query: ${req.query}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching adapter logs', { req, error });
        throw new Error(`Error while fetching logs for query ${req.query}: ${JSON.stringify(error)}`);
    }
}


export async function getFlowInstanceRecentLogs(id: string, versionId: string) {
    try {

        const response = await Get<TickFlowInstanceLogSummary[]>(URL.getFlowInstanceLogs + `/${id}/${versionId}`);
        debugApi(`[${serviceName}:Fetch]Get logs id: ${id}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching adapter logs', { id, error });
        throw new Error(`Error while fetching logs for ${id}: ${JSON.stringify(error)}`);
    }
}

export async function getFlowInstanceLogDetails(id: string) {
    try {

        const response = await Get<TickFlowInstanceLog>(URL.getFlowInstanceLogDetails + `/${id}`);
        debugApi(`[${serviceName}:Fetch]Get logs details for id: ${id}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching adapter log details', { id, error });
        throw new Error(`Error while fetching log details for log ${id}: ${JSON.stringify(error)}`);
    }
}


