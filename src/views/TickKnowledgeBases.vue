<template>
  <template v-if="hasActiveItem">
    <KnowledgeBaseEditor :activeId="selectedItemId" @saved="onSaved" @deleted="onDeleted" />
  </template>
  <template v-else>
    <TickScreen :title="$translate(LanguagePath.KnowledgeBases)">
      <template #actions>
        <TickAddCostItemButton @add="addEmpty" :requiredAuth="AuthorizationObjectType.ProcessConfiguration" :costItem="SubscriptionCostItemType.TaskDefinition" :currentNr="currentNr"
          :title="LanguagePath.App_Add" />
      </template>
      <template #default>
        <div class="list">
          <div class="collections">
            <CollectionsViewer class="list" @select="selectItem" :collection="collections" :typeFilters="objectTypeFilters" />
          </div>
        </div>
      </template>
    </TickScreen>
  </template>
</template>

<script setup lang="ts">
import useCollectionsStore from "@/store/collections";
import useManagingStore from "@/store/managingStore";
import { computed, onMounted, ref, watch } from "vue";

import TickAddCostItemButton from "@/components/atoms/TickAddCostItemButton.vue";
import CollectionsViewer from "@/components/molecules/collection/CollectionsViewer.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import KnowledgeBaseEditor from "@/components/molecules/knowledgebase/KnowledgeBaseEditor.vue";

import { AuthorizationObjectType, CollectionObjectTypeEnum, LanguagePath, SubscriptionCostItemType, TickKnowledgeBaseSummary } from "@/TickApi";
import { useRouter } from "vue-router";

// ──────────────────────────────
// REFS
// ──────────────────────────────
const selectedItemId = ref<string | null>(null);
const objectTypeFilters = ref<CollectionObjectTypeEnum[]>([CollectionObjectTypeEnum.KnowledgeBase]);

// ──────────────────────────────
// STORES
// ──────────────────────────────
const collectionsStore = useCollectionsStore();
const managingStore = useManagingStore();

// ──────────────────────────────
// COMPUTED
// ──────────────────────────────
const hasActiveItem = computed(() => selectedItemId.value != null && selectedItemId.value !== "");
const collections = computed(() => collectionsStore.collections);
const allItems = computed(() => collectionsStore.getByType(CollectionObjectTypeEnum.KnowledgeBase));
const currentNr = computed(() => allItems.value.length);

// ──────────────────────────────
// METHODS
// ──────────────────────────────
function addEmpty() {
  managingStore.addKnowledgeBase().then((newItem: TickKnowledgeBaseSummary) => {
    selectItem(newItem);
  });
}

function selectItem(item: TickKnowledgeBaseSummary) {
  const params = { ...useRouter().currentRoute.value.params, id: item.id };
  useRouter().push({ params });
}

function onDeleted() {
  useRouter().push({ name: "KnowledgeBases" });
}

function onSaved() {
  // optional: handle post-save behavior
}

// ──────────────────────────────
// LIFECYCLE
// ──────────────────────────────
onMounted(() => {
  collectionsStore.use();

  const routeId = useRouter().currentRoute.value.params.id;
  if (routeId) selectedItemId.value = routeId.toString();
});

// Keep selectedItemId in sync with route changes
watch(
  () => useRouter().currentRoute.value.params.id,
  (id) => {
    selectedItemId.value = id as string ?? null;
  }
);
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.collections {
  width: 440px;
}
</style>
