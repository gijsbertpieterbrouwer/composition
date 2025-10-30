<template>
  <template v-if="hasActiveItem">
    <DataBagEditor :activeId="selectedItemId" />
  </template>
  <template v-else>
    <TickScreen title="States & Variables">
      <template v-slot:actions>
        <TickButton v-if="allowEdit" @click="saveDefinitionItems" :disabled="!allowEdit">
          {{ $translate(LanguagePath.App_Save) }}
        </TickButton>
      </template>

      <template v-slot:default>
        <div class="info">
          State variables are used to fill messages, data-adapters and steer flows.
          Example: You define a contact.age variable. You can use it as such: Your age is: &#123;&#123;contact.age&#125;&#125;. => The result will look like "Your age is 37".
          Variables can be used in:
          <ul class="styledList">
            <li>Messaging: Canned responses as well as a direct message</li>
            <li>Data-adapters: In the body but also in the url leading towards the external API. <br /> The API-response (or a part of) can also be saved in a variable.</li>
            <li>Flows: Use them to steer, or fill variables by asking questions.</li>
          </ul>
        </div>

        <DatabagItemDefinitionsEditor />
      </template>
    </TickScreen>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import TickButton from "@/components/atoms/TickButton.vue";
import DataBagEditor from "@/components/molecules/databag/DatabagEditor.vue";
import DatabagItemDefinitionsEditor from "@/components/molecules/databag/DatabagItemDefinitionsEditor.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import { notifyError } from "@/notify";

import useDataBagsStore from "@/store/databags";
import useManagingStore from "@/store/managingStore";
import useUserStore from "@/store/user";
import { AuthorizationObjectType, LanguagePath, StorageLocation, TickDatabagItemDefinition, TickDataBagSummary } from "@/TickApi";

// ──────────────────────────────
// ROUTER
// ──────────────────────────────
const route = useRoute();
const router = useRouter();

// ──────────────────────────────
// STORES
// ──────────────────────────────
const dataBagsStore = useDataBagsStore();
const managingStore = useManagingStore();
const userStore = useUserStore();

// ──────────────────────────────
// REFS
// ──────────────────────────────
const selectedItemId = ref<string | undefined>(route.params.id?.toString());

// ──────────────────────────────
// COMPUTED
// ──────────────────────────────
const hasActiveItem = computed(() => selectedItemId.value != null && selectedItemId.value !== "");

const summaries = computed(() => dataBagsStore.summaries || []);

const allowEdit = computed(() =>
  userStore.allowedEdit(AuthorizationObjectType.TechnicalConfiguration)
);

const hasDuplicateKeys = computed(() => {
  const items = managingStore.databagItemDefinitions as TickDatabagItemDefinition[] || [];
  return items.some((item, idx) =>
    items.some((p, i) => i !== idx && p.fullPath === item.fullPath)
  );
});

// ──────────────────────────────
// METHODS
// ──────────────────────────────
function saveDefinitionItems() {
  if (hasDuplicateKeys.value) {
    notifyError("Cannot save", "Multiple variables have the same path, please fix before save.");
    return;
  }
  managingStore.saveDatabagItemDefinitions().then(() => {
    // saved callback
  });
}

function getIcon(item: TickDataBagSummary) {
  return item.storage === StorageLocation.Vault ? "secure" : "databag";
}

function selectItem(item: TickDataBagSummary) {
  router.push({ params: { ...route.params, id: item.id } });
}

// ──────────────────────────────
// WATCHERS
// ──────────────────────────────
watch(
  () => route.params.id,
  (newId) => {
    selectedItemId.value = newId?.toString();
  }
);

// ──────────────────────────────
// LIFECYCLE
// ──────────────────────────────
onMounted(() => {
  dataBagsStore.use();
});
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.styledList {
  margin-left: 20px;
}

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 50px;
}

.info {
  font-size: 0.8em;
  opacity: 0.7;
  padding-bottom: 45px;
}
</style>
