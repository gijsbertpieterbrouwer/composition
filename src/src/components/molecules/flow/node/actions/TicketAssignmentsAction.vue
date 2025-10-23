<template>
  <ActionBase :selectedLog="selectedLog" :stepId="stepId" :selected="selected" icon="users" :action="action" @addComment="addComment" @resolveComments="resolveComments" :isLastAction="isLastAction">
    <template v-if="hasActionData">
      <template v-if="resetFirst">
        <div> {{ $translate(LanguagePath.App_FlowEditor_Assignments_ResetFirst) }}</div>
      </template>

      <template v-if="hasUnAssignments">
        <div class="flex-row">
          <TickIcon name="minus" />
          <UsersAndTeamsSelector v-model="removerAssignments" :disabled="true" :overlapAfter="5" />
        </div>
      </template>
      <template v-if="hasAssignments">
        <div class="flex-row">

          <div v-if="assignRandomUser">
            <TickIcon name="plus" />
            {{ this.randomAssignmentText }}
            <TeamLabel :teamId="randomTeamId" v-if="hasRandomTeamId" />
          </div>
          <!-- {{ $translate(LanguagePath.App_FlowEditor_Assignments_Assign) }} -->
          <TickIcon name="plus" />
          <UsersAndTeamsSelector v-model="adderAssignments" :disabled="true" :overlapAfter="5" />
        </div>
      </template>
    </template>
    <template v-else>
      {{ $translate(LanguagePath.App_FlowEditor_Assignments_OnlyUnAssign) }}
    </template>

  </ActionBase>
</template>

<script lang="ts">
import LabelList from "@/components/atoms/LabelList.vue";
import ThenHr from "@/components/atoms/ThenHr.vue";
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "@/components/molecules/Selectors/UsersAndTeamsSelector.vue";
import TeamLabel from "@/components/molecules/team/TeamLabel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { getConnectionHandleId } from "@/helpers/flowhelpers";
import { jsonProxy } from "@/helpers/jsonProxy";
import { translate } from '@/plugins/translatePlugin';
import {
  FlowComment,
  FlowDefinitionAction,
  LanguagePath,
  TicketAssignmentActionData,
  TickFlowInstanceLog
} from "@/TickApi";
import { TicketAssignmentsLogicActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from "vue-facing-decorator";
import ActionBase from "../ActionBase.vue";

@Component({
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, LabelList, ThenHr, UsersAndTeamsSelector, EditorMessage, ActionBase, TeamLabel },
})
export default class TicketAssignmentsAction extends Vue {
  EditorMessageType = EditorMessageType
  LanguagePath = LanguagePath
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: TicketAssignmentsLogicActionSettings;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;
  @Prop({ default: "" }) private stepId!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;
  private isActionHovering: boolean;

  private get data() {
    return jsonProxy<TicketAssignmentActionData>(
      this.settings.actionDataJson || "{}",
      (json) => {
        this.settings.actionDataJson = json;
      }
    );
  }
  private addComment(stepId: string, actionId: string, comment: FlowComment) {
    this.$emit("addComment", stepId, actionId, comment);
  }
  private resolveComments() {
    this.$emit("resolveComments", this.action.id);
  }

  private get hasActionData() {
    if (this.data.resetFirst) {
      return this.hasAssignments
    } else {
      return this.hasAssignments || this.hasUnAssignments;
    }
  }


  private get hasUnAssignments() {
    return this.data?.unAssignUserIds?.length > 0 || this.data?.unAssignTeamIds?.length > 0;
  }

  private get hasAssignments() {
    return this.assignRandomUser || this.data?.assignUserIds?.length > 0 || this.data?.assignTeamIds?.length > 0;
  }


  private get removerAssignments(): UsersAndTeamsSelection {
    return {
      teamIds: this.data.unAssignTeamIds,
      userIds: this.data.unAssignUserIds,
    }
  }

  private get adderAssignments(): UsersAndTeamsSelection {
    return {
      teamIds: this.data.assignTeamIds,
      userIds: this.data.assignUserIds,
    }
  }

  private get resetFirst() {
    return this.data.resetFirst;
  }
  private get hasRandomTeamId() {
    return this.data.assignRandomUserTeamId != null;
  }

  private get randomTeamId() {
    return this.data.assignRandomUserTeamId;
  }

  private get randomAssignmentText() {
    if (this.assignRandomUserPreferOnline) {
      return this.randomTeamId ? translate(LanguagePath.App_FlowEditor_Assignments_Random_PreferOnline_FromTeam) : translate(LanguagePath.App_FlowEditor_Assignments_Random_PreferOnline)
    } else {
      return this.randomTeamId ? translate(LanguagePath.App_FlowEditor_Assignments_Random_PreferOnline_FromTeam) : translate(LanguagePath.App_FlowEditor_Assignments_Random)
    }
    // return this.assignRandomUserPreferOnline ? translate(LanguagePath.App_FlowEditor_Assignments_Random_PreferOnline) :translate(LanguagePath.App_FlowEditor_Assignments_Random);
    // return `Assign to a random ${this.assignRandomUserPreferOnline ? 'online ' : ''}user ${this.randomTeamId ? `from ` : ''}`;
  }

  private get assignRandomUser() {
    return this.data.assignRandomUser;
  }

  private get assignRandomUserPreferOnline() {
    return this.data.assignRandomUserPreferOnline;
  }

  private get assignRandomUserTeamId(): UsersAndTeamsSelection {
    return this.data.assignRandomUserTeamId ? { userIds: [], teamIds: [this.data.assignRandomUserTeamId] } : { userIds: [], teamIds: [] };
  }

  private get handleId() {
    return getConnectionHandleId(this.stepId, this.action.id);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.action {
  font-size: 14px;
  line-height: 16px;
  position: relative;
  padding: 0 12px;
  position: relative;

  .flex-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;

    .name {
      font-weight: 600;
      min-width: 60px;
    }

  }

}
</style>
