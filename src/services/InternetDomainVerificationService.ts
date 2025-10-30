import * as LOG from "@/log";
import { debugApi } from "@/log";
import { notifyError, notifyMessage } from "@/notify";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { AddInternetDomainRequest, TenantInternetDomainStatusEnum, TickInternetDomain, ValidateInternetDomainRequest } from "@/TickApi";

const serviceName = "INTERNET-DOMAIN"

export async function getAllInternetDomains() {
    try {
        const response = await Get<TickInternetDomain[]>(URL.getInternetDomains);
        debugApi(`[${serviceName}:Fetch]Get all}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching', { error });
        throw new Error(`Error while fetching `);
    }
}


export async function createInternetDomain(req: AddInternetDomainRequest) {
    try {
        const response = await Post<TickInternetDomain>(URL.createInternetDomain, req);
        debugApi(`[${serviceName}:Add] Add new domain`);

        return response.data;
    } catch (error) {
        LOG.error('Error while creating domain', { error });
        throw new Error(`Error while creating domain`);
    }
}

export async function deleteInternetDomain(id: string) {
    try {
        const response = await Post<unknown>(URL.deleteInternetDomain + `/${id} `);
        debugApi(`[${serviceName}:Delete] Delete domain ${id}`);

        return response.data;
    } catch (error) {
        LOG.error('Error while deleting domain', { error });
        throw new Error(`Error while deleting domain`);
    }
}

export async function validateInternetDomain(req: ValidateInternetDomainRequest) {
    try {
        const response = await Post<TickInternetDomain>(URL.validateInternetDomainValidationKey, req);
        debugApi(`[${serviceName}:Validate] Validating key for domain}`);

        if (response?.data?.status == TenantInternetDomainStatusEnum.Verified) {
            notifyMessage("Domain validated", "The domain was successfully verified");
        } else {
            notifyError("Wrong validation", "The validation code was not correct, please try again.");
        }
        return response.data;
    } catch (error) {
        LOG.error('[${serviceName}:Validate]Error while validating', { error });
        throw new Error(`Error while validating`);
    }
}