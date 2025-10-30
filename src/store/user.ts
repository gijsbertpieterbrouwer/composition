/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AuthorizationObjectType,
  AuthorizationType,
  DevelopmentFeature,
  DocumentationGroup,
  Initiator,
  InitiatorTypeEnum,
  MyUserContext,
  SubscriptionCostItemType,
  TenantSubscriptionPlanData,
  TenantSubscriptionPlanNumericItem,
  TickDocuBlock,
  TickNotification,
  TickWorkspace,
  WorkspaceAuthorization,
} from "@/TickApi";
import { openOnboardingPanel } from "@/components/panels/UserOnboardingPanel.vue";
import { patchMultipleInMetaDataList } from "@/helpers/arrayHelper";
import { authorizationIsSufficient } from "@/helpers/authorizationsHelper";
import { getLanguageByLocaleCode } from "@/helpers/enumsHelper";
import { unlimited } from "@/helpers/guid";
import { debugAction } from "@/log";
import { getNotifications, resolveNotification } from "@/services/NotificationsService";
import { updateWorkspace } from "@/services/WorkspaceService";
import { appRtcHub } from "@/services/rtc/AppRtcHub";
import type { Locale } from "date-fns";
import { enGB, nl } from "date-fns/locale";
import { _GettersTree, defineStore, StoreDefinition } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import useAppStore from "./app";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useTasksStore from "./tasks";
import useTicketsStore from "./tickets";
import useUtilityDataStore from "./utilitydata";
import useViewstateStore, { UserSettings } from "./viewstate";
import useVoiceStore from "./voice";


interface State {
  userId: string;
  tenantId: string;
  isFirstTime: boolean;
  isGlobalAdmin: boolean;
  isActivePartner: boolean;
  activeWorkspaceId: string | null;
  workspaces: TickWorkspace[];
  notifications: TickNotification[];
  docuBlocks: TickDocuBlock[];
  allowedDevelopmentFeature: DevelopmentFeature[]
  allowUpsell: boolean;
  homeDashboardId: string | null;
  subscriptionPlanData: TenantSubscriptionPlanData | null;
  localeCode: string;
}

interface Getters extends _GettersTree<State> {
  activeWorkspace(state: State): TickWorkspace | null;
  getWorkspace: (state: State) => (id: string) => TickWorkspace | null;
  getHomeDashboardId: (state: State) => () => string | null;
  // Authorizations
  allowed: (state: State) => (permission: AuthorizationObjectType, as: AuthorizationType) => boolean;
  allowedView: (state: State) => (permission: AuthorizationObjectType | null, requestedAuth: SubscriptionCostItemType | SubscriptionCostItemType[] | undefined | null) => boolean;
  allowedEdit: (state: State) => (permission: AuthorizationObjectType) => boolean;
  allowedOwn: (state: State) => (permission: AuthorizationObjectType) => boolean;

  developmentFeatureIsAllowed: (state: State) => (feature: DevelopmentFeature) => boolean;
  isSelf: (state: State) => (userId: string) => boolean;
  locale: (state: State) => Locale;
  userAsInitiator: (state: State) => Initiator
  getDocuBlocks: (state: State) => (group: DocumentationGroup | DocumentationGroup[]) => TickDocuBlock[];

  allowedInPlan: (state: State) => (costItem: SubscriptionCostItemType) => boolean;
  maxAllowedInPlan: (state: State) => (costItem: SubscriptionCostItemType) => number;
  allowedViewInPlan: (state: State) => (requestedAuth?: SubscriptionCostItemType | SubscriptionCostItemType[]) => boolean;
  allowedAddInPlan: (state: State) => (requestedAuth: SubscriptionCostItemType, currentNr: number) => boolean;
}

interface Actions {
  deactivateWorkspace(): void;
  activateWorkspace(workspace: TickWorkspace | string, forceRefresh?: boolean): void;
  set(context: MyUserContext): void;
  saveWorkspace(): Promise<unknown>;
  patchNotifications(updates: TickNotification[]): void;
  useNotifications(): Promise<void>;
  resolveNotification(item: TickNotification): Promise<void>;
}

function isTickWorkspace(
  workspaceOrUrl: TickWorkspace | string
): workspaceOrUrl is TickWorkspace {
  return typeof workspaceOrUrl !== "string";
}

function getWorkspaceByUrlName(urlName: string, workspaces: TickWorkspace[]) {
  return workspaces.find(
    (ws) =>
      urlName.localeCompare(ws.urlName ?? "", undefined, { sensitivity: "base" }) == 0
  );
}

const useUserStore: StoreDefinition<"user", State, Getters, Actions> = defineStore<"user", State, Getters, Actions>("user", {
  state: () => ({
    localeCode: "en-GB",
    userId: "",
    tenantId: "",
    isFirstTime: false,
    isGlobalAdmin: false,
    isActivePartner: false,
    activeWorkspaceId: null,
    workspaces: [],
    notifications: [],
    docuBlocks: [],
    allowedDevelopmentFeature: [],
    allowUpsell: false,
    homeDashboardId: null,
    subscriptionPlanData: null,
  }),
  getters: {
    userAsInitiator: (state) => {
      return {
        id: state.userId,
        type: InitiatorTypeEnum.User
      }
    },
    locale: (state) => {
      switch (state.localeCode.toLowerCase()) {
        case 'en-GB': return enGB;
        case 'nl': return nl;
        default: return enGB;
      }
    },
    activeWorkspace: (state) => {
      // cache active workspace
      return state.workspaces.find((ws) => ws?.id?.toLowerCase() == state.activeWorkspaceId?.toLowerCase()) ?? null;
    },

    allowedViewInPlan(state) {
      const numerics: TenantSubscriptionPlanNumericItem[] = (state.subscriptionPlanData)?.numerics || [];

      return (requestedAuth?: SubscriptionCostItemType | SubscriptionCostItemType[]) => {
        if (requestedAuth == null) { return true; }

        if (Array.isArray(requestedAuth)) {

          const hasAllowedItem = requestedAuth.some(a => numerics.some(p => p.type == a && (p.value == unlimited || p.value >= 1)))

          return hasAllowedItem;
        } else {
          return numerics.some(p => p.type == requestedAuth && (p.value == unlimited || p.value >= 1));
        }



      }
    },
    allowedAddInPlan(state) {
      const numerics: TenantSubscriptionPlanNumericItem[] = (state.subscriptionPlanData)?.numerics || [];

      return (requestedAuth: SubscriptionCostItemType, currentNr: number) => {
        return numerics.some(p => p.type == requestedAuth && (p.value == unlimited || p.value > currentNr));
      }
    }, // maxAllowedInPlan: (state: State) => (costItem: SubscriptionCostItemType) => number;
    maxAllowedInPlan(state) {
      const numerics: TenantSubscriptionPlanNumericItem[] = (state.subscriptionPlanData)?.numerics || [];

      return (costItem: SubscriptionCostItemType) => {
        return numerics.find(p => p.type == costItem)?.value ?? 0;
      }
    },
    allowedInPlan(state) {
      const numerics: TenantSubscriptionPlanNumericItem[] = (state.subscriptionPlanData)?.numerics || [];

      return (requestedAuth: SubscriptionCostItemType) => {
        return numerics.some(p => p.type == requestedAuth && (p.value == unlimited || p.value > 0));
      }
    },
    getHomeDashboardId(state) {
      const activeWorkspace = state.workspaces.find(ws => ws.id?.toLowerCase() === state.activeWorkspaceId?.toLowerCase());
      const defaultHomeDashboard = state.homeDashboardId;

      return () => {
        return activeWorkspace?.defaultDashboardId
          ? activeWorkspace?.defaultDashboardId
          : defaultHomeDashboard;

      }
    },
    allowed(state) {
      const activeWorkspace = state.workspaces.find(ws => ws.id?.toLowerCase() === state.activeWorkspaceId?.toLowerCase());
      const authorizations: WorkspaceAuthorization[] = (activeWorkspace || {} as TickWorkspace).authorizations || [];

      return (requestedAuth: AuthorizationObjectType, as: AuthorizationType) => {
        if (requestedAuth == null) { return true; }
        if (state.isGlobalAdmin) { return true; }
        return authorizations.some(p => p.objectType == requestedAuth && authorizationIsSufficient(as, p.as));
      }
    },

    allowedView(state) {
      return (requestedAuth: AuthorizationObjectType | null, requestedCostItem: SubscriptionCostItemType | SubscriptionCostItemType[] | undefined | null) => {
        const numerics: TenantSubscriptionPlanNumericItem[] = (state.subscriptionPlanData)?.numerics || [];
        const isAllowedInPlan = (requestedCostItem == null)
          ? true
          : Array.isArray(requestedCostItem)
            ? requestedCostItem.some(a => numerics.some(p => p.type == a && (p.value == unlimited || p.value >= 1)))
            : numerics.some(p => p.type == requestedCostItem && (p.value == unlimited || p.value >= 1));

        const activeWorkspace = state.workspaces.find(ws => ws.id?.toLowerCase() === state.activeWorkspaceId?.toLowerCase());
        const authorizations: WorkspaceAuthorization[] = (activeWorkspace || {} as TickWorkspace).authorizations || [];
        const isAllowedAuth = requestedAuth == null
          ? true
          : state.isGlobalAdmin
            ? true
            : authorizations.some(p => p.objectType == requestedAuth && authorizationIsSufficient(AuthorizationType.Viewer, p.as));

        return isAllowedInPlan && isAllowedAuth;
      }
    },
    allowedEdit(state) {
      const activeWorkspace = state.workspaces.find(ws => ws.id?.toLowerCase() === state.activeWorkspaceId?.toLowerCase());
      const authorizations: WorkspaceAuthorization[] = (activeWorkspace || {} as TickWorkspace).authorizations || [];

      return (requestedAuth: AuthorizationObjectType) => {
        if (requestedAuth == null) { return true; }
        if (state.isGlobalAdmin) { return true; }
        return authorizations.some(p => p.objectType == requestedAuth && authorizationIsSufficient(AuthorizationType.Contributor, p.as));
      }
    },
    allowedOwn(state) {
      const activeWorkspace = state.workspaces.find(ws => ws.id?.toLowerCase() === state.activeWorkspaceId?.toLowerCase());
      const authorizations: WorkspaceAuthorization[] = (activeWorkspace || {} as TickWorkspace).authorizations || [];

      return (requestedAuth: AuthorizationObjectType) => {
        if (requestedAuth == null) { return true; }
        if (state.isGlobalAdmin) { return true; }
        return authorizations.some(p => p.objectType == requestedAuth && authorizationIsSufficient(AuthorizationType.Owner, p.as));
      }
    },

    getDocuBlocks(state) {
      return (group: DocumentationGroup | DocumentationGroup[]) => {
        return Array.isArray(group)
          ? (state.docuBlocks || []).filter(p => (group as DocumentationGroup[]).some(a => a == p.group))
          : (state.docuBlocks || []).filter(p => p.group == group);
      }
    },
    developmentFeatureIsAllowed(state) {
      return (feature: DevelopmentFeature) => state.allowedDevelopmentFeature.includes(feature);
    },


    isSelf(state) {
      return (userId: string) => userId == state.userId;
    },
    getWorkspace(state) {
      return (id: string) =>
        state.workspaces?.find((ws) => ws.id?.toLowerCase() == id?.toLowerCase()) ?? null;
    },
  },
  actions: {
    deactivateWorkspace() {
      debugAction("[WORKSPACE:DEACTIVATE] DEActivating workspace");
      const activeWorkspaceId = this.activeWorkspaceId;
      if (activeWorkspaceId) {
        appRtcHub.unsubscribe(activeWorkspaceId);
      }
    },
    activateWorkspace(workspace: TickWorkspace | string, forceRefresh?: boolean) {
      const newActiveWorkspace = isTickWorkspace(workspace)
        ? (this.workspaces as TickWorkspace[]).find((ws) => ws.id == workspace.id)
        : getWorkspaceByUrlName(workspace, this.workspaces);



      if (!newActiveWorkspace) { return; }
      debugAction("[WORKSPACE:ACTIVATE] Activating workspace");

      if (useAppStore().authenticated) {
        if (!appRtcHub.hasSubscription(newActiveWorkspace.id)) {
          debugAction("[WORKSPACE:SUBSCRIBE] Subscribe to tenant workspace events.");
          appRtcHub.subscribe(newActiveWorkspace.id);
        }

        if (this.activeWorkspaceId !== newActiveWorkspace.id || forceRefresh) {
          if (this.activeWorkspaceId && appRtcHub.hasSubscription(this.activeWorkspaceId)) {
            debugAction("[WORKSPACE:UNSUBSCRIBE] Unsubscribe from tenant workspace events.");
            appRtcHub.unsubscribe(this.activeWorkspaceId);
          }

          if (forceRefresh && !appRtcHub.hasSubscription(newActiveWorkspace.id)) {
            debugAction("[WORKSPACE:SUBSCRIBE] Subscribe to tenant workspace events.");
            appRtcHub.subscribe(newActiveWorkspace.id);
          }

          debugAction("[WORKSPACE:Activate]Refreshing data");
          useUtilityDataStore().use(newActiveWorkspace.id);
          this.useNotifications();
          useTicketsStore().useCounter(newActiveWorkspace.id);

        }
      } else {
        if (this.activeWorkspaceId) {
          appRtcHub.unsubscribe(this.activeWorkspaceId);
        }

        debugAction("[WORKSPACE:NOT-AUTHENTICATED] Not authenticated, log in first.");
      }

      this.activeWorkspaceId = newActiveWorkspace.id;
    },
    set(context: MyUserContext) {
      debugAction("[WORKSPACE:Set User Context] User context set");
      this.workspaces = context.workspaces || [];
      this.userId = context.userId;
      this.docuBlocks = context.docuBlocks || [];
      this.allowedDevelopmentFeature = context.allowedDevelopmentFeatures || [];
      this.tenantId = context.tenantId;
      this.isFirstTime = context.isFirstLogin;
      this.isGlobalAdmin = context.admin;
      this.isActivePartner = context.isActivePartner;
      this.allowUpsell = context.allowUpsell;
      this.homeDashboardId = context.homeDashboardId ?? null;
      this.subscriptionPlanData = context.subscriptionPlanData ?? null;

      if (context?.localeCode) {
        this.localeCode = context.localeCode;
        useAppStore().useLanguage(getLanguageByLocaleCode(context.localeCode), true);
      }

      if (context.settingsJson) {
        try {
          const settings: UserSettings = JSON.parse(context.settingsJson);

          if (settings?.theme) {
            useViewstateStore().theme = settings.theme;
          }

          if (settings?.viewstateRules) {
            for (let index = 0; index < settings.viewstateRules.length; index++) {
              const rule = settings.viewstateRules[index];
              useViewstateStore().set(rule);
            }
          }

          if (settings.tasks) {
            if (settings.tasks.filterOptions) { useTasksStore().taskFilters = settings.tasks.filterOptions }
            if (settings.tasks.listOptions) { useTasksStore().listOptions = settings.tasks.listOptions }
          }

          if (settings.tickets) {
            if (settings.tickets.filterOptions) { useTicketsStore().ticketFilters = settings.tickets.filterOptions }
            if (settings.tickets.listOptions) { useTicketsStore().listOptions = settings.tickets.listOptions }
          }

          if (settings.voice) {
            useVoiceStore().autoConnect = settings.voice.autoConnect ?? false;
            useVoiceStore().defaultChannelId = settings.voice.defaultChannelId;
          }


        } catch (e) {
          console.error("Failed to parse settingsJson", e);
        }
      }

      const defaultWorkspace = (this.workspaces as TickWorkspace[]).find((ws) => !!ws.isDefault);
      if (defaultWorkspace) {
        this.activateWorkspace(defaultWorkspace);
      }

      if (context.isFirstLogin) {
        setTimeout(() => {
          openOnboardingPanel();
        }, 2000);

      }
    },

    async saveWorkspace() {
      const workspace = this.activeWorkspace;
      if (!workspace) return;

      const data = await updateWorkspace({
        name: workspace.name,
        iconFileId: workspace.iconFileId,
        workspaceId: workspace.id,
      });

      if (data) {
        workspace.name = data.name;
        workspace.urlName = data.urlName;
      }
      return data;
    },
    async useNotifications() {
      if (!useAppStore().authenticated) { return; }
      const notifications = await getNotifications();
      this.patchNotifications(notifications);

    },
    async resolveNotification(item: TickNotification) {
      this.notifications = (this.notifications as TickNotification[]).filter(p => p.id != item.id);
      await resolveNotification(item)

    },
    patchNotifications(updates: TickNotification[]): void {
      this.notifications = patchMultipleInMetaDataList(updates, this.notifications, 100);
    },
  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.user,// "tick-user",
      storage: getTickStorage(PiniaStorageType.Local, true),
    },
  ],
});

export default useUserStore;