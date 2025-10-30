<template>
  <div class="wrapper">
    <div class="header">
      <TicketFiltersButton @filtersUpdated="filtersUpdated" :data="ticketFilters" />
      <TicketListOptionsButton />
    </div>

    <div class="results-count">
      <BusyIndicator :loading="isLoading" />{{ this.resultsText }}
    </div>

    <ul class="list" v-if="hasItems">
      <TicketListItem :activeId="activeId" v-for="ticket in this.listToShow" :key="ticket.id" :ticket="ticket" @select="$emit('select', ticket)" :options="listOptions" />
      <div class="loadmore-wrapper">
        <TickButton v-if="hasMore" @click="loadMore" :busy="loadMoreBusy" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_LoadMore) }}</TickButton>
        <span v-else-if="hasItems" class="end-list">{{ $translate(LanguagePath.App_EndOfList) }}</span>
      </div>
    </ul>
    <div v-else class="list no-data">{{ this.noTicketsText }}</div>

    <div class="addbutton">
      <TickButton v-if="allowedAddTicket" @click="startCreateNewTicket" :appearance="Appearance.primary" :color="Color.contrast" :size="Size.XXL" icon="plus" :round="true">
      </TickButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import useTicketsStore, { TicketListOptions } from "@/store/tickets";

import SectionWithSidebar from "@/components/atoms/SectionWithSidebar.vue";
import TicketListItem from "@/components/molecules/ticket/TicketListItem.vue";
import TickIcon from "@/components/TickIcon.vue";
import keyboard from "@/helpers/keyboard";
import { RouterToTicket } from "@/router";

import BusyIndicator from "@/components/atoms/BusyIndicator.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickInputLabel from "@/components/atoms/TickInputLabel.vue";
import TicketCreatorPanel, { openTicketCreatorPanel } from '@/components/panels/TicketCreatorPanel.vue';
import { mount, unmount } from "@/helpers/mountHelper";
import { translate } from '@/plugins/translatePlugin';
import useUserStore from "@/store/user";
import { AuthorizationObjectType, LanguagePath, TicketFilterOptions, TicketSummary } from "@/TickApi";
import TicketFiltersButton from "./panels/TicketFiltersButton.vue";
import TicketListOptionsButton from "./panels/TicketListOptionsButton.vue";

@Component({
  emits: ["select", "updateFilters", "loadMore"],
  components: { TicketListItem, SectionWithSidebar, TickIcon, TickButton, TicketFiltersButton, BusyIndicator, TicketListOptionsButton, TicketCreatorPanel, TickInputLabel },
})
export default class TicketList extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop() private ticketFilters: TicketFilterOptions;
  @Prop() private activeId!: string;
  @Prop() private list!: TicketSummary[];
  @Prop() private totalCount: number;
  @Prop() private loadMoreBusy: boolean;

  private keyboardIds: number[] = [];
  private activePanel = "";

  private get allowedAddTicket() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Ticket);
  }

  private startCreateNewTicket() {
    //this.togglePanel();
    openTicketCreatorPanel(null, true);
  }



  private togglePanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.activePanel) { return; }

    this.activePanel = mount(TicketCreatorPanel, {
      props: {},
      loadComponents: [],
      events: {
        close: (newTicketId?: string) => {
          this.closePanel();
          if (newTicketId) {
            RouterToTicket(newTicketId);
          }
        },
      },
    });
  }


  private closePanel() {
    unmount(this.activePanel);
    this.activePanel = "";
  }

  private get listOptions(): TicketListOptions {
    return useTicketsStore().listOptions;
  }


  private loadMore() {
    this.$emit("loadMore");
  }

  private get hasMore() {
    return this.totalCount > this.listToShow.length;
  }


  private get nrOfResults() {
    return this.totalCount || 0;
  }

  private get isLoading() {
    return !this.loadMoreBusy && useTicketsStore().ticketListResponseIsLoading;
  }

  private get resultsText() {
    if (this.isLoading) { return translate(LanguagePath.App_Searching) }
    return this.totalCount == 0 ? "" : translate(LanguagePath.App_Found_Title, { path: 'nr', value: this.totalCount.toString() })
  }

  private get noTicketsText() {
    return translate(LanguagePath.App_TicketList_NothingFound)
    // const hasFilters = getActiveFiltersNr(this.ticketFilters) > 0;
    // return hasFilters ? "No tickets found with these filters" : "No tickets found for you";
  }

  private get hasItems(): boolean {
    return this.listToShow.length >= 1;
  }

  private get listToShow() {
    return this.list || [];
  }

  mounted() {
    // NAV up/down with pageUp/Down
    this.keyboardIds.push(keyboard.on("PageUp", () => {
      if (this.currentQuestIndex < 1) { return; }

      const questToShow = this.listToShow[this.currentQuestIndex - 1];
      RouterToTicket(questToShow.id);
    }, {
      ignoreInputFieldEvents: true
    }));

    this.keyboardIds.push(keyboard.on("PageDown", () => {
      if (this.currentQuestIndex >= this.listToShow.length - 1) { return; }

      const questToShow = this.listToShow[this.currentQuestIndex + 1];
      RouterToTicket(questToShow.id);
    }, {
      ignoreInputFieldEvents: true
    }));
  }


  private beforeUnmount() {
    //Unbind Nav with pagUp/Down
    keyboard.off(this.keyboardIds);
  }

  private get currentQuestIndex() {
    const currentIndex = this.listToShow.findIndex(p => p.id == this.activeId);
    return currentIndex;
  }



  private filtersUpdated(newFilters?: TicketFilterOptions) {
    this.$emit("updateFilters", newFilters);
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  display: grid;
  gap: 5px;
}


.wrapper {
  display: grid;
  gap: 5px;



  .header {
    display: grid;
    grid-template-columns: auto auto;
    padding: 1px;

  }


  .loadmore-wrapper {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    padding: 20px;

    .end-list {
      font-size: 0.6em;
      font-style: italic;
      opacity: 0.7;
    }
  }

  .results-count {
    font-size: 0.7em;
    opacity: 0.7;
    min-height: 25px;

  }

  .no-data {
    font-size: 0.7em;
    font-style: italic;
    opacity: 0.7;
  }
}

.addbutton {
  position: sticky;
  bottom: 20px;
  display: flex;
  justify-content: end;
}
</style>
