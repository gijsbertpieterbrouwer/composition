<template>
  <FileDataUploaderZone @setGroup="fileZoneSetGroup" @active="activateDroppingFiles" @uploadsCompleted="fileUploadsCompleted" :disableClickToOpen="true" :disableUploaderView="true"
    :fileType="FileSourceType.Attachment">

    <div class="tick-communication-area" ref="container">

      <div class="receipients-holder">
        <div class="flex">
          <TickDropdown dropdownTitle="" :noFilter="true" @select="selectSendingMessageType" :placeholder="receipientTitle" :options="responseOptions" :color="submitColor" :size="ButtonSize.mini" />
          <TicketMessageReceiverListEditor class="receivers" v-if="messageSendingType == MessageSendingType.Public" v-model="publicReceivers" />
        </div>
        <!-- <span>{{ this.userIsTyping }}</span> -->
        <template v-if="messageSendingType == MessageSendingType.External">
          <div class="subject-editor">
            <span>{{ $translate(LanguagePath.App_Ticket_CommunicationArea_External_Subject) }}: </span>
            <TickInput class="subject-input" v-focus v-model="draftSubject" />

          </div>
          <div class="recipients-selector">
            <span>{{ $translate(LanguagePath.App_Ticket_CommunicationArea_External_To) }}:</span>
            <CommunicatorSelector class="add-selector" @select="addCommunicatorAddress" :availableCommunicationTypes="[CommunicationType.Email]" :hideChannels="true" />
          </div>
        </template>
      </div>
      <div class="attachments-holder" v-if="messageAttachmentFileIds.length">
        <span class="attachment" v-for="(file, index) in this.messageAttachmentFileIds" :key="index">
          {{ file.name }}
          <button class="remover" @click="removeAttachment(file)">x</button>
        </span>
      </div>


      <TickButton class="resize-button" @click="emitter.emit(this.EditorEventType.toggleResize)" icon="resize" :size="ButtonSize.regular" :appearance="ButtonAppearance.transparent" />

      <TickEditor v-show="allowEditQuestEditor" class="editor" v-model="message" @submit="submit" @change="onMessageChange" :tokenizable="false" :placeholder="messagePlaceholder" />
      <div class="drop-dummy" v-if="userBusyDroppingFiles">
        {{ $translate(LanguagePath.App_Ticket_CommunicationArea_Notifications_DropZoneTitle) }}
      </div>

      <div class="controls">
        <!-- <TickButton
        class="plus-button"
        icon="plus"
        :size="ButtonSize.mini"
        :color="ButtonColor.contrast"
        @click="togglePanel"
      />
      <div class="separator" /> -->


        <TickButton icon="file" :size="ButtonSize.regular" :appearance="ButtonAppearance.transparent" @click="toggleFilesPanel" :title="$translate(LanguagePath.Files)" />
        <TickButton icon="message" :size="ButtonSize.regular" :appearance="ButtonAppearance.transparent" @click="toggleCannedResponsePanel" :title="$translate(LanguagePath.CannedResponses)" />
        <div class="separator" />
        <TickButton icon="bold" :size="ButtonSize.regular" :appearance="ButtonAppearance.transparent" @click="emitter.emit(this.EditorEventType.toggleBold)" title="Bold" />
        <TickButton icon="italics" :size="ButtonSize.regular" :appearance="ButtonAppearance.transparent" @click="emitter.emit(this.EditorEventType.toggleItalics)" title="Italic" />
        <div class="separator" />
        <!-- <TickButton
        icon="link"
        :size="ButtonSize.regular"
        :appearance="ButtonAppearance.transparent"
        @click="emitter.emit(this.EditorEventType.toggleLink)"
      /> 
      <div class="separator" />-->
        <TickButton icon="orderedlist" :size="ButtonSize.regular" :appearance="ButtonAppearance.transparent" @click="emitter.emit(this.EditorEventType.toggleOrderedList)" title="Ordered list" />
        <TickButton icon="unorderedlist" :size="ButtonSize.regular" :appearance="ButtonAppearance.transparent" @click="emitter.emit(this.EditorEventType.toggleBulletList)" title="Bullet list" />
        <div class="separator" />
        <TickButton icon="code" :size="ButtonSize.regular" :appearance="ButtonAppearance.transparent" @click="emitter.emit(this.EditorEventType.toggleCode)" title="Code" />
        <TickButton icon="codeblock" :size="ButtonSize.regular" :appearance="ButtonAppearance.transparent" @click="emitter.emit(this.EditorEventType.toggleCodeBlock)" title="Code block" />

      </div>
      <TickButton class="submit" icon="send" :round="true" :color="submitColor" @click="submit" :size="ButtonSize.mini" :title="submitTitle">{{ this.submitText }}</TickButton>
    </div>
  </FileDataUploaderZone>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-facing-decorator";

import TickButton, {
  Appearance as ButtonAppearance,
  Color as ButtonColor,
  Size as ButtonSize,
} from "@/components/atoms/TickButton.vue";
import TickEditor from "@/components/molecules/ticket/TickEditor.vue";

import TickDropdown from "@/components/atoms/TickDropdown.vue";

import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import ActiveFlowPanel from "@/components/panels/ActiveFlowPanel.vue";
import CannedResponsesPanel from "@/components/panels/CannedResponsesPanel.vue";
import FilesSelectionPanel from "@/components/panels/FilesSelectionPanel.vue";
import FlowsPanel from "@/components/panels/FlowsPanel.vue";
import LabelsPanel from "@/components/panels/LabelsPanel.vue";
import ShortcutsPanel, { ShortCutPanelItem } from "@/components/panels/ShortcutsPanel.vue";
import TaskInstanceCreatorPanel from "@/components/panels/TaskInstanceCreatorPanel.vue";
import UsersAndTeamsPanel from "@/components/panels/UsersAndTeamsPanel.vue";
import { focus } from "@/directives";
import { dateToTicks } from "@/helpers/dateHelper";
import emitter, { EditorEventType } from "@/helpers/editorEventBus";
import { getResponseOptions } from "@/helpers/enumsHelper";
import generateId from "@/helpers/guid";
import keyboard from "@/helpers/keyboard";
import { mount, unmount } from "@/helpers/mountHelper";
import getRefElement, { getRefElementDOMRect } from "@/helpers/refHelpers";
import { debug } from "@/log";
import { notifyMessage } from "@/notify";
import { translate } from "@/plugins/translatePlugin";
import { getParsedCannedResponse } from "@/services/CannedResponsesService";
import { sendExternalMessage, sendInternalNote, sendMessage } from "@/services/TicketsService";
import useAppStore from "@/store/app";
import useFilesStore from "@/store/files";
import useTicketsStore, { MessageSendingType } from "@/store/tickets";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import {
  AddExternalMessageRequest,
  AddMessageRequest,
  AddNoteRequest,
  AttachmentFileData,
  CommunicationDirection,
  CommunicationReceiverType,
  CommunicationType,
  FileLink,
  FileSourceType,
  InitiatorTypeEnum,
  LanguagePath,
  MessageStatus,
  NotificationType,
  TickMessage,
  TicketStatus,
  TimelineDataItemType,
  TimelineNote
} from "@/TickApi";
import { Component as VueComponent, computed } from "vue";
import FileDataUploaderZone from "../files/FileDataUploaderZone.vue";
import CommunicatorSelector, { CommunicatorAddressOption } from "../Selectors/CommunicatorSelector.vue";
import { UsersAndTeamsSelection } from "../Selectors/UsersAndTeamsSelector.vue";
import TicketMessageReceiverListEditor from "./TicketMessageReceiverListEditor.vue";

@Component({
  directives: { focus },
  // emits: ["blur"],
  components: {
    TickEditor,
    TickButton,
    FileDataUploaderZone,
    TickDropdown,
    CommunicatorSelector,
    TickInput,
    TicketMessageReceiverListEditor
  },
})
export default class TickCommunicationArea extends Vue {
  FileSourceType = FileSourceType;
  MessageSendingType = MessageSendingType;
  EditorEventType = EditorEventType;
  ButtonSize = ButtonSize;
  ButtonAppearance = ButtonAppearance;
  ButtonColor = ButtonColor;
  CommunicationType = CommunicationType;
  LanguagePath = LanguagePath;

  @Prop({ default: "" }) private initialMessage!: string;
  @Prop() private ticketId?: string;

  private activePanel = "";
  private userBusyDroppingFiles = false;
  private filezoneGroupUsed = "";
  private shortcutKeyPrefix = "/";
  private shortcutIdentifier!: number;
  private emitter = emitter; // used for click events in template

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isTypingTimer: any = null;




  private addCommunicatorAddress(to: CommunicatorAddressOption) {
    if (this.messageSendingType == MessageSendingType.External) {
      if (!this.draft.externalReceivers) { this.draft.externalReceivers = []; }
      this.draft.externalReceivers = [{
        name: to?.communicator?.name,
        address: to.communicatorAddress,
        communicatorAddressId: to?.communicatorAddressId,
        communicatorId: to.communicator?.id,
      }];
    }
  }

  private get draftSubject(): string {
    return this.draft.subject;
  }
  private set draftSubject(to: string) {
    this.draft.subject = to;
  }



  //LIFECYCLE
  public mounted() {
    // Listen to escape
    this.shortcutIdentifier = keyboard.on("Escape", () => {
      this.setFocusToMessage();
    },
      { ignoreInputFieldEvents: false }
    );

    if (this.message.trim().length || this.messageAttachmentFileIds.length) {
      debug("[Editor:Draft] draft found");
      this.setFocusToMessage();
      emitter.emit(EditorEventType.editMode);

    } else {
      if (this.initialMessage) {
        this.setFocusToMessage();
        this.message = this.initialMessage;
      }
    }

    if (this.draft.messageSendingType == MessageSendingType.External) {
      this.maximizeEditor();
    }


  }

  public beforeUnmount() {
    keyboard.off(this.shortcutIdentifier);
  }

  //FUNCTIONALITY

  private selectSendingMessageType(to: MessageSendingType) {
    this.messageSendingType = to;

    if (to == MessageSendingType.External) {
      this.maximizeEditor();
    }
  }

  private maximizeEditor() {
    this.emitter.emit(this.EditorEventType.maximizeSize);
  }

  private get responseOptions() {
    return getResponseOptions();
  }

  private resetDraft() {
    this.message = "";
    this.messageAttachmentFileIds = [];
    this.messageUsedCannedResponseId = "";
    this.draftSubject = this.ticket.title;
    this.draft.externalReceivers = [];

    useTicketsStore().setUserIsTyping(this.ticketId, false)
  }

  private fileZoneSetGroup(to: string) {
    this.filezoneGroupUsed = to;
  }

  private activateDroppingFiles(active: boolean) {
    this.userBusyDroppingFiles = active;
  }

  private fileUploadsCompleted(data: FileLink[]) {
    if (!data || !data.length) { return; }
    this.messageAttachmentFileIds = this.messageAttachmentFileIds.concat(data);
  }

  private removeAttachment(file: FileLink) {
    this.messageAttachmentFileIds = this.messageAttachmentFileIds.filter(p => p.fileDataId != file.fileDataId);
  }

  private submit() {
    this.message = this.message.trim();
    if (!this.message && !this.messageAttachmentFileIds.length) {
      notifyMessage(translate(LanguagePath.App_Ticket_CommunicationArea_Notifications_NoMessage_Title), translate(LanguagePath.App_Ticket_CommunicationArea_Notifications_NoMessage_Body))
      return;
    }

    switch (this.messageSendingType) {
      case MessageSendingType.Public:
        this.submitPublic();
        break;
      case MessageSendingType.Internal:
        this.submitInternal();
        break;
      case MessageSendingType.External:
        this.submitExternal();
        break;
      default:
        throw new Error("Type no known");
    }

    useFilesStore().removeUploadableFiles(this.filezoneGroupUsed)

    this.resetDraft();
  }

  private submitPublic() {
    //validate
    if (!this.draft?.receivers || !this.draft?.receivers.length) {
      notifyMessage(translate(LanguagePath.App_Ticket_CommunicationArea_Notifications_NoReceipients_Title), translate(LanguagePath.App_Ticket_CommunicationArea_Notifications_NoReceipients_Body))
      return;
    }

    var newMessageId = generateId();

    var sendRequest: AddMessageRequest = {
      messageId: newMessageId,
      subject: "",
      ticketId: this.ticketId,
      bodyAsMarkdown: this.message,
      bodyAsHtml: null,
      receivers: this.draft?.receivers,
      cannedResponseId: this.messageUsedCannedResponseId,
      attachmentFileDatas: this.messageAttachmentFileIds.map((f) => {
        const a: AttachmentFileData = {
          fileDataId: f.fileDataId,
          fileName: f.name,
          workspaceId: useUserStore().activeWorkspaceId,
        }
        return a;
      })
    };

    //add placeholder timeline item
    const firstReceiver = this.draft?.receivers[0];
    var placeholderMessage: TickMessage = {
      bodyAsMarkdown: `${sendRequest.bodyAsMarkdown} (${translate(LanguagePath.App_Ticket_Timeline_Message_BusySending)})`,
      bodyAsHtml: this.draft?.messageHtml,
      direction: CommunicationDirection.Outbound,
      id: newMessageId,
      externalCommunicatorId: firstReceiver.communicatorId,
      externalCommunicatorAddressId: firstReceiver.communicatorAddressId,
      communicationChannelId: firstReceiver.communicationChannelId,
      communicationType: firstReceiver.communicationType,
      status: MessageStatus.Processing,
      receiverType: CommunicationReceiverType.ExternalMessage,
      creationDate: null,
      isEdited: false,
      attachmentLinks: [],
    };

    useTicketsStore().patchTimeline(this.ticketId, [
      {
        id: newMessageId,
        important: true,
        type: TimelineDataItemType.Message,
        timelineDate: new Date(),
        timelineDateAsTick: dateToTicks(new Date()),
        data: placeholderMessage,
      },
    ]);

    const existingSummary = useTicketsStore().ticketSummary(this.ticketId)
    existingSummary.status = TicketStatus.WaitingForCommunicator;

    sendMessage(sendRequest);
  }


  private submitExternal() {

    if (!this.draft?.externalReceivers || !this.draft?.externalReceivers.length) {
      notifyMessage(translate(LanguagePath.App_Ticket_CommunicationArea_Notifications_NoReceipients_Title), translate(LanguagePath.App_Ticket_CommunicationArea_Notifications_NoReceipients_Body))
      return;
    }

    var newMessageId = generateId();

    var sendRequest: AddExternalMessageRequest = {
      messageId: newMessageId,
      subject: this.draft.subject,
      ticketId: this.ticketId,
      bodyAsMarkdown: this.message,
      receivers: this.draft?.externalReceivers,
      cannedResponseId: this.messageUsedCannedResponseId,
      attachmentFileDatas: this.messageAttachmentFileIds.map((f) => {
        const a: AttachmentFileData = {
          fileDataId: f.fileDataId,
          fileName: f.name,
          workspaceId: useUserStore().activeWorkspaceId,
        }
        return a;
      })
    };

    //add placeholder timeline item
    const firstReceiver = this.draft?.externalReceivers[0];
    var placeholderMessage: TickMessage = {
      bodyAsMarkdown: `${sendRequest.bodyAsMarkdown} (${translate(LanguagePath.App_Ticket_Timeline_Message_BusySending)})`,
      bodyAsHtml: this.draft?.messageHtml,
      direction: CommunicationDirection.Outbound,
      id: newMessageId,
      externalCommunicatorId: firstReceiver.communicatorId,
      externalCommunicatorAddressId: firstReceiver.communicatorAddressId,
      communicationChannelId: firstReceiver.communicationChannelId,
      communicationType: firstReceiver.communicationType,
      status: MessageStatus.Processing,
      receiverType: CommunicationReceiverType.ExternalMessage,
      creationDate: null,
      isEdited: false,
      attachmentLinks: [],
    };

    useTicketsStore().patchTimeline(this.ticketId, [
      {
        id: newMessageId,
        important: true,
        type: TimelineDataItemType.Message,
        timelineDate: new Date(),
        timelineDateAsTick: dateToTicks(new Date()),
        data: placeholderMessage,
      },
    ]);

    sendExternalMessage(sendRequest);
  }

  private submitInternal() {
    var newMessageId = generateId();
    const messageAsHtml = this.draft?.messageHtml;
    // console.log("html", messageAsHtml);
    var sendRequest: AddNoteRequest = {
      id: newMessageId,
      ticketId: this.ticketId,
      bodyAsMarkdown: this.message,
      attachmentFileDatas: this.messageAttachmentFileIds.map((f) => {
        const a: AttachmentFileData = {
          fileDataId: f.fileDataId,
          fileName: f.name,
          workspaceId: useUserStore().activeWorkspaceId,
        }
        return a;
      })

    };

    //add placeholder timeline item
    var placeholder: TimelineNote = {
      sentDate: new Date(),
      bodyAsMarkdown: `${sendRequest.bodyAsMarkdown} (${translate(LanguagePath.App_Ticket_Timeline_Message_BusySending)})`,
      bodyAsHtml: messageAsHtml,
      attachmentLinks: this.messageAttachmentFileIds,
      id: newMessageId,
      initiator: {
        id: useUserStore().userId,
        type: InitiatorTypeEnum.User
      }
    };
    useTicketsStore().patchTimeline(this.ticketId, [
      {
        id: newMessageId,
        important: true,
        type: TimelineDataItemType.Note,
        timelineDate: new Date(),
        timelineDateAsTick: dateToTicks(new Date()),
        data: placeholder,
      },
    ]);

    sendInternalNote(sendRequest);
  }

  @Watch("message")
  private onMessageChanged(to: string, old: string) {
    if (old.length > to.length) {
      this.closePanel(false);
    }

    this.tryDetectMentionShortCutKey(to);
    this.tryDetectShortCutKey(to);
  }

  private tryDetectMentionShortCutKey(msg: string) {
    const mentionToken = "@";

    if (msg == mentionToken || msg.endsWith(" " + mentionToken)) {
      debug("[Editor:Shortcut] @Mention => start");
      //emitter.emit(EditorEventType.focus);

      // open users/teams to mention
      this.openPanel(UsersAndTeamsPanel, { userIds: [], teamIds: [] }, (selection: { userIds: [], teamIds: [] }) => {
        debug("[Editor:Shortcut] @Mention => set");
        let newHandleToUse = null;
        if (selection.userIds) {
          const user = useUtilityDataStore().user(selection.userIds[selection.userIds.length - 1]);
          if (user != null) {
            newHandleToUse = user.handle;
          }
        }

        if (selection.teamIds) {
          const team = useUtilityDataStore().team(selection.teamIds[selection.teamIds.length - 1]);
          if (team) {
            newHandleToUse = team.handle;
          }
        }

        if (newHandleToUse) {
          // if @ was directly trailing another char => add a space in betweeen
          this.message += newHandleToUse.replace("@", "") + " "; // remove @ because it was already typed. add trailing space to allow multiple mentions

          //SMART = >set type to internal note
          if (this.messageSendingType != MessageSendingType.Internal) {
            this.messageSendingType = MessageSendingType.Internal;
            useAppStore().notify(NotificationType.Normal, translate(LanguagePath.App_Ticket_CommunicationArea_Notifications_ChangeType_ToInternal_Title), translate(LanguagePath.App_Ticket_CommunicationArea_Notifications_ChangeType_ToInternal_Body));
          }

          this.$nextTick(() => {
            this.closePanel(true);
            //emitter.emit(EditorEventType.focus);
          });

        }
      });
    }
  }

  private tryDetectShortCutKey(msg: string) {
    const p = this.shortcutKeyPrefix;
    switch (msg) {
      case p:
        debug("[Editor:Shortcut] open shortcuts panel");
        this.openPanel(ShortcutsPanel, {
          shortcuts: [{
            isSpacer: false,
            key: "/",
            name: translate(LanguagePath.App_Ticket_CommunicationArea_Shortcut_Public)
          },
          {
            isSpacer: false,
            key: "n",
            name: translate(LanguagePath.App_Ticket_CommunicationArea_Shortcut_InternalNote)
          },
          {
            isSpacer: false,
            key: "e",
            name: translate(LanguagePath.App_Ticket_CommunicationArea_Shortcut_External)
          },
          {
            isSpacer: false,
            key: "r",
            name: translate(LanguagePath.App_Ticket_CommunicationArea_Shortcut_Canned_responses)
          },
          {
            isSpacer: true,
          },
          {
            isSpacer: false,
            key: "f",
            name: translate(LanguagePath.App_Ticket_CommunicationArea_Shortcut_Flows)
          }, {
            isSpacer: false,
            key: "l",
            name: translate(LanguagePath.App_Ticket_CommunicationArea_Shortcut_Labels)
          }, {
            isSpacer: false,
            key: "a",
            name: translate(LanguagePath.App_Ticket_CommunicationArea_Shortcut_Assignments)
          }, {
            isSpacer: false,
            key: "t",
            name: translate(LanguagePath.App_Ticket_CommunicationArea_Shortcut_AddTask)
          }, {
            isSpacer: false,
            key: "c",
            name: translate(LanguagePath.App_Ticket_CommunicationArea_Shortcut_Complete)
          }]
        });
        this.messageSendingType = MessageSendingType.Public;
        break;
      case p + "n":
        debug("[Editor:Shortcut] Internal note");
        this.closePanel(true);
        this.message = "";
        this.messageSendingType = MessageSendingType.Internal;
        break;
      case p + "e":
        debug("[Editor:Shortcut] External message");
        this.closePanel(true);
        this.message = "";
        this.messageSendingType = MessageSendingType.External;
        break;
      case p + "/":
        debug("[Editor:Shortcut] public reply");
        this.message = "";
        this.closePanel(true);
        break;
      case p + "r":
        debug("[Editor:Shortcut] canned responses");
        this.toggleCannedResponsePanel();
        break;

      case p + "f":
        debug("[Editor:Shortcut] Flow selection");
        this.openPanel(this.ticket.currentFlowInstanceDefinitionId ? ActiveFlowPanel : FlowsPanel, null, this.ticket.currentFlowInstanceDefinitionId, (to: string) => {
          useTicketsStore().setTicketFlow(this.ticketId, to);
        });
        break;
      case p + "l":
        this.openLabelsPanel();
        break;
      case p + "t":
        this.openCreateTaskPanel();
        break;

      case p + "c":
        debug("[Editor:Shortcut] complete ticket");
        this.message = "";
        //if (!askConfirmation()) { return; }
        useTicketsStore().finish(this.ticketId);
        this.closePanel(false);
        break;
      // case "/s":
      //   //TODO: Mark as spam
      // break;

      case p + "a":
        this.openAssignmentsPanel();
        break;
    }
  }

  private openAssignmentsPanel() {
    debug("[Editor:Shortcut] assign users & teams");
    this.openPanel(UsersAndTeamsPanel, {
      userIds: this.ticket.assignedUserIds,
      teamIds: this.ticket.assignedTeamIds,
    }, (to: UsersAndTeamsSelection) => {
      useTicketsStore().setTicketAssignments(this.ticketId, {
        userIds: to.userIds,
        teamIds: to.teamIds,
      });
      this.openAssignmentsPanel();
    });
  }

  private openLabelsPanel() {
    debug("[Editor:Shortcut] Labels selection");
    this.openPanel(LabelsPanel, this.ticket.labelDefinitionIds, (to: string[]) => {
      useTicketsStore().setTicketLabels(this.ticketId, to);
      //this.openLabelsPanel();
    });
  }

  private openCreateTaskPanel() {
    debug("[Editor:Shortcut] Add ticket task");
    this.openPanel(TaskInstanceCreatorPanel, {
      ticketId: this.ticketId,
    }, () => {
      //useTicketsStore().setTicketLabels(this.ticketId, to);
      //this.openLabelsPanel();
    });
  }

  private toggleFilesPanel() {
    this.openPanel(FilesSelectionPanel, null, (to: FileLink) => {
      if (this.messageAttachmentFileIds.some(p => p.fileDataId == to.fileDataId)) { return; }
      debug(`[Editor: File]add ${to.name} to selection`);
      this.messageAttachmentFileIds.push(to);
    });
  }

  private toggleCannedResponsePanel() {
    this.openPanel(CannedResponsesPanel, null, (to: string) => {
      debug(`[Editor:Canned response] retrieve parsed ${to} `);
      this.messageUsedCannedResponseId = to;

      getParsedCannedResponse(this.ticketId, to).then((d) => {
        if (d.message) {
          this.message = d.message;
        }
        if (d.attachmentLinks) {
          this.messageAttachmentFileIds = this.messageAttachmentFileIds.concat(d.attachmentLinks);
        }
      });

    });
  }

  // @Watch("editorFocused")
  // private async onEditorFocusedChanged(to: boolean) {
  //   if (to) {
  //     return;
  //   }
  //   this.tryClose();
  // }


  private setFocusToMessage() {
    emitter.emit(EditorEventType.focus);
  }


  // eslint-disable-next-line @typescript-eslint/ban-types
  private async openPanel(panel: VueComponent, props?: object, fromOptions?: unknown, callback?: Function) {
    if (this.activePanel) {
      this.closePanel(false);
    }
    const control = getRefElement(this, "container");
    if (!control) {
      window.requestAnimationFrame(() => {
        this.openPanel(panel, props, fromOptions, callback);
      });
      return;
    }
    const panelOptions: TickPanelOptions = {
      title: "CommunicationArea-panel",
      from: getRefElementDOMRect(this, "container")
    }

    let panelProps = {
      panelOptions: panelOptions,
      modelValue: computed(() => fromOptions),
    }

    if (props != null) {
      panelProps = { ...panelProps, ...props };
    }

    this.activePanel = mount(panel, {
      props: panelProps,
      events: {
        close: () => {
          // this.closePanel(false);

          //this.$nextTick(() => {
          debug(`[Panel:Close] back to focus`);
          this.closePanel(true);
          //emitter.emit(EditorEventType.focus);
          //});
        },
        //FIXME: only listen when ShortCutsPanel
        selectShortCut: (to: ShortCutPanelItem) => {
          this.tryDetectShortCutKey("/" + to.key);
        },
        "update:modelValue": (to: string[]) => {
          callback(to);
        },
      },
    });
  }

  private closePanel(setFocus: boolean) {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";

    // strip "/" or "/X" from message 
    if (this.message.substring(this.message.length - 2, this.message.length - 1) == this.shortcutKeyPrefix) {
      this.message = this.message.substring(0, this.message.length - 2);
    }

    if (this.message.endsWith("/")) { this.message = this.message.substring(0, this.message.length - 1); }

    if (setFocus) {
      this.setFocusToMessage();
    }
  }

  //Getters & Setters
  private get draft() {
    return useTicketsStore().ticketDraft(this.ticketId);
  }

  private get ticket() {
    return useTicketsStore().ticket(this.ticketId);
  }
  private get allowEditQuestEditor() {
    return !this.userBusyDroppingFiles
  }
  private get receipientTitle() {

    const chosen = getResponseOptions().find(p => p.id == this.messageSendingType);
    return chosen?.text || "send";
    // switch (this.messageSendingType) {
    //   case MessageSendingType.Public: return "public message";
    //   case MessageSendingType.Internal: return "internal note";
    //   case MessageSendingType.External: return "external message";
    //   default: return "send";
    // }

  }



  private get message() {
    return this.draft?.messageMarkDown || "";
  }

  private set message(to: string) {
    if (!this.draft) { return; }
    this.draft.messageMarkDown = to;

    const isTyping = to.length > 0;

    if (this.userIsTyping != isTyping) {
      useTicketsStore().setUserIsTyping(this.ticketId, isTyping)
    }
  }


  private onMessageChange(md: string, html: string) {
    if (!this.draft) { return; }
    this.draft.messageHtml = html;
  }

  private get userIsTyping(): boolean {
    return this.draft?.isTyping || false;
  }

  private get messageSendingType() {
    return this.draft?.messageSendingType || MessageSendingType.Public;
  }
  private set messageSendingType(to: MessageSendingType) {
    this.draft.messageSendingType = to;
  }

  private get messageAttachmentFileIds() {
    return this.draft?.messageAttachmentFileIds || [];
  }
  private set messageAttachmentFileIds(to: FileLink[]) {
    this.draft.messageAttachmentFileIds = to;
  }

  private get messageUsedCannedResponseId() {
    return this.draft.messageUsedCannedResponseId;
  }
  private set messageUsedCannedResponseId(to: string) {
    this.draft.messageUsedCannedResponseId = to;
  }

  private get submitColor(): ButtonColor {
    // return this.messageSendingType == MessageSendingType.Public ? ButtonColor.secondary : ButtonColor.primary;

    switch (this.messageSendingType) {
      case MessageSendingType.Public:
        return ButtonColor.secondary
      case MessageSendingType.Internal:
        return ButtonColor.primary
      case MessageSendingType.External:
        return ButtonColor.tertiary
      default:
        throw new Error("Type no known");
    }

  }
  private get messagePlaceholder(): string {
    switch (this.messageSendingType) {
      case MessageSendingType.Public:
        return translate(LanguagePath.App_Ticket_CommunicationArea_Message_Public_Placeholder)
      case MessageSendingType.Internal:
        return translate(LanguagePath.App_Ticket_CommunicationArea_Message_InternalNote_Placeholder)
      case MessageSendingType.External:
        return translate(LanguagePath.App_Ticket_CommunicationArea_Message_External_Placeholder)
      default:
        throw new Error("Type no known");
    }

  }
  private get submitTitle(): string {
    return translate(LanguagePath.App_Ticket_CommunicationArea_Send_Tooltip);

    // switch (this.messageSendingType) {
    //   case MessageSendingType.Public:
    //     return "(Shift + Enter) to send public reply"
    //   case MessageSendingType.Internal:
    //     return "(Shift + Enter) to send internal note"
    //   case MessageSendingType.External:
    //     return "(Shift + Enter) to send external message"
    //   default:
    //     throw new Error("Type no known");
    // }

  }
  private get submitText() {
    return translate(LanguagePath.App_Ticket_CommunicationArea_Send_Title);

    // return this.messageSendingType == MessageSendingType.Public ? "Reply" : "note";

    // switch (this.messageSendingType) {
    //   case MessageSendingType.Public:
    //     return "Send"
    //   case MessageSendingType.Internal:
    //     return "Send"
    //   case MessageSendingType.External:
    //     return "Send"
    //   default:
    //     throw new Error("Type no known");
    // }
  }

  private get publicReceivers() {
    return this.draft?.receivers;
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.flex {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: left;
  align-content: center;
  align-items: center;
}


.receivers {
  opacity: 0.5;

  &:hover {
    opacity: 1;
  }
}


.tick-communication-area {
  display: grid;
  grid-template-columns: auto 70px;
  grid-template-rows: min-content auto 24px auto;
  grid-template-areas: "empty resize"
    "editor editor"
    "controls submit"
    "uploads uploads"
  ;
  padding: 12px;
}

.resize-button {
  grid-area: resize;
  opacity: 0.8;
  align-self: flex-start;
  justify-self: end;

  &:not([disabled]):hover {
    opacity: 1;
    background-color: var(--c-base-400);
  }
}

.editor {
  grid-area: editor;
}

.controls {
  grid-area: controls;
  display: flex;
  align-items: center;
  margin-left: -4px;

  .plus-button {
    margin-right: 4px;
  }

  button:not(.plus-button) {
    opacity: 0.8;

    &:not([disabled]):hover {
      opacity: 1;
      background-color: var(--c-base-400);
    }
  }

  .separator {
    width: 1px;
    margin: 0 8px;
    background-color: var(--c-contrast);
    height: 20px;
    opacity: 0.4;
  }
}

.submit {
  grid-area: submit;
  min-width: 50px;
}

.drop-dummy {
  font-size: 10px;
  min-height: 100px;
}

.receipients-holder {
  display: grid;
  gap: 5px;
  position: relative;
  top: -5px;
  font-size: 0.8em;

  .subject-editor {
    display: flex;
    gap: 5px;
    align-items: center;

    .subject-input {
      flex-grow: 1;
    }
  }

  .recipients-selector {
    display: flex;
    gap: 5px;
    align-items: center;

    .add-selector {
      flex-grow: 1;
      width: 100%;
    }

  }
}



.attachments-holder {
  grid-area: uploads;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;

  .attachment {
    padding: 0 4px;
    @include font-inter;
    font-weight: 700;
    font-size: 10px;
    line-height: 16px;
    text-transform: capitalize;
    white-space: nowrap;

    border-radius: 2px;
    transition: all 0.3s ease;
    color: $white;
    display: inline-flex;
    // max-width: 200px;
    min-width: 20px;
    // overflow: hidden;
    height: 17px;
    background-color: var(--c-contrast);
    color: var(--c-base);

    @include neon-bg;
    display: flex;
    gap: 5px;

    .remover {
      cursor: pointer;

      &:hover {
        color: $error;
      }
    }
  }

}
</style>