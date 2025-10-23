<template>
  <TimelineItem :icon="icon" class="assignment" :userId="initiator.id" :important="item.important" :date="item.timelineDate">
    <template v-if="selfAssigned">
      {{ this.holderName }} <span class="subdued">&nbsp;{{ $translate(LanguagePath.App_Assignment_Assigned) }}</span>
    </template>
    <template v-else>
      <button>{{ this.initiatorName }}</button>
      <span class="subdued">&nbsp;{{ this.action }}&nbsp;</span>
      <button ref="toggleButton" @click="openHolderUserPanel" v-if="holderIsUser">{{ this.holderName }}</button>
      <TeamLabel v-else :allowRemove="false" :teamId="holderId" />
    </template>
  </TimelineItem>
</template>

<script lang="ts">
import UserIcon from "@/components/atoms/UserIcon.vue";
import {
  AssigneeTypeEnum, AssignmentActionType,
  AssignmentObjectTypeEnum, InitiatorTypeEnum,
  LanguagePath,
  TimelineAssigment, TimelineDataItem
} from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TeamLabel from "../../team/TeamLabel.vue";
import TickInitiator from "../../TickInitiator.vue";

// FIXME: Ruben use TickInitiator again

import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TimelineItem from "@/components/molecules/ticket/Timeline/TimelineItem.vue";
import UserPanel from "@/components/panels/UserPanel.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { translate } from "@/plugins/translatePlugin";
import useUtilityDataStore from "@/store/utilitydata";

@Component({
  components: {
    UserIcon,
    TeamLabel,
    TickInitiator,
    TimelineItem,
  },
})
export default class TicketAssignment extends Vue {

  LanguagePath = LanguagePath
  @Prop() private item: Required<TimelineDataItem>;
  private activePanel = "";

  private openHolderUserPanel() {
    this.togglePanel();
  }


  private togglePanel() {
    // if (this.disabled) {
    //   debug("[USER:CLICK]Clicking on disabled userIcon");
    //   return;
    // }

    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.activePanel) {
      return;
    }

    const panelOptions: TickPanelOptions = {
      title: "UserPanel",
      from: getRefElementDOMRect(this, "toggleButton")
    }

    this.activePanel = mount(UserPanel, {
      props: {
        panelOptions: panelOptions,
        userId: this.data.holderId,
      },
      events: {
        close: () => {
          this.closePanel();
        },
      },
    });
  }

  private closePanel() {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";
  }


  private get data(): TimelineAssigment {
    return this.item.data;
  }

  private get holderId() {
    return this.data.holderId;
  }

  // private get isQuestAssignment() {
  //   return this.data.assignmentObjectType == AssignmentObjectTypeEnum.Ticket;
  // }

  private get holderIsUser() {
    return this.data.holderType == AssigneeTypeEnum.User;
  }

  // private get assignedByUser() {
  //   return this.initiator.type == InitiatorTypeEnum.User;
  // }

  private get icon() {
    switch (this.data.initiator.type) {
      case InitiatorTypeEnum.User:
        return "user";
      default:
        return "flow";
    }
  }

  private get initiatorName(): string {
    switch (this.initiator.type) {
      case InitiatorTypeEnum.Flow: {
        return translate(LanguagePath.App_A_Something, { path: 'name', value: translate(LanguagePath.Flow) });
      }
      case InitiatorTypeEnum.User: {
        let user = useUtilityDataStore().user(this.initiator.id);
        return user != null ? user.name : translate(LanguagePath.App_A_Something, { path: 'name', value: translate(LanguagePath.User) });
      }
      case InitiatorTypeEnum.System: {
        return "Tick";
      }
    }
    return "-";
  }

  private get selfAssigned() {
    return (
      this.data.assignmentObjectType == AssignmentObjectTypeEnum.Ticket &&
      this.data.holderId == this.data.initiator.id
    );
  }

  private get initiator() {
    return this.data.initiator || {};
  }

  private get action() {
    switch (this.data.actionType) {
      case AssignmentActionType.Start:
        return translate(LanguagePath.App_Assignment_Verb_Assigned);
      case AssignmentActionType.End:
        return translate(LanguagePath.App_Assignment_Verb_UnAssigned);
    }
    return "-";
  }

  private get holderName(): string {
    switch (this.data.holderType) {
      case AssigneeTypeEnum.Team: {
        let team = useUtilityDataStore().team(this.data.holderId);
        return team != null ? team.name : translate(LanguagePath.App_A_Something, { path: 'name', value: translate(LanguagePath.Team) });
      }
      case AssigneeTypeEnum.User: {
        let user = useUtilityDataStore().user(this.data.holderId);
        return user != null ? user.name : translate(LanguagePath.App_A_Something, { path: 'name', value: translate(LanguagePath.User) });
      }
    }
    return "-";
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.assignment {
  font-size: $text-size-regular;
  line-height: 20px;
}
</style>
