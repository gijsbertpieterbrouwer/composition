<template>
  <TickSettingsPanel :panelOptions="panelOptions" class="user-panel" @close="close">
    <template #title>{{ this.panelTitle }}</template>
    <template #actions>


      <LanguageSelector v-if="showPersonalMenu" @select="selectLanguage" :languageCode="userLanguageCode" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast" />
      <TickButton @click="editUser" v-if="!isMe && this.canEditUsers" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">
        {{ $translate(LanguagePath.App_View) }}
      </TickButton>
    </template>

    <div class="content">

      <template v-if="showPersonalMenu">
        <AvatarSelector @select="setAvatarSelection" :fileId="fileId" :name="name" :color="color" :sizePx="80" :type="userType" />
        <TickInput class="input" v-model.lazy="editableName" :maxlength="20" placeholder="name" />
        <TickSwitch v-model="personalTheme"> {{ $translate(LanguagePath.App_UserPanel_Theme) }}</TickSwitch>

        <TickButton @click="logout" class="logout-button" icon="logout" :size="Size.XXL">
          {{ $translate(LanguagePath.App_UserPanel_Logout) }}
        </TickButton>
      </template>


      <template v-else>
        <!-- OTHER USER/BOT -->
        <div class="user-wrapper">
          <AvatarSelector v-if="isMe" class="avatar" @select="setAvatarSelection" :fileId="fileId" :name="name" :color="color" :sizePx="100" :type="userType" />
          <TickAvatar v-else class="avatar" :sizePx="100" :online="showAsOnline" :fileId="fileId" :name="name" :color="color" />


          <div class="user-details">
            <template v-if="isUser">

            </template>
          </div>

          <SidebarPanel @toggle="refreshDashboardIfNeeded" :name="$translate(LanguagePath.App_UserPanel_Dashboard_Title)" class="dashboard" :id="dashboardPanelId">
            <Dashboard v-if="hasUserDashboard && this.dashboardVisible" :data="userDashboard" :dashboardId="userDashboardId" :showTitle="false" :disabled="true" />
          </SidebarPanel>
        </div>
      </template>

    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import { AuthorizationObjectType, FileSourceType, LanguagePath, SubscriptionCostItemType, TickDashboard, UserTypeEnum } from "@/TickApi";
import TickIcon from "@/components/TickIcon.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { getLanguageByLocaleCode } from "@/helpers/enumsHelper";
import { acceptableAvatarFormats } from "@/helpers/fileHelper";
import { translate } from '@/plugins/translatePlugin';
import router, { RouterToUser, ViewName } from "@/router";
import { getUserDashboardSmall, updateMyUser } from "@/services/TeamsService";
import useAppStore from "@/store/app";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import useViewstateStore, { InterfaceStateType, ThemeEnum } from "@/store/viewstate";
import { Component, Prop, Vue } from "vue-facing-decorator";
import SidebarPanel from "../atoms/SidebarPanel.vue";
import TickAvatar from "../atoms/TickAvatar.vue";
import TickButton, { Appearance, Color, Size } from "../atoms/TickButton.vue";
import TickDropdown from "../atoms/TickDropdown.vue";
import TickSwitch from "../atoms/TickSwitch.vue";
import AvatarSelector from "../molecules/Selectors/AvatarSelector.vue";
import LanguageSelector from "../molecules/Selectors/LanguageSelector.vue";
import Dashboard from "../molecules/dashboarding/Dashboard.vue";
import FileDataUploaderZone from "../molecules/files/FileDataUploaderZone.vue";
import { AvatarSelection } from "./AvatarSelectorPanel.vue";

@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickSettingsPanel,
    TickInput,
    TickIcon,
    TickSwitch,
    TickButton,
    TickAvatar,
    FileDataUploaderZone,
    TickDropdown,
    LanguageSelector,
    AvatarSelector,
    Dashboard,
    SidebarPanel
  },
})
export default class UserPanel extends Vue {
  FileSourceType = FileSourceType;
  Size = Size;
  Appearance = Appearance;
  Color = Color;
  LanguagePath = LanguagePath;
  @Prop() private userId!: string;
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private allowMenu!: TickPanelOptions;


  private startAvatarId?: string = null;
  private startLocaleCode: string = null;
  private editableName?: string = "";
  private userDashboard?: TickDashboard = null;

  private get showPersonalMenu() {
    return this.isMe && this.allowMenu;
  }

  private dashboardPanelId = "userpanel_dashboard";

  private get dashboardVisible() {
    return !this.showPersonalMenu && !useViewstateStore().has(InterfaceStateType.SidebarPanelCollapsed, this.dashboardPanelId);
  }

  mounted() {
    this.editableName = this.user?.name || "";
    this.startAvatarId = this.user?.avatarFileId;
    this.startLocaleCode = this.userLanguageCode;


    this.refreshDashboardIfNeeded();

  }

  private refreshDashboardIfNeeded() {
    if (this.userDashboard != null) { return; }
    if (this.dashboardVisible) {
      getUserDashboardSmall(this.userId).then((d) => {
        this.userDashboard = d;
      })
    }
  }


  private get hasUserDashboard() {
    return this.userDashboard != null;
  }

  private get userDashboardId(): string {
    return this.userDashboard?.id;
  }

  private editUser() {
    RouterToUser(this.userId);
    this.close();
  }

  private allowed(permission: AuthorizationObjectType, costItem?: SubscriptionCostItemType) {
    return useUserStore().allowedView(permission, costItem);
  }

  private get canEditUsers(): boolean {
    return this.allowed(AuthorizationObjectType.Workspace);
  }

  private setAvatarSelection(to: AvatarSelection) {

    this.user.avatarFileId = to.fileId;
    this.user.color = to.color;

    updateMyUser({
      avatarFileId: to.fileId,
      color: to.color,
      workspaceId: useUserStore().activeWorkspaceId,
    })

  }


  private get isUser() {
    return this.user?.userType == UserTypeEnum.User;
  }


  private get color() {
    return this.user?.color || null
  }

  private get userLanguageCode() {
    return useUserStore().localeCode;
  }

  private selectLanguage(to: string) {
    useAppStore().useLanguage(getLanguageByLocaleCode(to), true).then(() => {
      useUserStore().localeCode = to as string;
    })
  }

  private get panelTitle() {
    const online = this.onlineStatusText;
    const adminIndicator = this.user?.isAdmin ? `(${online} ${translate(LanguagePath.App_UserPanel_IsAdmin)})` : '';
    return `${this.name} ${adminIndicator}`;
  }

  // private avatarUploadsCompleted(data: FileLink[]) {
  //   if (!data || !data.length) { return; }
  //   this.user.avatarFileId = data[0].fileDataId;

  //   updateMyUser({
  //     avatarFileId: data[0].fileDataId,
  //     workspaceId: useUserStore().activeWorkspaceId,
  //   })
  // }

  private updateUser() {
    // no change => do nothing
    if (this.user.name == this.editableName && this.user.avatarFileId == this.startAvatarId && this.startLocaleCode == this.userLanguageCode) {
      return;
    }

    // store in store();
    this.user.name = this.editableName;

    updateMyUser({
      avatarFileId: this.user.avatarFileId,
      name: this.editableName,
      localeCode: this.userLanguageCode,
      workspaceId: useUserStore().activeWorkspaceId,
    })
  }

  private close() {
    this.updateUser();
    this.$emit("close");
  }


  private logout() {
    router.push({ name: ViewName.Logout });
    this.close();

  }

  private get onlineStatusText() {
    return this.online
      ? translate(LanguagePath.Online)
      : translate(LanguagePath.Offline)


    // if (this.online) {
    //   return "Online"
    // } else {
    //   return "Offline"
    // }
  }

  private get userHandle() {
    return this.user?.handle;
  }


  private get acceptableAvatarFormats(): string[] {
    return acceptableAvatarFormats()
  }

  private get hasAvatarFileId() {
    return this.fileId && this.fileId.length > 0;
  }

  private get fileId(): string | null {
    return this.user?.avatarFileId;
  }
  private get personalTheme() {
    return useViewstateStore().theme == ThemeEnum.Daylight;
  }

  private set personalTheme(to: boolean) {
    useViewstateStore().theme = to ? ThemeEnum.Daylight : ThemeEnum.Midnight;
  }

  private get user() {
    const id = this.userId || useUserStore().userId;
    const user = useUtilityDataStore().user(id);
    return user;
  }

  private get isMe() {
    return this.userId == useUserStore().userId;
  }
  private get userType() {
    return this.user?.userType;
  }
  private get name() {
    return this.user?.name || "";
  }

  private set name(to: string) {
    this.user.name = to;
  }

  private get online(): boolean {
    const user = this.user;
    return user ? user.loggedIn : false;
  }

  private get showAsOnline(): boolean {
    const user = this.user;
    if (!user) { return false; }
    if (this.isMe) { return false; }
    return user.loggedIn;
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.user-panel {
  min-width: 200px;


  .header {
    @include neon-bg;
    @include font-inter;
  }


  .content {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .profile-picture {
      display: grid;

      .overlay {
        position: relative;
        bottom: -60%;

        &.has {
          bottom: -105%;
          opacity: 0.7;
        }

        background-color: var(--c-base-300);
        color: var(--c-contrast);

        width: 100px;
        height: 25px;
        text-align: center;
        font-size: $text-size-regular;
        font-weight: 600;

      }
    }

  }
}

.user-wrapper {
  min-width: 500px;
  display: grid;

  gap: 10px;
  grid-template-rows: auto auto;
  grid-template-columns: 150px 1fr;
  grid-template-areas: "avatar details"
    "dashboard dashboard";
  //align-items: center;

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
