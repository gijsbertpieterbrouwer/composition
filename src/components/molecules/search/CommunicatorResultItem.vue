<template>
  <GenericResultWithListItem>
    <template v-slot:header>
      <div class="header">
        <CommunicatorIcon class="avatar" :communicator="communicator" :sizePx="50" /><span class="name">{{ this.communicatorName }}</span>
        <div class="actions">
          <TickButton @click="startTicket" icon="plus" :appearance="Appearance.secondary" :size="Size.mini" :color="Color.contrast">{{ $translate(LanguagePath.Ticket) }}</TickButton>
        </div>
      </div>
    </template>
    <TicketListItem class="ticket" @click="selectTicket(item)" :ticket="item" v-for="item in this.ticketSummaries" :key="item.id" />
  </GenericResultWithListItem>
</template>

<script lang="ts">
import CommunicatorIcon from "@/components/atoms/CommunicatorIcon.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TicketListItem from "@/components/molecules/ticket/TicketListItem.vue";
import PanelReduceSwitch from "@/components/panels/PanelReduceSwitch.vue";
import { openTicketCreatorPanel } from "@/components/panels/TicketCreatorPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { LanguagePath, SearchCommunicatorItem, SearchResultItem, TickCommunicator, TicketSummary } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import GenericResultWithListItem from "./GenericResultWithListItem.vue";

@Component({
  directives: { focus },
  emits: ["close", "selectTicket"],
  components: {
    TickButton,
    TickSettingsPanel,
    PanelReduceSwitch,
    TicketListItem,
    CommunicatorIcon,
    GenericResultWithListItem
  },
})
export default class CommunicatorResultItem extends Vue {
  LanguagePath = LanguagePath
  Appearance = Appearance
  Size = Size
  Color = Color
  @Prop() private data!: SearchResultItem;

  private get item(): SearchCommunicatorItem {
    return JSON.parse(this?.data?.dataJson || "{}");
  }

  private get communicator(): TickCommunicator {
    return this.item.communicator;
  }

  private get communicatorName() {
    return this?.communicator?.name || "";
  }

  private get ticketSummaries(): TicketSummary[] {
    return this.item.ticketSummaries || [];
  }

  private selectTicket(item: TicketSummary) {
    this.$emit("selectTicket", item);
  }

  private startTicket() {
    openTicketCreatorPanel(this.communicator.id, true);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.header {
  display: grid;
  gap: 10px;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "avatar name"
    "avatar actions";

  .avatar {
    grid-area: avatar;
  }

  .name {
    grid-area: name;
  }

  .actions {
    grid-area: actions;
  }


}


.name {
  text-transform: capitalize;
}

.ticket {
  &:hover {
    background-color: var(--c-base-300);
  }
}
</style>
