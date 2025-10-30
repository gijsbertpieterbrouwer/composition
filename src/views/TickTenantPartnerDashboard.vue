<template>
  <template v-if="hasActiveItem">
    <PartnerShipTenantEditor :active-id="selectedItemId" />
  </template>

  <template v-else>
    <TickScreen title="Your partnership">
      <template #actions>
        <!-- <TickButton @click="addAdapter">New adapter</TickButton> -->
      </template>

      <template #default>
        <TickEditorPanel :name="subTenantsPanelTitle">
          <div class="list">
            <TickListItem v-for="item in subTenants" :key="item.id" icon="subscription" :name="item.name" title="View tenant details" :click-data="item" @select="selectSubtenant">
              <div class="labels">
                <TickLabel v-if="item.subscriptionName" :title="item.subscriptionName" :disable-collapse="true" :name="item.subscriptionName" :color="ColorsEnum.Yellow" :allow-remove="false" />
                <TickLabel v-if="!item.ispaying" title="Non paying tenant" :disable-collapse="true" name="FREE" :color="ColorsEnum.Lime" :allow-remove="false" />
              </div>
            </TickListItem>
          </div>
        </TickEditorPanel>
      </template>
    </TickScreen>
  </template>
</template>

<script setup lang="ts">
import TickLabel from "@/components/atoms/TickLabel.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickEditorPanel from "@/components/molecules/editor/TickEditorPanel.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import PartnerShipTenantEditor from "@/components/molecules/partnership/PartnerShipTenantEditor.vue";
import { computed, onMounted, ref, watch } from "vue";

import usePartnershipStore from "@/store/partnership";
import useUserStore from "@/store/user";
import {
  AuthorizationObjectType,
  ColorsEnum,
  TenantOverviewSummary
} from "@/TickApi";
import { useRoute, useRouter } from "vue-router";

// ────────────────────────────────
// COMPONENT SETUP
// ────────────────────────────────
const route = useRoute();
const router = useRouter();
const partnershipStore = usePartnershipStore();
const userStore = useUserStore();

// ────────────────────────────────
// REFS & ENUMS
// ────────────────────────────────
const selectedItemId = ref<string | null | undefined>(null);

// ────────────────────────────────
// COMPUTED PROPERTIES
// ────────────────────────────────
const hasActiveItem = computed(() => !!selectedItemId.value);

const editallowed = computed(() =>
  userStore.allowedEdit(AuthorizationObjectType.Workspace)
);

const partnershipData = computed(() => partnershipStore.getCurrent);

const subTenants = computed(() => partnershipData.value?.currentPartnershipData?.subTenants || []);

const subTenantsPanelTitle = computed(() => {
  const payingNumber = subTenants.value.filter((p) => p.ispaying).length;
  return payingNumber === 1
    ? `1 paying registered tenant`
    : `${payingNumber} paying tenants registered`;
});

// ────────────────────────────────
// METHODS
// ────────────────────────────────
function endTenantSubscription(tenantId: string) {
  if (
    confirm(
      "Are you sure? Ending the subscription will remove this tenant and destroy all its Tick data."
    )
  ) {
    partnershipStore.endSubscription(tenantId);
  }
}

function selectSubtenant(item: TenantOverviewSummary) {
  router.push({ params: { ...route.params, id: item.id } });
}

// ────────────────────────────────
// WATCHERS
// ────────────────────────────────
watch(
  () => route.params,
  (to) => {
    selectedItemId.value = (to as any).id || null;
  },
  { immediate: true }
);

// ────────────────────────────────
onMounted(() => {
  partnershipStore.use();
  if (route.params.id) {
    selectedItemId.value = route.params.id.toString();
  }
});
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  overflow: hidden;

  .labels {
    display: flex;
    gap: 5px;
  }
}
</style>
