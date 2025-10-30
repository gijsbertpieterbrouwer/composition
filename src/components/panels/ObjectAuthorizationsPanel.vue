<template>
  <TickDialogPanel class="panel" @close="$emit('close')" :loading="loading">
    <template #title>{{ this.title }}</template>

    <div class="content">

      <table class="styledTable">
        <template v-for="(item, index) in this.authorizations" :key="item.id">
          <ObjectAuthorizationRuleEditor @remove="removeRule(this.authorizations[index])" class="auth" v-model="authorizations[index]" />
        </template>
      </table>

      <div class="buttons">
        <TickDropdown :allowAsSubDialog="true" :disabled="disableEditing" @select="addUserAuthorization" :options="nonMemberUserOptions" placeholder="Add" noresults="No users or teams to share with"
          :appearance="Appearance.secondary" :color="Color.contrast" />
        <TickButton class="save" :busy="busySaving" @click="saveAuthorizations" :appearance="Appearance.primary" :color="Color.primary">Ready</TickButton>
      </div>
    </div>
  </TickDialogPanel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { focus } from "@/directives";
import { AuthorizationObjectType, AuthorizationSubjectType, AuthorizationType, UserTypeEnum, WorkspaceAuthorization } from "@/TickApi";
import ObjectAuthorizationRuleEditor from "../molecules/authorizations/ObjectAuthorizationRuleEditor.vue";
import { getWorkspaceObjectAuthorizations, saveWorkspaceObjectAuthorizations } from "@/services/WorkspaceAuthorizationsService";
import TickDropdown, { DropdownOption } from "../atoms/TickDropdown.vue";
import generateId from "@/helpers/guid";
import useUserStore from "@/store/user";
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import useUtilityDataStore from "@/store/utilitydata";


@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickDialogPanel,
    ObjectAuthorizationRuleEditor,
    TickDropdown,
    TickButton
  },
})
export default class ObjectAuthorizationsPanel extends Vue {
  Size = Size;
  Appearance = Appearance;
  Color = Color;

  @Prop() private title!: string;
  @Prop() private objectId!: string;
  @Prop() private objectType!: AuthorizationObjectType;

  private authorizations: WorkspaceAuthorization[] = [];
  private loading = true;
  private busySaving = false;

  private get disableEditing() {
    return this.loading || this.busySaving;
  }

  mounted() {
    this.loading = true;
    getWorkspaceObjectAuthorizations(useUserStore().activeWorkspaceId, this.objectType, this.objectId).then((d) => {
      this.authorizations = d;
      this.loading = false;
    })
  }

  private close() {
    this.$emit("close");
  }

  private removeRule(auth: WorkspaceAuthorization) {
    this.authorizations = this.authorizations.filter(p => p.id != auth.id);
  }

  private saveAuthorizations() {
    if (this.busySaving || !this.authorizations?.length) { return; }
    this.busySaving = true;
    saveWorkspaceObjectAuthorizations(this.objectType, this.objectId, this.authorizations).then(() => {
      this.busySaving = false;
      this.close();
    });
  }


  private addUserAuthorization(userId: string, option: DropdownOption) {
    this.authorizations.push({
      id: generateId(),
      as: AuthorizationType.Viewer,
      objectId: this.objectId,
      objectType: this.objectType,
      creationDate: new Date(),
      workspaceId: useUserStore().activeWorkspaceId,
      subjectId: option.data.subjectId,
      subjectType: option.data.subjectType,
    });
  }


  private get allUsers() {
    return useUtilityDataStore().utilityData.users || [];
  }

  private get allTeams() {
    return useUtilityDataStore().utilityData.teams || [];
  }

  private get nonMemberUserOptions(): DropdownOption[] {
    const nonUserMembers = this.allUsers.filter(p => p.userType == UserTypeEnum.User && !this.authorizations?.some(a => a.subjectId == p.id));

    const userOptions: DropdownOption[] = nonUserMembers.map((p) => ({
      id: p.id,
      text: p.name,
      data: {
        subjectId: p.id,
        subjectType: AuthorizationSubjectType.User,
      }
    }));

    const nonTeamMembers = this.allTeams.filter(p => !this.authorizations?.some(a => a.subjectId == p.id));

    const teamOptions: DropdownOption[] = nonTeamMembers.map((p) => ({
      id: p.id,
      text: p.name,
      data: {
        subjectId: p.id,
        subjectType: AuthorizationSubjectType.Team,
      }
    }));

    const combined = userOptions.concat(teamOptions);


    return combined;
  }





}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 700px;
  padding: 10px;
  display: grid;
  gap: 10px;

  .auth {

    width: 100%;
  }


  .buttons {
    border-top: solid 1px var(--c-base-200);
    margin-top: 15px;
    padding-top: 20px;

    .save {
      float: right;
    }
  }


}
</style>
