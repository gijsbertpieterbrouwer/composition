import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import useAppStore from "@/store/app";
import { RtcBaseUrl } from "@/services/urls";
import { debug, error, warn } from '@/log';
import { watch } from "vue";

// eslint-disable-next-line @typescript-eslint/ban-types
export type Callback = Function;

let initialized = false;
let connection: HubConnection;

let events: Record<string, Callback[]> = {};
let onReconnectEvents: { subscriber: string, callback: Callback }[] = [];
let pendingRequests: { methodName: string, data: unknown }[] = [];

export function reset() {
  pendingRequests = [];
  onReconnectEvents = [];
  events = {};
  initialized = false;

  disconnect();
}

function invoke(methodName: string, data: unknown) {
  debug(`[RTC:Invoke] ${methodName}`);

  if (connection.state !== HubConnectionState.Connected) {
    debug(`[RTC:suspend] request ${methodName}`);
    pendingRequests.push({ methodName, data });
    return;
  }

  connection.invoke(methodName, data).catch(function (err) {
    return error(err.toString());
  });
}

function invokePendingRequests() {
  if (!pendingRequests || !pendingRequests.length) { return; }

  debug(`[RTC:Invoke] invoking ${pendingRequests.length} pending requests…`);
  // retry all pending requests
  pendingRequests.splice(0, pendingRequests.length).forEach(
    ({ methodName, data }) => invoke(methodName, data)
  );
}

function invokeOnReconnect() {
  if (!onReconnectEvents || !onReconnectEvents.length) { return; }

  debug(`[RTC:Invoke onReconnectEvents] invoking ${onReconnectEvents.length} callbacks`);
  // retry all pending requests
  onReconnectEvents.forEach(
    (p) => p.callback()
  );
}

async function connect(token: string) {
  const logLevel = (process.env.VUE_APP_LOGDEBUG === "true") ? LogLevel.Debug : LogLevel.Warning;

  connection = new HubConnectionBuilder()
    .configureLogging(logLevel)
    .withUrl(`${RtcBaseUrl()}?Token=${token}`, {
      //learn via: https://learn.microsoft.com/en-us/javascript/api/@microsoft/signalr/ihttpconnectionoptions?view=signalr-js-latest

      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
      logMessageContent: false,


    })
    // eslint-disable-next-line no-sparse-arrays
    .withAutomaticReconnect([0,
      5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000,
      5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000,
      5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000,
      5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000,
      5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000,
      5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000,
      5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000,
      5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000,
      5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, // 10 minutes have passed
      10000, 20000, 30000, 30000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000,
      60000, 60000, 60000, 60000, 60000, 60000, , 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000,
      60000, 60000, 60000])
    .build();



  connection.start().then(() => {
    invokePendingRequests();
    useAppStore().rtcConnected = true;
  }).catch((err) => error(err));

  //--

  connection.onreconnecting(() => {
    warn("[rtc:reconnecting] connection stopped, trying to reconnect…");
    useAppStore().rtcConnected = false;
  });

  connection.onreconnected(() => {
    // ConnectionId can be changed even the server can be restarted => allow for re subscribe

    debug("[rtc:reconnected] connection restored!!");
    invokeOnReconnect();
    invokePendingRequests();
    useAppStore().rtcConnected = true;
  });

  connection.onclose(() => {
    warn("[rtc:connection closed] connection closed.");
    useAppStore().rtcConnected = true;
  });
}

export function disconnect() {
  if (!connection) {
    useAppStore().rtcConnected = false;
    return;
  }
  connection.stop().then(() => {
    useAppStore().rtcConnected = false;
    debug("[rtc: connection stopped] connection stopped.");
  });
}

function assertConnection() {
  if (initialized) { return; }
  debug("[RTC: CONNECT]");

  const appStore = useAppStore();
  watch(() => appStore.token, (token) => {
    if (token) {
      connect(token);
    } else {
      debug("[rtc:Disconnect] disconnect because of no token");
      disconnect();
    }
  });

  if (useAppStore().token) {
    connect(useAppStore().token);
  }

  initialized = true;
}


export function subscribeToReconnect(subscriber: string, callback: Callback) {
  debug(`[RTC:${subscriber}] subscribe to onReconnect`);

  // check if already exists
  if (!onReconnectEvents.some(p => p.subscriber == subscriber)) {
    onReconnectEvents.push({
      subscriber: subscriber,
      callback: callback,
    })
  }
}

export function on(eventName: string, callback: Callback) {
  debug(`[RTC:${eventName}] subscribe to ${eventName}`);
  assertConnection();
  if (!connection) { return; }

  // no event with this name exists => create a listener for it on the connection
  if (!events[eventName]) {
    events[eventName] = [];

    connection.on(eventName, (args, arg2, arg3) => {
      debug(`[RTC:On] event ${eventName}`);
      if (!events[eventName]) {
        warn(`[rtc:on] ${eventName} has no listening events`);
        return;
      }

      events[eventName].forEach(cb => cb(args, arg2, arg3));
    });
  }

  // add callback to events
  events[eventName].push(callback);
}

export function off(eventName: string) {
  if (!events[eventName]) { return; }

  connection.off(eventName);
  delete events[eventName];
}

export function call<T = unknown>(methodName: string, data: T) {
  //  debug(`[RTC:Call] call ${methodName}`);

  assertConnection();

  invoke(methodName, data);
}
