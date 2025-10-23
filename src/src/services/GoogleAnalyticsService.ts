import * as LOG from "@/log";
import { event } from 'vue-gtag'

export enum eventTrackEventType {
    Login = "login",
    ViewItem = "view_item",
}
export enum eventTrackEventCategory {
    ecommerce = "ecommerce",
    engagement = "engagement",
}

export function addRoutingEventTrack(route: string, id: string): void {
    id = id || "";

    if (id) {
        LOG.debugAnalytics(`[ANALYTICS:TRACK] track route to ${route} with id: ${id}`);
    } else {
        LOG.debugAnalytics(`[ANALYTICS:TRACK] track route to ${route}`);
    }

    addEventTrack(eventTrackEventType.ViewItem, eventTrackEventCategory.engagement, route, id);
}


export function addEventTrack(eventType: eventTrackEventType, eventCategory: eventTrackEventCategory, label: string, val: string): void {
    event(eventType, { event_category: eventCategory, event_label: label, value: val });
}