import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import ExchangeManifestCreatorPanel from "@/components/panels/exchange/ExchangeManifestCreatorPanel.vue";
import TickSettingsPanel from "@/components/panels/settings/TickSettingsPanel.vue";
import TicketCreatorPanel from "@/components/panels/TicketCreatorPanel.vue";
import UsersAndTeamsPanel, { UsersAndTeamsSelection } from "@/components/panels/UsersAndTeamsPanel.vue";
import { RouterToTicket } from "@/router";
import { AssigneeTypeEnum } from "@/TickApi";
import { computed } from "vue";
import generateId from "./guid";
import { mount, unmount } from "./mountHelper";


export function removeExchangeManifestCreatorPanelPanel() {
  unmount("ExchangeManifestCreatorPanel");
}

export function openExchangeManifestCreatorPanelPanel() {
  mount(ExchangeManifestCreatorPanel, {
    props: {

    },
    events: {
      close: () => {
        removeExchangeManifestCreatorPanelPanel();
      },
    },
  }, "ExchangeManifestCreatorPanel");
}


//Users and teams panel


export function removeUsersAndTeamsItemPanel(panelId: string) {
  unmount(panelId);
}

export function openUsersAndTeamsItemPanel(panelOptions: TickPanelOptions, title: string, typeFilters: AssigneeTypeEnum[] | null, filterOnlyVoiceAvailable: boolean, onSelect: (to: UsersAndTeamsSelection) => unknown, onClose: () => void) {
  const newPanelId = "UsersAndTeams_" + generateId();

  const emptySelection: UsersAndTeamsSelection = {
    userIds: [],
    teamIds: [],
  }

  const activePanelId = mount(UsersAndTeamsPanel, {
    props: {
      title: title,
      typeFilters: typeFilters,
      panelOptions: panelOptions,
      modelValue: computed(() => emptySelection),
      noresults: "",
      filterOnlyVoiceAvailable: filterOnlyVoiceAvailable,
    },
    events: {
      close: () => {
        removeUsersAndTeamsItemPanel(activePanelId);
        onClose();
      },

      "update:modelValue": (to: UsersAndTeamsSelection) => {
        onSelect(to);
        removeUsersAndTeamsItemPanel(activePanelId);
      },
    },
    loadComponents: [TickSettingsPanel]
  }, newPanelId);
}



//TICKET CREATOR PANEL

// Static functions (for mounting)
export function removeTicketCreatorPanel() {
  unmount("TicketCreatorPanel");
}

export function openTicketCreatorPanel(
  communicatorId?: string,
  routerToTicket?: boolean,
  address?: string
) {
  mount(
    TicketCreatorPanel,
    {
      props: {
        communicatorId,
        address,
      },
      events: {
        close: (newTicketId: string) => {
          removeTicketCreatorPanel();
          if (routerToTicket) RouterToTicket(newTicketId);
        },
      },
    },
    "TicketCreatorPanel"
  );
}

// TICK CONSOLE PANEL
import TickConsolePanel from '@/components/panels/TickConsolePanel.vue';

export const panelName = 'TickConsolePanel';

export function openTickConsole() {
  mount(TickConsolePanel, {
    props: {},
    events: {
      close: () => {
        unmount(panelName);
      },
    },
  }, panelName);
}



import TenantRemovePanel from '@/components/panels/TenantRemovePanel.vue';

export const tenantRemovePanelName = 'TenantRemovePanel';

export function openTenantRemovePanel() {
  mount(TenantRemovePanel, {
    props: {},
    events: {
      close: () => {
        unmount(tenantRemovePanelName);
      },
    },
  }, tenantRemovePanelName);
}


// TASK INSTANCE CREATOR PANEL
import TaskInstanceCreatorPanel from "@/components/panels/TaskInstanceCreatorPanel.vue";

export const taskInstanceCreatorPanelId = "taskInstanceCreatorPanel";

export function removeTaskInstanceCreatorPanel() {
  unmount(taskInstanceCreatorPanelId);
}

export function openTaskInstanceCreatorPanel(ticketId?: string) {
  mount(TaskInstanceCreatorPanel, {
    props: { ticketId },
    events: {
      close: () => {
        removeTaskInstanceCreatorPanel();
      },
    },
  }, taskInstanceCreatorPanelId);
}