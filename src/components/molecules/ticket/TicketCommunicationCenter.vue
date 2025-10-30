<template>
  <div>
    <div class="notifications">
      <TypingIndicator class="typers" :userIds="typingUsers" :communicatorIds="typingCommunicators" :hideSelf="true" :knownCommunicators="involvedCommunicators" />
    </div>
    <div class="communication-center" :class="{ 'editMode': this.editMode }" :style="{ 'border-color': this.submitColorHex }">
      <button v-if="!editMode" class="focus-button" @click="focus">
        <div class="special-command">
          <ShortcutKey>//</ShortcutKey> <span class="description">{{ $translate(LanguagePath.App_Ticket_CommunicationCenter_Option_PublicReply) }}</span>
        </div>
        <div class="special-command">
          <ShortcutKey>/r</ShortcutKey> <span class="description">{{ $translate(LanguagePath.App_Ticket_CommunicationCenter_Option_CannedResponse) }}</span>
        </div>
        <div class="special-command">
          <ShortcutKey>/n</ShortcutKey> <span class="description">{{ $translate(LanguagePath.App_Ticket_CommunicationCenter_Option_InternalNote) }}</span>
        </div>
      </button>
      <TickCommunicationArea :ticketId="activeId" v-else :initialMessage="initialMessage" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import TickCommunicationArea from "@/components/molecules/ticket/TickCommunicationArea.vue";
import ShortcutKey from "@/components/atoms/ShortcutKey.vue";
import keyboard from "@/helpers/keyboard";
import emitter, { EditorEventType } from "@/helpers/editorEventBus";
import useTicketsStore, { MessageSendingType } from "@/store/tickets";
import { debug } from "@/log";
import { ColorsEnum, LanguagePath } from "@/TickApi";
import { getColorHex } from "@/helpers/colorsHelper";
import TypingIndicator from "@/components/atoms/TypingIndicator.vue";

@Component({
  components: { TickCommunicationArea, ShortcutKey, TypingIndicator },
})
export default class TicketCommunicationCenter extends Vue {
  private editMode = false;
  private initialMessage = "";
  private keyboardId: number = null;
  LanguagePath = LanguagePath
  @Prop() private activeId!: string;

  private get typingUsers() {
    return this?.ticket?.isTyping?.userIds || [];
  }

  private get typingCommunicators() {
    return this?.ticket?.isTyping?.communicatorIds || [];
  }

  private get involvedCommunicators() {
    return this?.ticket?.communicators || [];
  }

  mounted() {
    emitter.on(EditorEventType.editMode, () => {
      this.editMode = true;
    });

    this.keyboardId = keyboard.on("/", () => {
      this.initialMessage = "/";
      emitter.emit(EditorEventType.editMode);
    });

    this.keyboardId = keyboard.on("@", () => {
      this.initialMessage = "@";
      emitter.emit(EditorEventType.editMode);
    });

    // has draft? => Edit mode!

    const draft = this.draft;
    if (draft && (draft.messageMarkDown || draft.messageAttachmentFileIds.length)) {
      debug("[Ticket:Draft] draft found, enable edit mode");
      emitter.emit(EditorEventType.editMode);
      emitter.emit(EditorEventType.focus);
    }
  }
  private get submitColorHex() {
    return getColorHex(this.submitColor);
  }

  private get submitColor(): ColorsEnum {
    switch (this.messageSendingType) {
      case MessageSendingType.Public:
        return ColorsEnum.Blue;
      case MessageSendingType.Internal:
        return ColorsEnum.Yellow
      case MessageSendingType.External:
        return ColorsEnum.Purple
      default:
        throw new Error("Type no known");
    }
  }

  private get messageSendingType() {
    return this.draft?.messageSendingType || MessageSendingType.Public;
  }
  private get draft() {
    const draft = useTicketsStore().ticketDraft(this.activeId);
    return draft;
  }


  private get ticket() {
    return useTicketsStore().ticket(this.activeId);
  }

  private beforeUnmount() {
    keyboard.off(this.keyboardId);
  }

  private focus() {
    this.initialMessage = "";
    this.editMode = true;


    //focus after timeout to help waiting for the component to load
    setTimeout(() => {
      emitter.emit(EditorEventType.focus);
    }, 100);
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.notifications {
  font-size: 0.7em;
  padding-bottom: 2px;
}

.communication-center {
  border-radius: 0 12px 12px 12px;
  border: 1px solid var(--c-base-400);
  transition: all 0.3s ease;

  &.editMode {
    border-color: var(--c-contrast);
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.04),
      0px 1px 2px rgba(0, 0, 0, 0.12);
  }

  &:hover {
    border-color: var(--c-contrast);
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.04),
      0px 1px 2px rgba(0, 0, 0, 0.12);
  }

  .special-command {
    display: flex;
    gap: 4px;


    .description {
      color: var(--c-contrast);
      opacity: 0.6;
    }

  }

}

.focus-button {
  border-radius: 12px;
  padding: 16px;
  line-height: 24px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 40px;
}


@media only screen and (max-width: 1024px) {
  .special-command {
    .description {
      font-size: 10px;
    }
  }
}
</style>
