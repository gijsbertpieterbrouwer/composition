<template>
  <div class="voice-center" v-if="allowVoiceConnection"
    :class="{ 'slide-in': showVoiceCenter, 'slide-out': !showVoiceCenter, 'is-calling': callStatus == VoiceCallStatus.Calling, 'is-pending': callStatus == VoiceCallStatus.PendingAcceptance, 'is-ringing': callStatus == VoiceCallStatus.Ringing }">

    <div class="main-actions">


      <template v-if="callStatus == VoiceCallStatus.PendingAcceptance">
        <CommunicatorIcon class="icon" v-if="communicator" :communicator="communicator" :address="activePhoneCallNumber" :sizePx="35" :showName="true" />
        <TickButton @click.stop="declineCall" icon="phone-off" :appearance="Appearance.primary" :color="Color.failure">{{ $translate(LanguagePath.App_VoiceCenter_Pending_Decline_Title) }}
        </TickButton>
        <!-- <TickButton @click="acceptCall" icon="phone" :appearance="Appearance.primary" :color="Color.affirm">Accept</TickButton> -->
        <TickComboButton icon="phone" @click="acceptCall" :options="acceptOptions" :appearance="Appearance.primary" :color="Color.affirm">{{
          $translate(LanguagePath.App_VoiceCenter_Pending_Accept_Title) }}
        </TickComboButton>
      </template>
      <template v-else-if="callStatus == VoiceCallStatus.Ringing">
        <CommunicatorIcon class="icon" v-if="communicator" :communicator="communicator" :address="activePhoneCallNumber" :sizePx="35" :showName="true" />

        <TickButton @click.stop="endCall" icon="phone-off" :appearance="Appearance.primary" :color="Color.failure">{{ $translate(LanguagePath.App_VoiceCenter_Ringing_Cancel_Title) }}</TickButton>
        <!-- <TickComboButton icon="phone" @click="acceptCall" :options="acceptOptions" :appearance="Appearance.primary" :color="Color.affirm">{{
            $translate(LanguagePath.App_VoiceCenter_Pending_Accept_Title) }}
          </TickComboButton> -->

      </template>

      <template v-else-if="callStatus == VoiceCallStatus.Calling">
        <!-- CALLING -->
        <CommunicatorIcon class="icon" v-if="communicator" :communicator="communicator" :address="activePhoneCallNumber" :sizePx="30" :showName="true" />
        <TickButton @click.stop="endCall" icon="phone-off" :appearance="Appearance.primary" :color="Color.failure" :size="activeCallButtonSize" :round="true"
          :title="$translate(LanguagePath.App_VoiceCenter_Calling_EndCall_Title)" />


        <TickButton @click.stop="toggleCallOnHold" :busy="busyPuttingActivePhoneCallOnHold" :icon="holdIcon" :appearance="Appearance.secondary" :color="Color.contrast" :size="activeCallButtonSize"
          :round="true" :title="holdTitle" />

        <TickButton @click.stop="transferCall" icon="phone-forward" :appearance="Appearance.secondary" :color="Color.contrast" :size="activeCallButtonSize" :round="true"
          :title="$translate(LanguagePath.App_VoiceCenter_Transfer_Title)" />


        <template v-if="!ticketIsAlreadyOpen">
          <TickButton v-if="hasTicket" @click="openRelatedTicket" icon="ticket" :appearance="Appearance.secondary" :color="Color.contrast" :size="activeCallButtonSize">
            {{ $translate(LanguagePath.App_VoiceCenter_Actions_Ticket_View_Title) }}</TickButton>
          <TickButton v-else-if="hasCommunicator" @click="createTicket" icon="plus" :appearance="Appearance.secondary" :color="Color.contrast" :size="activeCallButtonSize">
            {{ $translate(LanguagePath.App_VoiceCenter_Actions_Ticket_Create_Title) }}</TickButton>



        </template>
        <TickButton v-if="currentlyOnTicketScreen && !ticketIsAlreadyOpen" @click="linkVoiceCallToTicket" icon="link" :appearance="Appearance.secondary" :color="Color.contrast"
          :size="activeCallButtonSize">
          {{ $translate(LanguagePath.App_VoiceCenter_Actions_Ticket_Link_Title) }}</TickButton>
      </template>
      <template v-else-if="!autoConnect && voiceCenterStatus == VoiceCenterStatus.InActive">
        <!-- INACTIVE No AutoConnect  -->
        <TickButton @click="connect" :appearance="Appearance.secondary" :color="Color.contrast" :size="activeCallButtonSize">{{
          $translate(LanguagePath.App_VoiceCenter_Actions_StartConnection_Title) }}
        </TickButton>
      </template>



      <!-- <template v-else>
        <TickButton v-if="!autoConnect" @click="connect" :appearance="Appearance.secondary" :color="Color.contrast" :size="activeCallButtonSize">{{
          $translate(LanguagePath.App_VoiceCenter_Actions_StartConnection_Title) }}
        </TickButton>
      </template> -->
    </div>

  </div>
</template>

<script lang="ts">
import CommunicatorIcon from '@/components/atoms/CommunicatorIcon.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickComboButton from '@/components/atoms/TickComboButton.vue';
import { DropdownOption } from '@/components/atoms/TickDropdown.vue';
import { TickPanelOptions } from '@/components/atoms/TickPanel.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import { openCommunicationStartPanel } from '@/components/panels/CommunicationStartPanel.vue';
import { openTicketCreatorPanel } from '@/components/panels/TicketCreatorPanel.vue';
import { openUsersAndTeamsItemPanel, usersAndTeamsSelection } from '@/components/panels/UsersAndTeamsPanel.vue';
import TickIcon from '@/components/TickIcon.vue';
import { askConfirmation } from '@/helpers/questionHelper';
import voiceEmitter, { VoiceEventType } from '@/helpers/voiceEventBus';
import { debugAction } from '@/log';
import { TickDom } from '@/main';
import { translate } from '@/plugins/translatePlugin';
import { RouterToTicket, ViewName } from '@/router';
import { AppVersion } from '@/services/urls';
import { createVoiceCallOnServer, declineVoiceCallFromServer, getVoiceCallInfoFromServer, holdVoiceCallOnServer, transferVoiceCallOnServer } from '@/services/voiceService';
import useAppStore from '@/store/app';
import useTicketsStore from '@/store/tickets';
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import useVoiceStore, { VoiceCallStatus, VoiceCenterStatus } from '@/store/voice';
import { AssigneeTypeEnum, CommunicationType, LanguagePath, ParticipantsTypeEnum, TickCommunicatorSummary } from '@/TickApi';
import { Call, Device } from '@twilio/voice-sdk';
import { Component, Vue } from 'vue-facing-decorator';


//TWILIO DEVICE has issues with reactivity, if reactive simple things like accepting a call are not working.



export function getVoiceDevice(): Device {
  return (document as TickDom).Tick?.VoiceDevice as Device;
}
function setVoiceDevice(to: Device) {
  const d = (document as TickDom);
  if (!d.Tick) { d.Tick = {}; }
  d.Tick.VoiceDevice = to;
}

function getVoiceCall(): Call {
  return (document as TickDom).Tick?.VoiceCall as Call;
}
function setVoiceCall(to: Call) {
  const d = (document as TickDom);
  if (!d.Tick) { d.Tick = {}; }
  d.Tick.VoiceCall = to;
}




@Component({
  components: { TickButton, TickIcon, CommunicatorIcon, TickComboButton, TickSelector },
  emits: [],
})
export default class TickVoiceCenter extends Vue {
  Appearance = Appearance;
  Color = Color;
  Size = Size;
  LanguagePath = LanguagePath
  VoiceCenterStatus = VoiceCenterStatus;
  VoiceCallStatus = VoiceCallStatus;

  private startingUp = true;

  //private isConnected = false;
  private eventsRegistered = false;

  private pollTimeMs = 10000;
  private activePhoneCallNumber: string = null;

  //private activePhoneCallId: string = null;
  private activePhoneCallExternalId: string = null;
  private activePhoneCallOnHold = false;
  private busyPuttingActivePhoneCallOnHold = false;

  // private get internalVoiceStatus() {
  //   return useVoiceStore().voiceStatus;
  // }
  // private set internalVoiceStatus(to) {
  //   useVoiceStore().voiceStatus = to;
  // }
  // private get internalCallStatus() {
  //   return useVoiceStore().callStatus;
  // }
  // private set internalCallStatus(to) {
  //   useVoiceStore().voiceStatus= to;
  // }

  private get currentCallData() {
    return useVoiceStore().currentCallData;
  }
  private set currentCallData(to) {
    useVoiceStore().currentCallData = to;
  }

  private get voiceCenterStatus() {
    return useVoiceStore().voiceStatus
  }

  // private set voiceCenterStatus(to: VoiceCenterStatus) {
  //   if (this.internalVoiceStatus == to) { return; }
  //   this.internalVoiceStatus = to;
  //   console.log("setting voice to", to);
  //   // this.$forceUpdate();
  // }

  private get callStatus() {
    return useVoiceStore().callStatus;
  }

  // private set callStatus(to: VoiceCallStatus) {
  //   if (this.internalCallStatus != to) { console.log("setting call to", to); }
  //   this.internalCallStatus = to;

  //   //this.$forceUpdate();
  // }


  private get activeCallButtonSize() {
    return Size.regular;
  }

  private debugVoice(action: string, message: string) {
    debugAction(`[VOICE:${action}] ${message}`);
  }

  private get acceptOptions(): DropdownOption[] {
    const options = [
      {
        // icon: "edit",
        id: "transfer",
        text: translate(LanguagePath.App_VoiceCenter_Transfer_Title),
        onSelect: () => {
          this.transferCall();
        }
      },
    ];

    return options;
  }

  private get hasTicket(): boolean {
    return this.currentCallData?.ticketSummary != null;
  }
  private get hasCommunicator(): boolean {
    return this.communicator != null;
  }

  private get communicator() {
    const cp = this.currentCallData?.participants.find(p => p.type == ParticipantsTypeEnum.Communicator && p.jsonData != null)
    const c = cp ? JSON.parse(cp.jsonData) as TickCommunicatorSummary : null;
    return c;
  }

  private get ticketIsAlreadyOpen(): boolean {
    if (!this.hasTicket) { return false }

    return this.activeTicketId && this.activeTicketId == this.currentCallData?.ticketSummary?.id;
  }

  private get currentlyOnTicketScreen() {
    return useAppStore().route?.name == ViewName.Tickets;
  }
  private get activeTicketId(): string {
    if (!this.currentlyOnTicketScreen) { return null; }
    return useTicketsStore().activeTicketId;
  }

  private openRelatedTicket() {
    if (!this.hasTicket) { return false; }
    RouterToTicket(this.currentCallData.ticketSummary?.id);
  }



  private createTicket() {
    if (!this.hasCommunicator) { return false; }
    openTicketCreatorPanel(this.communicator?.id, true)
  }


  private get showVoiceCenter(): boolean {
    if (this.startingUp) { return false; }
    const showCallStatusses = [VoiceCallStatus.Calling, VoiceCallStatus.PendingAcceptance, VoiceCallStatus.Ringing];
    const callBusy = showCallStatusses.some(a => a == this.callStatus);

    const needingManualBoot = !this.autoConnect && this.voiceCenterStatus == VoiceCenterStatus.InActive;

    return callBusy || needingManualBoot;
  }

  private get isFirstTime() {
    return useVoiceStore().autoConnect == null;
  }

  private get autoConnect() {
    return useVoiceStore().autoConnect ?? false;
  }

  private set autoConnect(to: boolean) {
    useVoiceStore().autoConnect = to ?? false;
  }

  private get allowVoiceConnection(): boolean {
    return this.hasPhoneChannel
  }

  private get hasToken(): boolean {
    return useVoiceStore().hasToken;
  }

  private get voiceToken() {
    return useVoiceStore().token;
  }

  private get hasPhoneChannel() {
    return useUtilityDataStore().utilityData?.communicationChannels?.some(p => p.communicationType == CommunicationType.Phone);
  }

  unmounted() {
    var device = getVoiceDevice();
    if (device) { device.disconnectAll(); }
  }

  mounted() {
    if (this.hasToken) {
      debugAction("HasToken", "Token available, use it")
      this.onStartConnection(this.voiceToken);
    }

    setTimeout(() => {
      this.startingUp = false;
      this.checkConnection();
    }, 1000);

    this.initializeEventBus();
  }

  private initializeEventBus() {
    voiceEmitter.on(VoiceEventType.startPhoneCall, (data) => {
      this.startCall(data.phoneNumber, data.channelId, data.communicatorId, data.communicatorAddressId);
    });
  }

  private get availablePhoneChannels() {
    return useUtilityDataStore().utilityData.communicationChannels.filter(p =>
      p.communicationType == CommunicationType.Phone
      && p.enableOutboundMessages) || [];
  }

  private startCall(phoneNumber: string, requestChannelId: string, communicatorId: string, communicatorAddressId: string) {
    if (this.activePhoneCallNumber == phoneNumber) { return; }


    if (requestChannelId && this.availablePhoneChannels.find(p => p.id == requestChannelId)) {
      this.internalStartPhoneCall(phoneNumber, requestChannelId, communicatorId, communicatorAddressId);
    } else {

      const defaultChannelId = useVoiceStore().defaultChannelId;

      if (defaultChannelId && this.availablePhoneChannels.find(p => p.id == defaultChannelId)) {
        this.internalStartPhoneCall(phoneNumber, defaultChannelId, communicatorId, communicatorAddressId);
      } else {
        // choose from popup
        openCommunicationStartPanel(CommunicationType.Phone, (selection) => {
          if (selection.channelId) {
            this.internalStartPhoneCall(phoneNumber, selection.channelId, communicatorId, communicatorAddressId);
          }
        })
      }

    }
  }

  private internalStartPhoneCall(phoneNumber: string, channelId: string, communicatorId: string, communicatorAddressId: string) {
    if (phoneNumber) {
      this.debugVoice("call", `Calling ${phoneNumber} with channel: ${channelId}`)
      //return;
    }

    this.activePhoneCallNumber = phoneNumber;
    useVoiceStore().callStatus = VoiceCallStatus.Ringing;

    // call api to initiate the phone call
    createVoiceCallOnServer({
      workspaceId: useUserStore().activeWorkspaceId,
      deviceId: useAppStore().deviceId,
      phoneNumber: phoneNumber,
      useChannelId: channelId,
      communicatorId: communicatorId,
      communicatorAddressId: communicatorAddressId,
    }).then((d) => {
      useVoiceStore().currentCallData = d;
      useVoiceStore().callStatus = VoiceCallStatus.Ringing;
    });

  }

  private onEndConnection() {
    useVoiceStore().connected = false;
    getVoiceDevice().disconnectAll();
    useVoiceStore().endVoiceConnection();
  }
  private onStartConnection(token: string) {
    this.debugVoice('start connection', "Starting connection");
    this.setupDevice(token, true);
  }

  private setupDevice(token?: string, forceRegistering?: boolean) {
    const existingDevice = getVoiceDevice();


    if (!useVoiceStore().connected && this.voiceCenterStatus == VoiceCenterStatus.Registered) {
      this.debugVoice('SYNC SERVER', "Disparity between server and client, update server");
      useVoiceStore().startVoiceConnection();
    }

    if (!existingDevice) {
      this.eventsRegistered = false
    } else {

      if (existingDevice?.state == Device.State.Registered) {
        useVoiceStore().voiceStatus = VoiceCenterStatus.Registered;
      }


      if (existingDevice?.state != Device.State.Destroyed) {
        if (forceRegistering || existingDevice.state == Device.State.Unregistered) {
          this.registerDevice(existingDevice);
        }
        return;
      }
    }
    const device = existingDevice || new Device(token, {
      logLevel: 3, // warnings
      tokenRefreshMs: 30000,
      appName: "TICK-APP",
      allowIncomingWhileBusy: false,
      appVersion: AppVersion(),
      closeProtection: translate(LanguagePath.App_VoiceCenter_Calling_LeavingPageWarning_Title),
      codecPreferences: [Call.Codec.PCMU, Call.Codec.Opus], // pcmu better quality, opus, better quality in low data conditions
      enableImprovedSignalingErrorPrecision: true,
    });

    if (!this.eventsRegistered) {

      device.on('ready', () => {
        this.debugVoice('ready', "Device is ready");
      });

      device.on('tokenWillExpire', () => {
        this.debugVoice("token", "expiration imminent")
        this.retrieveNewToken();
      });

      device.on('tokenExpired', () => {
        this.debugVoice("token", "expired")
        this.retrieveNewToken();
      });

      device.on('incoming', (call: Call) => {
        this.debugVoice('Call', 'incoming call detected');
        useVoiceStore().callStatus = VoiceCallStatus.PendingAcceptance

        this.registerCallEvents(call);
        this.getCallInfoByCallInboundExternalCallId(call?.parameters?.CallSid);
      });

      device.on('connect', () => {
        this.debugVoice('Call', 'connected');
      });

      device.on('cancel', () => {
        this.debugVoice('Call', 'cancelled');
      });

      device.on('disconnect', () => {
        this.debugVoice('DISCONNECT', 'Device disconnected.');
      });

      device.on('error', () => {
        //if (error instanceof TwilioError.AuthorizationErrors.AccessTokenExpired 
        // || error instanceof TwilioError.AuthorizationErrors.AccessTokenInvalid) {

        // reset and try again

        useVoiceStore().token = null;
        setVoiceDevice(null);


        useVoiceStore().callStatus = VoiceCallStatus.Nothing;
        useVoiceStore().voiceStatus = VoiceCenterStatus.InActive;
        // this.retrieveNewToken();
        // }
        //else {
        //  console.error('Twilio.Device error:', error);
        //}
      });

      device.on('registrationError', (error) => {
        console.error('Registration error:', error);
      });

      device.on('registered', () => {
        this.debugVoice('registered', 'registration success');
        useVoiceStore().voiceStatus = VoiceCenterStatus.Registered;
        useVoiceStore().startVoiceConnection();
      });

      this.eventsRegistered = true;
    }

    if (token && (device.state == Device.State.Unregistered || device.state == Device.State.Destroyed)) {
      this.registerDevice(device);
    }

    setVoiceDevice(device);
  }

  private registerDevice(device: Device) {
    device.register().then(() => {
      useVoiceStore().voiceStatus = VoiceCenterStatus.Registered;
    }, (reason: string) => {
      this.debugVoice("failed", reason);
    });
  }

  private retrieveNewToken() {
    this.connect();
  }

  private acceptCall() {
    getVoiceCall().accept();
    useVoiceStore().callStatus = VoiceCallStatus.Calling;
  }

  private declineCall() {
    this.debugVoice("call", "Reject");
    const call = getVoiceCall();
    getVoiceCall()?.reject();
    this.registerCallEvents(null);
    declineVoiceCallFromServer({
      externalCallId: call?.parameters?.CallSid,
      workspaceId: useUserStore().activeWorkspaceId
    })
  }



  private endCall() {
    this.debugVoice("Call", "ending failed, disconnect directly")
    getVoiceCall()?.disconnect();

    // endVoiceCall(this.activePhoneCallId).then(() => {
    //   this.debugVoice("Call", "ended via API, waiting for reaction");
    //   //proactive reset state
    //   this.onCallStatusChange(null, true);
    // }, () => {
    //   this.debugVoice("Call", "ending failed, disconnect directly")
    //   getVoiceCall()?.disconnect();//this.call.disconnect();
    //   //setVoiceCall(null);// this.call = null;
    // });




  }

  private get holdIcon() {
    return this.activePhoneCallOnHold ? 'mic-off' : 'mic';
  }
  private get holdTitle() {
    return this.activePhoneCallOnHold ? translate(LanguagePath.App_VoiceCenter_Calling_Hold_Off_Title) : translate(LanguagePath.App_VoiceCenter_Calling_Hold_On_Title);
  }
  // private toggleMuteCall() {
  //   const call = getVoiceCall();
  //   if (this.activePhoneCallMuted) {
  //     //unmute
  //     call?.mute(false)
  //     this.activePhoneCallMuted = false;
  //   } else {
  //     //mute
  //     call?.mute(true)
  //     this.activePhoneCallMuted = true;
  //   }
  // }

  private toggleCallOnHold() {
    this.busyPuttingActivePhoneCallOnHold = true;
    holdVoiceCallOnServer(useVoiceStore().activeCallId, !this.activePhoneCallOnHold).then(() => {
      this.activePhoneCallOnHold = !this.activePhoneCallOnHold;
      this.busyPuttingActivePhoneCallOnHold = false;
    });
  }


  private transferCall() {
    var from = null;//getRefElementDOMRect(this, "transferCall");
    const panelOptions: TickPanelOptions = {
      title: "UsersAndTeamsSelector",
      allowAsSubDialog: true,
      from: from,
      showAsModal: from ? false : true,
    }

    openUsersAndTeamsItemPanel(panelOptions, translate(LanguagePath.App_VoiceCenter_Transfer_Title), [AssigneeTypeEnum.User, AssigneeTypeEnum.Team], true, (to: usersAndTeamsSelection) => {
      if (to?.userIds?.length > 0) {
        transferVoiceCallOnServer({
          workspaceId: useUserStore().activeWorkspaceId,
          toId: to.userIds[0],
          toType: ParticipantsTypeEnum.User,
          callId: useVoiceStore().activeCallId,
          fromDeviceId: useAppStore().deviceId
        });
        // const user = useUtilityDataStore().user(to.userIds[0])
        // if (user) {
        // }
      }

      if (to?.teamIds?.length > 0) {
        // const team = useUtilityDataStore().team(to.teamIds[0])
        // if (team) {
        //   handle = team.handle;
        // }
        transferVoiceCallOnServer({
          workspaceId: useUserStore().activeWorkspaceId,
          toId: to.teamIds[0],
          toType: ParticipantsTypeEnum.Team,
          callId: useVoiceStore().activeCallId,
          fromDeviceId: useAppStore().deviceId
        });
      }

    }, () => {
      this.debugVoice("Transfer", "closing user/team selector")
    });
  }

  private registerCallEvents(call: Call) {
    if (call) {
      useVoiceStore().voiceStatus = VoiceCenterStatus.Registered;

      this.debugVoice("Call", "listen to events")
      setVoiceCall(call)

      this.activePhoneCallExternalId = call?.parameters?.CallSid || null;

      call.on("accept", () => {
        this.debugVoice("Call", "accept call");
        useVoiceStore().callStatus = VoiceCallStatus.Calling;
      });

      call.on("cancel", () => {
        // hung up before answered
        this.debugVoice("Call", "call cancelled");
        useVoiceStore().callStatus = VoiceCallStatus.Nothing;
      });

      call.on("disconnect", () => {
        this.debugVoice("call", "disconnect");
        useVoiceStore().callStatus = VoiceCallStatus.Nothing;
      });

      call.on("error", () => {
        this.debugVoice("call", "error");
        useVoiceStore().callStatus = VoiceCallStatus.Nothing;
      });
    } else {
      this.debugVoice("Call", "no call, reset status");
      // no phone call
      useVoiceStore().callStatus = VoiceCallStatus.Nothing;
      this.activePhoneCallNumber = null;
      this.activePhoneCallExternalId = null;
      this.activePhoneCallOnHold = false;

    }


    this.$forceUpdate();

  }

  private pollConnection() {
    setTimeout(() => {
      this.checkConnection();
    }, this.pollTimeMs);
  }

  private checkConnection() {
    if (!useAppStore().authenticated) { return; }
    const existingDevice = getVoiceDevice();
    if (existingDevice) {
      this.setupDevice(null, null);
    } else {
      useVoiceStore().voiceStatus = VoiceCenterStatus.InActive;
      if (this.allowVoiceConnection) {
        if (this.isFirstTime) {
          askConfirmation((to: boolean) => {
            if (to) { this.connect(); }
          }, translate(LanguagePath.App_VoiceCenter_Connect_Confirmation_Title), true)

        } else if (this.autoConnect) {
          this.connect();
        }
      }


    }

    // // check current connection
    // const call = getVoiceCall();
    // if (call) {
    //   console.log("a")
    //     ; this.onCallStatusChange(call, true);
    // }

    this.pollConnection();
  }

  private connect() {
    this.autoConnect = true;

    this.debugVoice("START", "fetch token");
    useVoiceStore().getVoiceToken().then((token) => {
      if (token) {
        this.onStartConnection(token);
      }
    });
  }

  private disconnect() {
    useVoiceStore().endVoiceConnection().then(() => {
      this.onEndConnection();
    });
  }

  private getCallInfoByCallId(callId: string) {
    if (this.currentCallData?.callId == callId) { return; }
    getVoiceCallInfoFromServer({
      workspaceId: useUserStore().activeWorkspaceId,
      callId: callId,
      externalCallId: null,
    }).then((d) => {
      this.currentCallData = d;
      //this.activePhoneCallId = d.callId;
    })
  }

  private busyRetrievingCallData = false;
  private getCallInfoByCallInboundExternalCallId(externalCallId: string) {
    if (this.busyRetrievingCallData) { return; }

    this.busyRetrievingCallData = true;
    getVoiceCallInfoFromServer({
      workspaceId: useUserStore().activeWorkspaceId,
      callId: null,
      externalCallId: externalCallId,
    }).then((d) => {
      this.busyRetrievingCallData = false;
      this.currentCallData = d;
      //this.activePhoneCallId = d.callId;

      // auto accept if I am initiator
      const initiatorParticipant = d.participants.find(p => p.isCallInitiator);
      if (initiatorParticipant && useUserStore().isSelf(initiatorParticipant.participantObjectId)) {
        this.acceptCall();
      }

    })
  }

  private linkVoiceCallToTicket() {
    if (!this.currentlyOnTicketScreen) { return; }
    useVoiceStore().linkVoiceCallToTicket(this.activeTicketId);
  }


}
</script>
<style lang="scss">
@import "@/styles/theme";

@keyframes slide-in {
  0% {
    transform: translate(-50%, -110%) scale(1);
  }

  100% {
    transform: translate(-50%, 0%) scale(1);
  }
}

@keyframes slide-out {
  0% {
    transform: translate(-50%, 0%) scale(1);
  }

  100% {
    transform: translate(-50%, -500%)scale(1);
  }
}

.voice-center {
  //min-width: 300px;
  justify-content: center;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  z-index: 9999999;
  height: auto !important;
  border-radius: 0px 0px 8px 8px;
  background-color: var(--c-base-100);
  border-bottom-right-radius: 16px;
  border-bottom-left-radius: 16px;
  padding: 10px 20px;
  font-size: $text-size-regular;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
  transform: translate(-50%, -100%);
  -webkit-transform: translate(-50%, -100%);

  &.is-calling {
    box-shadow: rgba(21, 255, 0, 0.16) 0px 10px 36px 0px, rgba(0, 255, 77, 0.616) 0px 0px 0px 1px;
  }

  &.is-pending,
  &.is-ringing {
    box-shadow: rgba(255, 0, 0, 0.16) 0px 10px 36px 0px, rgba(255, 0, 0, 0.616) 0px 0px 0px 1px;
  }

  &.slide-in {
    animation: slide-in 0.2s forwards;
    -webkit-animation: slide-in 0.2s forwards;
  }

  &.slide-out {
    animation: slide-out 0.2s forwards;
    -webkit-animation: slide-out 0.2s forwards;
  }

  .main-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;

  }
}
</style>