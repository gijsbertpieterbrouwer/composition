<template>
  <TimelineItem icon="phone" :important="item.important" :date="item.timelineDate">
    <div class="wrapper">

      <div class="header">
        <ChannelLabel :channelId="this.channelId" :asText="true" />
        <span>({{ durationText }})</span>
      </div>
      <div>
        <Attachment v-if="this.recordingFileLink" :attachmentLink="recordingFileLink" />
        <span class="info" v-else>{{ $translate(LanguagePath.App_TicketEditor_PhoneCall_NoRecording_Title) }}</span>
      </div>

    </div>
  </TimelineItem>
</template>

<script lang="ts">
import TimelineItem from "@/components/molecules/ticket/Timeline/TimelineItem.vue";
import { getTimespan } from "@/helpers/dateHelper";
import { LanguagePath, TimelineDataItem, TimelinePhoneCallLog } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import ChannelLabel from "../../channel/ChannelLabel.vue";
import Attachment from "./Attachment.vue";


@Component({
  components: { TimelineItem, ChannelLabel, Attachment, },
})
export default class TicketPhoneCallLog extends Vue {
  LanguagePath = LanguagePath
  @Prop() private item: Required<TimelineDataItem>;

  private get data(): TimelinePhoneCallLog {
    return this.item.data;
  }

  private get channelId() {
    return this.data.communicationChannelId;
  }

  private get recordingFileLink() {
    return this.data.recordingFile;
  }


  private get durationText() {
    if (!this.data.durationMs) { return ""; }
    const durationSpan = getTimespan(this.data.durationMs);

    return `${durationSpan.value} ${durationSpan.unit}`;

  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  font-size: $text-size-regular;
  line-height: 20px;
  width: clamp(300px, 60%, 500px);
  display: grid;
  gap: 10px;
  border-radius: 12px;
  padding: 8px 12px;
  max-width: 80%;
  background-color: var(--c-base-400);
  overflow: hidden;

  .header {
    display: flex;
    gap: 10px;
  }

  .info {
    font-style: italic;
  }
}
</style>
