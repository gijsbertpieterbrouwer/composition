export function AppVersion() {
  return process.env.VUE_APP_VERSION || "000";
}
export function AppStorageKeyPrefix() {
  return process.env.VUE_APP_StorageKeyPrefix || "Tick";
}
export function AppBaseUrl() {
  return process.env.VUE_APP_URL || "tick.cloud";
}

export function ApiBaseUrl() {
  return process.env.VUE_APP_API_URL || "tick.cloud";
}

export function FilesBaseUrl() {
  return process.env.VUE_APP_FILES_URL || "tick.cloud/files";
}

export function RtcBaseUrl() {
  return process.env.VUE_APP_API_RTC_URL || "tick.cloud";
}
export function ChatWidgetURL() {
  return process.env.VUE_APP_ChatWidget_URL || "http://chatwidget.tick.cloud/";
}
export function CommunityURL() {
  return process.env.VUE_APP_Community_URL || "";
}
export function ChatWidgetJs_URL() {
  return process.env.VUE_APP_ChatWidgetJs_URL || "";
}

export function openUrl(url: string) {
  if (!url) { return; }
  if (!url.startsWith("http")) {
    url = `${document.location.protocol}//${url}`
  }
  window.open(url, "new");
}

export function popupCenter(url: string, title: string, w: number, h: number) {
  const left = window.screenLeft + window.innerWidth / 2 - w / 2;
  const top = window.screenTop + window.innerHeight / 2 - h / 2;
  window.open(
    url, title, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
    w + ", height=" + h +
    ", top=" + top +
    ", left=" + left
  );
}

enum URL {
  //SUBSCRIPTION
  getLanguageItems = "language/all",


  login = "authorization/login",
  logout = "authorization/logout",
  requestUserPasswordReset = "authorization/user/RequestResetUserPassword",
  resetUserPassword = "authorization/user/resetpassword",

  getByUrlName = "tenant/getByUrlName",
  preregister = "tenant/preregister",
  register = "tenant/register",
  getRegisterProgress = "tenant/getRegisterProgress",

  //SUBSCRIPTION
  getActiveSubscription = "subscription/get/active",
  subscribe = "subscription/subscribe",
  currentPeriodUsage = "subscription/get/usage/currentPeriod",
  availablePlans = "subscription/plans",
  removeTenant = "subscription/tenant/remove",

  //PARTNERSHIP
  getActivePartnership = "partner/get",
  startAffiliatePartnership = "partner/affiliate/start",
  endPartnership = "partner/end",
  endTenantViaPartnership = "partner/tenant/end",
  getPartnershipSubTenant = "partner/tenant/get",
  resetPartnershipSubTenantUserPassword = "partner/tenant/user/resetpassword", //[HttpPost("tenant/user/resetpassword/{workspaceId}/{tenantId}/{id}")]

  //Billing
  getBillingInfo = "billing/get/info",
  getInvoicesLast12months = "billing/get/last12months",
  startManualInvoicePayment = "billing/invoice/pay",
  getInvoicePdf = "billing/invoice/download",
  revokeMandate = "billing/mandate/revoke",
  createMandate = "billing/mandate/create",

  //Search
  omniSearch = "search/all",

  //Knowledge bases
  getKnowledgebases = "knowledgebase/all",
  getKnowledgebase = "knowledgebase/get",
  getKnowledgebaseArticles = "knowledgebase/get",
  addKnowledgebase = "knowledgebase/create",
  updateKnowledgebase = "knowledgebase/update",
  deleteKnowledgeBase = "knowledgebase/delete",

  addKnowledgebaseArticle = "knowledgebase/article/create",
  getKnowledgebaseArticle = "knowledgebase/article/get",
  updateKnowledgebaseArticle = "knowledgebase/article/update",
  deleteKnowledgeBaseArticle = "knowledgebase/article/delete",

  //TICKETS
  getTickets = "tickets/all",
  getTicket = "tickets/get",
  sendTicketMessage = "tickets/message/add",
  sendExternalTicketMessage = "tickets/externalMessage/add",
  sendTicketNote = "tickets/note/add",
  refreshTicketMetadatacomponent = "tickets/metadatacomponent/refresh", //metadatacomponent/refresh/{questMetadataComponentId}
  finishTicket = "tickets/finish",
  startFlowForTicket = "tickets/flow/start",
  finishFlowsForTicket = "tickets/flows/finish",
  editTicket = "tickets/edit",
  editTicketLabels = "tickets/labels",
  editTicketAssignments = "tickets/assignments",
  setTicketIsTyping = "tickets/setIsTyping",
  addTicket = "tickets/add",


  //Canned responses
  getAllCannedResponseDefinitionSummaries = "cannedResponses/definition/all",
  getCannedResponseDefinition = "cannedResponses/definition/get",
  addCannedResponseDefinition = "cannedResponses/definition/add",
  updateCannedResponseDefinition = "cannedResponses/definition/update",
  deleteCannedResponseDefinition = "cannedResponses/definition/delete",
  getParsedCannedResponse = "cannedResponses/parse",

  //TASK
  addTask = "tasks/instance/add",
  getTasks = "tasks/instance/get/all",
  getTask = "tasks/instance/get",
  updateTask = "tasks/instance/update",
  updateTaskAssignments = "tasks/instance/assignments/update",

  getTaskDefinition = "tasks/definition/get",
  addTaskDefinition = "tasks/definition/add",
  updateTaskDefinition = "tasks/definition/update",
  deleteTaskDefinition = "tasks/definition/delete",

  //FLOW
  getFlow = "flow/get",
  createFlow = "flow/create",
  copyFlowToEnvironment = "flow/copyToEnvironment",
  setFlowActive = "flow/setFlowActive",
  getFlowInstanceLogs = "flow/Logs/GetRecent",
  getFlowInstanceLogDetails = "flow/Logs/Details/Get",
  getFlowInstanceLogsByQuery = "flow/Logs/Search",
  //SLA
  getSlas = "sla/all",
  getSla = "sla/get",
  createSla = "sla/create",
  updateSla = "sla/update",
  deleteSla = "sla/delete",
  getSlaStats = "sla/statistics",

  //Statistics
  getDashboardData = "statistics/dashboard/data",
  getDashboards = "statistics/dashboard/all",
  createDashboard = "statistics/dashboard/create",
  updateDashboard = "statistics/dashboard/update",
  deleteDashboard = "statistics/dashboard/delete",
  getDashboardStatisticDefinitions = "statistics/dashboard/statisticDefinitions/all",
  createDashboardTileByTemplate = "statistics/dashboard/tile/templates/get",
  setDashboardAsWorkspaceDefault = "statistics/dashboard/default/workspace",

  //FILES
  getFile = "files/get",
  createFile = "files/create",
  updateFile = "files/update",
  deleteFile = "files/delete",
  uploadFileData = "files/file/upload",

  //COLLECTIONS
  getCollections = "collections/get",
  moveCollectionObject = "collections/moveObject",
  updateCollection = "collections/update",
  moveCollection = "collections/move",
  createCollection = "collections/create",
  deleteCollection = "collections/delete",

  //InternetDomains
  getInternetDomains = "InternetDomains/all",
  createInternetDomain = "InternetDomains/create",
  deleteInternetDomain = "InternetDomains/delete",
  validateInternetDomainValidationKey = "InternetDomains/Validate",

  //ADAPTER
  getDataAdapter = "adapters/get",
  createDataAdapter = "adapters/create",
  updateDataAdapter = "adapters/update",
  tryDataAdapter = "adapters/try",
  deleteAdapter = "adapters/delete",
  getDataAdapterLogs = "adapters/Logs/GetRecent",
  getDataAdapterLogDetails = "adapters/Logs/Details/Get",
  getDataAdapterLogStatistics = "adapters/Statistics",

  // Workspace Integrations
  getWorkspaceIntegrations = "WorkspaceIntegrations/all",
  createWorkspaceIntegration = "WorkspaceIntegrations/create",
  activateSlackWorkspaceIntegration = "WorkspaceIntegrations/activate/slack",
  activateShopifyWorkspaceIntegration = "WorkspaceIntegrations/activate/shopify",
  deleteWorkspaceIntegration = "WorkspaceIntegrations/delete",
  testWorkspaceIntegration = "WorkspaceIntegrations/test",

  //Event subscriptions
  getEventSubscriptions = "eventSubscriptions/all",
  getEventSubscription = "eventSubscriptions/get",
  createEventSubscription = "eventSubscriptions/create",
  updateEventSubscription = "eventSubscriptions/update",
  deleteEventSubscription = "eventSubscriptions/delete",


  //Channels
  getChannels = "channels/all",
  getChannel = "channels/get",
  updateChannel = "channels/update",
  deleteChannel = "channels/delete",
  getUnsavedChannel = "channels/GetUnsavedChannel",
  createChannel = "channels/create",
  validateTelegramToken = "channels/validate/telegram",
  validatePhoneToken = "channels/validate/Phone/Tenant",
  getAvailablePhoneNumbers = "channels/phone/availablePhonenumbers",
  validateEmailSettings = "channels/validate/email",

  //Databags
  getDataBags = "databags/all",
  getDataBag = "databags/get",
  updateDataBag = "databags/update",


  updateDataBagItemDefinitions = "databags/definitions/all/Update",
  getDataBagItemDefinitions = "databags/definitions/all",
  addDataBagItemDefinition = "databags/definitions/add",

  //Labels
  getLabels = "labels/all",
  updateLabels = "labels/updateAll",
  addLabel = "labels/add",

  //WORKSPACE (managing)
  setupWorkspace = "workspace/setup",
  getUtilityData = "workspace/utilitydata",
  createWorkspace = "workspace/create",
  updateWorkspace = "workspace/update",
  getWorkspaceAuthorizations = "WorkspaceAuthorizations/all",
  updateWorkspaceAuthorizations = "WorkspaceAuthorizations/all",
  getWorkspaceObjectAuthorizations = "WorkspaceAuthorizations/object/all",
  updateWorkspaceObjectAuthorizations = "WorkspaceAuthorizations/object/update",
  workspaceLogs = "workspace/logs",

  //Users (managing)
  getUsers = "users/all",
  getUser = "users/get",
  updateUser = "users/update",
  updateMyUser = "users/me/update",
  updateUserAdmin = "users/admin/update",
  createUser = "users/create",
  deleteUser = "users/delete",
  adminLogoutUser = "users/logout",

  //UTILITY
  validatePhoneNumber = "utility/validate/phoneNumber",

  getAvatarStyles = "users/get/styleOptions",
  getUserDashboardSmall = "users/get/dashboard/small",

  //Teams (managing)
  getTeams = "teams/all",
  getTeam = "teams/get",
  updateTeam = "teams/update",
  createTeam = "teams/create",
  deleteTeam = "teams/delete",

  //Environments (managing)
  getEnvironments = "ExecutionEnvironments/all",
  getEnvironment = "ExecutionEnvironments/get",
  updateEnvironment = "ExecutionEnvironments/update",
  createEnvironment = "ExecutionEnvironments/create",
  deleteEnvironment = "ExecutionEnvironments/delete",
  setEnvironmentAsProduction = "ExecutionEnvironments/setAsProduction",
  setEnvironmentAsCreator = "ExecutionEnvironments/setAsCreator",


  //META data components 
  createMetaDataComponent = "MetadataComponents/create",
  getMetaDataComponent = "MetadataComponents/get",
  updateMetaDataComponent = "MetadataComponents/update",
  deleteMetaDataComponent = "MetadataComponents/delete",

  //Notifications 
  getNotifications = "notifications/get/unread",
  resolveNotifications = "notifications/resolve",

  mergeCommunicators = "communicators/merge",
  markCommunicatorAsSpammer = "communicators/markSpammer",
  updateCommunicator = "communicators/update",
  searchCommunicatorAddress = "communicators/search/address",
  getCommunicators = "communicators/get/all",
  getCommunicator = "communicators/details/get",
  updateCommunicatorDetails = "communicators/details/update",

  getCommunicatorCategories = "communicators/categories/all",
  getCommunicatorCategory = "communicators/categories/get",
  updateCommunicatorCategory = "communicators/categories/update",
  deleteCommunicatorCategory = "communicators/categories/delete",
  createCommunicatorCategory = "communicators/categories/create",
  updateCommunicatorFromMetaDataComponent = "communicators/metadatacomponent/info/update",

  getVoiceConnectionToken = "voice/user/token/get",
  startVoiceConnection = "voice/user/connect",
  endVoiceConnection = "voice/user/disconnect",
  getVoiceCallInfo = "voice/call/info",
  holdVoiceCall = "voice/call/hold",
  transferVoiceCall = "voice/call/transfer",
  createVoiceCall = "voice/call/create",
  declineVoiceCall = "voice/call/decline",
  linkVoiceCallToTicket = "voice/call/ticket/link",



  //Exchange
  createUnsavedManifest = "exchange/manifest/create",
  createManifest = "exchange/manifest/add",
}

export default URL;
