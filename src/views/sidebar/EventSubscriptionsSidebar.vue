<template>
  <DocuHolder class="docuHolder" :group="docGroups" />

  <AdapterLogsList v-if="hasAdapaterData" :adapterDefinitionId="eventSubscriptionAdapterId" />
</template>

<script setup lang="ts">
import AdapterLogsList from '@/components/molecules/dataadapters/AdapterLogsList.vue';
import DocuHolder from '@/components/molecules/docublocks/DocuHolder.vue';
import { TickRouteParams } from '@/router';
import useEventSubscriptionsStore from '@/store/eventSubscriptions';
import { DocumentationGroup } from '@/TickApi';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const eventSubscriptionsStore = useEventSubscriptionsStore();

const selectedItemId = ref<string | null>(null);

const eventSubscriptionData = computed(() => eventSubscriptionsStore.getEventSubscription(selectedItemId.value ?? ''));

const eventSubscriptionAdapterId = computed(() => eventSubscriptionData.value?.usedAdapterId);

const hasAdapaterData = computed(() => hasSelection.value && !!eventSubscriptionAdapterId.value);

const hasSelection = computed(() => selectedItemId.value != null);

const docGroups = [DocumentationGroup.EventSubscriptionEditor];

onMounted(() => {
  if (route.params.id) {
    selectedItemId.value = route.params.id.toString();
  }
});

watch(
  () => route.params,
  (to: TickRouteParams) => {
    selectedItemId.value = to.id ?? null;
  }
);
</script>

<style lang="scss" scoped>
.docuHolder {
  margin-top: 58px;
}
</style>