<template>
  <TickFocusScreen :noSidebar="true">
    <CommunicatorDetails v-if="hasActiveItem" @exit="exitDetails" class="details" :activeId="selectedItemId" @saved="onSaved" />

    <template v-else>
      <div class="no-data">
        <HappyIndicator :text="'No contacts, you can add one!'" />
      </div>
    </template>

    <template #list>
      <CommunicatorList :activeId="selectedItemId" class="list" @select="selectItem" :filters="communicatorFilters" @updateFilters="updateFilters" :loadMoreBusy="loadMoreBusy"
        :totalCount="summariesCount" :list="communicatorSummaries" @loadMore="loadMoreCommunicators" />
    </template>
    <template #sidebar>
    </template>
  </TickFocusScreen>
</template>

<script setup lang="ts">
import HappyIndicator from '@/components/atoms/HappyIndicator.vue';
import TickFocusScreen from '@/components/atoms/TickFocusScreen.vue';
import CommunicatorDetails from '@/components/molecules/communicator/CommunicatorDetails.vue';
import CommunicatorList from '@/components/molecules/communicator/CommunicatorList.vue';
import { TickRouteParams } from '@/router';
import useCommunicatorsStore from '@/store/communicators';
import { CommunicatorFilterOptions, TickTaskInstanceSummary } from '@/TickApi';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const communicatorsStore = useCommunicatorsStore();
const selectedItemId = ref<string | undefined>("");
const loadMoreBusy = ref(false);
const filteredTasksLoaded = ref(false);

const communicatorFilters = computed(() => communicatorsStore.communicatorFilters);

const filteredListResponse = computed(() => communicatorsStore.listResponse);

const communicatorSummaries = computed(() => filteredListResponse.value?.communicators ?? []);

const summariesCount = computed(() => filteredListResponse.value?.totalCount ?? communicatorSummaries.value.length);

const hasActiveItem = computed(() => !!selectedItemId.value && selectedItemId.value !== "");

const onSaved = () => {
  fetchCommunicatorsByFilter(false);
};

const updateFilters = (to?: CommunicatorFilterOptions | undefined) => {
  communicatorsStore.communicatorFilters = to;
  fetchCommunicatorsByFilter(false);
};

const loadMoreCommunicators = () => {
  fetchCommunicatorsByFilter(true);
};

const fetchCommunicatorsByFilter = async (isPaging: boolean) => {
  if (isPaging) { loadMoreBusy.value = true; }

  filteredTasksLoaded.value = isPaging ? false : true;
  const filters = isPaging ? (communicatorsStore.taskListResponse?.usedFilters ?? communicatorFilters.value) : communicatorFilters.value;

  try {
    await communicatorsStore.use(filters, isPaging);
  } finally {
    filteredTasksLoaded.value = true;
    loadMoreBusy.value = false;
  }
};

const exitDetails = () => {
  activateItem(null);
};

const selectItem = (item: TickTaskInstanceSummary) => {
  activateItem(item.id);
};

const activateItem = (id: string | null) => {
  router.push({ params: { ...route.params, id: id ?? '' } });
};

onMounted(() => {
  fetchCommunicatorsByFilter(false);

  if (route.params.id) {
    selectedItemId.value = route.params.id.toString();
  }
});

watch(
  () => route.params,
  (to: TickRouteParams) => {
    selectedItemId.value = to.id ?? undefined;
  }
);
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  padding-top: 40px;
}

.no-data {
  display: grid;
  place-items: center;
  padding: 120px;
}
</style>