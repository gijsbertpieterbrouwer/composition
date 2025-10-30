<template>
  <TimelineItem :icon="icon" :iconPaddingPx="12" :important="item.important">
    <div class="ticket-message" :class="{ 'from-communicator': this.isFromCommunicator, 'is-externalmessage': this.isExternalCommunication }">
      <div class="message-header">
        <CommunicatorIcon class="icon" v-if="isFromCommunicator" :communicator="communicator" :address="communicatorAddress" :sizePx="20" :showName="true" />

        <UserIcon v-else class="icon" :hideAdminBadge="true" :userId="internalUserId" :sizePx="20" :showName="true" />
        <!-- <span>{{ this.name }}</span> -->




        <div class="actions">
          <span class="subdued date" :title="tooltipDate">
            <template v-if="isProcessing">
              {{ $translate(LanguagePath.App_Sending) }}
            </template>
            <template v-else>{{ this.displayDate }}
              <TickIcon v-if="hasWarning" name="warning" />
            </template>
          </span>

          <TickButton :title="$translate(LanguagePath.App_ShowMore)" :class="chevronClass" @click="toggleExpandAllInformation" v-if="hasMetaDataItems" icon="chevron-down" class="chevron"
            :appearance="Appearance.transparent" :color="Color.contrast" :size="Size.mini" />
        </div>
      </div>

      <div class="content text-selectable" :class="{ 'html': this.showAsHtml }">
        <div v-if="showAsHtml" class="body" v-html="sanitizedBodyAsHtml"></div>
        <div v-else class="body">{{ this.data.bodyAsMarkdown }}</div>

        <div class="attachments" v-if="hasAttachments">
          <Attachment :attachmentLink="attachment" v-for="(attachment, index) in this.attachments" :key="index" />
        </div>

        <div class="reply-options" v-if="hasReplyOptions">
          <BaseReplyOption class="reply-option" :data="replyOption" v-for="(replyOption, index) in this.replyOptions" :key="index" />
        </div>


        <div class="metadata-items" v-if="expandAllInformation">
          <!-- <TicketMessageMetaDataItem class="metadata-item" :data="item" v-for="(item, index) in this.metaDataItems" :key="index" /> -->
          <GenericMetaDataComponentDataItem v-for="(value, popertyName) in this.metaDataItems" :key="value.index" :data="value" :label="popertyName" />
        </div>
      </div>

    </div>
  </TimelineItem>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import { CommunicationDirection, CommunicationReceiverType, CommunicatorAddress, MessageStatus, TicketDetails, TickMessage, TimelineDataItem, LanguagePath } from "@/TickApi";
import UserIcon from "@/components/atoms/UserIcon.vue";
import Attachment from "./Attachment.vue";
import { displayDate, displayDistanceToNowDate } from "@/helpers/dateHelper";
import BaseReplyOption from "../ReplyOption/BaseReplyOption.vue";
import TickAvatar from "@/components/atoms/TickAvatar.vue";
import { getCommunicationDirectionTypeOptions, getCommunicationTypeOptions, } from "@/helpers/enumsHelper";
import TimelineItem from "@/components/molecules/ticket/Timeline/TimelineItem.vue";
import TickIcon from "@/components/TickIcon.vue";
import CommunicatorIcon from "@/components/atoms/CommunicatorIcon.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import GenericMetaDataComponentDataItem from "../../metadatacomponent/components/GenericMetaDataComponentDataItem.vue";


// FIXME: Ruben show / indicate attachments
// FIXME: Ruben reply options

@Component({
  components: {
    UserIcon,
    Attachment,
    BaseReplyOption,
    TickAvatar,
    TimelineItem,
    TickIcon,
    CommunicatorIcon,
    TickButton,
    GenericMetaDataComponentDataItem
  },
})
export default class TicketMessage extends Vue {
  Appearance = Appearance
  Size = Size
  Color = Color
  LanguagePath = LanguagePath
  @Prop() private item: Required<TimelineDataItem>;
  @Prop() private formerItem: Required<TimelineDataItem>;
  @Prop() private ticket: Required<TicketDetails>;

  private get showAsMessage() {
    return this.data.bodyAsMarkdown || (!this.data.bodyAsMarkdown && !this.data.bodyAsHtml);
  }

  private get showAsHtml() {
    return this.data.bodyAsHtml && this.data.bodyAsHtml.length;
  }


  private get sanitizedBodyAsHtml() {
    // add target attribute to always open in new window
    const searchRegExp = new RegExp("<a ", 'g');
    const replaceWith = "<a target='_blank' ";
    return this.data.bodyAsHtml.replace(searchRegExp, replaceWith);
  }

  private get icon() {
    switch (this.data.direction) {
      case CommunicationDirection.Inbound:
        return "inbound";
      case CommunicationDirection.Outbound:
        return "outbound";
    }
    return "";
  }

  private get hasWarning() {
    return this.data.status == MessageStatus.Error;
  }

  private get isProcessing() {
    return this.data.status == MessageStatus.Processing;
  }

  private get internalUserId() {
    const userId = this.data.internalUserId;
    return userId;
  }

  private get sameSenderAsFormerItem() {
    if (!this.formerItem) {
      return false;
    }
    if (this.item.type == this.formerItem.type) {
      if (this.data.direction == this.formerData.direction) {
        switch (this.data.direction) {
          case CommunicationDirection.Inbound:
            return (
              this.data.externalCommunicatorId ==
              this.formerData.externalCommunicatorId
            );
          case CommunicationDirection.Outbound:
            return this.data.internalUserId == this.formerData.internalUserId;
        }
      }
    }
    return false;
  }

  private get isExternalCommunication() {
    return this.data.receiverType == CommunicationReceiverType.ExternalMessage;
  }

  private get isFromCommunicator() {
    return this.data.direction == CommunicationDirection.Inbound;
  }

  private get communicator() {
    const communicator = this.ticket?.communicators.find(
      (p) => p.id == this.data.externalCommunicatorId
    );
    return communicator;
  }

  private get communicatorAddress(): CommunicatorAddress {
    const address = this.communicator?.addresses.find(
      (p) => p.id == this.data.externalCommunicatorAddressId
    );

    return address;
  }

  // private get communicatorName() {
  //   return this.communicator?.name;
  // }

  private get formerData(): TickMessage {
    return this.formerItem.data;
  }

  private get data(): TickMessage {
    return this.item.data;
  }

  // private get name() {
  //   if (this.isFromCommunicator) {
  //     return this.communicatorName;
  //   } else {

  //     const user = useUtilityDataStore().user(this.data.internalUserId);
  //     if (user) {
  //       return user.name || "User"
  //     }
  //     const bot = useUtilityDataStore().user(this.data.internalUserId);
  //     if (bot) {
  //       return bot.name || "Bot"
  //     }

  //     return "Tick user";
  //   }


  // }

  private get displayDate() {
    return displayDistanceToNowDate(this.item.timelineDate);
  }

  private get tooltipDate() {
    return displayDate(this.item.timelineDate);
  }

  private get communicationTypes() {
    return getCommunicationTypeOptions();
  }
  private get communicationDirections() {
    return getCommunicationDirectionTypeOptions();
  }

  private get medium() {
    return this.communicationTypes.find(
      (p) => p.id == this.data.communicationType
    ).text;
  }

  private get direction() {
    return this.communicationDirections
      .find((p) => p.id == this.data.direction)
      .text.toLowerCase();
  }

  private get hasAttachments() {
    return this.data.attachmentLinks && this.data.attachmentLinks.length > 0;
  }

  private get attachments() {
    return this.data.attachmentLinks || [];
  }

  private get replyOptions() {
    return this.data.replyOptions || [];
  }

  private get hasReplyOptions() {
    return this.replyOptions.length > 0;
  }

  private get hasMetaDataItems(): boolean {
    return this.data?.metaDataJson?.length > 0;
  }

  private get metaDataItems(): unknown {
    return JSON.parse(this.data?.metaDataJson || "{}")
  }

  private expandAllInformation = false;

  private toggleExpandAllInformation() {
    this.expandAllInformation = !this.expandAllInformation;
  }

  private get chevronClass() {
    return this.expandAllInformation ? "open" : "closed";
  }

}
</script>

<style lang="scss">
.ticket-message {
  .content {

    a {
      color: var(--c-contrast) !important;
    }

    &.html {
      a {
        color: initial !important;
      }
    }
  }

}
</style>

<style lang="scss" scoped>
@import "@/styles/theme";

.ticket-message {
  border-radius: 0 12px 12px 12px;
  //border: 1px solid var(--c-contrast);
  background-color: var(--c-base-100);
  padding: 12px;
  font-size: $text-size-regular;
  line-height: 16px;
  transform: translateX(-12px);
  min-width: 300px;

  display: flex;
  flex-direction: column;
  gap: 8px;

  &:not(.from-communicator) {
    border: 1px solid var(--c-ticket-message-border);
    background-color: var(--c-ticket-message-background);

    &.is-externalmessage {
      border: 1px solid var(--c-purple-neon);
    }
  }

  &.from-communicator {
    border: none;
    background-color: var(--c-base-100);

    &.is-externalmessage {
      border: 1px solid var(--c-purple-neon);
    }
  }






  .message-header {
    display: flex;
    gap: 8px;
    line-height: 20px;

    .date {
      padding-left: 8px;
    }

    .actions {
      display: flex;
      gap: 5px;
      margin-left: auto;


      .chevron {

        &.open {
          transform: rotate(-180deg);
          transition: transform 150ms ease;
        }

        &.closed {
          transform: rotate(-360deg);
          transition: transform 150ms ease;
        }
      }

    }
  }

  .content {
    display: grid;
    gap: 10px;



    &.html {
      max-width: 100%;
      border-radius: 8px;
      overflow: hidden;
    }

    a {
      color: var(--c-contrast) !important;
    }

    .body {}

    .attachments {}

    .reply-options {}

    .metadata-items {

      display: flex;
      width: 100%;
      flex-wrap: wrap;
      gap: 10px;

      .metadata-item {

        opacity: 0.4;

        &:hover {
          opacity: 1;
        }
      }
    }
  }

  .reply-options {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;

    .reply-option {
      cursor: default;
      //opacity: 0.5;
    }
  }
}
</style>
