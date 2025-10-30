import mitt, { Emitter } from 'mitt';

export interface startPhoneCallEventData {
  phoneNumber: string,
  channelId: string,
  communicatorId: string,
  communicatorAddressId: string,
}

export enum VoiceEventType {
  startPhoneCall = "startPhoneCall",
}

type VoiceEvents = {
  [VoiceEventType.startPhoneCall]: startPhoneCallEventData;
};

const voiceEmitter = mitt();
export default voiceEmitter as unknown as Emitter<VoiceEvents>;
