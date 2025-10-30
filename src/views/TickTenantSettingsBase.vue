<template>
  <TickFocusScreen :noSidebar="!showSidebar">
    <router-view></router-view>
    <template #sidebar>
      <router-view name="sidebar" />
    </template>
    <template #list>
      <div class="holder">
        <TickHeading class="menu-group-title" :size="Size.small"> {{ $translate(LanguagePath.App_TenantSettingsMenu_Title) }}</TickHeading>
        <TickMenuItem v-if="isGlobalAdmin" :collapsed="menuCollapsed" to="Subscription" icon="subscription">{{ $translate(LanguagePath.App_TenantSettingsMenu_Subscription_Title) }}</TickMenuItem>
        <TickMenuItem v-if="isGlobalAdmin" :collapsed="menuCollapsed" to="CurrentPeriodUsage" icon="subscription">{{ $translate(LanguagePath.App_TenantSettingsMenu_Spending_Title) }}</TickMenuItem>
        <TickMenuItem v-if="isGlobalAdmin" :collapsed="menuCollapsed" to="TickBilling" icon="subscription">{{ $translate(LanguagePath.App_TenantSettingsMenu_Billing_Title) }}</TickMenuItem>
        <TickMenuItem v-if="isGlobalAdmin && this.hasPartnership" to="PartnerDashboard" icon="partner">{{ $translate(LanguagePath.App_TenantSettingsMenu_PartnerDashboard_Title) }}</TickMenuItem>
        <div class="spacer" />

        <TickMenuItem v-if="isActivePartner && this.allowedView(AuthorizationObjectType.Workspace)" :collapsed="menuCollapsed" to="Partnership" icon="partner">
          {{ $translate(LanguagePath.App_TenantSettingsMenu_PartnerProgram_Title) }}</TickMenuItem>
      </div>
    </template>
  </TickFocusScreen>
</template>


<script lang="ts">
import SectionWithSidebar from "@/components/atoms/SectionWithSidebar.vue";
import TickFocusScreen from '@/components/atoms/TickFocusScreen.vue';
import TickHeading, { Size } from '@/components/atoms/TickHeading.vue';
import TickMenuItem from '@/components/atoms/TickMenuItem.vue';
import useUserStore from "@/store/user";
import { AuthorizationObjectType, LanguagePath } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';
@Component({
  components: { SectionWithSidebar, TickMenuItem, TickFocusScreen, TickHeading }
})
export default class TickTenantSettingsBase extends Vue {
  AuthorizationObjectType = AuthorizationObjectType;
  Size = Size;
  LanguagePath = LanguagePath
  private get menuCollapsed(): boolean {
    return false;
  }
  private allowedView(permission: AuthorizationObjectType) {
    return useUserStore().allowedView(permission, null);
  }


  private get isGlobalAdmin(): boolean {
    return useUserStore().isGlobalAdmin == true;
  }

  private get isActivePartner(): boolean {
    return useUserStore().isActivePartner == true;
  }

  private get showSidebar() {
    return false;//useViewstateStore().canShowFull;
  }

  private get hasPartnership(): boolean {
    return useUserStore().isActivePartner;
  }

}
</script>


<style lang="scss" scoped>
@import "@/styles/theme";

.menu-group-title {
  padding: 24px 0 4px 8px;

  @include font-outfit;
  font-size: $text-size-regular;
  font-weight: 700;
  line-height: 20px;
  text-transform: uppercase;

  color: c("secondary");

}

.holder {
  height: 100%;
  padding-top: 58px;
  padding-bottom: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.spacer {
  flex-grow: 1;
  min-height: 5vh;
}

.last {
  min-height: 8vh;
}
</style>