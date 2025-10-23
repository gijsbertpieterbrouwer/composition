<template>
  <DocuHolder class="docuHolder" :group="docGroups" />

  <AdapterLogsList v-if="hasAdapaterData" :adapterDefinitionId="eventSubscriptionAdapterId" />
</template>

<script lang="ts">
import AdapterLogsList from '@/components/molecules/dataadapters/AdapterLogsList.vue';
import DocuHolder from '@/components/molecules/docublocks/DocuHolder.vue';
import { TickRouteParams } from '@/router';
import useEventSubscriptionsStore from '@/store/eventSubscriptions';
import { DocumentationGroup } from '@/TickApi';
import { Component, Vue, Watch } from 'vue-facing-decorator';

@Component({
  components: { DocuHolder, AdapterLogsList }
})
export default class EventSubscriptionsSidebar extends Vue {
  DocumentationGroup = DocumentationGroup
  private selectedItemId: string = null;

  private get eventSubscriptionData() {
    return useEventSubscriptionsStore().getEventSubscription(this.selectedItemId);
  }

  private get eventSubscriptionAdapterId() {
    return this.eventSubscriptionData?.usedAdapterId;
  }

  private get hasAdapaterData() {
    return this.hasSelection && this.eventSubscriptionAdapterId;
  }

  private get hasSelection() {
    return this.selectedItemId != null;
  }

  mounted() {
    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
  }

  private get docGroups() {
    return [DocumentationGroup.EventSubscriptionEditor];
  }
}
</script>
<style lang="scss" scoped>
.docuHolder {
  margin-top: 58px;
}
</style>