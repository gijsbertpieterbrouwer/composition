<template>
  <TimelineItem icon="note" :iconPaddingPx="12" :userId="initiator.id" :important="item.important">
    <div class="message">
      <div class="message-header">
        <TickInitiator :data="initiator" :sizePx="20" />
        <span class="subdued date" :title="tooltipDate">{{ this.displayDate }}</span>
      </div>

      <div class="content" :class="{ 'html': this.showAsHtml }">
        <div v-if="showAsHtml" class="body" v-html="sanitizedBodyAsHtml"></div>
        <div v-else class="body">{{ this.data.bodyAsMarkdown }}</div>
      </div>
      <div class="attachments" v-if="hasAttachments">
        <Attachment :attachmentLink="attachment" v-for="(attachment, index) in this.attachments" :key="index" />
      </div>
      <!-- <div class="content" v-else v-html="data.bodyAsHtml" /> -->
    </div>

    <!-- <div class="attachments" v-if="hasAttachments">
      <Attachment
        :attachmentLink="attachment"
        v-for="(attachment, index) in this.attachments"
        :key="index"
      />
    </div> -->
  </TimelineItem>
</template>

<script lang="ts">
import { displayDate, displayDistanceToNowDate } from "@/helpers/dateHelper";
import { TaskInstanceStatus, TimelineDataItem, TimelineNote } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TaskDetails from "../../task/TaskDetails.vue";
import TickInitiator from "../../TickInitiator.vue";
import Attachment from "./Attachment.vue";
import TimelineItem from "@/components/molecules/ticket/Timeline/TimelineItem.vue";
import UserIcon from "@/components/atoms/UserIcon.vue";
import useUtilityDataStore from "@/store/utilitydata";

@Component({
  components: {
    TaskDetails,
    TickInitiator,
    Attachment,
    TimelineItem,
    UserIcon,
  },
})
export default class TicketNote extends Vue {
  TaskInstanceStatus = TaskInstanceStatus;
  @Prop() private item: Required<TimelineDataItem>;

  private get data(): TimelineNote {
    return this.item.data;
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

  private get initiator() {
    return this.data.initiator;
  }

  private get user() {

    const id = this.initiator.id;
    const user = useUtilityDataStore().user(id);
    return user;
  }

  private get name() {
    return this.user.name;
  }

  private get displayDate() {
    return displayDistanceToNowDate(this.data.sentDate);
  }

  private get tooltipDate() {
    return displayDate(this.data.sentDate);
  }

  private get hasAttachments() {
    return this.data.attachmentLinks && this.data.attachmentLinks.length > 0;
  }

  private get attachments() {
    return this.data.attachmentLinks || [];
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.message {
  border-radius: 0 12px 12px 12px;
  //background-color: var(--c-primary);
  border-bottom: 1px solid var(--c-primary);
  padding: 12px;
  padding-bottom: 4px;
  font-size: $text-size-regular;
  line-height: 16px;
  transform: translateX(-12px);

  display: flex;
  flex-direction: column;
  gap: 8px;

  .date {
    padding-left: 8px;
  }
}

.content {
  font-style: italic;

  &.html {
    max-width: 100%;
  }
}

.message-header {
  display: flex;
  gap: 8px;
  line-height: 20px;
}
</style>
