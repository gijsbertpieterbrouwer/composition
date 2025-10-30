<template>
  <SectionWithSidebar :collapsible="false" :collapsed="false" :sidebarHeader="true" :color="SidebarColor.Secondary" :hideSidebar="!canShowFull">
    <div class="version" @click="openTickConsole">Version: {{ version }}</div>

    <div class="tick-home">
      <div class="header">
        <TickHeading>{{ homeTitle }}</TickHeading>
      </div>

      <Dashboard v-if="hasHomeDashboard" :dashboardId="homeDashboardId" :showTitle="false" :disabled="true" />
      <SalesUpsellBlock class="upseller" v-if="showUpsell" />
      <DocuHolder :group="DocumentationGroup.General" />
    </div>

    <template #sidebar-label v-if="canShowFull">
      {{ $translate(LanguagePath.App_Notifications) }}
    </template>

    <template #sidebar v-if="canShowFull">
      <SidebarPanel name="Developer" id="developer" v-if="inDeveloperMode">
        <div class="developer">
          <TickButton @click="openTickConsole" :appearance="ButtonAppearance.primary" :color="ButtonColor.contrast" :size="ButtonSize.mini">
            DEVELOPER KIT
          </TickButton>
          <TickButton @click="openOnboardingPanel" :appearance="ButtonAppearance.primary" :color="ButtonColor.contrast" :size="ButtonSize.mini">
            Onboarding
          </TickButton>
          <TickButton @click="openExchangeManifestCreatorPanelPanel" :appearance="ButtonAppearance.primary" :color="ButtonColor.contrast" :size="ButtonSize.mini">
            Exchange: Creator
          </TickButton>
          <TickButton @click="simulateCallToggle" :appearance="ButtonAppearance.primary" :color="ButtonColor.contrast" :size="ButtonSize.mini">
            Call: Simulate call
          </TickButton>
        </div>
      </SidebarPanel>
      <NotificationsList class="notifications" />
    </template>
  </SectionWithSidebar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

import SectionWithSidebar, { SidebarColor } from "@/components/atoms/SectionWithSidebar.vue";
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize } from "@/components/atoms/TickButton.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import Dashboard from "@/components/molecules/dashboarding/Dashboard.vue";
import DocuHolder from "@/components/molecules/docublocks/DocuHolder.vue";
import NotificationsList from "@/components/molecules/home/NotificationsList.vue";
import SalesUpsellBlock from "@/components/molecules/sales/SalesUpsellBlock.vue";

import openExchangeManifestCreatorPanelPanel from "@/components/panels/ExchangeManifestCreatorPanel.vue";
import { openTickConsole } from "@/components/panels/TickConsolePanel.vue";
import { openOnboardingPanel } from "@/components/panels/UserOnboardingPanel.vue";
import { translate } from "@/plugins/translatePlugin";
import { AppVersion } from "@/services/urls";

import useAppStore from "@/store/app";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import useViewstateStore from "@/store/viewstate";
import useVoiceStore, { VoiceCallStatus } from "@/store/voice";

import { DocumentationGroup, LanguagePath } from "@/TickApi";

// ──────────────────────────────
// STORES
// ──────────────────────────────
const appStore = useAppStore();
const userStore = useUserStore();
const utilityStore = useUtilityDataStore();
const viewstateStore = useViewstateStore();
const voiceStore = useVoiceStore();
const router = useRouter();

// ──────────────────────────────
// COMPUTED
// ──────────────────────────────
const version = computed(() => AppVersion());

const inDeveloperMode = computed(() => appStore.inDeveloperMode ?? false);
const canShowFull = computed(() => viewstateStore.canShowFull);
const showUpsell = computed(() => userStore.allowUpsell);
const homeDashboardId = computed(() => userStore.getHomeDashboardId());
const hasHomeDashboard = computed(() => homeDashboardId.value != null);

const dayPartLanguagePath = computed<LanguagePath>(() => {
  const curHr = new Date().getHours();
  if (curHr < 4 || curHr > 22) return LanguagePath.App_Home_Night_Title;
  if (curHr < 12) return LanguagePath.App_Home_Morning_Title;
  if (curHr < 18) return LanguagePath.App_Home_Afternoon_Title;
  return LanguagePath.App_Home_Evening_Title;
});

const homeTitle = computed(() => {
  const user = utilityStore.user(userStore.userId);
  const name = user?.name ?? "";
  return translate(dayPartLanguagePath.value, { path: "name", value: name });
});

// ──────────────────────────────
// METHODS
// ──────────────────────────────
function openOnboardingPanelFn() {
  openOnboardingPanel();
}


function openTickConsoleFn() {
  openTickConsole();
}

function simulateCallToggle() {
  voiceStore.callStatus =
    voiceStore.callStatus === VoiceCallStatus.Calling
      ? VoiceCallStatus.Nothing
      : VoiceCallStatus.Calling;
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.version {
  position: fixed;
  bottom: 10px;
  right: 40px;
  z-index: 999999999;
  font-size: 0.6em;
  padding: 5px 10px;

  &:hover {
    background-color: var(--c-base-400);
  }
}

.notifications {
  margin-top: 80px;
}

.developer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
}

.tick-home {
  padding: 6vmin;
  margin: 0 auto;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 2vw;
  background-color: var(--c-base);
  min-height: 100%;

  .upseller {
    margin-bottom: 20px;
  }
}

@media only screen and (max-width: 1024px) {
  .tick-home {
    padding: 2vmin;
    gap: 1vw;
  }
}
</style>
