import { translate } from "@/plugins/translatePlugin";
import { ViewName } from "@/router";
import { searchAll } from "@/services/searchService";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { AuthorizationObjectType, LanguagePath, SearchResponse, SearchResultTypeEnum, SubscriptionCostItemType } from "@/TickApi";

export interface OmniSearchResult {
  localItems: SearchResponse;
  serverItems: SearchResponse;
}

export interface LocalSearchResultItem {
  icon?: string;
  text: string;
  items: LocalSearchResultItemListItem[];
}

export interface LocalSearchResultItemListItem {
  text: string;
  description: string;
  icon?: string;
  to: ViewName;
  id: string;
  // versionId?:string;
}

function allowed(permission: AuthorizationObjectType, costItem: SubscriptionCostItemType) {
  return useUserStore().allowedView(permission, costItem);
}


function searchLocalData(searchQuery: string): SearchResponse {
  searchQuery = searchQuery.toLowerCase();
  const response: SearchResponse = {
    items: [],
    resultsCount: 0,
  }
  let results: LocalSearchResultItemListItem[] = [];

  if (allowed(AuthorizationObjectType.Workspace, SubscriptionCostItemType.User)) {
    const userResults: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.users.filter(p => p.name.toLowerCase().includes(searchQuery) || p.handle.toLowerCase().includes(searchQuery)).map((item) => ({
      text: item.name,
      id: item.id,
      to: ViewName.Users,
      icon: "users",
      description: translate(LanguagePath.User),
    }))
    results = results.concat(userResults);

  }

  if (allowed(AuthorizationObjectType.Workspace, SubscriptionCostItemType.Teams)) {
    const teamResults: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.teams.filter(p => p.name.toLowerCase().includes(searchQuery) || p.handle.toLowerCase().includes(searchQuery)).map((item) => ({
      text: item.name,
      id: item.id,
      to: ViewName.Teams,
      icon: "team",
      description: translate(LanguagePath.Team),

    }))
    results = results.concat(teamResults);
  }

  if (allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.DataAdapter)) {
    const adapterDefinitionsResults: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.adapterDefinitions.filter(p => p.name.toLowerCase().includes(searchQuery)).map((item) => ({
      text: item.name,
      id: item.id,
      to: ViewName.DataAdapters,
      icon: "adapter",
      description: translate(LanguagePath.DataAdapter),
    }))
    results = results.concat(adapterDefinitionsResults);
  }

  if (allowed(AuthorizationObjectType.Ticket, null)) {
    const cannedResponseDefinitions: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.cannedResponseDefinitions.filter(p => p.name.toLowerCase().includes(searchQuery)).map((item) => ({
      text: item.name,
      id: item.id,
      to: ViewName.CannedResponses,
      icon: "message",
      description: translate(LanguagePath.CannedResponse),
    }))
    results = results.concat(cannedResponseDefinitions);
  }
  if (allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.Channel)) {
    const channelDefinitions: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.communicationChannels.filter(p => p.name.toLowerCase().includes(searchQuery)).map((item) => ({
      text: item.name,
      id: item.id,
      to: ViewName.Channels,
      icon: "channel",
      description: translate(LanguagePath.Channel),
    }))
    results = results.concat(channelDefinitions);
  }

  //if (this.devFeatureIsAllowed(DevelopmentFeature.Dashboards)) {
  const dashboardDefinitions: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.dashboardDefinitions.filter(p => p.name.toLowerCase().includes(searchQuery)).map((item) => ({
    text: item.name,
    id: item.id,
    to: ViewName.Dashboards,
    icon: "dashboard",
    description: translate(LanguagePath.Dashboard),
  }))
  results = results.concat(dashboardDefinitions);
  //}

  if (allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.ExecutionEnvironment)) {
    const executionEnvironmentsDefinitions: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.executionEnvironments.filter(p => p.name.toLowerCase().includes(searchQuery)).map((item) => ({
      text: item.name,
      id: item.id,
      to: ViewName.Environments,
      icon: "environment",
      description: translate(LanguagePath.ExecutionEnvironment),
    }))
    results = results.concat(executionEnvironmentsDefinitions);
  }
  if (allowed(AuthorizationObjectType.Workspace, null)) {
    const workspaceFiles: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.files.filter(p => p.name.toLowerCase().includes(searchQuery)).map((item) => ({
      text: item.name,
      id: item.id,
      to: ViewName.Files,
      icon: "file",
      description: translate(LanguagePath.File),
    }))
    results = results.concat(workspaceFiles);
  }


  if (allowed(AuthorizationObjectType.ProcessConfiguration, SubscriptionCostItemType.Knowledgebase)) {
    const knowledgeBases: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.knowledgeBases.filter(p => p.name.toLowerCase().includes(searchQuery)).map((item) => ({
      text: item.name,
      id: item.id,
      to: ViewName.KnowledgeBases,
      icon: "knowledgebase",
      description: translate(LanguagePath.KnowledgeBase),
    }))
    results = results.concat(knowledgeBases);
  }
  if (allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.Sla)) {
    const slaDefinitions: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.slaDefinitions.filter(p => p.name.toLowerCase().includes(searchQuery)).map((item) => ({
      text: item.name,
      id: item.id,
      to: ViewName.SlaDefinitions,
      icon: "sla",
      description: translate(LanguagePath.SLA),
    }))
    results = results.concat(slaDefinitions);
  }
  if (allowed(AuthorizationObjectType.ProcessConfiguration, SubscriptionCostItemType.TaskDefinition)) {
    const taskDefinitions: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.taskDefinitions.filter(p => p.name.toLowerCase().includes(searchQuery)).map((item) => ({
      text: item.name,
      id: item.id,
      to: ViewName.TaskDefinitions,
      icon: "task",
      description: translate(LanguagePath.TaskDefinition),
    }))
    results = results.concat(taskDefinitions);
  }


  // if (allowed(AuthorizationObjectType.ProcessConfiguration, SubscriptionCostItemType.Flow)) {
  //   let taskDefinitions: LocalSearchResultItemListItem[] = useUtilityDataStore().utilityData.flowDefinitions.filter(p => p.name.toLowerCase().includes(searchQuery)).map((item) => ({
  //     text: item.name,
  //     id: item.id,
  //     versionId: item.versionId, //TODO: No version IdPROBLEM HHERE
  //     to: ViewName.Flows,
  //     icon: "flow",
  //     description: translate(LanguagePath.Flow),
  //   }))
  //   results = results.concat(taskDefinitions);
  // }

  const localDataItem: LocalSearchResultItem = {
    text: "", //translate(LanguagePath.App_Search_FoundInWorkspace),
    items: results,
    icon: "search"
  };

  response.items.push({
    name: translate(LanguagePath.App_Search_LocalItems),
    dataJson: JSON.stringify(localDataItem),
    type: SearchResultTypeEnum.Custom,
  });
  response.resultsCount = results.length;

  return response;
}


export async function omniSearch(searchQuery: string): Promise<OmniSearchResult> {
  const workspaceId = useUserStore().activeWorkspaceId;

  const serverData = await searchAll(workspaceId, searchQuery)
  const localResponse = searchLocalData(searchQuery);

  const r: OmniSearchResult = {
    localItems: localResponse,
    serverItems: serverData,
  }
  return r

}