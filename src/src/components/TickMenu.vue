<template>
  <div class="menu">
    <div class="home-button" @click="openWorkspacesMenu">
      <WorkspaceSelector />

      <!-- <WorkspaceIcon v-if="workspaceFileId" :workspaceId="workspaceId" :sizePx="48" />
      <TickIcon v-else class="logo" name="ticklogo" /> -->
    </div>

    <OmniSearchbox class="omnisearch" />
    <TickMenuItem :to="ViewName.Home" icon="home" :largeIcon="true" :collapsed="collapsed">
      {{ $translate(LanguagePath.App_Home_Title) }}</TickMenuItem>

    <TickMenuItem v-if="allowed(AuthorizationObjectType.Ticket, null)" :to="ViewName.Tickets" icon="ticket" :indicator="ticketsIndicator" :largeIcon="true" :collapsed="collapsed">
      {{ $translate(LanguagePath.Tickets) }}</TickMenuItem>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.TaskInstance, SubscriptionCostItemType.TaskDefinition)" :to="ViewName.Tasks" icon="task" :indicator="taskIndicator" :largeIcon="true"
      :collapsed="collapsed"> {{
        $translate(LanguagePath.TaskInstances) }}
    </TickMenuItem>

    <TickMenuItem v-if="allowed(AuthorizationObjectType.Workspace)" :to="ViewName.Communicators" icon="contacts" :indicator="taskIndicator" :largeIcon="true" :collapsed="collapsed"> {{
      $translate(LanguagePath.Communicators) }}
    </TickMenuItem>

    <TickMenuItem v-if="allowed(AuthorizationObjectType.TechnicalConfiguration, null)" :to="ViewName.Collections" icon="collection" :largeIcon="true" :collapsed="collapsed"> {{
      $translate(LanguagePath.Collections) }}
    </TickMenuItem>
    <TickMenuItem v-if="allowed(null, SubscriptionCostItemType.CustomDashboard)" :to="ViewName.Dashboards" icon="dashboard" :largeIcon="true" :collapsed="collapsed"> {{
      $translate(LanguagePath.Dashboards) }}</TickMenuItem>
    <div class="spacer" />

    <TickMenuItem class="general" :to="ViewName.WorkspaceSettings" icon="settings" :largeIcon="true" :collapsed="collapsed">{{ $translate(LanguagePath.Workspace) }}</TickMenuItem>

    <UserIcon v-if="collapsed" :allowMenu="true" :hideAdminBadge="true" :sizePx="45" @click="toggleUserPanel" ref="toggleButton" class="icon collapsed-user-icon" :disabled="true" />
    <TickMenuItem v-if="!collapsed" @click="toggleUserPanel" ref="toggleButton" :largeIcon="true" :collapsed="collapsed">
      <UserIcon :sizePx="28" class="icon user-icon" :disabled="true" />&nbsp;<span>{{ this.username }}</span>
    </TickMenuItem>

  </div>
</template>

<script lang="ts">
import TickMenuItem from "@/components/atoms/TickMenuItem.vue";
import OmniSearchbox from "@/components/molecules/search/OmniSearchbox.vue";
import TickIcon from "@/components/TickIcon.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { numberToString } from "@/helpers/stringHelper";
import { ViewName } from "@/router";
import useTicketsStore from "@/store/tickets";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { AuthorizationObjectType, ColorsEnum, DevelopmentFeature, LanguagePath, SubscriptionCostItemType } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import { TickIndicatorData } from "./atoms/TickIndicator.vue";
import { TickPanelOptions } from "./atoms/TickPanel.vue";
import UserIcon from "./atoms/UserIcon.vue";
import WorkspaceIcon from "./atoms/WorkspaceIcon.vue";
import WorkspaceSelector from "./molecules/Selectors/WorkspaceSelector.vue";
import UserPanel from "./panels/UserPanel.vue";

//import { useRouter } from "vue-router";
@Component({ components: { TickMenuItem, TickIcon, UserIcon, OmniSearchbox, WorkspaceIcon, WorkspaceSelector } })
export default class TickMenu extends Vue {
  @Prop() private collapsed: boolean;
  SubscriptionCostItemType = SubscriptionCostItemType;
  AuthorizationObjectType = AuthorizationObjectType;
  DevelopmentFeature = DevelopmentFeature;
  LanguagePath = LanguagePath;
  ViewName = ViewName

  private activePanel = "";

  private get workspace() {
    const ws = useUserStore().activeWorkspace;
    return ws;
  }

  private get workspaceName() {
    return this.workspace?.urlName || "-";
  }

  private get workspaceFileId() {
    return this.workspace?.iconFileId;
  }

  private get workspaceId() {
    return this.workspace?.id;
  }


  private get ticketsIndicator(): TickIndicatorData | null {
    const c = useTicketsStore().nrOfOpenTicketsAssignedToMe;
    if (!c) { return null; }

    return {
      color: ColorsEnum.Blue,
      title: c,
      tooltip: `${numberToString(c)} ${c == 1 ? 'ticket is' : 'tickets are'} waiting for you to respond`,
    }
  }

  private get taskIndicator(): TickIndicatorData | null {
    return null;
    // const c = useTasksStore().openTasksCount;
    // if (!c) { return null; }

    // return {
    //   color: ColorsEnum.Blue,
    //   title: c,
    //   tooltip: `${numberToString(c)} ${c == 1 ? 'task is' : 'task'} for you`,
    // }
  }




  private get username() {
    const user = useUtilityDataStore().user(useUserStore().userId)

    return user ? (user.name || "?") : "?";
  }

  private devFeatureIsAllowed(feature: DevelopmentFeature) {
    return useUserStore().developmentFeatureIsAllowed(feature);
  }

  private allowed(permission: AuthorizationObjectType, costItem?: SubscriptionCostItemType) {
    return useUserStore().allowedView(permission, costItem);
  }

  private toggleUserPanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.activePanel) {
      return;
    }

    const panelOptions: TickPanelOptions = {
      title: "UserPanel",
      from: getRefElementDOMRect(this, "toggleButton")
    }

    this.activePanel = mount(UserPanel, {
      props: {
        panelOptions: panelOptions,
        userId: useUserStore().userId,
        allowMenu: true,
      },
      events: {
        close: () => {
          this.closePanel();
        },
      },
    });
  }

  private closePanel() {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.home-button {
  padding-bottom: 5px;
  margin-bottom: 20px;
  //height: 64px;
  //padding: 20px 16px;
  color: var(--c-primary);

  &:hover {
    //background-color: var(--c-base-200);
    filter: brightness(120%);

    svg {
      fill: var(--c-contrast);
    }
  }

  .logo {
    width: 32px;
    height: 32px;
    margin-left: 5px;
    margin-top: 5px;
  }

}

.menu {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px;
  border-bottom: 1px solid var(--c-menu-border);
  border-right: 1px solid var(--c-menu-border);
  background-color: var(--c-menu-background);
}

.omnisearch {
  margin-bottom: 10px;
}

.spacer {
  flex-grow: 1;
}


.collapsed-user-icon {
  align-self: center;
  margin-bottom: 10px;
  margin-top: 8px;
}
</style>
