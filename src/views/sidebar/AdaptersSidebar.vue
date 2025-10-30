<template>
  <DocuHolder class="docuHolder" :group="docGroups" />

  <AdapterLogsList v-if="hasSelection" :adapterDefinitionId="selectedItemId" />
</template>

<script setup lang="ts">
import AdapterLogsList from '@/components/molecules/dataadapters/AdapterLogsList.vue';
import DocuHolder from '@/components/molecules/docublocks/DocuHolder.vue';
import { TickRouteParams } from '@/router';
import { DocumentationGroup } from '@/TickApi';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const selectedItemId = ref<string | null>(null);

const hasSelection = computed(() => selectedItemId.value != null);

const docGroups = computed(() => [DocumentationGroup.AdapterEditor, DocumentationGroup.Utility]);

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