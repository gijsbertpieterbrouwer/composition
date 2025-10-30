import { getTenantUrlNameFromHostname } from "@/helpers";
import { debugAction, debugCustom, logColors } from "@/log";
import useAppStore from "@/store/app";
import { LoginReason } from "@/views/UserLogin.vue";
import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import { notifyError } from "./notify";
import { translate } from "./plugins/translatePlugin";
import { addRoutingEventTrack } from "./services/GoogleAnalyticsService";
import useUserStore from "./store/user";
import { AuthorizationObjectType, CollectionObjectTypeEnum, LanguagePath } from "./TickApi";

export enum ViewstateEnum {
  Register_preregister = "preregister",
  Register_register = "register",
  Register_waitForRegistrationComplete = "waitforregistrationcomplete",
  FullscreenView = "fullscreenview",
}

export interface TickRouteParams {
  workspaceName?: string;
  reason?: string;
  viewstate?: ViewstateEnum;
  id?: string;
  versionId?: string;
}

export interface UserRouteParams {
  workspaceName?: string;
  userId?: string;
}

export enum ViewName {
  NotFound = "NotFound",
  ActivateIntegration = "ActivateIntegration",
  Login = "Login",
  Logout = "Logout",
  Register = "Register",
  ResetUserPassword = "ResetUserPassword",
  NoTenant = "NoTenant",
  Home = "Home",
  Tickets = "Tickets",
  Tasks = "Tasks",
  Communicators = "Communicators",
  CommunicatorCategories = "CommunicatorCategories",
  Dashboards = "Dashboards",
  Flows = "Flows",
  Collections = "Collections",
  TaskDefinitions = "TaskDefinitions",
  Settings = "Settings",
  WorkspaceSettings = "WorkspaceSettings",
  WorkspaceLogs = "WorkspaceLogs",
  Labels = "Labels",
  Authorizations = "Authorizations",
  Databags = "Databags",
  Users = "Users",
  Teams = "Teams",
  Environments = "Environments",
  CannedResponses = "CannedResponses",
  KnowledgeBases = "KnowledgeBases",
  KnowledgeBaseArticle = "KnowledgeBaseArticle",
  Channels = "Channels",
  DataAdapters = "DataAdapters",
  EventSubscriptions = "EventSubscriptions",
  DomainVerifications = "DomainVerifications",
  Files = "Files",
  MetaDataComponents = "MetaDataComponents",
  SlaDefinitions = "SlaDefinitions",
  Tenant = "Tenant",
  Subscription = "Subscription",
  Partnership = "Partnership",
  PartnerDashboard = "PartnerDashboard",
  CurrentPeriodUsage = "CurrentPeriodUsage",
  TickBilling = "TickBilling",
  InstallShopify = "InstallShopify",
}

const routes = [
  {
    path: "/:catchAll(.*)",
    component: () => import("@/views/NotFound.vue"),
    name: ViewName.NotFound,
    meta: { requiresAuth: false },
  },
  {
    path: "/:reason?",
    name: ViewName.Login,
    component: () => import("@/views/UserLogin.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/activateIntegration/:tenantId?/:integrationId?",
    name: ViewName.ActivateIntegration,
    component: () => import("@/views/ActivateIntegration.vue"),
    meta: { requiresAuth: false, disableTenantCheck: true },
  },
  {
    path: "/integration/install/shopify",
    name: ViewName.InstallShopify,
    component: () => import("@/views/integrations/InstallShopify.vue"),
    meta: { requiresAuth: false, disableTenantCheck: true },
  },
  {
    path: "/logout",
    name: ViewName.Logout,
    component: () => import("@/views/UserLogout.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/register/:planId?/:partnershipId?",
    name: ViewName.Register,
    component: () => import("@/views/RegisterTenant.vue"),
    meta: { requiresAuth: false, disableTenantCheck: true },
  },
  {
    path: "/password/reset/:viewstate?",
    alias: '/invitation/:viewstate?',
    name: ViewName.ResetUserPassword,
    component: () => import("@/views/ResetPassword.vue"),
    meta: { requiresAuth: false },
  },

  {
    path: "/noTenant/:reason?",
    name: ViewName.NoTenant,
    component: () => import("@/views/NoTenant.vue"),
    meta: { requiresAuth: false, disableTenantCheck: true },
  },
  {
    path: "/:workspaceName/home",
    name: ViewName.Home,
    component: () => import("@/views/TickHome.vue"),
  },
  {
    path: "/:workspaceName/tickets/:id?",
    name: ViewName.Tickets,
    component: () => import("@/views/TickTickets.vue"),
    meta: { auth: AuthorizationObjectType.Ticket },
  },
  {
    path: "/:workspaceName/tasks/:id?",
    name: ViewName.Tasks,
    component: () => import("@/views/TickTaskInstances.vue"),
    meta: { auth: AuthorizationObjectType.TaskInstance },
  },
  {
    path: "/:workspaceName/contacts/:id?",
    name: ViewName.Communicators,
    component: () => import("@/views/TickCommunicators.vue"),
    meta: { auth: AuthorizationObjectType.Workspace },
  },

  {
    path: "/:workspaceName/dashboards/:id?",
    name: ViewName.Dashboards,
    component: () => import("@/views/TickDashboards.vue"),
  },
  {
    path: "/:workspaceName/flows/:id?/:versionId?/:instanceId?",
    name: ViewName.Flows,
    component: () => import("@/views/TickFlows.vue"),
    meta: { auth: AuthorizationObjectType.ProcessConfiguration },
  },

  {
    path: "/:workspaceName/collections",
    name: ViewName.Collections,
    component: () => import("@/views/TickCollections.vue"),
    meta: { auth: AuthorizationObjectType.TechnicalConfiguration },
  },
  {
    path: "/:workspaceName/settings/tasks/:id?",
    name: ViewName.TaskDefinitions,
    component: () => import("@/views/TickTaskDefinitions.vue"),
    meta: { auth: AuthorizationObjectType.ProcessConfiguration },
  },
  {
    path: "/:workspaceName/settings/contactCategories/:id?",
    name: ViewName.CommunicatorCategories,
    component: () => import("@/views/TickCommunicatorCategoryDefinitions.vue"),
    meta: { auth: AuthorizationObjectType.ProcessConfiguration },
  },

  //SETTINGS
  {
    path: "/:workspaceName/settings",
    name: ViewName.Settings,
    component: () => import("@/views/TickSettingsBase.vue"),
    children: [
      {
        path: "workspace",
        name: ViewName.WorkspaceSettings,
        component: () => import("@/views/TickWorkspaceSettings.vue"),
        meta: { hideSideBar: true, auth: AuthorizationObjectType.Workspace },
      },
      {
        path: "logs",
        name: ViewName.WorkspaceLogs,
        component: () => import("@/views/TickWorkspaceLogs.vue"),
        meta: { hideSideBar: true, auth: AuthorizationObjectType.Workspace },
      },
      {
        path: "labels",
        name: ViewName.Labels,
        component: () => import("@/views/TickLabels.vue"),
        meta: { auth: AuthorizationObjectType.Workspace },
      },
      {
        path: "authorizations",
        name: ViewName.Authorizations,
        // component: () => import("@/views/TickAuthorizations.vue"),
        components: {
          default: () => import("@/views/TickAuthorizations.vue"),
          sidebar: () => import("@/views/sidebar/AuthorizationsSidebar.vue"),
        },
        meta: { auth: AuthorizationObjectType.Workspace },
      },

      {
        path: "databags/:id?",
        name: ViewName.Databags,
        // component: () => import("@/views/TickDatabags.vue"),
        components: {
          default: () => import("@/views/TickDatabags.vue"),
          sidebar: () => import("@/views/sidebar/DatabagsSidebar.vue"),
        },
        meta: { auth: AuthorizationObjectType.TechnicalConfiguration },
      },
      {
        path: "users/:id?",
        name: ViewName.Users,
        component: () => import("@/views/TickUsers.vue"),
        meta: { auth: AuthorizationObjectType.Workspace },
      },
      {
        path: "teams/:id?",
        name: ViewName.Teams,
        component: () => import("@/views/TickTeams.vue"),
        meta: { auth: AuthorizationObjectType.Workspace },
      },
      {
        path: "environments/:id?",
        name: ViewName.Environments,
        component: () => import("@/views/TickExecutionEnvironments.vue"),
        meta: { auth: AuthorizationObjectType.TechnicalConfiguration },
      },
      {
        path: "cannedResponses/:id?",
        name: ViewName.CannedResponses,
        component: () => import("@/views/TickCannedResponses.vue"),
        meta: { auth: AuthorizationObjectType.Ticket },
      },
      {
        path: "knowledgebases/:id?",
        name: ViewName.KnowledgeBases,
        // component: () => import("@/views/TickKnowledgeBases.vue"),
        components: {
          default: () => import("@/views/TickKnowledgeBases.vue"),
          sidebar: () => import("@/views/sidebar/KnowledgebaseSidebar.vue"),
        },
        meta: { auth: AuthorizationObjectType.ProcessConfiguration },
      },
      {
        path: "knowledgebases/article/:id?",
        name: ViewName.KnowledgeBaseArticle,
        component: () => import("@/views/TickKnowledgeBaseArticle.vue"),
        meta: { auth: AuthorizationObjectType.ProcessConfiguration },
      },

      {
        path: "channels/:id?",
        name: ViewName.Channels,
        // component: () => import("@/views/TickChannels.vue"),
        components: {
          default: () => import("@/views/TickChannels.vue"),
          sidebar: () => import("@/views/sidebar/ChannelsSidebar.vue"),
        },
        meta: { auth: AuthorizationObjectType.TechnicalConfiguration },
      },
      {
        path: "data-adapters/:id?",
        name: ViewName.DataAdapters,
        //component: () => import("@/views/TickDataAdapters.vue"),
        components: {
          default: () => import("@/views/TickDataAdapters.vue"),
          sidebar: () => import("@/views/sidebar/AdaptersSidebar.vue"),
        },
        meta: { auth: AuthorizationObjectType.TechnicalConfiguration },
      },
      {
        path: "event-subscriptions/:id?",
        name: ViewName.EventSubscriptions,
        // component: () => import("@/views/TickEventSubscriptions.vue"),

        components: {
          default: () => import("@/views/TickEventSubscriptions.vue"),
          sidebar: () => import("@/views/sidebar/EventSubscriptionsSidebar.vue"),
        },
        meta: { auth: AuthorizationObjectType.TechnicalConfiguration },

      },
      {
        path: "domain-verifications",
        name: ViewName.DomainVerifications,
        //component: () => import("@/views/TickDomainVerifications.vue"),
        components: {
          default: () => import("@/views/TickDomainVerifications.vue"),
          sidebar: () => import("@/views/sidebar/DomainVerificationsSidebar.vue"),
        },
        meta: { auth: AuthorizationObjectType.TechnicalConfiguration },
      },

      {
        path: "files/:id?",
        name: ViewName.Files,
        component: () => import("@/views/TickWorkspaceFiles.vue"),
        meta: { auth: AuthorizationObjectType.Workspace },
      },
      {
        path: "context-blocks/:id?",
        name: ViewName.MetaDataComponents,
        // component: () => import("@/views/TickMetaDataComponents.vue"),
        components: {
          default: () => import("@/views/TickMetaDataComponents.vue"),
          sidebar: () => import("@/components/molecules/metadatacomponent/MetaDataComponentEditorSidebar.vue"),
        },
        meta: { auth: AuthorizationObjectType.TechnicalConfiguration },
      },
      {
        path: "sla/:id?",
        name: ViewName.SlaDefinitions,
        component: () => import("@/views/TickSlaDefinitions.vue"),
        meta: { auth: AuthorizationObjectType.TechnicalConfiguration },
      },
    ],
  },

  //TENANT
  {
    path: "/:workspaceName/tenant",
    name: ViewName.Tenant,
    component: () => import("@/views/TickTenantSettingsBase.vue"),
    children: [
      {
        path: "subscription",
        name: ViewName.Subscription,
        component: () => import("@/views/TickTenantSubscription.vue"),
      },
      {
        path: "partnership",
        name: ViewName.Partnership,
        component: () => import("@/views/TickTenantPartnership.vue"),
      },
      {
        path: "partnership/dashboard/:id?",
        name: ViewName.PartnerDashboard,
        component: () => import("@/views/TickTenantPartnerDashboard.vue"),
      },

      {
        path: "subscription/current/usage",
        name: ViewName.CurrentPeriodUsage,
        component: () =>
          import("@/views/TickCurrentSubscriptionPeriodUsage.vue"),
      },
      {
        path: "subscription/billing/:id?",
        name: ViewName.TickBilling,
        component: () => import("@/views/TickBilling.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes as RouteRecordRaw[], //as RouteRecordRaw[] needed because of TS error
});

router.beforeEach(function (to, from, next) {

  if (to.params && to.params.id) {
    debugCustom(`[Router:${to?.name?.toString()}] Navigate to: ${to?.name?.toString()} => ${to.params.id
      }`,
      logColors.fg.white,
      logColors.bg.magenta
    );
  } else {
    debugCustom(
      `[Router:${to.name?.toString()}] Navigate to: ${to.name?.toString()}`,
      logColors.fg.white,
      logColors.bg.blue
    );
  }
  const subdomain = getTenantUrlNameFromHostname(window.location.hostname);
  if (!subdomain || subdomain == "app") {
    // if already on no tenant page => continue
    if (!to.meta.disableTenantCheck) {
      next({ name: ViewName.NoTenant });
      return;
    }
  }

  const appStore = useAppStore();

  // check authorization level
  const requiredAuthorizationType = (to.meta.auth != null && to.meta.auth != undefined) ? to.meta.auth as AuthorizationObjectType : null;
  if (!tryView(requiredAuthorizationType)) {
    return;
  }

  // check is logged in
  const requiresAuth = typeof to.meta.requiresAuth === "boolean" ? to.meta.requiresAuth : true;

  if (requiresAuth && !appStore.authenticated) {
    debugCustom(`[Router:Authorization] Login required => navigate to login`, logColors.fg.white, logColors.bg.red);

    const requestPath = window.location.pathname;
    next({ name: ViewName.Login, query: { from: requestPath } });
    //next({ name: "Login" });
    return;
  }

  addRoutingEventTrack((to.name as string), (to.params as TickRouteParams).id)
  useUserStore().activateWorkspace((to.params.workspaceName as string) || "");

  next();

});

function allowView(auth: AuthorizationObjectType | null): boolean {
  if (!auth) {
    return true;
  }
  return useUserStore().allowedView(auth, null);
}
function tryView(auth: AuthorizationObjectType | null): boolean {
  if (!allowView(auth)) {
    notifyError(translate(LanguagePath.App_Route_NotAllowed_Title), translate(LanguagePath.App_Route_NotAllowed_Message))
    return false;
  } else {
    return true;
  }
}

export function RouterToLogs() {
  if (!tryView(AuthorizationObjectType.Workspace)) { return; }


  debugAction(`[Router:Logs] navigate to workspace logs`);
  router.push({ name: ViewName.WorkspaceLogs });

}
export function RouterToTicket(id?: string | null) {
  if (!tryView(AuthorizationObjectType.Ticket)) { return; }

  if (id) {
    debugAction(`[Router:Ticket] navigate to ticket ${id}`);
    router.push({ name: ViewName.Tickets, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
  } else {
    debugAction(`[Router:Ticket] navigate to tickets`);
    router.push({ name: ViewName.Tickets });
  }
}

export function RouterToUser(id: string) {
  if (!tryView(AuthorizationObjectType.Workspace)) { return; }

  debugAction(`[Router:User] navigate to ${id}`);
  router.push({ name: ViewName.Users, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
}
export function RouterToCannedResponse(id?: string) {
  if (!tryView(AuthorizationObjectType.Ticket)) { return; }
  if (id) {
    debugAction(`[Router:Canned Responses] navigate to ${id}`);
    router.push({ name: ViewName.CannedResponses, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
  } else {
    debugAction(`[Router:Canned Responses] navigate`);
    router.push({ name: ViewName.CannedResponses, params: { workspaceName: useUserStore().activeWorkspace?.urlName } });
  }
}

export function RouterToKnowledgeBase(id: string) {
  debugAction(`[Router:Knowledgebase] navigate to ${id}`);
  router.push({ name: ViewName.KnowledgeBases, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
}
export function RouterToKnowledgeBaseArticle(id: string) {
  debugAction(`[Router:Knowledgebase Article] navigate to ${id}`);
  router.push({ name: ViewName.KnowledgeBaseArticle, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
}

export function RouterToMetadataComponent(id: string) {
  debugAction(`[Router:MetadataComponent] navigate to ${id}`);
  router.push({ name: ViewName.MetaDataComponents, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
}
export function RouterToTaskDefinition(id: string) {
  debugAction(`[Router:TaskDefinition] navigate to ${id}`);
  router.push({ name: ViewName.TaskDefinitions, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
}
export function RouterToTaskInstance(id: string) {
  debugAction(`[Router:TaskInstance] navigate to ${id}`);
  router.push({ name: ViewName.Tasks, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
}
export function RouterToSlaDefinition(id: string) {
  debugAction(`[Router:SlaDefinition] navigate to ${id}`);
  router.push({ name: ViewName.SlaDefinitions, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
}

export function RouterToWorkspaceFile(id: string) {
  debugAction(`[Router:WorkspaceFile] navigate to ${id}`);
  router.push({ name: ViewName.Files, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
}

export function RouterToRegisterTenant() {
  debugAction(`[Router:register] navigate to register`);
  router.push({ name: ViewName.Register });
}
export function RouterToSubscription() {
  debugAction(`[Router:subscription] navigate to subscription`);
  router.push({ name: ViewName.Subscription });
}

export function RouterToLogin(reason?: LoginReason) {
  debugAction(`[Router:Login] navigate to login`);
  if (reason) {
    router.push({ name: ViewName.Login, params: { reason: reason } });
  } else {
    router.push({ name: ViewName.Login });
  }
}

export function RouterToLogout() {
  debugAction(`[Router:Logout] navigate to logout`);
  router.push({ name: ViewName.Logout });
}

export function RouterToHome() {
  debugAction(`[Router:Home] navigate to Home`);
  router.push({ name: ViewName.Home, params: { workspaceName: useUserStore().activeWorkspace?.urlName } });
}

export function RouterToView(view: ViewName, id: string) {
  debugAction(`[Router] navigate to ${id}`);
  router.push({ name: view, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
}

export function RouterToItem(type: CollectionObjectTypeEnum, id: string, versionId?: string, instanceId?: string) {
  switch (type) {
    case CollectionObjectTypeEnum.Flow:
      router.push({ name: ViewName.Flows, params: { id: id, versionId: versionId, instanceId: instanceId, workspaceName: useUserStore().activeWorkspace?.urlName } });
      break;
    case CollectionObjectTypeEnum.DataAdapter:
      router.push({ name: ViewName.DataAdapters, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
      break;
    case CollectionObjectTypeEnum.MetaDataComponent:
      router.push({ name: ViewName.MetaDataComponents, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
      break;
    case CollectionObjectTypeEnum.File:
      router.push({ name: ViewName.Files, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
      break;
    case CollectionObjectTypeEnum.Task:
      router.push({ name: ViewName.TaskDefinitions, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
      break;
    case CollectionObjectTypeEnum.KnowledgeBase:
      router.push({ name: ViewName.KnowledgeBases, params: { id: id, workspaceName: useUserStore().activeWorkspace?.urlName } });
      break;
    default:
      console.warn(`Routing to type ${type} not yet implemented`);
      break;
  }
}

export default router;
