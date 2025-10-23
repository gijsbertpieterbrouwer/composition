import * as LOG from "@/log";
import { debugApi } from "@/log";
import { Get } from "@/services/Server";
import URL from "@/services/urls";
import { TickNotification } from "@/TickApi";

export async function getNotifications() {
    try {
        const response = await Get<TickNotification[]>(URL.getNotifications);
        debugApi(`[NOTIFICATIONS:FETCH] success`);
        return response.data;
    } catch (error) {
        LOG.error('Error while getting notifications', { error });
        throw new Error(`Error while getting notifications`);
    }
}

export async function resolveNotification(item: TickNotification) {
    try {
        const response = await Get<never>(URL.resolveNotifications + `/${item.id}`);
        debugApi(`[NOTIFICATIONS:Resolve] success`);
        return response.data;
    } catch (error) {
        LOG.error('Error while resolving notification', { error });
        throw new Error(`Error while resolving a notification`);
    }
}
