<template>
  <template v-if="hasActiveItem">
    <KnowledgeBaseArticleEditor :activeId="selectedItemId" @saved="onSaved" @deleted="onDeleted" />
  </template>
  <template v-else>
    loading...
  </template>
</template>

<script setup lang="ts">
import KnowledgeBaseArticleEditor from "@/components/molecules/knowledgebase/KnowledgeBaseArticleEditor.vue";
import useManagingStore from "@/store/managingStore";
import useUserStore from "@/store/user";
import { AuthorizationObjectType, TickKnowledgeBaseSummary } from "@/TickApi";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

// ──────────────────────────────
// REFS
// ──────────────────────────────
const selectedItemId = ref<string | null>(null);
const busyAdding = ref(false);

// ──────────────────────────────
// STORES
// ──────────────────────────────
const managingStore = useManagingStore();
const userStore = useUserStore();

// ──────────────────────────────
// COMPUTED
// ──────────────────────────────
const hasActiveItem = computed(() => selectedItemId.value != null && selectedItemId.value !== "");
const createAllowed = computed(() => userStore.allowedEdit(AuthorizationObjectType.ProcessConfiguration));
const items = computed(() => managingStore.knowledgebaseSummaries || []);

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
  // optional post-save behavior
}

// ──────────────────────────────
// LIFECYCLE
// ──────────────────────────────
onMounted(() => {
  const routeId = useRouter().currentRoute.value.params.id;
  if (routeId) selectedItemId.value = routeId.toString();
});

watch(
  () => useRouter().currentRoute.value.params.id,
  (id) => {
    selectedItemId.value = id as string ?? null;
  }
);
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
}
</style>
