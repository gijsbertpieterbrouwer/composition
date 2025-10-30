/* eslint-disable @typescript-eslint/no-unused-vars */
import { debugAction } from "@/log";
import { endVoiceConnectionOnServer, getVoiceConnectionTokenFromServer, linkVoiceCallToTicketOnServer, startVoiceConnectionOnServer } from "@/services/voiceService";
import { TickCallSummary } from "@/TickApi";
import { defineStore } from "pinia";
import { computed, ref } from 'vue';
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
  token: string | null;
  autoConnect?: boolean;
  defaultChannelId?: string;
  connected: boolean;

  voiceStatus: VoiceCenterStatus;
  callStatus: VoiceCallStatus;
  currentCallData: TickCallSummary | null;
}

const useVoiceStore = defineStore("voice", () => {
  // State as refs (allow null/undefined for token, currentCallData)
  const token = ref<string | null>(null);
  const autoConnect = ref<boolean | null>(null);
  const defaultChannelId = ref<string | null>(null);
  const connected = ref(false);

  const voiceStatus = ref(VoiceCenterStatus.InActive);
  const callStatus = ref(VoiceCallStatus.Nothing);
  const currentCallData = ref<TickCallSummary | null>(null);

  // Getters as computed
  const hasToken = computed(() => token.value != null);

  const activeCallId = computed(() => currentCallData.value?.callId ?? '');

  // Actions as functions
  const setDefaultChannel = (channelId: string) => {
    debugAction("[Voice:Default] storing default channel");
    defaultChannelId.value = channelId;
  };

  const getVoiceToken = async (): Promise<string | null> => {
    debugAction("[Voice:Start] Starting voice connection");

    try {
      const d = await getVoiceConnectionTokenFromServer({
        deviceId: useAppStore().deviceId ?? undefined,
      });
      token.value = d.token ?? null;
      return d.token ?? null;
    } catch {
      token.value = null;
      return null;
    }
  };

  const startVoiceConnection = async (): Promise<boolean> => {
    try {
      await startVoiceConnectionOnServer({
        deviceId: useAppStore().deviceId ?? undefined,
      });
      connected.value = true;
      return true;
    } catch {
      return false;
    }
  };

  const endVoiceConnection = async (): Promise<boolean> => {
    try {
      await endVoiceConnectionOnServer({
        deviceId: useAppStore().deviceId ?? undefined,
      });
      token.value = null;
      return true;
    } catch {
      return false;
    }
  };

  const linkVoiceCallToTicket = async (ticketId: string): Promise<void> => {
    if (!activeCallId.value) return;

    try {
      const linkedTicketSummary = await linkVoiceCallToTicketOnServer({
        callId: activeCallId.value,
        ticketId: ticketId,
      });
      if (currentCallData.value) {
        currentCallData.value.ticketSummary = linkedTicketSummary;
      }
    } catch (e) {
      console.error('Error linking voice call to ticket:', e);
    }
  };

  // Commented action preserved
  // const getCallInfoByCallId = async (callId: string): Promise<void> => {
  //   if (currentCallData.value?.callId === callId) { return; }
  //   try {
  //     const d = await getVoiceCallInfo({
  //       workspaceId: useUserStore().activeWorkspaceId,
  //       callId: callId,
  //       externalCallId: null,
  //     });
  //     currentCallData.value = d;
  //   } catch (e) {
  //     console.error('Error getting call info:', e);
  //   }
  // };

  return {
    // State
    token,
    autoConnect,
    defaultChannelId,
    connected,
    voiceStatus,
    callStatus,
    currentCallData,

    // Getters
    hasToken,
    activeCallId,

    // Actions
    setDefaultChannel,
    getVoiceToken,
    startVoiceConnection,
    endVoiceConnection,
    linkVoiceCallToTicket,
    // getCallInfoByCallId,  // Uncomment if needed
  };
}, {
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.voice,
      storage: getTickStorage(PiniaStorageType.Local, true),
    },
  ],
});

export default useVoiceStore;