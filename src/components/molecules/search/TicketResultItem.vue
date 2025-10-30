<template>
  <TicketListItem class='ticket' @select="select" :ticket="itemAsTicketSummary" />
</template>

<script lang="ts">
import TicketListItem from "@/components/molecules/ticket/TicketListItem.vue";
import PanelReduceSwitch from "@/components/panels/PanelReduceSwitch.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { SearchResultItem, TicketSummary } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  directives: { focus },
  emits: ["close", "select"],
  components: {
    TickSettingsPanel,
    PanelReduceSwitch,
    TicketListItem,
  },
})
export default class TicketResultItem extends Vue {
  @Prop() private data!: SearchResultItem;

  private get itemAsTicketSummary(): TicketSummary {
    return JSON.parse(this?.data?.dataJson || "{}");
  }

  private select() {
    this.$emit("select", this.itemAsTicketSummary)
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.ticket {
  &:hover {
    color: var(--c-contrast);
    background-color: var(--c-base-300);
  }
}
</style>
