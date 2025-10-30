<template>
  <TickFocusScreen :noSidebar="true" :noList="showAsFullView">
    <template #list>
      <DashboardList class="list" :activeId="selectedItemId" @select="selectDashboard" />
    </template>

    <div class="dashboard-data">
      <TickScreen v-if="hasActiveItem" icon="dashboard" :title="dashboardName" @clickTitle="askNewName">
        <template v-slot:actions>
          <UserAuthorizationIndicator v-if="!showAsFullView" :data="currentAuth" />
          <TickDropdown v-if="editAllowed && !showAsFullView" @select="addTileFromSelection" :asButton="true" :color="Color.contrast" :appearance="Appearance.secondary" icon="plus"
            :options="newTileOptions" :placeholder="$translate(LanguagePath.App_DashboardEditor_AddTile_Title)" />
          <TickButton v-if="editAllowed && !showAsFullView" @click="askNewName" :appearance="Appearance.secondary" :color="Color.contrast">
            {{ $translate(LanguagePath.App_Rename) }}
          </TickButton>
          <ObjectAuthorizationsSelector v-if="ownAllowed && !showAsFullView" :title="authorizePanelTitle" :objectId="selectedItemId" :objectType="AuthorizationObjectType.DashboardObject" />
          <TickButton v-if="isWorkspaceContributor && !showAsFullView" icon="home" @click="setAsWorkspaceDefault" :appearance="Appearance.secondary" :color="Color.contrast">
            {{ $translate(LanguagePath.App_DashboardEditor_SetAsHome_Title) }}
          </TickButton>
          <TickButton icon="resize" @click="toggleFullscreen" :appearance="Appearance.secondary" :color="Color.contrast">
            {{ $translate(LanguagePath.App_DashboardEditor_FullScreen_Title) }}
          </TickButton>
          <TickButton v-if="ownAllowed && !showAsFullView" icon="delete" @click="deleteDashboard" :appearance="Appearance.secondary" :color="Color.contrast" />
        </template>

        <template v-slot:default>
          <Dashboard :disabled="showAsFullView" :dashboardId="selectedItemId" :showTitle="false" />
        </template>
      </TickScreen>
    </div>
  </TickFocusScreen>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickDropdown, { DropdownOption } from "@/components/atoms/TickDropdown.vue";
import TickFocusScreen from "@/components/atoms/TickFocusScreen.vue";
import UserAuthorizationIndicator from "@/components/atoms/UserAuthorizationIndicator.vue";
import ObjectAuthorizationsSelector from "@/components/molecules/authorizations/ObjectAuthorizationsSelector.vue";
import Dashboard from "@/components/molecules/dashboarding/Dashboard.vue";
import DashboardList from "@/components/molecules/dashboarding/DashboardList.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import { authorizationIsSufficient } from "@/helpers/authorizationsHelper";
import { getNewTileTemplateOptions } from "@/helpers/enumsHelper";
import { mount, unmount } from "@/helpers/mountHelper";
import { askNewName as askNewNameHelper, onConfirmation } from '@/helpers/questionHelper';
import { translate } from "@/plugins/translatePlugin";
import { ViewstateEnum } from "@/router";
import { createDashboardTileByTemplate } from "@/services/StatisticsService";
import useDashboardsStore from "@/store/dashboards";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { AuthorizationObjectType, AuthorizationType, DashboardTileTemplateType, LanguagePath, TickDashboard, TickDashboardSummary } from "@/TickApi";

// ──────────────────────────────
// ROUTER
// ──────────────────────────────
const route = useRoute();
const router = useRouter();

// ──────────────────────────────
// STORES
// ──────────────────────────────
const dashboardsStore = useDashboardsStore();
const userStore = useUserStore();
const utilityStore = useUtilityDataStore();

// ──────────────────────────────
// REFS
// ──────────────────────────────
const selectedItemId = ref<string | null>(route.params.id?.toString() || null);
const activePanel = ref<string>("");

// ──────────────────────────────
// COMPUTED
// ──────────────────────────────
const dashboard = computed<TickDashboard | null>(() => {
  return utilityStore.dashboard(selectedItemId.value) || null;
});

const hasActiveItem = computed(() => selectedItemId.value != null && selectedItemId.value !== "");

const dashboardName = computed(() => dashboard.value?.name || "");

const editAllowed = computed(() => {
  if (!dashboard.value) return false;
  return authorizationIsSufficient(AuthorizationType.Contributor, dashboard.value.authorizationType);
});

const ownAllowed = computed(() => {
  if (!dashboard.value) return false;
  return authorizationIsSufficient(AuthorizationType.Owner, dashboard.value.authorizationType);
});

const currentAuth = computed(() => dashboard.value?.authorizationType);

const isWorkspaceContributor = computed(() => userStore.allowedEdit(AuthorizationObjectType.Workspace));

const showAsFullView = computed(() => route.query.view === ViewstateEnum.FullscreenView);

const authorizePanelTitle = computed(() => translate(LanguagePath.App_DashboardEditor_SharePanel_Title));

const newTileOptions = computed<DropdownOption[]>(() => getNewTileTemplateOptions());

// ──────────────────────────────
// METHODS
// ──────────────────────────────
function selectDashboard(item: TickDashboardSummary) {
  router.push({ params: { ...route.params, id: item.id } });
}

function activateDashboard(id: string) {
  selectedItemId.value = id;
}

function setAsWorkspaceDefault() {
  if (!dashboard.value) return;
  dashboardsStore.setDashboardAsWorkspaceDefauld(dashboard.value.id);
}

function addTileFromSelection(type: DashboardTileTemplateType) {
  if (!dashboard.value) return;
  createDashboardTileByTemplate(type, dashboard.value).then((tile) => {
    dashboard?.value?.settings?.tiles?.push(tile);
    saveDefinition();
  });
}

function toggleFullscreen() {
  const elem = document.documentElement;
  if (!document.fullscreenElement) {
    router.push({ query: { view: ViewstateEnum.FullscreenView } });
    elem.requestFullscreen().catch((err) => {
      alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
    });
  } else {
    document.exitFullscreen().then(() => {
      router.push({ query: { view: null } });
    });
  }
}

function deleteDashboard() {
  if (!editAllowed.value || !dashboard.value) return;
  onConfirmation(() => {
    dashboardsStore.deleteDashboard(dashboard.value!.id);
    selectedItemId.value = "";
    router.push("Dashboards");
  });
}

function askNewName() {
  if (!editAllowed.value) return;
  askNewNameHelper((to) => {
    if (to && dashboard.value) {
      dashboard.value.name = to;
      saveDefinition();
    }
  }, dashboardName.value);
}

function saveDefinition() {
  if (!dashboard.value) return;
  dashboardsStore.saveDashboard(dashboard.value.id);
}

// ──────────────────────────────
// DASHBOARD SHARING PANEL
// ──────────────────────────────
function openDashboardSharingPanel() {
  toggleDashboardSharingPanel();
}

function toggleDashboardSharingPanel() {
  if (activePanel.value) {
    closePanel();
  } else {
    mountDashboardSharingPanel();
  }
}

function mountDashboardSharingPanel() {
  if (activePanel.value || !selectedItemId.value) return;

  activePanel.value = mount(ObjectAuthorizationsSelector, {
    props: {
      dashboardId: selectedItemId.value,
    },
    events: {
      close: () => closePanel(),
      select: () => closePanel(),
    },
  });
}

function closePanel() {
  if (!activePanel.value) return;
  unmount(activePanel.value);
  activePanel.value = "";
}

// ──────────────────────────────
// WATCHERS
// ──────────────────────────────
watch(() => route.params.id, (id) => {
  if (id) activateDashboard(id as string);
  else selectedItemId.value = null;
});

// ──────────────────────────────
// LIFECYCLE
// ──────────────────────────────
onMounted(() => {
  if (route.params.id) activateDashboard(route.params.id as string);
});
</script>

<style lang="scss" scoped>
.dashboard-data {
  padding: 20px;
}
</style>
