<template>
  <TimelineItem :icon="icon" :userId="initiator.id" class="label" :important="item.important" :date="item.timelineDate">
    <div class="content">
      {{ this.initiatorName }}
      <span class="subdued">{{ this.action }} label</span>
      <Ticklabel :allowRemove="false" :disableCollapse="true" :color="label.color" :name="label.name" />

    </div>
  </TimelineItem>
</template>

<script lang="ts">
import Ticklabel from "@/components/atoms/TickLabel.vue";
import TimelineItem from "@/components/molecules/ticket/Timeline/TimelineItem.vue";
import { translate } from "@/plugins/translatePlugin";
import useUtilityDataStore from "@/store/utilitydata";
import {
  ColorsEnum,
  InitiatorTypeEnum,
  LanguagePath,
  TimelineDataItem,
  TimelineLabel
} from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickInitiator from "../../TickInitiator.vue";

// FIXME: Ruben use TickInitiator again

@Component({
  components: { TickInitiator, Ticklabel, TimelineItem },
})
export default class TicketLabel extends Vue {
  @Prop() private item: Required<TimelineDataItem>;

  private get data(): TimelineLabel {
    return this.item.data;
  }


  private getUserName() {
    const user = useUtilityDataStore().user(this.initiator.id);
    return user ? user.name : "-";
  }

  private get initiatorName(): string {
    switch (this.initiator.type) {
      case InitiatorTypeEnum.Flow: {
        return translate(LanguagePath.App_A_Something, { path: 'name', value: translate(LanguagePath.Flow) });
      }
      case InitiatorTypeEnum.User: {
        let user = useUtilityDataStore().user(this.initiator.id);
        return user != null ? user.name : translate(LanguagePath.App_A_Something, { path: 'name', value: translate(LanguagePath.User) });
      }
      case InitiatorTypeEnum.System: {
        return "Tick";
      }
    }
    return "-";
  }

  private get initiator() {
    return this.data.isEnd
      ? this.data.label.removedBy
      : this.data.label.createdBy;
  }

  private get icon() {
    if (!this.initiator) {
      return "flow";
    }

    switch (this.initiator.type) {
      case InitiatorTypeEnum.User:
        return "user";
    }

    return "flow";
  }

  private get action() {
    return this.data.isEnd ? translate(LanguagePath.App_TicketTimeline_Removed) : translate(LanguagePath.App_TicketTimeline_Added);
  }

  private get label() {
    const labelDef = useUtilityDataStore().label(this.data.label.labelDefinitionId);

    if (!labelDef) {
      return {
        color: ColorsEnum.Grey,
        id: "unknown",
        name: "unknown",
        deleted: false,
      };
    }

    return {
      color: labelDef.color,
      id: labelDef.id,
      name: labelDef.name,
      deleted: labelDef.deleted,
    };
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.label {
  font-size: $text-size-regular;
  line-height: 20px;
}

.content {
  display: flex;
  gap: 4px;
  align-items: center;
}
</style>
