import { TaskFilterOptions, TicketFilterOptions } from "@/TickApi";
import { _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import { TaskListOptions } from "./tasks";
import { TicketListOptions } from "./tickets";

export interface Rule {
  id?: string | null;
  key: InterfaceStateType;
  state: string | boolean;
}


export enum InterfaceStateType {
  MainMenuCollapsed = "MainMenuCollapsed",
  TaskListCollapsed = "TaskListCollapsed",
  LabelsCollapsed = "LabelsCollapsed",
  CollectionNodesCollapsed = "CollectionNodesCollapsed",
  FlowSideBarCollapsed = "FlowSideBarCollapsed",
  SettingsMenuCollapsed = "SettingsMenuCollapsed",
  TaskDefinitionCollapsed = "TaskDefinitionCollapsed",
  TicketHideTrivialTimelineItems = "TicketHideTrivialTimelineItems",
  SidebarPanelCollapsed = "SidebarPanelCollapsed",
  ShowDocuBlockCollapsed = "ShowDocuBlockCollapsed",
  FlowStepCollapsed = "FlowStepCollapsed",
}
export enum ThemeEnum {
  Daylight = "daylight",
  Midnight = "midnight",
}

export interface ScreenDimensions {
  width: number;
  height: number;
}

export interface UserSettings {
  theme: ThemeEnum,
  //localeCode: string,
  viewstateRules?: Rule[],
  tickets?: {
    listOptions?: TicketListOptions | null,
    filterOptions?: TicketFilterOptions | null,
  },
  tasks?: {
    listOptions?: TaskListOptions | null,
    filterOptions?: TaskFilterOptions | null,
  }
  voice?: {
    autoConnect?: boolean | null,
    defaultChannelId: string | null,
  }
}

interface State {
  theme: ThemeEnum;
  minWidthForNonCollapsed: number;
  rules: Rule[];
  screenDimensions: ScreenDimensions;
}

export type GetRule = (key: InterfaceStateType, id?: string | null) => Rule | undefined;
export type HasRule = (key: InterfaceStateType, id?: string | null) => boolean;

interface Getters extends _GettersTree<State> {
  rule(state: State): GetRule;
  has(state: State): HasRule;
  canShowFull(state: State): boolean;
}

interface Actions {
  set(rule: Rule): void;
  toggle(key: InterfaceStateType, id?: string | null): void;
}

const useViewstateStore = defineStore<"viewstate", State, Getters, Actions>(
  "viewstate",
  {
    state: () => ({
      theme: ThemeEnum.Daylight,
      minWidthForNonCollapsed: 1000,
      screenDimensions: {
        height: 0,
        width: 0,
      },
      rules: [
        {
          id: null,
          key: InterfaceStateType.LabelsCollapsed,
          state: true,
        },
        {
          key: InterfaceStateType.MainMenuCollapsed,
          state: true,
        }
      ],
    }),
    getters: {
      rule: (state) => (key: InterfaceStateType, id?: string | null) =>
        state.rules.find((r) => r.key === key && (id === null || r.id === id)),
      has: (state) => (key: InterfaceStateType, id?: string | null) =>
        !!state.rules.find((r) => r.key === key && r.state && (id === null || r.id === id)),
      canShowFull: (state) => {
        const currentWidth = state.screenDimensions.width;
        if (!currentWidth) { return true; } // initialization
        return currentWidth >= state.minWidthForNonCollapsed;
      }
    },
    actions: {
      set(rule: Rule) {
        const exists = this.rules.find((r) => r.key === rule.key && (rule.id === null || r.id === rule.id));
        if (exists) {
          exists.state = rule.state;
        } else {
          this.rules.push(rule);
        }
      },
      toggle(key: InterfaceStateType, id?: string | null) {
        const existing = this.rules.find(
          (r) => r.key === key && (id === null || r.id === id)
        );
        if (existing) {
          existing.state = !existing.state;
        } else {
          this.rules.push({ key, state: true, id: id || null });
        }
      },
    },
    persist: [
      {
        pick: undefined,
        key: PiniaStoragePath.viewstate,// "tick-viewstate",
        storage: getTickStorage(PiniaStorageType.Session),
      },
    ],
  }
);

export default useViewstateStore;