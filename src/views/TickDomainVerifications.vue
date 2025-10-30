<template>
  <TickScreen :title="$translate(LanguagePath.DomainVerifications)">
    <template v-slot:actions></template>

    <template v-slot:default>
      <InternetDomainCreator v-if="allowAdd" />
      <InternetDomainEditor v-for="item in domains" :key="item.id" :domain="item" @deleted="() => onDeleted(item)" />
    </template>
  </TickScreen>
</template>

<script setup lang="ts">
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import InternetDomainCreator from "@/components/molecules/internetdomain/InternetDomainCreator.vue";
import InternetDomainEditor from "@/components/molecules/internetdomain/InternetDomainEditor.vue";
import { computed, onMounted, ref } from "vue";

import useInternetDomainsStore from "@/store/internetDomains";
import useUserStore from "@/store/user";
import { AuthorizationObjectType, LanguagePath, SubscriptionCostItemType, TickInternetDomain } from "@/TickApi";

// ──────────────────────────────
// STORES
// ──────────────────────────────
const domainsStore = useInternetDomainsStore();
const userStore = useUserStore();

// ──────────────────────────────
// REFS
// ──────────────────────────────
const busyAdding = ref(false);

// ──────────────────────────────
// COMPUTED
// ──────────────────────────────
const domains = computed<TickInternetDomain[]>(() => domainsStore.domains || []);

const addAllowedInPlan = computed(() => {
  return userStore.allowedAddInPlan(SubscriptionCostItemType.InternetDomain, domains.value.length);
});

const allowAdd = computed(() =>
  userStore.allowedEdit(AuthorizationObjectType.TechnicalConfiguration) && addAllowedInPlan.value
);

const allowEdit = computed(() => true); // or replace with actual permission logic

// ──────────────────────────────
// METHODS
// ──────────────────────────────
function onSaved() {
  // placeholder
}

function onDeleted(item: TickInternetDomain) {
  domainsStore.domains = domainsStore.domains.filter(p => p.id !== item.id);
}

// function to navigate/select item if needed
// function selectItem(item: TickInternetDomain) {
//   router.push({ params: { ...route.params, id: item.id } });
// }

// ──────────────────────────────
// LIFECYCLE
// ──────────────────────────────
onMounted(() => {
  domainsStore.use();
});
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
