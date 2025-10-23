import { debug } from '@/log';
import { call, Callback, on, subscribeToReconnect } from "@/services/RtcHub";

export abstract class RtcHubInstance {
  protected initialized = false;
  protected subscribedIds: string[] = [];

  protected abstract rtcName: string;

  protected abstract subscribeToEvents(): void;
  protected abstract startSubscription(id: string): void;
  protected abstract endSubscription(id: string): void;

  public reset() {
    debug(`Resetting ${this.rtcName} `);
    //this.unsubscribe();
    this.initialized = false;
  }

  protected assertEventSubscription() {
    if (this.initialized) {
      debug("already initialized");
      return;
    }
    this.initialized = true;

    this.subscribeToEvents();

    subscribeToReconnect(this.rtcName, () => {
      this.subscribedIds.splice(0, this.subscribedIds.length).forEach(
        (p) => this.subscribe(p)
      );
    });
  }

  protected call(method: string, params: unknown) {
    this.assertEventSubscription();
    call(method, params);
  }

  protected on(event: string, callback: Callback) {
    on(event, callback);
  }


  public subscribe(id: string) {
    this.assertEventSubscription();

    if (this.subscribedIds.find((sid) => sid === id)) {
      debug(`[RTC:Subscribe] already subscribed to details: ${id}`);
      return;
    }

    this.startSubscription(id);

    this.subscribedIds.push(id);

    debug(`[RTC:Subscribe] subscribed to details: ${id}`);
  }

  public unsubscribe(id?: string) {
    // No id supplied: unsubscribe from all
    const idsToUnsubscribe = (id) ? [id] : this.subscribedIds;
    // TODO: fixme
    if (!idsToUnsubscribe.length) { return; }

    idsToUnsubscribe.forEach((id) => {
      if (!this.subscribedIds.includes(id)) { return; }

      this.subscribedIds.splice(this.subscribedIds.indexOf(id), 1);

      this.endSubscription(id);

      debug(`[RTC:Unsubscribe] unsubscribed from details: ${id}`);
    })
  }

  public hasSubscription(id: string): boolean {
    return !!this.subscribedIds.find((sid) => sid === id);
  }
}
