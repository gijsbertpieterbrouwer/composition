<template>
  <TickFocusScreen :no-padding="true" :no-sidebar="!showSidebar">
    <template #list>
      <TicketList class="list" :load-more-busy="loadMoreBusy" :total-count="ticketSummariesCount" :list="ticketSummaries" :active-id="selectedItemId" :ticket-filters="ticketFilters"
        @select="navigateToTicket" @updateFilters="updateFilters" @loadMore="loadMoreQuests" />
    </template>

    <TicketContent v-if="hasActiveItem" class="details" :active-id="selectedItemId" @exit="exitTicket" />

    <div v-else class="no-data">
      <HappyIndicator :text="noTicketsText" />
    </div>

    <template #sidebar>
      <TicketMetaDataComponentsArea :active-id="selectedItemId" />
    </template>
  </TickFocusScreen>
</template>

<script lang="ts" setup>
import HappyIndicator from "@/components/atoms/HappyIndicator.vue";
import TickFocusScreen from "@/components/atoms/TickFocusScreen.vue";
import TicketContent from "@/components/molecules/ticket/TicketContent.vue";
import TicketList from "@/components/molecules/ticket/TicketList.vue";
import TicketMetaDataComponentsArea from "@/components/molecules/ticket/TicketMetaDataComponentsArea.vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { GetTicketsResponse, LanguagePath, TicketFilterOptions, TicketSummary } from "@/TickApi";
import { getRandomInt } from "@/helpers/randomHelper";
import { debugAction } from "@/log";
import { translate } from "@/plugins/translatePlugin";
import { RouterToTicket, TickRouteParams } from "@/router";
import useTicketsStore from "@/store/tickets";
import useViewstateStore from "@/store/viewstate";

const ticketsStore = useTicketsStore();
const viewstateStore = useViewstateStore();

const ticketsPollerTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const selectedItemId = ref<string | null>(null);
const filteredTicketsLoaded = ref(false);
const loadMoreBusy = ref(false);

// ────────────────────────────────
// COMPUTED PROPERTIES
// ────────────────────────────────
const showSidebar = computed(() => viewstateStore.canShowFull);

const hasActiveItem = computed(() => !!selectedItemId.value);

const hasFilteredTickets = computed(() => ticketSummaries.value.length > 0);

const ticketFilters = computed(() => ticketsStore.ticketFilters);

const filteredListResponse = computed<GetTicketsResponse | null>(
  () => ticketsStore.ticketListResponse
);

const ticketSummaries = computed<TicketSummary[]>(() => filteredListResponse.value?.tickets || []);

const ticketSummariesCount = computed<number>(
  () => filteredListResponse.value?.totalCount || ticketSummaries.value.length
);

const noTicketsText = computed(() =>
  hasFilteredTickets.value
    ? translate(LanguagePath.App_TicketEditor_NothingSelected_HasTickets)
    : translate(LanguagePath.App_TicketEditor_NothingSelected_HasNoTickets)
);

const loaded = computed(() => filteredTicketsLoaded.value);

// ────────────────────────────────
// METHODS
// ────────────────────────────────
function updateFilters(to?: TicketFilterOptions) {
  ticketsStore.ticketFilters = to ?? null;
  fetchTicketsByFilter(false);
}

function activateTicket(id?: string | null) {
  ticketsStore.activateTicket(id);
}

function loadMoreQuests() {
  fetchTicketsByFilter(true);
}

function fetchTicketsByFilter(isPaging: boolean) {
  if (isPaging) loadMoreBusy.value = true;

  filteredTicketsLoaded.value = !isPaging;

  const filters = isPaging
    ? ticketsStore.ticketListResponse?.usedFilters ?? null
    : ticketFilters.value;

  ticketsStore.use(filters, isPaging).then(() => {
    filteredTicketsLoaded.value = true;
    loadMoreBusy.value = false;
  });
}

function startPoller() {
  const randomInterval = getRandomInt(5000, 15000);
  ticketsPollerTimer.value = setTimeout(() => {
    ticketsStore.pollUpdates(selectedItemId.value || null);
    startPoller();
  }, randomInterval);
}

function checkTicketActive() {
  if (
    loaded.value &&
    !selectedItemId.value &&
    ticketSummaries.value.length
  ) {
    debugAction("[Ticket:OPEN FIRST] Navigate to the first in the list");
    navigateToTicket({ id: ticketSummaries.value[0].id });
  }
}

function exitTicket() {
  RouterToTicket(null);
}

function navigateToTicket({ id }: { id: string }) {
  RouterToTicket(id);
}

// ────────────────────────────────
// WATCHERS
// ────────────────────────────────
watch(loaded, () => {
  checkTicketActive();
});

watch(
  () => ticketsStore.ticketListResponse,
  () => {
    if (!selectedItemId.value && ticketSummaries.value.length) {
      checkTicketActive();
    }
  }
);

watch(
  () => viewstateStore.routeParams as TickRouteParams,
  (to, from) => {
    if (to && to.id) {
      if (to.id !== from?.id) activateTicket(to.id);
    } else {
      checkTicketActive();
    }
    selectedItemId.value = to.id || null;
  },
  { deep: true }
);

// ────────────────────────────────
// LIFECYCLE HOOKS
// ────────────────────────────────
onMounted(() => {
  fetchTicketsByFilter(false);

  const route = viewstateStore.routeParams as TickRouteParams;
  if (route?.id) {
    selectedItemId.value = route.id.toString();
    activateTicket(route.id);
  } else {
    checkTicketActive();
  }

  startPoller();
});

onBeforeUnmount(() => {
  if (ticketsPollerTimer.value) clearTimeout(ticketsPollerTimer.value);
});
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
