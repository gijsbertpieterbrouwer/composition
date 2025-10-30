import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifySaved } from "@/notify";
import { Post } from "@/services/Server";
import URL from "@/services/urls";
import {
    CreateDashboardsRequest,
    DashboardDataRequest,
    DashboardDataResponse,
    DashboardTileSettings,
    DashboardTileTemplateType,
    DeleteDashboardRequest,
    GetDashboardsRequest,
    GetStatisticDefinitionsRequest,
    GetStatisticDefinitionsResponse,
    TickDashboard,
    TickDashboardSummary
} from "@/TickApi";


const serviceName = "Dashboards"

export async function GetDashboardDataFromServer(request: DashboardDataRequest) {
    debugApi(`[${serviceName}:Fetch dashboard data]`);
    if (!request.charts?.length && !request.counters?.length && !request.pies?.length && !request.messageboards?.length && !request.heatmaps?.length) {
        LOG.error('Cannot fetch data for dashboard without a valid request');
        //console.log("request", request);
        return null;
    }

    try {
        const response = await Post<DashboardDataResponse>(URL.getDashboardData, request);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching dashboard data', { error });
        throw new Error(`Error while fetching dashboard data: ${JSON.stringify(error)}`);
    }
}


export async function getDashboards(request: GetDashboardsRequest) {
    debugApi(`[${serviceName}:Fetch all]`);

    try {
        const response = await Post<TickDashboardSummary[]>(URL.getDashboards, request);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching data', { error });
        throw new Error(`Error while fetching data: ${JSON.stringify(error)}`);
    }
}

export async function createDashboard(request: CreateDashboardsRequest) {
    debugApi(`[${serviceName}:Create]`);

    try {
        const response = await Post<TickDashboard>(URL.createDashboard, request);

        return response.data;
    } catch (error) {
        LOG.error('Error while creating', { error });
        throw new Error(`Error while creating: ${JSON.stringify(error)}`);
    }
}

export async function updateDashboard(request: TickDashboard) {
    debugApi(`[${serviceName}:Update]`);

    try {
        const response = await Post<TickDashboard>(URL.updateDashboard, request);
        notifySaved("Saved", "Automatically saved");
        return response.data;
    } catch (error) {
        LOG.error('Error while updating', { error });
        throw new Error(`Error while updating: ${JSON.stringify(error)}`);
    }
}
export async function deleteDashboard(request: DeleteDashboardRequest) {
    debugApi(`[${serviceName}:Delete]`);

    try {
        const response = await Post<TickDashboard>(URL.deleteDashboard, request);
        return response.data;
    } catch (error) {
        LOG.error('Error while deleting', { error });
        throw new Error(`Error while deleting: ${JSON.stringify(error)}`);
    }
}
export async function getDashboardStatisticdefinitions(request: GetStatisticDefinitionsRequest) {
    debugApi(`[${serviceName}:Get stat defs]`);

    try {
        const response = await Post<GetStatisticDefinitionsResponse>(URL.getDashboardStatisticDefinitions, request);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching', { error });
        throw new Error(`Error while fetching: ${JSON.stringify(error)}`);
    }
}
export async function createDashboardTileByTemplate(template: DashboardTileTemplateType, existingDashboard: TickDashboard) {
    debugApi(`[${serviceName}:Get new tile by template]`);

    try {
        const response = await Post<DashboardTileSettings>(URL.createDashboardTileByTemplate + `/${template}`, existingDashboard);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching', { error });
        throw new Error(`Error while fetching: ${JSON.stringify(error)}`);
    }
}

export async function updateWorkspaceDefaultDashboard(workspaceId: string, dashboardId: string): Promise<unknown> {
    try {
        const response = await Post(`${URL.setDashboardAsWorkspaceDefault}/${workspaceId}/${dashboardId}`);
        notifySaved();
        return response.data;
    } catch (error) {
        LOG.error('Error while updating workspace', { error });
        throw new Error(`Error while updating a workspace ${JSON.stringify(error)}`);
    }
}