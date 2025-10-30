<template>
  <template v-if="hasActiveItem">
    <EventSubscriptionEditor :activeId="selectedItemId" @saved="onSaved" @deleted="onDeleted" />
  </template>

  <template v-else>
    <TickScreen :title="$translate(LanguagePath.EventSubscriptions)">
      <template v-slot:actions>
        <TickButton @click="addEmpty" v-if="allowAdd" :busy="busyAdding">
          {{ $translate(LanguagePath.App_Add) }}
        </TickButton>
        <!-- <TickDropdown v-if="allowEdit" @select="createEmptyChannelAction" :options="channelTypeOptions" placeholder="Add channel"></TickDropdown> -->
      </template>

      <template v-slot:default>
        <div class="no-data" v-if="noData">
          {{ $translate(LanguagePath.App_EventSubscriptionEditor_Explanation) }}
        </div>

        <div class="list">
          <TickListItem v-for="item in eventSubscriptions" :key="item.id" :icon="'adapter'" :name="item.name" @select="() => selectItem(item)">
            <span class="active-indicator" :class="subClass(item)">
              {{ getSubtitle(item) }}
            </span>
          </TickListItem>
        </div>
      </template>
    </TickScreen>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import TickButton from "@/components/atoms/TickButton.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import EventSubscriptionEditor from "@/components/molecules/eventsubscriptions/EventSubscriptionEditor.vue";

import { getColorName } from "@/helpers/colorsHelper";
import useEventSubscriptionsStore from "@/store/eventSubscriptions";
import useUserStore from "@/store/user";
import { AuthorizationObjectType, ColorsEnum, LanguagePath, SubscriptionCostItemType, TickEventSubscriptionSummary } from "@/TickApi";

// ──────────────────────────────
// REFS
// ──────────────────────────────
const selectedItemId = ref<string | undefined>(undefined);
const busyAdding = ref(false);

// ──────────────────────────────
// STORES
// ──────────────────────────────
const eventSubscriptionsStore = useEventSubscriptionsStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

// ──────────────────────────────
// COMPUTED
// ──────────────────────────────
const eventSubscriptions = computed<TickEventSubscriptionSummary[]>(
  () => eventSubscriptionsStore.all || []
);

const hasActiveItem = computed(() => !!selectedItemId.value);
const noData = computed(() => eventSubscriptions.value.length === 0);

const addAllowedInPlan = computed(() => {
  const currentNr = eventSubscriptions.value.length;
  return userStore.allowedAddInPlan(
    SubscriptionCostItemType.EventSubscription,
    currentNr
  );
});

const allowAdd = computed(() =>
  userStore.allowedEdit(AuthorizationObjectType.TechnicalConfiguration) && addAllowedInPlan.value
);

// ──────────────────────────────
// METHODS
// ──────────────────────────────
function selectItem(item: TickEventSubscriptionSummary) {
  router.push({ params: { ...route.params, id: item.id } });
}

function onSaved() {
  // placeholder
}

function onDeleted() {
  router.push({ name: "EventSubscriptions" });
}

async function createEmpty() {
  busyAdding.value = true;
  const id = await eventSubscriptionsStore.add();
  busyAdding.value = false;
  router.push({ params: { ...route.params, id } });
}

function addEmpty() {
  createEmpty();
}

function subClass(subscription: TickEventSubscriptionSummary) {
  return subscription.active ? getColorName(ColorsEnum.Green) : getColorName(ColorsEnum.Grey);
}

function getSubtitle(subscription: TickEventSubscriptionSummary) {
  return subscription.active ? "Active" : "InActive";
}

// ──────────────────────────────
// LIFECYCLE
// ──────────────────────────────
onMounted(() => {
  eventSubscriptionsStore.use();
  if (route.params.id) {
    selectedItemId.value = route.params.id?.toString();
  }
});

watch(
  () => route.params.id,
  (id) => {
    selectedItemId.value = id?.toString();
  }
);
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.no-data {
  font-size: $text-size-regular;
  padding: 20px;
}

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
}

.active-indicator {
  display: inline-block;
  padding: 2px 4px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  white-space: nowrap;
  border-radius: 2px;
  color: #fff;
  margin: 0 5px;
  background-color: $grey400;
  @include neon-bg;
}
</style>
