<template>
  <div v-if="!showApp" class="app" id="app" :class="themeName">
    <div class="view">
      <router-view />
    </div>
  </div>
  <SectionWithSidebar v-globalnozoom v-else class="app" :maxSidebarWidth="200" :hideSidebar="showAsFullView" :class="themeName" :collapsible="canCollapseMenu" :sidebarHeader="canCollapseMenu"
    :collapsed="menuCollapsed" @toggle="toggleMenuCollapsed" orientation="rtl" toggleLocation="bottom">
    <TickNotificationCenter />
    <TickVoiceCenter />
    <div class="view">
      <router-view />
    </div>
    <template #sidebar>
      <TickMenu class="menu" :collapsed="menuCollapsed" />
    </template>
  </SectionWithSidebar>
</template>

<script lang="ts">
import SectionWithSidebar from "@/components/atoms/SectionWithSidebar.vue";
import TickMenu from "@/components/TickMenu.vue";
import { globalnozoom } from "@/directives";
import useAppStore from "@/store/app";
import useViewstateStore, { InterfaceStateType } from "@/store/viewstate";
import { Component, Vue, Watch } from "vue-facing-decorator";
import TickNotificationCenter from "./components/molecules/notifications/TickNotificationCenter.vue";
import TickVoiceCenter from "./components/molecules/voice/TickVoiceCenter.vue";
import { dateToTicks } from "./helpers/dateHelper";
import { getLanguageByLocaleCode } from "./helpers/enumsHelper";
import { addScript } from "./helpers/javascriptHelper";
import { ViewName, ViewstateEnum } from "./router";
import { ChatWidgetJs_URL } from "./services/urls";
import useUserStore from "./store/user";

@Component({
  directives: { globalnozoom },
  components: { SectionWithSidebar, TickMenu, TickNotificationCenter, TickVoiceCenter },
})
export default class AppRoot extends Vue {
  private isUnauthenticatedView = false;
  private pollMs = 1000;


  private get themeName(): string {
    return this.showApp
      ? `theme-${useViewstateStore().theme}`
      : 'theme-daylight';
  }


  private get hasSidebar(): boolean {
    return this.showAsFullView && this.canShowFull;
  }
  private get showAsFullView(): boolean {
    return this.$route.query.view == ViewstateEnum.FullscreenView
  }

  private get showApp(): boolean {
    return useAppStore().authenticated && !this.isUnauthenticatedView;
  }

  private get menuCollapsed(): boolean {
    return !this.canShowFull || useViewstateStore().has(InterfaceStateType.MainMenuCollapsed);
  }

  private get canCollapseMenu(): boolean {
    return this.canShowFull;
  }

  private toggleMenuCollapsed() {
    useViewstateStore().toggle(InterfaceStateType.MainMenuCollapsed);
  }


  private get canShowFull(): boolean {
    return useViewstateStore().canShowFull;
  }


  private onWindowResize() {
    const { offsetWidth, offsetHeight } = document.getElementById('app');

    useViewstateStore().screenDimensions.width = offsetWidth;
    useViewstateStore().screenDimensions.height = offsetHeight;
  }


  unmount() {
    window.removeEventListener("resize", this.onWindowResize);
  }


  private nowUtcTimer: any = null;
  private startPoller() {
    this.nowUtcTimer = setTimeout(() => {
      const newTicks = dateToTicks(new Date());
      useAppStore().nowUtcTicks = newTicks
      this.startPoller();
    }, this.pollMs);
  }


  beforeUnmount() {
    clearTimeout(this.nowUtcTimer);
  }



  mounted() {
    addScript(ChatWidgetJs_URL())
    this.isUnauthenticatedView = this.$route.meta.requiresAuth == false;
    this.startPoller();

    this.onWindowResize();
    window.addEventListener("resize", this.onWindowResize);

    useAppStore().useLanguage(getLanguageByLocaleCode(useUserStore().localeCode), false);

    // window.onbeforeunload = () => {
    //   logout({
    //     deviceId: useAppStore().getDeviceId(),
    //     forceLogOff: false,
    //   }).then(() => {
    //     return true;
    //   });
    // };

  }


  @Watch("$route")
  private routeParamsChanged(to) {
    this.isUnauthenticatedView = this.$route.meta.requiresAuth == false;

    const name = this.$route.name;
    useAppStore().route = {
      name: name as ViewName,
    }
  }




}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.app {
  height: 100dvh;
  @include font-inter;
  user-select: none;
  background: var(--c-app-background);
  width: 100%;
  height: 100%;
}

.menu {
  flex-grow: 1;
}

.view {
  flex-grow: 1;

  >* {
    height: 100dvh;
  }
}
</style>

<style lang="scss">
@import "@/styles/fonts";
@import "@/styles/theme";
@import "@/styles/reset";
@import "@/styles/global";

html,
body,
.app {
  @include font-inter;
  overflow: hidden;


  a {
    color: var(--c-contrast);
  }

}
</style>
