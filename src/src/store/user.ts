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
import { enGB, nl } from "date-fns/locale";
import { _GettersTree, defineStore } from "pinia";
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
  activeWorkspaceId: string;
  workspaces: Required<TickWorkspace>[];
  notifications: TickNotification[];
  docuBlocks: TickDocuBlock[];
  allowedDevelopmentFeature: DevelopmentFeature[]
  allowUpsell: boolean;
  homeDashboardId: string;
  subscriptionPlanData: TenantSubscriptionPlanData;
  localeCode: string;
}

interface Getters extends _GettersTree<State> {
  activeWorkspace(state: State): Required<TickWorkspace>;
  getWorkspace: (state: State) => (id: string) => Required<TickWorkspace>;
  getHomeDashboardId: (state: State) => () => string;
  // Authorizations
  allowed: (state: State) => (permission: AuthorizationObjectType, as: AuthorizationType) => boolean;
  allowedView: (state: State) => (permission: AuthorizationObjectType, requestedAuth: SubscriptionCostItemType | SubscriptionCostItemType[]) => boolean;
  allowedEdit: (state: State) => (permission: AuthorizationObjectType) => boolean;
  allowedOwn: (state: State) => (permission: AuthorizationObjectType) => boolean;

  developmentFeatureIsAllowed: (state: State) => (feature: DevelopmentFeature) => boolean;
  isSelf: (state: State) => (userId: string) => boolean;
  locale: (state: State) => Locale;
  userAsInitiator: (state: State) => Initiator
  getDocuBlocks: (state: State) => (group: DocumentationGroup | DocumentationGroup[]) => TickDocuBlock[];

  allowedInPlan: (state: State) => (costItem: SubscriptionCostItemType) => boolean;
  maxAllowedInPlan: (state: State) => (costItem: SubscriptionCostItemType) => number;
}

interface Actions {
  deactivateWorkspace(): void;
  activateWorkspace(workspace: TickWorkspace | string, forceRefresh?: boolean): void;
  set(context: MyUserContext): void;
  saveWorkspace(): Promise<unknown>;
  patchNotifications(updates: TickNotification[]): void;
  useNotifications(): void;
  resolveNotification(item: TickNotification): void;
}

function isTickWorkspace(
  workspaceOrUrl: TickWorkspace | string
): workspaceOrUrl is TickWorkspace {
  return typeof workspaceOrUrl !== "string";
}

function getWorkspaceByUrlName(urlName: string, workspaces: TickWorkspace[]) {
  return workspaces.find(
    (ws) =>
      urlName.localeCompare(ws.urlName, undefined, { sensitivity: "base" }) == 0
  );
}

const useUserStore = defineStore<"user", State, Getters, Actions>("user", {
  state: () => ({
    localeCode: "en-GB",
    name: "",
    userId: "",
    tenantId: "",
    isFirstTime: false,
    isGlobalAdmin: false,
    isActivePartner: false,
    activeWorkspaceId: "",
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
      const activeWorkspace = state.workspaces.find(
        (ws) => ws?.id?.toLowerCase() == state.activeWorkspaceId?.toLowerCase()
      );
      return activeWorkspace;
    },

    allowedViewInPlan(state) {
      const numerics: TenantSubscriptionPlanNumericItem[] = (state.subscriptionPlanData as TenantSubscriptionPlanData)?.numerics || [];

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
      const numerics: TenantSubscriptionPlanNumericItem[] = (state.subscriptionPlanData as TenantSubscriptionPlanData)?.numerics || [];

      return (requestedAuth: SubscriptionCostItemType, currentNr: number) => {
        return numerics.some(p => p.type == requestedAuth && (p.value == unlimited || p.value > currentNr));
      }
    }, // maxAllowedInPlan: (state: State) => (costItem: SubscriptionCostItemType) => number;
    maxAllowedInPlan(state) {
      const numerics: TenantSubscriptionPlanNumericItem[] = (state.subscriptionPlanData as TenantSubscriptionPlanData)?.numerics || [];

      return (costItem: SubscriptionCostItemType) => {
        return numerics.find(p => p.type == costItem)?.value ?? 0;
      }
    },
    allowedInPlan(state) {
      const numerics: TenantSubscriptionPlanNumericItem[] = (state.subscriptionPlanData as TenantSubscriptionPlanData)?.numerics || [];

      return (requestedAuth: SubscriptionCostItemType) => {
        return numerics.some(p => p.type == requestedAuth && (p.value == unlimited || p.value > 0));
      }
    },
    getHomeDashboardId(state) {
      const activeWorkspace = this.activeWorkspace as TickWorkspace;
      const defaultHomeDashboard = state.homeDashboardId as string;

      return () => {
        return activeWorkspace?.defaultDashboardId
          ? activeWorkspace?.defaultDashboardId
          : defaultHomeDashboard;

      }
    },
    allowed(state) {
      const activeWorkspace = this.activeWorkspace;
      const authorizations: WorkspaceAuthorization[] = (activeWorkspace || {} as TickWorkspace).authorizations || [];

      return (requestedAuth: AuthorizationObjectType, as: AuthorizationType) => {
        if (requestedAuth == null) { return true; }
        if (state.isGlobalAdmin) { return true; }
        return authorizations.some(p => p.objectType == requestedAuth && authorizationIsSufficient(as, p.as));
      }
    },

    allowedView(state) {
      return (requestedAuth: AuthorizationObjectType, requestedCostItem: SubscriptionCostItemType | SubscriptionCostItemType[]) => {
        return this.allowedViewInPlan(requestedCostItem) && this.allowed(requestedAuth, AuthorizationType.Viewer);
      }
    },
    allowedEdit(state) {
      return (requestedAuth: AuthorizationObjectType) => {
        return this.allowed(requestedAuth, AuthorizationType.Contributor);
      }
    },
    allowedOwn(state) {
      return (requestedAuth: AuthorizationObjectType) => {
        return this.allowed(requestedAuth, AuthorizationType.Owner);
      }
    },

    getDocuBlocks(state) {
      return (group: DocumentationGroup | DocumentationGroup[]) => {
        return Array.isArray(group)
          ? (state.docuBlocks as TickDocuBlock[]).filter(p => (group as DocumentationGroup[]).some(a => a == p.group)) || []
          : (state.docuBlocks as TickDocuBlock[]).filter(p => p.group == group) || [];
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
        state.workspaces?.find((ws) => ws.id.toLowerCase() == id?.toLowerCase());
    },
  },
  actions: {
    deactivateWorkspace() {
      debugAction("[WORKSPACE:DEACTIVATE] DEActivating workspace");
      appRtcHub.unsubscribe(this.activeWorkspace?.id);
    },
    activateWorkspace(workspace: TickWorkspace | string, forceRefresh?: boolean) {
      const newActiveWorkspace = isTickWorkspace(workspace)
        ? (this.workspaces as Required<TickWorkspace>[]).find((ws) => ws.id == workspace.id)
        : getWorkspaceByUrlName(workspace, this.workspaces);



      if (!newActiveWorkspace) { return; }
      debugAction("[WORKSPACE:ACTIVATE] Activating workspace");

      if (useAppStore().authenticated) {
        if (!appRtcHub.hasSubscription(newActiveWorkspace.id)) {
          debugAction("[WORKSPACE:SUBSCRIBE] Subscribe to tenant workspace events.");
          appRtcHub.subscribe(newActiveWorkspace.id);
        }

        if (this.activeWorkspaceId !== newActiveWorkspace.id || forceRefresh) {
          if (this.activeWorkspace && appRtcHub.hasSubscription(this.activeWorkspace.id)) {
            debugAction("[WORKSPACE:UNSUBSCRIBE] Unsubscribe from tenant workspace events.");
            appRtcHub.unsubscribe(this.activeWorkspace.id);
          }

          if (forceRefresh && !appRtcHub.hasSubscription(newActiveWorkspace.id)) {
            debugAction("[WORKSPACE:SUBSCRIBE] Subscribe to tenant workspace events.");
            appRtcHub.subscribe(newActiveWorkspace.id);
          }

          debugAction("[WORKSPACE:Activate]Refreshing data");
          useUtilityDataStore().use(newActiveWorkspace.id);
          useUserStore().useNotifications();
          useTicketsStore().useCounter(newActiveWorkspace.id);

        }
      } else {
        if (this.activeWorkspace) {
          appRtcHub.unsubscribe(this.activeWorkspace.id);
        }

        debugAction("[WORKSPACE:NOT-AUTHENTICATED] Not authenticated, log in first.");
      }

      this.activeWorkspaceId = newActiveWorkspace.id;
    },
    set(context: MyUserContext) {
      debugAction("[WORKSPACE:Set User Context] User context set");
      this.workspaces = context.workspaces;
      this.userId = context.userId;
      this.docuBlocks = context.docuBlocks;
      this.allowedDevelopmentFeature = context.allowedDevelopmentFeatures;
      this.tenantId = context.tenantId;
      this.isFirstTime = context.isFirstLogin;
      this.isGlobalAdmin = context.admin;
      this.isActivePartner = context.isActivePartner;
      this.allowUpsell = context.allowUpsell;
      this.homeDashboardId = context.homeDashboardId;
      this.subscriptionPlanData = context.subscriptionPlanData;

      if (context?.localeCode) {
        this.localeCode = context.localeCode;
        useAppStore().useLanguage(getLanguageByLocaleCode(context.localeCode), true);
      }

      if (context.settingsJson) {
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
          useVoiceStore().autoConnect = settings.voice.autoConnect;
          useVoiceStore().defaultChannelId = settings.voice.defaultChannelId;
        }


      }

      const defaultWorkspace = (this.workspaces as Required<TickWorkspace>[]).find((ws) => !!ws.isDefault);
      this.activateWorkspace(defaultWorkspace);

      if (context.isFirstLogin) {
        setTimeout(() => {
          openOnboardingPanel();
        }, 2000);

      }
    },

    async saveWorkspace() {
      const workspace = this.activeWorkspace as TickWorkspace;

      const data = await updateWorkspace({
        name: workspace.name,
        iconFileId: workspace.iconFileId,
        workspaceId: workspace.id,
      });

      workspace.name = data.name;
      workspace.urlName = data.urlName;
      return;
    },
    useNotifications() {
      if (!useAppStore().authenticated) { return; }
      getNotifications().then((notifications) => {
        this.patchNotifications(notifications);
      });

    },
    resolveNotification(item: TickNotification) {
      this.notifications = (this.notifications as TickNotification[]).filter(p => p.id != item.id);
      resolveNotification(item)

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
