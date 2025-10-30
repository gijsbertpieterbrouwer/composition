import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifyError, notifyMessage } from "@/notify";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { TenantOverview, TickEndPartnershipRequest, TickEndPartnershipResponse, TickEndTenantSubscriptionRequest, TickEndTenantSubscriptionResponse, TickPartnerShipData, TickStartAffiliatePartnershipRequest, TickStartAffiliatePartnershipResponse } from "@/TickApi";

const serviceName = "PARTNERSHIP"

export async function getActivePartnership() {
    try {
        const response = await Get<TickPartnerShipData>(URL.getActivePartnership);
        debugApi(`[${serviceName}:Fetch]Get active partnership}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching partnership', { error });
        throw new Error(`Error while fetching details`);
    }
}


export async function startAffiliatePartnership(req: TickStartAffiliatePartnershipRequest) {
    try {
        const response = await Post<TickStartAffiliatePartnershipResponse>(URL.startAffiliatePartnership, req);
        debugApi(`[${serviceName}:Partner] start partnership}`);
        notifyMessage("Partnership", "Successfully started the partnership");
        return response.data;
    } catch (error) {
        LOG.error('Error while starting partnership', { error });
        throw new Error(`Error while starting partnership`);
    }
}

export async function endPartnership(req: TickEndPartnershipRequest) {
    try {
        const response = await Post<TickEndPartnershipResponse>(URL.endPartnership, req);
        debugApi(`[${serviceName}:Partner] end partnership}`);
        notifyMessage("Partnership", response.data.message || "Successfully ended the partnership");
        return response.data;
    } catch (error) {
        LOG.error('Error while ending partnership', { error });
        throw new Error(`Error while ending partnership`);
    }
}

export async function endTenantViaPartnership(req: TickEndTenantSubscriptionRequest) {
    try {
        const response = await Post<TickEndTenantSubscriptionResponse>(URL.endTenantViaPartnership, req);
        debugApi(`[${serviceName}:Partner] end tenant via partnership}`);

        if (response.data.success) {
            notifyMessage("Tenant removed", response.data.message || "Successfully ended the tenant");
        } else {
            notifyError("Tenant not removed", response.data.message || "There was a problem");
        }

        return response.data;
    } catch (error) {
        LOG.error('Error while ending tenant via partnerhsip', { error });
        throw new Error(`Error while ending tenant via partnerhsip`);
    }
}

export async function getPartnershipSubTenant(tenantId: string, workspaceId: string) {
    try {
        const response = await Get<TenantOverview>(URL.getPartnershipSubTenant + `/${workspaceId}/${tenantId}`);
        debugApi(`[${serviceName}:Partner] get tenant via partnership`);

        return response.data;
    } catch (error) {
        LOG.error('Error while getting tenant via partnerhsip', { error });
        throw new Error(`Error while getting tenant via partnerhsip`);
    }
}


export async function resetPartnershipSubTenantUserPassword(tenantId: string, workspaceId: string, userId: string) {
    try {
        const response = await Post<unknown>(URL.resetPartnershipSubTenantUserPassword + `/${workspaceId}/${tenantId}/${userId}`);
        debugApi(`[${serviceName}:Partner] end tenant via partnership}`);

        if (response.data) {
            notifyMessage("Password reset requested", "Please let the user check his e-mail for password reset information.");
        }

        return response.data;
    } catch (error) {
        LOG.error('Error while resettings user password', { error });
        throw new Error(`Error while resettings user password`);
    }
}
