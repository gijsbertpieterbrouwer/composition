/* eslint-disable @typescript-eslint/no-unused-vars */
import { debugAction } from "@/log";
import { endVoiceConnection, getVoiceConnectionToken, linkVoiceCallToTicket, startVoiceConnection } from "@/services/voiceService";
import { TickCallSummary } from "@/TickApi";
import { _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import useAppStore from "./app";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";

export enum VoiceCenterStatus {
  InActive,
  BootingUp,
  Registered,
}

export enum VoiceCallStatus {
  Nothing,
  Ringing,
  PendingAcceptance,
  Calling
}

interface State {
  token: string;
  autoConnect?: boolean;
  defaultChannelId?: string;
  connected: boolean;

  voiceStatus: VoiceCenterStatus;
  callStatus: VoiceCallStatus;
  currentCallData: TickCallSummary

}

interface Getters extends _GettersTree<State> {
  hasToken(state: State): boolean;
  activeCallId(state: State): string;
}

interface Actions {
  getVoiceToken(): Promise<string>;
  endVoiceConnection(): Promise<boolean>;
  startVoiceConnection(): Promise<boolean>;
  setDefaultChannel(channelId: string): void
  linkVoiceCallToTicket(ticketId: string): void;

  //processCall(status: VoiceCallStatus, call: Call): void;
}

const useVoiceStore = defineStore<"voice", State, Getters, Actions>("voice", {
  state: () => ({
    token: null,
    autoConnect: null,
    connected: false,
    defaultChannelId: null,

    voiceStatus: VoiceCenterStatus.InActive,
    callStatus: VoiceCallStatus.Nothing,
    currentCallData: null,
  }),
  getters: {
    hasToken: (state) => {
      return state.token != null
    },
    activeCallId: (state) => {
      return state.currentCallData?.callId;
    },
  },
  actions: {
    setDefaultChannel(channelId: string) {
      debugAction("[Voice:Default] storing default channel");
      this.defaultChannelId = channelId;
    },
    async getVoiceToken() {

      debugAction("[Voice:Start] Starting voice connection");

      const result = await getVoiceConnectionToken({
        deviceId: useAppStore().deviceId,
      }).then((d) => {
        this.token = d.token;
        return d.token;
      }).catch(() => {
        this.token = null;
        return null;
      });
      return result;
    },
    async startVoiceConnection() {
      await startVoiceConnection({
        deviceId: useAppStore().deviceId,
      }).then((d: unknown) => {
        this.connected = true;
      });
      return true;
    },
    async endVoiceConnection() {
      await endVoiceConnection({
        deviceId: useAppStore().deviceId,
      }).then((d: unknown) => {
        this.token = null;
      });
      return true;
    },
    async linkVoiceCallToTicket(ticketId: string) {
      linkVoiceCallToTicket({
        callId: this.activeCallId,
        ticketId: ticketId,
      }).then((linkedTicketSummary) => {
        this.currentCallData.ticketSummary = linkedTicketSummary;
      });
    },

    // async getCallInfoByCallId(callId: string) {
    //   if (this.currentCallData?.callId == callId) { return; }
    //   getVoiceCallInfo({
    //     workspaceId: useUserStore().activeWorkspaceId,
    //     callId: callId,
    //     externalCallId: null,
    //   }).then((d) => {
    //     this.currentCallData = d;
    //   })
    // }


  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.voice,// "tick-voice",
      storage: getTickStorage(PiniaStorageType.Local, true),
    },
  ],
});

export default useVoiceStore;
