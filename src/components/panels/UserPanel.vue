<template>
  <TickSettingsPanel :panel-options="panelOptions" class="user-panel" @close="close">
    <template #title>{{ panelTitle }}</template>

    <template #actions>
      <LanguageSelector v-if="showPersonalMenu" @select="selectLanguage" :languageCode="userLanguageCode" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast" />
      <TickButton v-if="!isMe && canEditUsers" @click="editUser" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">
        {{ $translate(LanguagePath.App_View) }}
      </TickButton>
    </template>

    <div class="content">
      <template v-if="showPersonalMenu">
        <AvatarSelector @select="setAvatarSelection" :fileId="fileId" :name="name" :color="color" :sizePx="80" :type="userType" />
        <TickInput class="input" v-model.lazy="editableName" :maxlength="20" placeholder="name" />
        <TickSwitch v-model="personalTheme">{{ $translate(LanguagePath.App_UserPanel_Theme) }}</TickSwitch>

        <TickButton @click="logout" class="logout-button" icon="logout" :size="Size.XXL">
          {{ $translate(LanguagePath.App_UserPanel_Logout) }}
        </TickButton>
      </template>

      <template v-else>
        <div class="user-wrapper">
          <AvatarSelector v-if="isMe" class="avatar" @select="setAvatarSelection" :fileId="fileId" :name="name" :color="color" :sizePx="100" :type="userType" />
          <TickAvatar v-else class="avatar" :sizePx="100" :online="showAsOnline" :fileId="fileId" :name="name" :color="color" />

          <div class="user-details"></div>

          <SidebarPanel @toggle="refreshDashboardIfNeeded" :name="$translate(LanguagePath.App_UserPanel_Dashboard_Title)" class="dashboard" :id="dashboardPanelId">
            <Dashboard v-if="hasUserDashboard && dashboardVisible" :data="userDashboard" :dashboardId="userDashboardId" :showTitle="false" :disabled="true" />
          </SidebarPanel>
        </div>
      </template>
    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { getLanguageByLocaleCode } from "@/helpers/enumsHelper";
import router, { RouterToUser, ViewName } from "@/router";
import { getUserDashboardSmall, updateMyUser } from "@/services/TeamsService";
import useAppStore from "@/store/app";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import useViewstateStore, { InterfaceStateType, ThemeEnum } from "@/store/viewstate";
import { computed, defineComponent, onMounted, ref } from "vue";
import SidebarPanel from "../atoms/SidebarPanel.vue";
import TickAvatar from "../atoms/TickAvatar.vue";
import TickButton, { Appearance, Color, Size } from "../atoms/TickButton.vue";
import TickInput from "../atoms/TickInput.vue";
import type { TickPanelOptions } from '../atoms/TickPanel.vue';
import AvatarSelector from "../molecules/Selectors/AvatarSelector.vue";
import LanguageSelector from "../molecules/Selectors/LanguageSelector.vue";
import Dashboard from "../molecules/dashboarding/Dashboard.vue";

import {
  AuthorizationObjectType,
  ColorsEnum,
  LanguagePath,
  SubscriptionCostItemType,
  TickDashboard
} from "@/TickApi";

export default defineComponent({
  name: "UserPanel",
  components: {
    TickInput,
    TickSettingsPanel,
    TickAvatar,
    TickButton,
    AvatarSelector,
    LanguageSelector,
    Dashboard,
    SidebarPanel,
  },
  props: {
    userId: { type: String, required: true },
    panelOptions: { type: Object as () => TickPanelOptions, required: true },
    allowMenu: { type: Boolean, default: true },
  },
  setup(props, { emit }) {
    const userStore = useUserStore();
    const utilityStore = useUtilityDataStore();
    const viewstateStore = useViewstateStore();
    const appStore = useAppStore();

    const editableName = ref("");
    const startAvatarId = ref<string | null>(null);
    const startLocaleCode = ref<string | null>(null);
    const userDashboard = ref<TickDashboard | null>(null);
    const dashboardPanelId = "userpanel_dashboard";

    const user = computed(() => {
      const id = props.userId || userStore.userId;
      return utilityStore.user(id);
    });

    const isMe = computed(() => props.userId === userStore.userId);
    const showPersonalMenu = computed(() => isMe.value && props.allowMenu);

    const dashboardVisible = computed(
      () => !showPersonalMenu.value && !viewstateStore.has(InterfaceStateType.SidebarPanelCollapsed, dashboardPanelId)
    );

    const userDashboardId = computed(() => userDashboard.value?.id);
    const hasUserDashboard = computed(() => !!userDashboard.value);

    const name = computed({
      get: () => user.value?.name || "",
      set: (val) => {
        if (user.value) user.value.name = val;
      },
    });

    const color = computed(() => user.value?.color || null);
    const userType = computed(() => user.value?.userType);
    const fileId = computed(() => user.value?.avatarFileId);
    const userLanguageCode = computed(() => userStore.localeCode);

    const personalTheme = computed({
      get: () => viewstateStore.theme === ThemeEnum.Daylight,
      set: (val) => (viewstateStore.theme = val ? ThemeEnum.Daylight : ThemeEnum.Midnight),
    });

    const online = computed(() => user.value?.loggedIn ?? false);
    const showAsOnline = computed(() => !isMe.value && online.value);

    const allowed = (permission: AuthorizationObjectType, costItem?: SubscriptionCostItemType) =>
      userStore.allowedView(permission, costItem);

    const canEditUsers = computed(() => allowed(AuthorizationObjectType.Workspace));

    const panelTitle = computed(() => {
      const onlineText = online.value ? "Online" : "Offline";
      const adminText = user.value?.isAdmin
        ? `(${onlineText} ${appStore.$translate(LanguagePath.App_UserPanel_IsAdmin)})`
        : "";
      return `${name.value} ${adminText}`;
    });

    const editUser = () => {
      RouterToUser(props.userId);
      close();
    };

    const selectLanguage = (code: string) => {
      appStore.useLanguage(getLanguageByLocaleCode(code), true).then(() => {
        userStore.localeCode = code;
      });
    };

    const setAvatarSelection = (selection: { fileId: string; color: ColorsEnum }) => {
      if (user.value) {
        user.value.avatarFileId = selection.fileId;
        user.value.color = selection.color;
      }
      updateMyUser({
        avatarFileId: selection.fileId,
        color: selection.color,
        workspaceId: userStore.activeWorkspaceId ?? "",
      });
    };

    const refreshDashboardIfNeeded = () => {
      if (userDashboard.value || !dashboardVisible.value) return;
      getUserDashboardSmall(props.userId).then((d) => (userDashboard.value = d));
    };

    const updateUser = () => {
      if (!user.value) return;
      if (
        user.value.name === editableName.value &&
        startAvatarId.value === user.value.avatarFileId &&
        startLocaleCode.value === userLanguageCode.value
      )
        return;

      user.value.name = editableName.value;

      updateMyUser({
        avatarFileId: user.value.avatarFileId,
        name: editableName.value,
        localeCode: userLanguageCode.value,
        workspaceId: userStore.activeWorkspaceId ?? "",
      });
    };

    const close = () => {
      updateUser();
      emit("close");
    };

    const logout = () => {
      router.push({ name: ViewName.Logout });
      close();
    };

    onMounted(() => {
      editableName.value = user.value?.name || "";
      startAvatarId.value = user.value?.avatarFileId || null;
      startLocaleCode.value = userLanguageCode.value || null;
      refreshDashboardIfNeeded();
    });

    return {
      Size,
      Appearance,
      Color,
      LanguagePath,
      editableName,
      startAvatarId,
      startLocaleCode,
      userDashboard,
      dashboardPanelId,
      user,
      isMe,
      showPersonalMenu,
      dashboardVisible,
      userDashboardId,
      hasUserDashboard,
      name,
      color,
      userType,
      fileId,
      userLanguageCode,
      personalTheme,
      online,
      showAsOnline,
      panelTitle,
      canEditUsers,
      allowed,
      editUser,
      selectLanguage,
      setAvatarSelection,
      refreshDashboardIfNeeded,
      close,
      logout,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.user-panel {
  min-width: 200px;

  .content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.user-wrapper {
  min-width: 500px;
  display: grid;
  gap: 10px;
  grid-template-rows: auto auto;
  grid-template-columns: 150px 1fr;
  grid-template-areas: "avatar details" "dashboard dashboard";

  .avatar {
    grid-area: avatar;
    display: block;
  }

  .user-details {
    grid-area: details;
  }

  .dashboard {
    grid-area: dashboard;
  }
}
</style>
