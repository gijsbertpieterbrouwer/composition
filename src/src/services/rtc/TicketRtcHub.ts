import { call, on } from "@/services/RtcHub";
import { debug } from "@/log";
import {
  MetaDataComponentDeletion,
  MetaDataComponentUpdate,
  TicketUpdate,
  TimelineDataItem,
} from "@/TickApi";
import useTicketsStore from "@/store/tickets";
import { RtcHubInstance } from "./RtcHubInstance";

class TicketRtcHub extends RtcHubInstance {
  protected rtcName = "ticketRTC";

  protected subscribeToEvents() {
    debug(`[Ticket RTC:Subscribe] subscribed to details`);

    on("IncomingTicketTimelineDataItem", (ticketId: string, data: TimelineDataItem) => {
      useTicketsStore().patchTimeline(ticketId, [data]);
    });

    on("IncomingTicketUpdate", (ticketId: string, data: TicketUpdate) => {
      useTicketsStore().patchTimeline(ticketId, data.timelineItems);

      if (data.hasFlowUpdate) {
        useTicketsStore().patchTicketFlow(ticketId, data.currentFlowInstanceDefinitionId);
      }
    });

    on("IncomingMetaDataComponentUpdate", (ticketId: string, data: MetaDataComponentUpdate) => {
      useTicketsStore().patchMetaDataComponent(ticketId, data);
    });

    on("IncomingMetaDataComponentDeletion", (ticketId: string, data: MetaDataComponentDeletion) => {
      useTicketsStore().removeMetaDataComponents(ticketId, data);
    });

  }

  protected startSubscription(ticketId: string) {
    call("subscribeToTicketDetails", {
      TicketId: ticketId,
      Active: true,
    });
  }

  protected endSubscription(ticketId: string) {
    call("subscribeToTicketDetails", {
      TicketId: ticketId,
      Active: false,
    });
  }

}

export default new TicketRtcHub();
