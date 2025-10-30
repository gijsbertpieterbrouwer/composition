<template>
  <div class="menu">
    <div class="home-button">
      <WorkspaceSelector />
    </div>

    <OmniSearchbox class="omnisearch" />

    <TickMenuItem :to="ViewName.Home" icon="home" :large-icon="true" :collapsed="collapsed">
      {{ $translate(LanguagePath.App_Home_Title) }}
    </TickMenuItem>

    <TickMenuItem v-if="allowed(AuthorizationObjectType.Ticket, null)" :to="ViewName.Tickets" icon="ticket" :indicator="ticketsIndicator" :large-icon="true" :collapsed="collapsed">
      {{ $translate(LanguagePath.Tickets) }}
    </TickMenuItem>

    <TickMenuItem v-if="allowed(AuthorizationObjectType.TaskInstance, SubscriptionCostItemType.TaskDefinition)" :to="ViewName.Tasks" icon="task" :indicator="taskIndicator" :large-icon="true"
      :collapsed="collapsed">
      {{ $translate(LanguagePath.TaskInstances) }}
    </TickMenuItem>

    <TickMenuItem v-if="allowed(AuthorizationObjectType.Workspace)" :to="ViewName.Communicators" icon="contacts" :indicator="taskIndicator" :large-icon="true" :collapsed="collapsed">
      {{ $translate(LanguagePath.Communicators) }}
    </TickMenuItem>

    <TickMenuItem v-if="allowed(AuthorizationObjectType.TechnicalConfiguration, null)" :to="ViewName.Collections" icon="collection" :large-icon="true" :collapsed="collapsed">
      {{ $translate(LanguagePath.Collections) }}
    </TickMenuItem>

    <TickMenuItem v-if="allowed(null, SubscriptionCostItemType.CustomDashboard)" :to="ViewName.Dashboards" icon="dashboard" :large-icon="true" :collapsed="collapsed">
      {{ $translate(LanguagePath.Dashboards) }}
    </TickMenuItem>

    <div class="spacer" />

    <TickMenuItem class="general" :to="ViewName.WorkspaceSettings" icon="settings" :large-icon="true" :collapsed="collapsed">
      {{ $translate(LanguagePath.Workspace) }}
    </TickMenuItem>

    <UserIcon v-if="collapsed" ref="toggleButton" :allow-menu="true" :hide-admin-badge="true" :size-px="45" class="icon collapsed-user-icon" :disabled="true" @click="toggleUserPanel" />

    <TickMenuItem v-else ref="toggleButton" :large-icon="true" :collapsed="collapsed" @click="toggleUserPanel">
      <UserIcon :size-px="28" class="icon user-icon" :disabled="true" />&nbsp;
      <span>{{ username }}</span>
    </TickMenuItem>
  </div>
</template>

<script setup lang="ts">
import TickMenuItem from '@/components/atoms/TickMenuItem.vue';
import UserIcon from '@/components/atoms/UserIcon.vue';
import OmniSearchbox from '@/components/molecules/search/OmniSearchbox.vue';
import WorkspaceSelector from '@/components/molecules/Selectors/WorkspaceSelector.vue';
import UserPanel from '@/components/panels/UserPanel.vue';
import { computed, getCurrentInstance, ref } from 'vue';

import { mount, unmount } from '@/helpers/mountHelper';
import { getRefElementDOMRect } from '@/helpers/refHelpers';
import { numberToString } from '@/helpers/stringHelper';
import { ViewName } from '@/router';
import useTicketsStore from '@/store/tickets';
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import {
  AuthorizationObjectType,
  ColorsEnum,
  DevelopmentFeature,
  LanguagePath,
  SubscriptionCostItemType,
} from '@/TickApi';
import type { TickIndicatorData } from './atoms/TickIndicator.vue';
import type { TickPanelOptions } from './atoms/TickPanel.vue';

// props
defineProps<{ collapsed: boolean }>();

// stores
const userStore = useUserStore();
const ticketsStore = useTicketsStore();
const utilityStore = useUtilityDataStore();

// refs
const toggleButton = ref<HTMLElement | null>(null);
const activePanel = ref<string>('');

// constants for template
const SubscriptionCostItemTypeConst = SubscriptionCostItemType;
const AuthorizationObjectTypeConst = AuthorizationObjectType;
const DevelopmentFeatureConst = DevelopmentFeature;
const LanguagePathConst = LanguagePath;
const ViewNameConst = ViewName;

// computed properties
const workspace = computed(() => userStore.activeWorkspace);
const workspaceName = computed(() => workspace.value?.urlName || '-');
const workspaceFileId = computed(() => workspace.value?.iconFileId);
const workspaceId = computed(() => workspace.value?.id);

const ticketsIndicator = computed<TickIndicatorData | null>(() => {
  const c = ticketsStore.nrOfOpenTicketsAssignedToMe;
  if (!c) return null;

  return {
    color: ColorsEnum.Blue,
    title: c,
    tooltip: `${numberToString(c)} ${c === 1 ? 'ticket is' : 'tickets are'} waiting for you to respond`,
  };
});

const taskIndicator = computed<TickIndicatorData | null>(() => null);

const username = computed(() => {
  const user = utilityStore.user(userStore.userId);
  return user ? user.name || '?' : '?';
});

// functions
const allowed = (permission: AuthorizationObjectType | null, costItem?: SubscriptionCostItemType | null) => {
  return userStore.allowedView(permission, costItem);
};

const devFeatureIsAllowed = (feature: DevelopmentFeature) => {
  return userStore.developmentFeatureIsAllowed(feature);
};

const closePanel = () => {
  if (!activePanel.value) return;
  unmount(activePanel.value);
  activePanel.value = '';
};

const openPanel = () => {
  if (activePanel.value) return;

  const instance = getCurrentInstance();
  if (!instance?.proxy) { return; }
  const rect = getRefElementDOMRect(instance?.proxy, 'toggleButton');

  const panelOptions: TickPanelOptions = {
    title: 'UserPanel',
    from: rect,
  };

  activePanel.value = mount(UserPanel, {
    props: {
      panelOptions,
      userId: userStore.userId,
      allowMenu: true,
    },
    events: {
      close: () => closePanel(),
    },
  });
};

const toggleUserPanel = () => {
  if (activePanel.value) closePanel();
  else openPanel();
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.home-button {
  padding-bottom: 5px;
  margin-bottom: 20px;
  color: var(--c-primary);

  &:hover {
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
