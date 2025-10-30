import { maxDetailsListItems, patchMetaDataList, patchMetaDataListSummary } from "@/helpers/arrayHelper";
import { requestUserPasswordReset } from "@/services/AuthenticationService";
import {
  addCannedResponseDefinition,
  deleteCannedResponseDefinition,
  getAllCannedResponseDefinitionSummaries,
  getCannedResponseDefinition,
  updateCannedResponseDefinition,
} from "@/services/CannedResponsesService";
import {
  addEnvironment,
  deleteEnvironment,
  getEnvironmentDetails,
  getEnvironments,
  setEnvironmentAsCreator,
  setEnvironmentAsProduction,
  updateEnvironment,
} from "@/services/ExecutionEnvironmentService";
import { addEmptyKnowledgeBase, addEmptyKnowledgeBaseArticle, deleteKnowledgeBase, deleteKnowledgeBaseArticle, getAllKnowledgeBaseSummaries, getKnowledgeBase, getKnowledgeBaseArticle, getKnowledgeBaseArticles, updateKnowledgeBase, updateKnowledgeBaseArticle } from "@/services/KnowledgeBaseService";
import { addLabel, getLabels, updateLabels } from "@/services/LabelsService";
import {
  addMetaDataComponent,
  deleteMetaDataComponent,
  getMetaDataComponentDetails,
  updateMetaDataComponent,
} from "@/services/MetaDataComponentsService";
import {
  addSlaDefinition,
  deleteSlaDefinition,
  getSlaDefinitionDetails,
  getSlaDefinitions,
  updateSlaDefinition,
} from "@/services/SlaService";
import {
  addTaskDefinition,
  deleteTaskDefinition,
  getTaskDefinition,
  updateTaskDefinition,
} from "@/services/TasksService";
import {
  addTeam,
  addUser,
  deleteTeam,
  deleteUser,
  getTeamDetails,
  getTeams,
  getUserDetails,
  getUsers,
  updateTeam,
  updateUser,
  updateUserAdmin,
} from "@/services/TeamsService";
import { getWorkspaceAuthorizations, updateWorkspaceAuthorizations } from "@/services/WorkspaceAuthorizationsService";
import {
  AdapterComponentPresentationTypeEnum,
  AddExecutionEnvironmentRequest,
  AddKnowledgeBaseArticleRequest,
  AddKnowledgeBaseRequest,
  AddLabelRequest,
  AddSlaDefinitionRequest,
  AddTeamRequest,
  AddUserRequest,
  ColorsEnum,
  ComponentDataSourceTypeEnum,
  IntegrationType,
  MetaDataComponentUpdate,
  MetaDataItem,
  ObjectRemovalProgress,
  RemovalStatus,
  TeamSummary,
  TickCannedResponseDefinition,
  TickCannedResponseSummary,
  TickCommunicatorCategoryDefinition,
  TickCommunicatorCategoryDefinitionSummary,
  TickComponentPresentationTypeEnum,
  TickDatabagItemDefinition,
  TickExecutionEnvironment,
  TickExecutionEnvironmentSummary,
  TickKnowledgeBase,
  TickKnowledgeBaseArticle,
  TickKnowledgeBaseArticleSummary,
  TickKnowledgeBaseSummary,
  TickLabelDefinition,
  TickManagerTeamData,
  TickManagerUserData,
  TickMetaDataComponent,
  TickSlaDefinitionData,
  TickSlaDefinitionSummary,
  TickTaskDefinition,
  TickWorkspaceIntegration,
  TickWorkspaceIntegrationProgress,
  UpdateLabelsRequest,
  UserSummary,
  WorkspaceAuthorization,
} from "@/TickApi";
import { _ActionsTree, _GettersTree, defineStore } from "pinia";
import useCollectionsStore from "./collections";
import useUserStore from "./user";

import { stringIsNullOrEmpty } from "@/helpers/stringHelper";
import { createCommunicatorCategory, deleteCommunicatorCategoryDefinition, getCommunicatorCategories, getCommunicatorCategoryDefinition, saveCommunicatorCategoryDefinition } from "@/services/CommunicatorsService";
import { addNewDatabagItemDefinition, getDatabagItemDefinitions, updateDatabagItemDefinitions } from "@/services/DatabagsService";
import { addWorkspaceIntegration, deleteWorkspaceIntegration, getWorkspaceIntegrations } from "@/services/WorkspaceIntegrationsService";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";


interface State {
  labels: TickLabelDefinition[];

  userSummaries: UserSummary[];
  users: TickManagerUserData[];

  teamSummaries: TeamSummary[];
  teams: TickManagerTeamData[];
  teamsLoaded: boolean;

  environmentSummaries: TickExecutionEnvironmentSummary[];
  environments: TickExecutionEnvironment[];

  metaDataComponents: TickMetaDataComponent[];
  metaDataComponentEditorSampleData: MetaDataComponentUpdate | null;

  slaDefinitionSummaries: TickSlaDefinitionSummary[];
  slaDefinitions: TickSlaDefinitionData[];

  taskDefinitions: TickTaskDefinition[];

  cannedResponseSummaries: TickCannedResponseSummary[];
  cannedResponses: TickCannedResponseDefinition[];

  knowledgebaseSummaries: TickKnowledgeBaseSummary[];
  knowledgebases: TickKnowledgeBase[];

  knowledgebaseArticles: TickKnowledgeBaseArticle[];

  workspaceAuthorizations: WorkspaceAuthorization[];

  databagItemDefinitions: TickDatabagItemDefinition[];

  workspaceIntegrations: TickWorkspaceIntegration[];

  communicatorCategoryDefinitionSummaries: TickCommunicatorCategoryDefinitionSummary[];
  communicatorCategoryDefinitions: TickCommunicatorCategoryDefinition[];
}

interface Getters extends _GettersTree<State> {
  allLabels(state: State): TickLabelDefinition[];
}

interface Actions extends _ActionsTree {
  useLabels(): void;
  saveLabels(): Promise<unknown>;
  addLabel(name: string, color: ColorsEnum): Promise<TickLabelDefinition>;
  patchLabel(serverData: TickLabelDefinition): void;

  resetUserPassword(username: string): Promise<unknown>;
  useUsers(): void;
  getUser(id: string): Promise<TickManagerUserData | null>;
  saveUser(id: string): Promise<TickManagerUserData>;
  addUser(user: AddUserRequest): Promise<MetaDataItem>;
  deleteUser(id: string): Promise<unknown>;
  updateUserAdmin(id: string, setAdmin: boolean): Promise<TickManagerUserData>;
  patchUser(serverData: TickManagerUserData): void;

  useTeams(forceRefresh?: boolean): void;
  getTeam(id: string): Promise<TickManagerTeamData | null>;
  saveTeam(id: string): Promise<TickManagerTeamData>;
  addTeam(team: AddTeamRequest): Promise<MetaDataItem>;
  deleteTeam(id: string): Promise<unknown>;
  patchTeam(serverData: TickManagerTeamData): void;

  useEnvironments(): void;
  getEnvironment(id: string): Promise<TickExecutionEnvironment | null>;
  saveEnvironment(id: string): Promise<TickExecutionEnvironment>;
  addEnvironment(env: AddExecutionEnvironmentRequest): Promise<MetaDataItem>;
  deleteEnvironment(id: string): Promise<unknown>;
  setEnvironmentAsProduction(id: string): Promise<unknown>;
  setEnvironmentAsCreator(id: string): Promise<unknown>;
  patchEnvironment(serverData: TickExecutionEnvironment): void;

  addMetadataComponent(
    type: ComponentDataSourceTypeEnum,
    subType:
      | AdapterComponentPresentationTypeEnum
      | TickComponentPresentationTypeEnum
  ): Promise<MetaDataItem>;
  getMetaDataComponent(id: string): Promise<TickMetaDataComponent | null>;
  saveMetaDataComponent(id: string): Promise<TickMetaDataComponent>;
  deleteMetaDataComponent(id: string): Promise<unknown>;
  patchMetaDataComponent(serverData: TickMetaDataComponent): void;

  useSlaDefinitions(): void;
  addSlaDefinition(
    req: AddSlaDefinitionRequest
  ): Promise<TickSlaDefinitionSummary>;
  getSlaDefinition(id: string): Promise<TickSlaDefinitionData | null>;
  saveSlaDefinition(id: string): Promise<TickSlaDefinitionData>;
  deleteSlaDefinition(id: string): Promise<unknown>;
  patchSla(serverData: TickSlaDefinitionData): void;
  patchSlaSummary(serverData: TickSlaDefinitionSummary): void;

  addTaskDefinition(): Promise<TickTaskDefinition>;
  getTaskDefinition(id: string): Promise<TickTaskDefinition | null>;
  saveTaskDefinition(id: string): Promise<TickTaskDefinition>;
  patchTask(serverData: TickTaskDefinition): void;
  deleteTaskDefinition(id: string): Promise<unknown>;

  useCannedResponses(): void;
  addCannedResponse(): Promise<TickCannedResponseDefinition>;
  getCannedResponse(id: string): Promise<TickCannedResponseDefinition | null>;
  saveCannedResponse(id: string): Promise<TickCannedResponseDefinition>;
  deleteCannedResponse(id: string): Promise<unknown>;
  patchCannedResponse(serverData: TickCannedResponseDefinition): void;

  useKnowledgeBases(): void;
  addKnowledgeBase(): Promise<TickKnowledgeBaseSummary>;
  getKnowledgeBase(id: string): Promise<TickKnowledgeBase | null>;
  saveKnowledgeBase(id: string): Promise<TickKnowledgeBase>;
  deleteKnowledgeBase(id: string): Promise<ObjectRemovalProgress>;
  patchKnowledgeBaseSummary(serverData: TickKnowledgeBaseSummary): void;
  patchKnowledgeBase(serverData: TickKnowledgeBase): void;

  getKnowledgeBaseArticles(knowledgeBaseId: string): Promise<TickKnowledgeBaseArticleSummary[]>;
  addKnowledgeBaseArticle(knowledgeBaseId: string): Promise<TickKnowledgeBaseArticleSummary>;
  getKnowledgeBaseArticle(id: string): Promise<TickKnowledgeBaseArticle | null>;
  saveKnowledgeBaseArticle(id: string): Promise<TickKnowledgeBaseArticle>;
  deleteKnowledgeBaseArticle(id: string): Promise<unknown>;
  patchKnowledgeBaseArticle(serverData: TickKnowledgeBaseArticle): void;

  useAuthorizations(): Promise<unknown>;
  saveAuthorizations(): Promise<unknown>;

  useDatabagItemDefinitions(): Promise<unknown>;
  saveDatabagItemDefinitions(): Promise<unknown>;
  addDatabagItemDefinition(def: TickDatabagItemDefinition): Promise<TickDatabagItemDefinition>;

  useWorkspaceIntegrations(): Promise<unknown>;
  addWorkspaceIntegration(type: IntegrationType, integrationData: object): Promise<TickWorkspaceIntegrationProgress>;
  deleteWorkspaceIntegration(id: string): Promise<unknown>;

  useCommunicatorCategoryDefinitions(): void;
  getCommunicatorCategoryDefinition(id: string): Promise<TickCommunicatorCategoryDefinition | null>;
  deleteCommunicatorCategoryDefinition(id: string): Promise<unknown>;
  saveCommunicatorCategoryDefinition(id: string): Promise<TickCommunicatorCategoryDefinition>;
  createCommunicatorCategory(name: string): Promise<TickCommunicatorCategoryDefinitionSummary>;
  patchCommunicatorCategoryDefinition(serverData: TickCommunicatorCategoryDefinition): void;
  patchCommunicatorCategoryDefinitionSummary(serverData: TickCommunicatorCategoryDefinitionSummary): void;
}

const useManagingStore = defineStore<"managingStore", State, Getters, Actions>(
  "managingStore",
  {
    state: () => ({
      labels: [],
      userSummaries: [],
      users: [],
      teamSummaries: [],
      teams: [],
      teamsLoaded: false,
      environmentSummaries: [],
      environments: [],
      metaDataComponents: [],
      metaDataComponentEditorSampleData: null,
      slaDefinitionSummaries: [],
      slaDefinitions: [],
      taskDefinitions: [],
      cannedResponseSummaries: [],
      cannedResponses: [],
      knowledgebaseSummaries: [],
      knowledgebases: [],
      knowledgebaseArticles: [],

      workspaceAuthorizations: [],
      databagItemDefinitions: [],
      workspaceIntegrations: [],
      communicatorCategoryDefinitionSummaries: [],
      communicatorCategoryDefinitions: [],
    }),
    getters: {
      allLabels: (state) => state.labels,
    },
    actions: {
      async useLabels() {
        const labels = await getLabels(useUserStore().activeWorkspaceId ?? "");
        this.labels = labels;
      },
      async saveLabels() {

        for (let index = 0; index < this.labels.length; index++) {
          const l = this.labels[index] as TickLabelDefinition;
          if (l.color == null) { l.color = ColorsEnum.Grey; }
          if (l.name == null) { l.name = "" }
        }


        const req: UpdateLabelsRequest = {
          labels: this.labels,
          workspaceId: useUserStore().activeWorkspaceId ?? "",
        };

        await updateLabels(req);
      },
      async addLabel(name: string, color: ColorsEnum): Promise<TickLabelDefinition> {
        const req: AddLabelRequest = {
          name: name,
          color: color,
          workspaceId: useUserStore().activeWorkspaceId ?? "",
        };

        const newLabel = await addLabel(req);
        this.patchLabel(newLabel);

        return newLabel;
      },
      patchLabel(serverData: TickLabelDefinition) {
        this.labels = patchMetaDataList(serverData, this.labels, maxDetailsListItems);
      },

      //USERS
      async useUsers() {
        const summaries = await getUsers(useUserStore().activeWorkspaceId ?? "");
        this.userSummaries = summaries;
      },
      async getUser(id: string): Promise<TickManagerUserData | null> {
        if (!id) {
          return null;
        }

        const serverData = await getUserDetails(
          useUserStore().activeWorkspaceId ?? "",
          id
        );
        this.patchUser(serverData);
        return serverData;
      },
      async resetUserPassword(username: string): Promise<unknown> {
        const serverData = await requestUserPasswordReset({
          tenantId: useUserStore().tenantId,
          userName: username,
        });

        return serverData;
      },

      patchUser(serverData: TickManagerUserData) {

        this.users = patchMetaDataList(serverData, this.users, maxDetailsListItems);
      },

      async saveUser(id: string): Promise<TickManagerUserData> {
        const user = (this.users as TickManagerUserData[]).find(
          (p) => p.id == id
        );
        if (user == null) {
          throw new Error(`User with id ${id} not found`);
        }
        const serverUser = await updateUser(user);
        this.patchUser(serverUser);
        return serverUser;
      },
      async updateUserAdmin(id: string, setAdmin: boolean): Promise<TickManagerUserData> {
        const user = (this.users as TickManagerUserData[]).find(
          (p) => p.id == id
        );
        if (user == null) {
          throw new Error(`User with id ${id} not found`);
        }

        await updateUserAdmin({
          admin: setAdmin,
          userId: user.id,
        });
        const newUserData = await this.getUser(id);
        if (newUserData == null) {
          throw new Error(`User with id ${id} not found after update`);
        }
        return newUserData;
      },
      async addUser(user: AddUserRequest): Promise<MetaDataItem> {
        const result = await addUser(user);
        this.useUsers();
        return result;
      },
      async deleteUser(userId: string): Promise<unknown> {
        const result = await deleteUser(userId);

        this.useUsers();

        return result;
      },

      //TEAMS
      async useTeams(forceRefresh = false) {
        if (this.teamsLoaded && !forceRefresh) {
          return;
        }
        const summaries = await getTeams(useUserStore().activeWorkspaceId ?? "");
        this.teamSummaries = summaries;
        this.teamsLoaded = true;
      },
      async getTeam(id: string): Promise<TickManagerTeamData | null> {
        if (!id) {
          return null;
        }

        const serverData = await getTeamDetails(id);
        this.patchTeam(serverData);
        return serverData;
      },
      async saveTeam(id: string): Promise<TickManagerTeamData> {

        const team = (this.teams as TickManagerTeamData[]).find(
          (p) => p.id == id
        );
        if (team == null) {
          throw new Error(`Team with id ${id} not found`);
        }
        if (team.color == null) {
          team.color = ColorsEnum.Grey;
        }

        this.patchTeam(team);

        const updated = await updateTeam(team);
        this.useTeams(true);
        return updated;
      },
      async addTeam(team: AddTeamRequest): Promise<MetaDataItem> {
        const result = await addTeam(team);

        this.useTeams(true);
        return result;
      },
      async deleteTeam(id: string): Promise<unknown> {
        const result = await deleteTeam(id);

        const index = (this.teams as TickManagerTeamData[]).findIndex(
          (s) => s.id === id
        );
        if (index > -1) {
          this.teams.splice(index, 1);
        }
        const indexSummary = (this.teamSummaries as TeamSummary[]).findIndex(
          (s) => s.id === id
        );
        if (indexSummary > -1) {
          this.teamSummaries.splice(indexSummary, 1);
        }

        return result;
      },
      patchTeam(serverData: TickManagerTeamData) {
        this.teams = patchMetaDataList(serverData, this.teams, maxDetailsListItems);
      },

      //Environments
      async useEnvironments() {
        const summaries = await getEnvironments(
          useUserStore().activeWorkspaceId ?? ""
        );
        this.environmentSummaries = summaries;
      },
      async getEnvironment(id: string): Promise<TickExecutionEnvironment | null> {
        if (!id) {
          return null;
        }

        const serverData = await getEnvironmentDetails(id);

        this.patchEnvironment(serverData);

        return serverData;
      },
      async saveEnvironment(id: string): Promise<TickExecutionEnvironment> {
        const env = (this.environments as TickExecutionEnvironment[]).find(
          (p) => p.id == id
        );
        if (env == null) {
          throw new Error(`Environment with id ${id} not found`);
        }
        this.patchEnvironment(env);

        const updated = await updateEnvironment(env);
        this.useEnvironments();
        return updated;
      },
      async addEnvironment(
        env: AddExecutionEnvironmentRequest
      ): Promise<MetaDataItem> {
        const result = await addEnvironment(env);

        this.useEnvironments();
        return result;
      },
      async deleteEnvironment(id: string): Promise<unknown> {
        const result = await deleteEnvironment(id);

        const index = (
          this.environments as TickExecutionEnvironment[]
        ).findIndex((s) => s.id === id);
        if (index > -1) {
          this.environments.splice(index, 1);
        }
        const indexSummary = (
          this.environmentSummaries as TickExecutionEnvironmentSummary[]
        ).findIndex((s) => s.id === id);
        if (indexSummary > -1) {
          this.environmentSummaries.splice(indexSummary, 1);
        }

        return result;
      },
      async setEnvironmentAsProduction(id: string): Promise<unknown> {
        const result = await setEnvironmentAsProduction(id);

        return result;
      },
      async setEnvironmentAsCreator(id: string): Promise<unknown> {
        const result = await setEnvironmentAsCreator(id);

        return result;
      },
      patchEnvironment(serverData: TickExecutionEnvironment) {
        this.environments = patchMetaDataList(serverData, this.environments, maxDetailsListItems);
      },

      //META data components
      async addMetadataComponent(
        type: ComponentDataSourceTypeEnum,
        subType:
          | AdapterComponentPresentationTypeEnum
          | TickComponentPresentationTypeEnum
      ): Promise<MetaDataItem> {
        const result = await addMetaDataComponent(
          useUserStore().activeWorkspaceId ?? "",
          type,
          subType
        );

        return result;
      },
      async getMetaDataComponent(id: string): Promise<TickMetaDataComponent | null> {
        if (!id) {
          return null;
        }

        const serverData = await getMetaDataComponentDetails(id);

        this.patchMetaDataComponent(serverData);

        return serverData;
      },
      patchMetaDataComponent(serverData: TickMetaDataComponent) {
        this.metaDataComponents = patchMetaDataList(serverData, this.metaDataComponents, maxDetailsListItems);
      },
      async saveMetaDataComponent(id: string): Promise<TickMetaDataComponent> {
        const item = (this.metaDataComponents as TickMetaDataComponent[]).find(
          (p) => p.id == id
        );
        if (item == null) {
          throw new Error(`MetaDataComponent with id ${id} not found`);
        }
        this.patchMetaDataComponent(item);

        const updated = await updateMetaDataComponent(item);
        return updated;
      },
      async deleteMetaDataComponent(id: string): Promise<unknown> {
        const result = await deleteMetaDataComponent(id);

        const index = (
          this.metaDataComponents as TickMetaDataComponent[]
        ).findIndex((s) => s.id === id);
        if (index > -1) {
          this.metaDataComponents.splice(index, 1);
        }

        return result;
      },

      //SLA
      async useSlaDefinitions() {
        const summaries = await getSlaDefinitions(
          useUserStore().activeWorkspaceId ?? ""
        );
        this.slaDefinitionSummaries = summaries;
      },

      async addSlaDefinition(
        req: AddSlaDefinitionRequest
      ): Promise<TickSlaDefinitionSummary> {
        const result = await addSlaDefinition(req);
        this.patchSlaSummary(result);
        return result;
      },
      async getSlaDefinition(id: string): Promise<TickSlaDefinitionData | null> {
        if (!id) {
          return null;
        }

        const serverData = await getSlaDefinitionDetails(id);
        this.patchSla(serverData);
        return serverData;
      },
      patchSla(serverData: TickSlaDefinitionData) {
        this.slaDefinitions = patchMetaDataList(serverData, this.slaDefinitions, maxDetailsListItems);
      },
      patchSlaSummary(serverData: TickSlaDefinitionSummary) {
        this.slaDefinitionSummaries = patchMetaDataList(serverData, this.slaDefinitionSummaries, maxDetailsListItems);
      },
      async saveSlaDefinition(id: string): Promise<TickSlaDefinitionData> {
        const item = (this.slaDefinitions as TickSlaDefinitionData[]).find(
          (p) => p.id == id
        );
        if (item == null) {
          throw new Error(`SlaDefinition with id ${id} not found`);
        }

        const updated = await updateSlaDefinition(item);
        this.patchSla(updated);
        return updated;
      },
      async deleteSlaDefinition(id: string): Promise<unknown> {
        const result = await deleteSlaDefinition(id);

        const index = (
          this.slaDefinitions as TickSlaDefinitionData[]
        ).findIndex((s) => s.id === id);
        if (index > -1) {
          this.slaDefinitions.splice(index, 1);
        }

        const indexS = (
          this.slaDefinitionSummaries as TickSlaDefinitionSummary[]
        ).findIndex((s) => s.id === id);
        if (indexS > -1) {
          this.slaDefinitionSummaries.splice(indexS, 1);
        }

        return result;
      },

      //TASKS
      async getTaskDefinition(id: string): Promise<TickTaskDefinition | null> {
        if (!id) {
          return null;
        }

        const serverData = await getTaskDefinition(id);
        this.patchTask(serverData);

        return serverData;
      },
      async addTaskDefinition(): Promise<TickTaskDefinition> {
        const serverData = await addTaskDefinition({
          workspaceId: useUserStore().activeWorkspaceId ?? "",
        });

        this.patchTask(serverData);

        return serverData;
      },

      async saveTaskDefinition(id: string): Promise<TickTaskDefinition> {
        const item = (this.taskDefinitions as TickTaskDefinition[]).find(
          (p) => p.id == id
        );
        if (item == null) {
          throw new Error(`TaskDefinition with id ${id} not found`);
        }
        const updated = await updateTaskDefinition(item);
        this.patchTask(updated);

        useCollectionsStore().use();

        return updated;
      },
      async deleteTaskDefinition(id: string): Promise<unknown> {
        const def = (this.taskDefinitions as TickTaskDefinition[]).find((s) => s.id === id);
        if (def == null) {
          throw new Error(`TaskDefinition with id ${id} not found`);
        }

        await deleteTaskDefinition(def.id);

        //remove
        const index = (this.taskDefinitions as TickTaskDefinition[]).findIndex((s) => s.id === id);
        this.taskDefinitions.splice(index, 1);

        return null;
      },
      patchTask(serverData: TickTaskDefinition) {
        this.taskDefinitions = patchMetaDataList(serverData, this.taskDefinitions, maxDetailsListItems);
      },

      // Canned responses
      async useCannedResponses() {
        const summaries = await getAllCannedResponseDefinitionSummaries(
          useUserStore().activeWorkspaceId ?? ""
        );
        this.cannedResponseSummaries = summaries;
      },
      async addCannedResponse() {
        const def = await addCannedResponseDefinition(
          useUserStore().activeWorkspaceId ?? ""
        );
        this.patchCannedResponse(def);
        return def;
      },
      async getCannedResponse(id: string) {
        if (!id) {
          return null;
        }
        const def = await getCannedResponseDefinition(id);
        this.patchCannedResponse(def);
        return def;
      },
      async saveCannedResponse(id: string) {
        const def = (this.cannedResponses as TickCannedResponseDefinition[]).find((s) => s.id === id);
        if (def == null) {
          throw new Error(`CannedResponse with id ${id} not found`);
        }

        patchMetaDataListSummary(def, this.cannedResponseSummaries);

        const serverDef = await updateCannedResponseDefinition(def);
        this.patchCannedResponse(serverDef);
        return serverDef;
      },
      async deleteCannedResponse(id: string) {
        const def = (
          this.cannedResponses as TickCannedResponseDefinition[]
        ).find((s) => s.id === id);

        if (def == null) {
          throw new Error(`CannedResponse with id ${id} not found`);
        }

        //remove
        const index = (this.cannedResponses as TickCannedResponseDefinition[]).findIndex((s) => s.id === id);
        this.cannedResponses.splice(index, 1);

        const summaryIndex = (this.cannedResponseSummaries as TickCannedResponseSummary[]).findIndex((s) => s.id === id);
        if (summaryIndex > -1) {
          this.cannedResponseSummaries.splice(summaryIndex, 1);
        }

        await deleteCannedResponseDefinition(id);



        return null;
      },
      patchCannedResponse(serverData: TickCannedResponseDefinition) {
        this.cannedResponses = patchMetaDataList(serverData, this.cannedResponses, maxDetailsListItems);

      },


      // Knowledge bases
      async useKnowledgeBases() {
        const summaries = await getAllKnowledgeBaseSummaries(
          useUserStore().activeWorkspaceId ?? ""
        );
        this.knowledgebaseSummaries = summaries;
      },
      async addKnowledgeBase(): Promise<TickKnowledgeBaseSummary> {
        const newReq: AddKnowledgeBaseRequest = {
          workspaceId: useUserStore().activeWorkspaceId ?? ""
        }

        const def = await addEmptyKnowledgeBase(newReq);
        this.patchKnowledgeBaseSummary(def);
        return def;
      },
      async getKnowledgeBase(id: string): Promise<TickKnowledgeBase | null> {
        if (!id) {
          return null;
        }
        const def = await getKnowledgeBase(id);
        this.patchKnowledgeBase(def);
        return def;
      },
      async saveKnowledgeBase(id: string) {
        const def = (this.knowledgebases as TickKnowledgeBase[]).find((s) => s.id === id);
        if (def == null) {
          throw new Error(`Knowledge base with id ${id} not found`);
        }
        const serverDef = await updateKnowledgeBase(def);
        this.patchKnowledgeBase(serverDef);
        return serverDef;
      },
      async deleteKnowledgeBase(id: string) {

        const def = (this.knowledgebases as TickKnowledgeBase[]).find((s) => s.id === id);
        if (def == null) {
          throw new Error(`Knowledge base with id ${id} not found`);
        }

        const progress = await deleteKnowledgeBase(def.id);

        if (progress.removalStatus != RemovalStatus.Failed) {
          const index = (this.knowledgebases as TickKnowledgeBase[]).findIndex((s) => s.id === id);
          this.knowledgebases.splice(index, 1);

          const indexS = (this.knowledgebaseSummaries as TickKnowledgeBaseSummary[]).findIndex((s) => s.id === id);
          if (indexS > -1) {
            this.knowledgebaseSummaries.splice(indexS, 1);
          }
        }

        return progress;

      },

      patchKnowledgeBaseSummary(serverData: TickKnowledgeBaseSummary) {
        this.knowledgebaseSummaries = patchMetaDataList(serverData, this.knowledgebaseSummaries, maxDetailsListItems);
      },
      patchKnowledgeBase(serverData: TickKnowledgeBase) {
        this.knowledgebases = patchMetaDataList(serverData, this.knowledgebases, maxDetailsListItems);
      },


      async getKnowledgeBaseArticles(knowledgeBaseId: string): Promise<TickKnowledgeBaseArticleSummary[]> {
        const summaries = await getKnowledgeBaseArticles(knowledgeBaseId);
        return summaries;
      },
      async addKnowledgeBaseArticle(knowledgeBaseId: string): Promise<TickKnowledgeBaseArticleSummary> {
        const newReq: AddKnowledgeBaseArticleRequest = {
          knowledgeBaseId: knowledgeBaseId
        }
        const def = await addEmptyKnowledgeBaseArticle(newReq);

        return def;
      },
      async getKnowledgeBaseArticle(id: string): Promise<TickKnowledgeBaseArticle | null> {
        if (!id) {
          return null;
        }
        const def = await getKnowledgeBaseArticle(id);
        this.patchKnowledgeBaseArticle(def);
        return def;
      },
      async saveKnowledgeBaseArticle(id: string) {

        const def = (
          this.knowledgebaseArticles as TickKnowledgeBaseArticle[]
        ).find((s) => s.id === id);
        if (def == null) {
          throw new Error(`Knowledge base article with id ${id} not found`);
        }



        if (stringIsNullOrEmpty(def.articleMarkdown)) {
          def.articleMarkdown = def.articleSummaryMarkDown;
        }

        const serverDef = await updateKnowledgeBaseArticle(def);

        this.patchKnowledgeBaseArticle(serverDef);
        return serverDef;
      },
      async deleteKnowledgeBaseArticle(id: string) {

        const def = (this.knowledgebaseArticles as TickKnowledgeBaseArticle[]).find((s) => s.id === id);
        if (def == null) {
          throw new Error(`Knowledge base article with id ${id} not found`);
        }

        await deleteKnowledgeBaseArticle(def.id);

        const index = (this.knowledgebaseArticles as TickKnowledgeBaseArticle[]).findIndex((s) => s.id === id);
        if (index > -1) {
          this.knowledgebaseArticles.splice(index, 1);
        }

        return;

      },



      patchKnowledgeBaseArticle(serverData: TickKnowledgeBaseArticle) {
        this.knowledgebaseArticles = patchMetaDataList(serverData, this.knowledgebaseArticles, maxDetailsListItems);
      },


      // Canned responses
      async useAuthorizations() {
        const auths = await getWorkspaceAuthorizations(useUserStore().activeWorkspaceId ?? "");
        this.workspaceAuthorizations = auths;

        return true;
      },

      async saveAuthorizations() {
        const auths = await updateWorkspaceAuthorizations(useUserStore().activeWorkspaceId ?? "", this.workspaceAuthorizations);
        this.workspaceAuthorizations = auths;

        return true;
      },



      // Databag Item Definitions 
      async useDatabagItemDefinitions() {
        const items = await getDatabagItemDefinitions(useUserStore().activeWorkspaceId ?? "");
        this.databagItemDefinitions = items;

        return true;
      },

      async saveDatabagItemDefinitions() {
        await updateDatabagItemDefinitions(useUserStore().activeWorkspaceId ?? "", this.databagItemDefinitions);
        return true;
      },

      async addDatabagItemDefinition(def: TickDatabagItemDefinition): Promise<TickDatabagItemDefinition> {
        const newItem = await addNewDatabagItemDefinition(useUserStore().activeWorkspaceId ?? "", def);
        this.databagItemDefinitions = patchMetaDataList(newItem, this.databagItemDefinitions, maxDetailsListItems);

        return newItem;
      },


      // TickWorkspaceIntegration 
      async useWorkspaceIntegrations() {
        const items = await getWorkspaceIntegrations(useUserStore().activeWorkspaceId ?? "");
        this.workspaceIntegrations = items;
        return true;
      },
      async addWorkspaceIntegration(type: IntegrationType, integrationData: object) {
        const progress = await addWorkspaceIntegration(useUserStore().activeWorkspaceId ?? "", type, integrationData || {});
        return progress;
      },
      async deleteWorkspaceIntegration(id: string) {
        const progress = await deleteWorkspaceIntegration(id);
        this.useWorkspaceIntegrations();

        return progress;
      },


      // Communicator Categories 
      async useCommunicatorCategoryDefinitions() {
        const items = await getCommunicatorCategories(useUserStore().activeWorkspaceId ?? "");
        this.communicatorCategoryDefinitionSummaries = items;
        return true;
      },


      async getCommunicatorCategoryDefinition(id: string): Promise<TickCommunicatorCategoryDefinition | null> {
        if (!id) {
          return null;
        }
        const def = await getCommunicatorCategoryDefinition(useUserStore().activeWorkspaceId ?? "", id);
        this.patchCommunicatorCategoryDefinition(def);
        return def;
      },
      patchCommunicatorCategoryDefinition(serverData: TickCommunicatorCategoryDefinition) {
        this.communicatorCategoryDefinitions = patchMetaDataList(serverData, this.communicatorCategoryDefinitions, maxDetailsListItems);
      },
      patchCommunicatorCategoryDefinitionSummary(serverData: TickCommunicatorCategoryDefinitionSummary) {
        this.communicatorCategoryDefinitionSummaries = patchMetaDataList(serverData, this.communicatorCategoryDefinitionSummaries, maxDetailsListItems);
      },
      async deleteCommunicatorCategoryDefinition(id: string) {
        const def = (this.communicatorCategoryDefinitions as TickCommunicatorCategoryDefinition[]).find((s) => s.id === id);
        if (def == null) {
          throw new Error(`CommunicatorCategoryDefinition with id ${id} not found`);
        }

        const progress = await deleteCommunicatorCategoryDefinition(def);
        this.useCommunicatorCategoryDefinitions();

        return progress;
      },

      async saveCommunicatorCategoryDefinition(id: string) {
        const def = (this.communicatorCategoryDefinitions as TickCommunicatorCategoryDefinition[]).find((s) => s.id === id);
        if (def == null) {
          throw new Error(`CommunicatorCategoryDefinition with id ${id} not found`);
        }
        const serverDef = await saveCommunicatorCategoryDefinition(def);
        this.patchCommunicatorCategoryDefinition(serverDef);
        return serverDef;
      },
      async createCommunicatorCategory(name: string) {

        const serverDef = await createCommunicatorCategory({
          name: name,
          workspaceId: useUserStore().activeWorkspaceId ?? "",
        });
        this.patchCommunicatorCategoryDefinitionSummary(serverDef);
        return serverDef;
      },


    },
    persist: [
      {
        pick: undefined,
        key: PiniaStoragePath.managing,// "tick-managing",
        storage: getTickStorage(PiniaStorageType.Session),
      },
    ],
  }
);

export default useManagingStore;