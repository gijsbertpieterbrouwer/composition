<template>
  <div>
    <TickLabel :title="title" class="ticket-status" :disableCollapse="true" :name="title" :color="colorName" :allowRemove="false" />
  </div>
</template>

<script lang="ts">
import { ColorsEnum, TicketStatus } from "@/TickApi";
import TickLabel from "@/components/atoms/TickLabel.vue";
import { getTicketStatus } from "@/helpers/enumsHelper";
import { Component, Prop, Vue } from "vue-facing-decorator";
@Component({
  emits: ["select", "remove"],
  components: { TickLabel },
})
export default class TicketStatusLabel extends Vue {
  @Prop() private status!: TicketStatus;

  private get title() {

    return getTicketStatus(this.status);

    // switch (this.status) {
    //   case TicketStatus.Finished:
    //     return "Completed";
    //   case TicketStatus.WaitingForCommunicator:
    //     return "Open: Waiting for response";
    //   case TicketStatus.WaitingForTickUser:
    //     return "Open: Waiting for you";
    //   default:
    //     return "Open";
    // }

  }

  private get colorName(): ColorsEnum {
    switch (this.status) {
      case TicketStatus.Finished:
        return ColorsEnum.BoldLime;
      case TicketStatus.WaitingForCommunicator:
        return ColorsEnum.BoldBlue;
      case TicketStatus.WaitingForTickUser:
        return ColorsEnum.BoldYellow;
      default:
        return ColorsEnum.BoldBlue;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.ticket-status {
  font-weight: 400;
}
</style>
