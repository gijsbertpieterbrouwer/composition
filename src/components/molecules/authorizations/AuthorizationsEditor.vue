<template>
  <TickScreen :title="$translate(LanguagePath.Authorizations)" :loading="!loaded">


    <template v-slot:actions>
      <TickButton v-if="allowEdit" @click="save" :disabled="!allowEdit">{{ $translate(LanguagePath.App_Save) }}</TickButton>
    </template>

    <template v-slot:default>

      <template v-if="allowTeams">
        <TickHeading>{{ $translate(LanguagePath.Teams) }}</TickHeading><br />
        <div class="info">{{ $translate(LanguagePath.Authorizations_Team_Explanation) }}</div>
        <table class="styledTable">
          <thead>
            <tr>
              <th class="owner"></th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Workspace) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Process_configuration) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_TechnicalConfiguration) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Tickets) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Tasks) }}</th>
            </tr>
          </thead>
          <tbody>
            <AuthorizationRowEditor :isGlobalAdmin="false" :subjectType="AuthorizationSubjectType.Team" :subjectId="team.id" v-for="team in this.allTeams" :key="team.id">
              <TeamIcon :teamId="team.id" />
            </AuthorizationRowEditor>
          </tbody>
        </table>
      </template>

      <template v-if="allowUsers">
        <TickHeading>{{ $translate(LanguagePath.Users) }}</TickHeading>
        <table class="styledTable">
          <thead>
            <tr>
              <th class="owner"></th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Workspace) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Process_configuration) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_TechnicalConfiguration) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Tickets) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Tasks) }}</th>
            </tr>
          </thead>
          <tbody>
            <AuthorizationRowEditor :isGlobalAdmin="user.isAdmin" :subjectType="AuthorizationSubjectType.User" :subjectId="user.id" v-for="user in this.allUsers" :key="user.id">
              <UserIcon :userId="user.id" />
            </AuthorizationRowEditor>
          </tbody>
        </table>
      </template>
    </template>
  </TickScreen>
</template>

<script lang="ts">

import TeamIcon from '@/components/atoms/TeamIcon.vue';
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickHeading from '@/components/atoms/TickHeading.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import UserIcon from '@/components/atoms/UserIcon.vue';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import { AuthorizationObjectType, AuthorizationSubjectType, LanguagePath, SubscriptionCostItemType, TeamSummary, UserSummary, UserTypeEnum } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import AuthorizationRowEditor from './AuthorizationRowEditor.vue';


@Component({
  emits: ["saved"],
  components: {
    TickInput, TickButton, TickCheckbox, ThenHr, TickScreen, TickEditorPanel, TickDropdown, TickSelector, TickSwitch, AuthorizationRowEditor, UserIcon, TeamIcon, TickHeading
  },
})
export default class AuthorizationsEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  AuthorizationSubjectType = AuthorizationSubjectType;

  private loaded = false;

  mounted() {
    useUtilityDataStore().use(useUserStore().activeWorkspaceId);

    useManagingStore().useAuthorizations().then(() => {
      this.loaded = true;
    });
  }

  private get allowEdit() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace);
  }

  private availableInPlan(costItem?: SubscriptionCostItemType) {
    return useUserStore().allowedView(null, costItem);
  }


  private get allowTeams(): boolean {
    return this.availableInPlan(SubscriptionCostItemType.Teams);
  }

  private get allowUsers(): boolean {
    return this.availableInPlan(SubscriptionCostItemType.User);
  }

  private get allUsers() {
    const users = useUtilityDataStore().utilityData?.users as UserSummary[] || [];
    const fUsers = users.filter(p => p.userType == UserTypeEnum.User && !p.deleted);

    return fUsers.sort((a, b) => a.name.localeCompare(b.name));
  }
  private get allTeams() {
    const teams = useUtilityDataStore().utilityData?.teams as TeamSummary[] || [];
    return teams.sort((a, b) => a.name.localeCompare(b.name));
  }

  private save() {
    useManagingStore().saveAuthorizations().then(() => {
      this.$emit("saved");
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.info {
  font-size: 0.7em;
  opacity: 0.7;
  padding-bottom: 5px;
}

.styledTable {
  margin-bottom: 40px;


  .owner {
    width: 80px;
  }

  tbody {
    tr:not(:first-child) {
      border-top: solid 1px var(--c-base-200);
    }

    tr:hover {
      background-color: var(--c-base-100);
    }
  }

}
</style>
