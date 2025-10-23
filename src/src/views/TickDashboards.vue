<template>
  <TickFocusScreen :noSidebar="true" :noList="showAsFullView">
    <template #list>
      <DashboardList class="list" :activeId="selectedItemId" @select="selectDashboard" />
    </template>

    <div class="dashboard-data">

      <!-- <Dashboard dashboardId="selectedItemId" /> -->

      <TickScreen v-if="hasActiveItem" icon="dashboard" :title="dashboardName" @clickTitle="askNewName">
        <template v-slot:actions>


          <UserAuthorizationIndicator :data="currentAuth" v-if="!showAsFullView" />
          <TickDropdown v-if="editAllowed && !this.showAsFullView" @select=" this.addTileFromSelection" :asButton="true" :color="Color.contrast" :appearance="Appearance.secondary" icon="plus"
            :options="newTileOptions" :placeholder="$translate(LanguagePath.App_DashboardEditor_AddTile_Title)" />
          <TickButton @click="askNewName" v-if="editAllowed && !this.showAsFullView" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_Rename) }}
          </TickButton>

          <ObjectAuthorizationsSelector v-if="ownAllowed && !this.showAsFullView" :title="authorizePanelTitle" :objectId="selectedItemId" :objectType="AuthorizationObjectType.DashboardObject" />
          <TickButton icon="home" @click="setAsWorkspaceDefault" v-if="isWorkspaceContributor && !this.showAsFullView" :appearance="Appearance.secondary" :color="Color.contrast">
            {{ $translate(LanguagePath.App_DashboardEditor_SetAsHome_Title) }}
          </TickButton>
          <TickButton @click="toggleFullscreen" icon="resize" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_DashboardEditor_FullScreen_Title) }}
          </TickButton>



          <TickButton @click="deleteDashboard" icon="delete" v-if="ownAllowed && !this.showAsFullView" :appearance="Appearance.secondary" :color="Color.contrast" />
        </template>

        <template v-slot:default>
          <Dashboard :disabled="showAsFullView" :dashboardId="selectedItemId" :showTitle="false" />

        </template>
      </TickScreen>

    </div>
  </TickFocusScreen>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickDropdown, { DropdownOption } from "@/components/atoms/TickDropdown.vue";
import TickFocusScreen from "@/components/atoms/TickFocusScreen.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import UserAuthorizationIndicator from "@/components/atoms/UserAuthorizationIndicator.vue";
import ObjectAuthorizationsSelector from "@/components/molecules/authorizations/ObjectAuthorizationsSelector.vue";
import Dashboard from "@/components/molecules/dashboarding/Dashboard.vue";
import DashboardList from "@/components/molecules/dashboarding/DashboardList.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import ObjectAuthorizationsPanel from "@/components/panels/ObjectAuthorizationsPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { authorizationIsSufficient } from "@/helpers/authorizationsHelper";
import { getNewTileTemplateOptions } from "@/helpers/enumsHelper";
import { mount, unmount } from "@/helpers/mountHelper";
import { askNewName, onConfirmation } from '@/helpers/questionHelper';
import { translate } from "@/plugins/translatePlugin";
import { TickRouteParams, ViewstateEnum } from "@/router";
import { createDashboardTileByTemplate } from "@/services/StatisticsService";
import useDashboardsStore from "@/store/dashboards";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { AuthorizationObjectType, AuthorizationType, DashboardTileTemplateType, LanguagePath, TickDashboard, TickDashboardSummary } from "@/TickApi";
import { Component, Vue, Watch } from "vue-facing-decorator";
@Component({
  components: {
    TickFocusScreen,
    TickIcon,
    Dashboard,
    DashboardList,
    TickSwitch,
    TickScreen,
    TickButton,
    ObjectAuthorizationsSelector,
    UserAuthorizationIndicator,
    TickDropdown
  },
})
export default class TickDashboards extends Vue {
  Size = Size;
  Appearance = Appearance;
  Color = Color;
  AuthorizationObjectType = AuthorizationObjectType
  LanguagePath = LanguagePath
  private selectedItemId = "";
  private activePanel = "";


  private get isWorkspaceContributor(): boolean {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace)
  }

  private setAsWorkspaceDefault() {
    useDashboardsStore().setDashboardAsWorkspaceDefauld(this.dashboard.id);
  }

  private addTileFromSelection(type: DashboardTileTemplateType) {
    createDashboardTileByTemplate(type, this.dashboard).then((tile) => {
      this.dashboard.settings.tiles.push(tile);
      this.saveDefinition();
    });
  }

  private get newTileOptions(): DropdownOption[] {
    return getNewTileTemplateOptions();
  }

  private toggleFullscreen() {
    let elem = document.documentElement;

    if (!document.fullscreenElement) {
      this.$router.push({ query: { view: ViewstateEnum.FullscreenView } })
      elem.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen().then(() => {
        this.$router.push({ query: { view: null } })
      });
      //this.$router.push({ query: { view: null } })
    }


    //this.$router.push({ query: { view: this.showAsFullView ? null : ViewstateEnum.FullscreenView } })


  }

  private get showAsFullView() {
    return this.$route.query.view == ViewstateEnum.FullscreenView
  }

  private get authorizePanelTitle() {
    return translate(LanguagePath.App_DashboardEditor_SharePanel_Title);//"Share dashboard with:"
  }

  private deleteDashboard() {
    if (!this.editAllowed) { return; }
    onConfirmation(() => {
      useDashboardsStore().deleteDashboard(this.dashboard.id)
      this.selectedItemId = "";
      this.$router.push("Dashboards");
    })


  }

  private askNewName() {
    if (!this.editAllowed) { return; }

    askNewName((to) => {
      if (to) {
        this.dashboard.name = to;
        this.saveDefinition();
      }
    }, this.dashboardName);
  }

  private saveDefinition() {
    useDashboardsStore().saveDashboard(this.dashboard.id);
  }


  private get dashboardName() {
    return this.dashboard?.name || "";
  }

  private get dashboard(): TickDashboard {
    const def = useUtilityDataStore().dashboard(this.selectedItemId) as TickDashboard;

    return def || null;
  }

  private get editAllowed() {
    if (!this.dashboard) { return false; }

    const auth = this.dashboard?.authorizationType;
    return authorizationIsSufficient(AuthorizationType.Contributor, auth)
  }

  private get ownAllowed() {
    if (!this.dashboard) { return false; }

    const auth = this.dashboard?.authorizationType;
    return authorizationIsSufficient(AuthorizationType.Owner, auth)
  }
  private get currentAuth() {

    return this.dashboard?.authorizationType;
  }
  private get homeDashboardId() {
    return useUserStore().homeDashboardId;
  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private selectDashboard(item: TickDashboardSummary) {
    this.$router.push({ params: { ...this.$route.params, id: item.id } })
  }

  private activateDashboard(id: string) {
    this.selectedItemId = id;
  }

  private mounted() {

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }

    if (this.$route.params.id) {
      this.activateDashboard(this.$route.params.id as string)
    }

  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams, from: TickRouteParams) {
    if (to && to.id) {
      if (to.id !== from.id) {
        this.activateDashboard(to.id as string)
      }
    }

    this.selectedItemId = to.id || null;
  }



  private openDashboardSharingPanel() {
    this.toggleDashboardSharingPanel();
  }

  private toggleDashboardSharingPanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.mountDashboardSharingPanel();
    }
  }

  private mountDashboardSharingPanel() {
    if (this.activePanel) {
      return;
    }

    // const panelOptions: TickPanelOptions = {
    //   from: getRefElementDOMRect(this, "sharebutton")
    // }

    this.activePanel = mount(ObjectAuthorizationsPanel, {
      props: {
        // panelOptions: panelOptions,
        dashboardId: this.selectedItemId,
      },
      events: {
        close: () => {
          this.closePanel();
          // this.saveDefinition(this.activePanelTileId);
        },
        select: () => {
          this.closePanel();
          // this.$emit("resize", size);

        },

      },
    });
  }

  private closePanel() {
    if (!this.activePanel) { return; }

    unmount(this.activePanel);
    this.activePanel = "";
  }


}
</script>

<style lang="scss" scoped>
.dashboard-data {
  padding: 20px;
}
</style>
