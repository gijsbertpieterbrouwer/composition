import * as LOG from "@/log";
import { debugApi } from "@/log";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { BillingPeriodData, RemoveTenantProgress, SubscriptionProgressResponse, TickRemoveTenantRequest, TickSubscribeRequest, TickSubScriptionData, TickSubscriptionPlan } from "@/TickApi";


export async function getActiveSubscription() {
    try {
        const response = await Get<TickSubScriptionData>(URL.getActiveSubscription);
        debugApi(`[Subscription:Fetch]Get active subscription}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching your subscription', { error });
        throw new Error(`Error while fetching details for subscription`);
    }
}

export async function subscribeTenant(request: TickSubscribeRequest) {
    try {
        const response = await Post<SubscriptionProgressResponse>(URL.subscribe, request);

        debugApi(`[Subscription:Subscribe]subscribe to plan}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while subscribing', { error });
        throw new Error(`Error while subscribing`);
    }
}

export async function getCurrentPeriodUsage() {
    try {
        const response = await Get<BillingPeriodData>(URL.currentPeriodUsage);
        debugApi(`[Subscription:Current usage] got current period usage for a total of (${response.data.totalAmountWithoutDiscount})}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while getting current period usage', { error });
        throw new Error(`Error while getting current period usage`);
    }
}

export async function getAvailablePlans() {
    try {
        const response = await Get<TickSubscriptionPlan[]>(URL.availablePlans);
        debugApi(`[PLANS:Fetch]Get active plans}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while fetching available plans', { error });
        throw new Error(`Error while fetching plans`);
    }
}

export async function removeTenant(req: TickRemoveTenantRequest) {
    try {
        const response = await Post<RemoveTenantProgress>(URL.removeTenant, req);
        debugApi(`[Renant:remove]Remove the tenant and all its data}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while removing tenant', { error });
        throw new Error(`Error while removing tenant`);
    }
}
