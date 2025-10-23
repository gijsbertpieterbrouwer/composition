<template>
  <TickFocusScreen :noPadding="true" :noSidebar="!showSidebar">
    <template #list>
      <TicketList class="list" :loadMoreBusy="loadMoreBusy" :totalCount="ticketSummariesCount" :list="ticketSummaries" :activeId="selectedItemId" @select="navigateToTicket"
        @updateFilters="updateFilters" :ticketFilters="ticketFilters" @loadMore="loadMoreQuests" />
    </template>

    <TicketContent @exit="exitTicket" :activeId="selectedItemId" class="details" v-if="hasActiveItem" />
    <div class="no-data" v-else>
      <HappyIndicator :text="noTicketsText" />
    </div>

    <template #sidebar>
      <TicketMetaDataComponentsArea :activeId="selectedItemId" />
    </template>
  </TickFocusScreen>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-facing-decorator";

import useTicketsStore from "@/store/tickets";
import { RouterToTicket, TickRouteParams } from "@/router";
import TickFocusScreen from "@/components/atoms/TickFocusScreen.vue";
import TicketList from "@/components/molecules/ticket/TicketList.vue";
import TicketContent from "@/components/molecules/ticket/TicketContent.vue";
import TicketMetaDataComponentsArea from "@/components/molecules/ticket/TicketMetaDataComponentsArea.vue";
import { debugAction } from "@/log";
import TickIcon from "@/components/TickIcon.vue";
import HappyIndicator from "@/components/atoms/HappyIndicator.vue";
import { getRandomInt } from "@/helpers/randomHelper";
import { GetTicketsResponse, LanguagePath, TicketFilterOptions, TicketSummary } from "@/TickApi";
import useViewstateStore from "@/store/viewstate";
import { translate } from "@/plugins/translatePlugin";

@Component({
  components: {
    TicketList,
    TicketContent,
    TickFocusScreen,
    TicketMetaDataComponentsArea,
    TickIcon,
    HappyIndicator
  },
})
export default class TickTickets extends Vue {
  private ticketsPollerTimer: unknown = null;
  private selectedItemId = "";
  private filteredTicketsLoaded = false;
  private loadMoreBusy = false;

  private get showSidebar() {
    return useViewstateStore().canShowFull;
  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get hasFilteredTickets(): boolean {
    return this.ticketSummaries && this.ticketSummaries?.length > 0 || false;
  }


  private get ticketFilters() {
    return useTicketsStore().ticketFilters;
  }

  private updateFilters(to?: TicketFilterOptions) {
    useTicketsStore().ticketFilters = to;
    this.fetchTicketsByFilter(false);

  }


  private activateTicket(id?: string) {
    useTicketsStore().activateTicket(id);
  }

  private get noTicketsText() {
    if (this.hasFilteredTickets) {
      return translate(LanguagePath.App_TicketEditor_NothingSelected_HasTickets);// "Select a ticket";
    } else {
      return translate(LanguagePath.App_TicketEditor_NothingSelected_HasNoTickets);
    }
  }

  private get filteredListResponse(): GetTicketsResponse {
    return useTicketsStore().ticketListResponse;
  }

  private get ticketSummaries(): TicketSummary[] {
    return this.filteredListResponse?.tickets || [];
  }
  private get ticketSummariesCount(): number {
    return this.filteredListResponse?.totalCount || this.ticketSummaries?.length;
  }


  private loadMoreQuests() {
    this.fetchTicketsByFilter(true);
  }

  private fetchTicketsByFilter(isPaging: boolean) {
    if (isPaging) { this.loadMoreBusy = true; }

    this.filteredTicketsLoaded = isPaging ? false : true;

    const filters = isPaging ? useTicketsStore().ticketListResponse?.usedFilters : this.ticketFilters;

    useTicketsStore().use(filters, isPaging).then(() => {
      this.filteredTicketsLoaded = true;
      this.loadMoreBusy = false;
    });

  }

  private mounted() {
    this.fetchTicketsByFilter(false);

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }

    if (this.$route.params.id) {
      this.activateTicket(this.$route.params.id as string)
    } else {
      this.checkTicketActive();
    }
    this.startPoller();
  }

  private beforeUnmount() {
    clearTimeout(this.ticketsPollerTimer as number);
  }

  private startPoller() {
    // Choose random interval because when connection drops ALL connected clients will otherwise poll at the exact same timing which will break the backend
    const randomInterval = getRandomInt(5000, 15000);
    this.ticketsPollerTimer = setTimeout(() => {

      useTicketsStore().pollUpdates(this.selectedItemId);

      this.startPoller();
    }, randomInterval);
  }

  private get loaded() {
    return this.filteredTicketsLoaded;
  }

  @Watch("loaded")
  private checkTicketActive() {

    if (this.loaded && !this.$route.params.id && !this.selectedItemId && this.ticketSummaries && this.ticketSummaries.length) {
      debugAction("[Ticket:OPEN FIRST]Navigate to the first in the list")
      this.navigateToTicket({ id: this.ticketSummaries[0].id });
    }
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams, from: TickRouteParams) {
    if (to && to.id) {
      if (to.id !== from.id) {
        this.activateTicket(to.id as string)
      }
    } else {
      this.checkTicketActive();
    }


    this.selectedItemId = to.id || null;

  }


  //fixme: => move to questList 
  // @Watch("tickets")
  // private ticketsListChanged(to: unknown[], from: unknown[]) {
  //   if (!from.length && to.length) {
  //     this.checkTicketActive();
  //   }
  // }

  private exitTicket() {
    RouterToTicket(null);
  }

  private navigateToTicket({ id }: { id: string }) {
    RouterToTicket(id);
  }

}
</script>

<style lang="scss" scoped>
.list {
  padding-top: 40px;
}

.no-data {
  display: grid;
  place-items: center;
  padding: 120px;
}
</style>
@/store/tickets