import { debug } from "@/log";
import { RtcHubInstance } from "@/services/rtc/RtcHubInstance";
import { on } from "@/services/RtcHub";
import useAppStore from "@/store/app";
import useTasksStore from "@/store/tasks";
import useTicketsStore from "@/store/tickets";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { TenantUpdate, TickAppNotification, TicketSummaries, TicketSummary, TickNotification, TickTaskInstanceSummary, UserEvent, UserEventType } from "@/TickApi";


class AppRtcHub extends RtcHubInstance {
  protected rtcName = "appRTC";
  protected subscribeToEvents(): void {
    debug(`[APP RTC:Subscribe] Subscribing to App events`);

    on("IncomingUserEvent", (serverData: Required<UserEvent>) => {
      switch (serverData.eventType) {
        case UserEventType.ForceLogOutDevices:
          useAppStore().logOut();
      }
    });

    on("IncomingAppNotification", (serverData: Required<TickAppNotification>) => {
      useAppStore().notify(serverData.type, serverData.title, serverData.message)
    });

    on("IncomingTenantUpdate", (serverData: Required<TenantUpdate>) => {
      useUtilityDataStore().patch(serverData.utilityDelta);
    });

    on("IncomingNotifications", (updates: Required<TickNotification[]>) => {
      useUserStore().patchNotifications(updates);
    });

    on("IncomingTaskSummary", (update: Required<TickTaskInstanceSummary>) => {
      useTasksStore().patchTaskSummary(update);
    });

    on("IncomingTicketSummary", (summary: Required<TicketSummary>) => {
      useTicketsStore().patchSummary(summary);
    });

    on("IncomingTicketSummaries", (summaries: Required<TicketSummaries>) => {
      useTicketsStore().patchSummaries(summaries);
    });
  }

  protected startSubscription(id: string) {
    debug(`[APP RTC:Subscribe] Subscribe to updates: ${id}`);
  }

  protected endSubscription(id: string) {
    debug(`[APP RTC:Unsubscribe] Unsubscribe from updates: ${id}`);
  }
}

const appRtcHub = new AppRtcHub();
export { appRtcHub };
