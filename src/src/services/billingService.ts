import * as LOG from "@/log";
import { debugApi } from "@/log";
import { Get, Post } from "@/services/Server";
import URL from "@/services/urls";
import { PaymentProgressResponse, TickBillingInfo, TickInvoice } from "@/TickApi";

export async function getBillingInfo() {
    try {
        const response = await Get<TickBillingInfo[]>(URL.getBillingInfo);
        debugApi(`[Billing:FETCH] success`);
        return response.data;
    } catch (error) {
        LOG.error('Error while getting invoices', { error });
        throw new Error(`Error while getting invoices`);
    }
}

export async function getInvoicesLast12Months() {
    try {
        const response = await Get<TickInvoice[]>(URL.getInvoicesLast12months);
        debugApi(`[Invoices:FETCH] got ${response.data} invoices}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while getting invoices', { error });
        throw new Error(`Error while getting invoices`);
    }
}

export async function startManualInvoicePayment(id: string) {
    try {
        const response = await Post<PaymentProgressResponse>(URL.startManualInvoicePayment + `/${id}`);
        debugApi(`[Invoices:PAY] start payment on  ${id}}`);
        return response.data;
    } catch (error) {
        LOG.error('Error while starting invoice payment', { error });
        throw new Error(`Error while starting invoice payment`);
    }
}

export async function revokeMandate() {
    try {
        const response = await Post<unknown>(URL.revokeMandate);
        debugApi(`[Mandate:Revoke] Revoking mandate`);
        return response.data;
    } catch (error) {
        LOG.error('Error while revoking mandate', { error });
        throw new Error(`Error while revoking mandate`);
    }
}

export async function createMandate() {
    try {
        const response = await Post<PaymentProgressResponse>(URL.createMandate);
        debugApi(`[Mandate:Create] Revoking mandate`);
        return response.data;
    } catch (error) {
        LOG.error('Error while creating mandate', { error });
        throw new Error(`Error while creating mandate`);
    }
}