<template>
  <div class="action">
    <SidebarPanel id="assign-reset" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Assignments_Title)">
      <template #subheader>{{ $translate(LanguagePath.App_FlowEditor_SideBar_Assignments_Explanation) }}</template>
      <TickSwitch v-model="resetActive" :disabled="disabled"> {{ $translate(LanguagePath.App_FlowEditor_SideBar_Assignments_ResetButton_Title) }}</TickSwitch>
    </SidebarPanel>

    <SidebarPanel id="assign-unassign" v-if="!resetActive" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Assignments_UnAssign_Title)">
      <UsersAndTeamsSelector :title="$translate(LanguagePath.App_FlowEditor_SideBar_Assignments_UnAssign_selector_Placeholder)" v-model="removerAssignments" :typeFilters="assignmentFilters"
        :overlapAfter="5" />
    </SidebarPanel>

    <SidebarPanel id="assign-specific=assign" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Assignments_Random_Title)">
      <template #header>
        <TickSwitch v-model="assignRandomUser" :disabled="disabled" />
      </template>
      <template #subheader>{{ $translate(LanguagePath.App_FlowEditor_SideBar_Assignments_Random_Explanation) }}</template>

      <TickSwitch v-model="assignRandomUserPreferOnline" :disabled="disabled">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Assignments_Random_PreferOnline) }}</TickSwitch>
      {{ $translate(LanguagePath.App_FlowEditor_SideBar_Assignments_Random_FromTeam_Title) }}
      <UsersAndTeamsSelector v-if="assignRandomUser" :title="$translate(LanguagePath.App_FlowEditor_SideBar_Assignments_Random_FromTeam_Selector_Title)" v-model="assignRandomUserTeamId"
        :typeFilters="[AssigneeTypeEnum.Team]" :emptyLabel="$translate(LanguagePath.App_FlowEditor_SideBar_Assignments_Random_FromTeam_Selector_Empty_Title)" />
    </SidebarPanel>

    <SidebarPanel id="assign-assign" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Assignments_Assign_Title)">
      <UsersAndTeamsSelector title="Assign to ticket" v-model="adderAssignments" :typeFilters="assignmentFilters" :overlapAfter="5" />
    </SidebarPanel>
  </div>
</template>

<script lang="ts">
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "@/components/molecules/Selectors/UsersAndTeamsSelector.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import { AssigneeTypeEnum, FlowDefinitionAction, LanguagePath, TicketAssignmentActionData, } from "@/TickApi";
import { TicketAssignmentsLogicActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue, } from "vue-facing-decorator";

@Component({
  emits: ["remove", "update"],
  components: {
    SidebarPanel,
    TickSwitch,
    UsersAndTeamsSelector
  },
})
export default class TicketAssignmentsAction extends Vue {
  AssigneeTypeEnum = AssigneeTypeEnum;
  LanguagePath = LanguagePath;

  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: TicketAssignmentsLogicActionSettings;
  @Prop() private disabled!: boolean;

  private get data() {
    return jsonProxy<TicketAssignmentActionData>(
      this.settings.actionDataJson || "{}",
      (json) => {
        this.settings.actionDataJson = json;
      }
    );
  }

  private get assignmentFilters() {
    return [AssigneeTypeEnum.User, AssigneeTypeEnum.Team];
  }

  private get removerAssignments(): UsersAndTeamsSelection {
    return {
      teamIds: this.data.unAssignTeamIds,
      userIds: this.data.unAssignUserIds,
    }
  }

  private set removerAssignments(to: UsersAndTeamsSelection) {
    this.data.unAssignTeamIds = to.teamIds;
    //this.data.unAssignUserIds = to.userIds;

    //fixme: using nexttick because proxy does not support editing multiple properties so quickly
    this.$nextTick(() => {
      this.data.unAssignUserIds = to.userIds;
    });
  }

  private get adderAssignments(): UsersAndTeamsSelection {
    return {
      teamIds: this.data.assignTeamIds,
      userIds: this.data.assignUserIds,
    }
  }

  private set adderAssignments(to: UsersAndTeamsSelection) {

    this.data.assignTeamIds = to.teamIds;
    //fixme: using nexttick because proxy does not support editing multiple properties so quickly
    this.$nextTick(() => {
      this.data.assignUserIds = to.userIds;
    });
  }

  private get resetActive() {
    return this.data.resetFirst;
  }

  private set resetActive(to: boolean) {
    this.data.resetFirst = to;
  }

  private get assignRandomUser() {
    return this.data.assignRandomUser;
  }

  private set assignRandomUser(to: boolean) {
    this.data.assignRandomUser = to;
  }

  private get assignRandomUserPreferOnline() {
    return this.data.assignRandomUserPreferOnline;
  }

  private set assignRandomUserPreferOnline(to: boolean) {
    this.data.assignRandomUserPreferOnline = to;
  }

  private get assignRandomUserTeamId(): UsersAndTeamsSelection {
    return this.data.assignRandomUserTeamId ? { userIds: [], teamIds: [this.data.assignRandomUserTeamId] } : { userIds: [], teamIds: [] };
  }

  private set assignRandomUserTeamId(to: UsersAndTeamsSelection) {
    const oldTeamId = this.data.assignRandomUserTeamId;
    const newTeamIds = to.teamIds;

    if (!newTeamIds.length) {
      this.data.assignRandomUserTeamId = null;
    } else {
      // who is new?
      var notKnownNewTeamIds = newTeamIds.find(p => p != oldTeamId);
      this.data.assignRandomUserTeamId = notKnownNewTeamIds;

    }
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
