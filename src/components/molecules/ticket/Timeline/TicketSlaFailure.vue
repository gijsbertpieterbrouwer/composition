<template>
  <TimelineItem @click="navToItem" v-if="!data.success" icon="sla" :important="item.important" :date="item.timelineDate">
    <span class="sla-result">
      <span class="sla-name">{{ this.getSlaDefinitionName }}</span>&nbsp; {{ $translate(LanguagePath.App_TicketTimeline_Sla_Failure_Title) }}
    </span>
  </TimelineItem>
</template>

<script lang="ts">
import { SlaResult, TimelineDataItem, LanguagePath, AuthorizationObjectType, AuthorizationType } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TimelineItem from "@/components/molecules/ticket/Timeline/TimelineItem.vue";
import useUtilityDataStore from "@/store/utilitydata";
import { RouterToSlaDefinition } from "@/router";
import useUserStore from "@/store/user";


@Component({
  components: { TimelineItem },
})
export default class TicketSlaFailure extends Vue {
  LanguagePath = LanguagePath
  @Prop() private item: Required<TimelineDataItem>;

  private get data(): SlaResult {
    return this.item.data;
  }

  private get getSlaDefinitionName() {
    const slaDef = useUtilityDataStore().sla(this.data.slaDefinitionId);

    return slaDef == null
      ? "SLA"
      : slaDef.name;
  }

  private get allowedViewSlaDefinition(): boolean {
    return useUserStore().allowed(AuthorizationObjectType.TechnicalConfiguration, AuthorizationType.Viewer);
  }

  private navToItem() {
    if (!this.allowedViewSlaDefinition) { return; }
    RouterToSlaDefinition(this.data.slaDefinitionId);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.sla-result {
  font-size: $text-size-regular;
  line-height: 20px;


  .sla-name {
    font-weight: 600;
    text-transform: capitalize;
  }
}
</style>
