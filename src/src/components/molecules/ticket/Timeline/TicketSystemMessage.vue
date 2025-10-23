<template>
  <TimelineItem :icon="icon" :important="item?.important" :date="date" :continuousLine="continuousLine">
    <span class="system-message">
      <span class="message">{{ this.message }} </span>
      <span v-if="initiatorName">({{ $translate(LanguagePath.App_TicketTimeline_SystemMessage_By_Title) }} {{ this.initiatorName }})</span>
    </span>
  </TimelineItem>
</template>

<script lang="ts">
import { TimelineSystemMessage, TimelineDataItem, TimelineSystemMessageType, InitiatorTypeEnum, LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TimelineItem from "@/components/molecules/ticket/Timeline/TimelineItem.vue";
import useUtilityDataStore from "@/store/utilitydata";
import { translate } from "@/plugins/translatePlugin";

@Component({
  components: { TimelineItem },
})
export default class TicketSystemMessage extends Vue {
  LanguagePath = LanguagePath
  @Prop() private item: Required<TimelineDataItem>;

  private get data(): TimelineSystemMessage {
    return this.item.data;
  }

  private get date() {
    return this.item?.timelineDate;
  }

  private get message() {
    return this.data.message;
  }

  private get continuousLine() {
    switch (this.data.type) {
      case TimelineSystemMessageType.TicketFinish: return false;
    }

    return true;
  }

  private get icon() {
    switch (this.data.type) {
      case TimelineSystemMessageType.TicketFinish: return "finish";
    }

    return "";
  }

  private get initiatorName(): string {
    if (!this.data?.initiator) { return ""; }

    switch (this.data.initiator.type) {
      case InitiatorTypeEnum.Flow: {
        return translate(LanguagePath.App_A_Something, { path: 'name', value: translate(LanguagePath.Flow) });
      }
      case InitiatorTypeEnum.User: {
        let user = useUtilityDataStore().user(this.data.initiator.id);
        return user != null ? user.name : translate(LanguagePath.App_A_Something, { path: 'name', value: translate(LanguagePath.User) });
      }
      case InitiatorTypeEnum.System: {
        return "Tick";
      }
    }
    return "-";
  }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.system-message {
  font-size: $text-size-regular;
  line-height: 20px;
  display: grid;
  gap: 5px;


  .message {
    font-weight: 600;
  }
}
</style>
