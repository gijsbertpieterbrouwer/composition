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

<script lang="ts">
import HappyIndicator from '@/components/atoms/HappyIndicator.vue';
import TickFocusScreen from '@/components/atoms/TickFocusScreen.vue';
import CommunicatorDetails from '@/components/molecules/communicator/CommunicatorDetails.vue';
import CommunicatorList from '@/components/molecules/communicator/CommunicatorList.vue';
import { focus } from "@/directives";
import { TickRouteParams } from '@/router';
import useCommunicatorsStore from '@/store/communicators';
import { CommunicatorFilterOptions, GetCommunicatorsResponse, TickCommunicatorSummary, TickTaskInstanceSummary } from '@/TickApi';
import { Component, Vue, Watch } from 'vue-facing-decorator';

@Component({
  directives: { focus },
  components: { TickFocusScreen, HappyIndicator, CommunicatorList, CommunicatorDetails },
})
export default class TickCommunicators extends Vue {
  private selectedItemId = "";
  private loadMoreBusy = false;
  private filteredTasksLoaded = false;

  private get communicatorFilters() {
    return useCommunicatorsStore().communicatorFilters;
  }

  private onSaved() {
    this.fetchCommunicatorsByFilter(false);
  }

  private updateFilters(to?: CommunicatorFilterOptions) {
    useCommunicatorsStore().communicatorFilters = to;
    this.fetchCommunicatorsByFilter(false);
  }

  private get filteredListResponse(): GetCommunicatorsResponse {
    return useCommunicatorsStore().listResponse;
  }

  private get communicatorSummaries(): TickCommunicatorSummary[] {
    return this.filteredListResponse?.communicators || [];
  }
  private get summariesCount(): number {
    return this.filteredListResponse?.totalCount || this.communicatorSummaries?.length;
  }

  private loadMoreCommunicators() {
    this.fetchCommunicatorsByFilter(true);
  }

  private fetchCommunicatorsByFilter(isPaging: boolean) {
    if (isPaging) { this.loadMoreBusy = true; }

    this.filteredTasksLoaded = isPaging ? false : true;
    const filters = isPaging ? useCommunicatorsStore().taskListResponse?.usedFilters : this.communicatorFilters;

    useCommunicatorsStore().use(filters, isPaging).then(() => {
      this.filteredTasksLoaded = true;
      this.loadMoreBusy = false;
    });
  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  mounted() {
    this.fetchCommunicatorsByFilter(false);

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  private exitDetails() {
    this.activateItem(null);
  }

  private selectItem(item: TickTaskInstanceSummary) {
    this.activateItem(item.id);
  }

  private activateItem(id: string) {
    this.$router.push({ params: { ...this.$route.params, id: id } });
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
  }
}
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
