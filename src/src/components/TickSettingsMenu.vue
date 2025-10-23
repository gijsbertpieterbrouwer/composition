<template>
  <div class="holder">

    <TickHeading class="menu-group-title" :size="Size.small" v-if="allowed(AuthorizationObjectType.Workspace, null)">{{ $translate(LanguagePath.App_WorkspaceMenu_Group_Members) }}
    </TickHeading>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.Workspace, SubscriptionCostItemType.User)" :to="ViewName.Users" icon="users">{{ $translate(LanguagePath.Users) }}</TickMenuItem>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.Workspace, SubscriptionCostItemType.Teams)" :to="ViewName.Teams" icon="team">{{ $translate(LanguagePath.Teams) }}</TickMenuItem>
    <TickMenuItem v-if="allowedEdit(AuthorizationObjectType.Workspace)" :to="ViewName.Authorizations" icon="secure">{{ $translate(LanguagePath.Authorizations) }}</TickMenuItem>

    <TickHeading class="menu-group-title" :size="Size.small" v-if="allowed(AuthorizationObjectType.Ticket, null) || this.allowed(AuthorizationObjectType.Workspace, null)">{{
      $translate(LanguagePath.App_WorkspaceMenu_Group_Tickets) }}</TickHeading>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.Ticket, null)" :to="ViewName.CannedResponses" icon="message">{{ $translate(LanguagePath.CannedResponses) }}</TickMenuItem>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.Workspace, SubscriptionCostItemType.Labels)" :to="ViewName.Labels" icon="label">{{ $translate(LanguagePath.Labels) }}</TickMenuItem>

    <TickMenuItem v-if="allowed(AuthorizationObjectType.Workspace, null)" :to="ViewName.CommunicatorCategories" icon="contacts">{{
      $translate(LanguagePath.CommunicatorCategories) }}
    </TickMenuItem>

    <TickMenuItem v-if="allowed(AuthorizationObjectType.Workspace, null)" :to="ViewName.Files" icon="file">{{ $translate(LanguagePath.Files) }} </TickMenuItem>

    <TickHeading v-if="allowed(AuthorizationObjectType.ProcessConfiguration, [SubscriptionCostItemType.Flow, SubscriptionCostItemType.TaskDefinition, SubscriptionCostItemType.Knowledgebase])"
      class="menu-group-title" :size="Size.small">{{ $translate(LanguagePath.App_WorkspaceMenu_Group_Processes) }}</TickHeading>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.ProcessConfiguration, SubscriptionCostItemType.Flow)" :to="ViewName.Flows" icon="flow">{{ $translate(LanguagePath.Flows) }}</TickMenuItem>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.ProcessConfiguration, SubscriptionCostItemType.TaskDefinition)" :to="ViewName.TaskDefinitions" icon="task">{{
      $translate(LanguagePath.TaskDefinitions) }}</TickMenuItem>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.ProcessConfiguration, SubscriptionCostItemType.Knowledgebase)" :to="ViewName.KnowledgeBases" icon="knowledgebase">{{
      $translate(LanguagePath.KnowledgeBases) }}</TickMenuItem>


    <TickHeading class="menu-group-title" :size="Size.small"
      v-if="allowed(AuthorizationObjectType.TechnicalConfiguration, [SubscriptionCostItemType.Channel, SubscriptionCostItemType.Sla, SubscriptionCostItemType.ExecutionEnvironment])">{{
        $translate(LanguagePath.App_WorkspaceMenu_Group_TechnicalConfiguration) }}
    </TickHeading>

    <TickMenuItem v-if="allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.Channel)" :to="ViewName.Channels" icon="channel">{{ $translate(LanguagePath.Channels) }}
    </TickMenuItem>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.Sla)" :to="ViewName.SlaDefinitions" icon="sla">{{ $translate(LanguagePath.SLAs) }}
    </TickMenuItem>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.ExecutionEnvironment)" :to="ViewName.Environments" icon="environment">{{
      $translate(LanguagePath.ExecutionEnvironments) }}
    </TickMenuItem>

    <TickMenuItem v-if="allowedEdit(AuthorizationObjectType.TechnicalConfiguration) && this.allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.InternetDomain)"
      :to="ViewName.DomainVerifications" icon="domainverification">{{ $translate(LanguagePath.DomainVerifications) }}</TickMenuItem>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.DataAdapter)" :to="ViewName.DataAdapters" icon="adapter">{{
      $translate(LanguagePath.DataAdapters) }}</TickMenuItem>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.EventSubscription)" :to="ViewName.EventSubscriptions" icon="adapter">{{
      $translate(LanguagePath.EventSubscriptions) }}
    </TickMenuItem>
    <TickMenuItem v-if="allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.MetaDataComponent)" :to="ViewName.MetaDataComponents" icon="metadata-component">{{
      $translate(LanguagePath.MetadataComponents) }}
    </TickMenuItem>
    <TickMenuItem
      v-if="allowed(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.DatabagItem) || this.allowed(AuthorizationObjectType.ConfigurationSecrets, SubscriptionCostItemType.DatabagItem)"
      :to="ViewName.Databags" icon="databagitem">{{ $translate(LanguagePath.States_Variables) }}
    </TickMenuItem>

    <template v-if="showTickSection">
      <TickHeading class="menu-group-title" :size="Size.small">{{ $translate(LanguagePath.App_WorkspaceMenu_Group_TickSupport) }}</TickHeading>
      <TickMenuItem icon="navigate" to="https://www.tick.cloud/en/pages/docs.html">{{ $translate(LanguagePath.App_WorkspaceMenu_Docs) }} </TickMenuItem>
      <TickMenuItem icon="comment" :to="communityUrl" v-if="communityUrl">{{ $translate(LanguagePath.App_WorkspaceMenu_Community) }}</TickMenuItem>
    </template>



    <div class="spacer" />
    <TickMenuItem v-if="allowed(AuthorizationObjectType.Workspace, null)" :to="ViewName.WorkspaceSettings" icon="settings">{{ $translate(LanguagePath.Workspace) }}</TickMenuItem>
    <TickMenuItem v-if="isGlobalAdmin" :to="ViewName.Subscription" icon="subscription">{{ $translate(LanguagePath.Subscription) }}</TickMenuItem>
    <TickMenuItem v-if="isGlobalAdmin" :to="ViewName.Partnership" icon="partner">{{ $translate(LanguagePath.Partner_Program) }}</TickMenuItem>
    <div class="spacer last" />
  </div>
</template>

<script lang="ts">
import useUserStore from '@/store/user';

import { ViewName } from '@/router';
import { CommunityURL } from '@/services/urls';
import { AuthorizationObjectType, DevelopmentFeature, LanguagePath, SubscriptionCostItemType } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';
import TickHeading, { Size } from './atoms/TickHeading.vue';
import TickMenuItem from './atoms/TickMenuItem.vue';

@Component({ components: { TickMenuItem, TickHeading } })
export default class TickSettingsMenu extends Vue {
  AuthorizationObjectType = AuthorizationObjectType;
  SubscriptionCostItemType = SubscriptionCostItemType;
  DevelopmentFeature = DevelopmentFeature;
  Size = Size;
  LanguagePath = LanguagePath
  ViewName = ViewName
  private communityUrl = CommunityURL();

  private allowed(permission: AuthorizationObjectType, costItem?: SubscriptionCostItemType | SubscriptionCostItemType[]) {
    return useUserStore().allowedView(permission, costItem);
  }

  private allowedEdit(permission: AuthorizationObjectType) {
    return useUserStore().allowedEdit(permission);
  }
  private devFeatureIsAllowed(feature: DevelopmentFeature) {
    return useUserStore().developmentFeatureIsAllowed(feature);
  }
  private get isGlobalAdmin() {
    return useUserStore().isGlobalAdmin == true;
  }

  private get showTickSection(): boolean {
    return this.allowed(AuthorizationObjectType.TechnicalConfiguration) || this.allowed(AuthorizationObjectType.ProcessConfiguration) || this.isGlobalAdmin;
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.menu-group-title {
  padding: 24px 0 4px 8px;

  @include font-outfit;
  font-size: $text-size-regular;
  font-weight: 700;
  line-height: 20px;
  text-transform: uppercase;

  color: c("secondary");

}

.holder {
  height: 100%;
  padding-top: 58px;
  padding-bottom: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.spacer {
  flex-grow: 1;
  min-height: 5vh;
}

.last {
  flex-grow: 0;
  height: 22px;
  min-height: 22px;
}
</style>
