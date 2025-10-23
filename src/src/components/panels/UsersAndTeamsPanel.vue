<template>
  <TickSettingsPanel :panelOptions="panelOptions" class="users-and-teams-panel" @close="close">

    <template #title>{{ this.titleText }}</template>

    <div class="content">
      <TickInput v-if="showSearch" class="filter-input" v-model="filterText" v-focus :placeholder="$translate(LanguagePath.App_Search)" />

      <div class="title" v-if="reducedFilteredUsers.length"> {{ $translate(LanguagePath.Users) }}</div>
      <TickAssigneeDisplay class="assignable" :class="{ 'highlighted': this.isHighlighted(index, AssigneeTypeEnum.User) }" v-for="(user, index) in this.reducedFilteredUsers" :key="user.id"
        :selected="userIsSelected(user.id)" :id="user.id" :name="user.name" :handle="user.handle" :type="AssigneeTypeEnum.User" @toggle="toggleUserAssignment" />

      <PanelReduceSwitch :reduce="reduceUserResults" @toggle=this.toggleReduceUsers :nrHidden="nrOfHiddenUsers" :totalCount="filteredUsers.length" :maxNrOfItems="maxNrOfItems" />

      <div class="title" v-if="reducedFilteredTeams.length"> {{ $translate(LanguagePath.Teams) }}</div>
      <TickAssigneeDisplay class="assignable" :class="{ 'highlighted': this.isHighlighted(index, AssigneeTypeEnum.Team) }" v-for="(team, index) in this.reducedFilteredTeams" :key="team.id"
        :selected="teamIsSelected(team.id)" :id="team.id" :name="team.name" :handle="team.handle" :type="AssigneeTypeEnum.Team" @toggle="toggleTeamAssignment" />
      <PanelReduceSwitch :reduce="reduceTeamResults" @toggle=this.toggleReduceTeams :nrHidden="nrOfHiddenTeams" :totalCount="filteredTeams.length" :maxNrOfItems="maxNrOfItems" />

    </div>

  </TickSettingsPanel>
</template>

<script lang="ts">
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickAssigneeDisplay from "@/components/molecules/TickAssigneeDisplay.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import useManagingStore from "@/store/managingStore";
import { AssigneeTypeEnum, LanguagePath, SubscriptionCostItemType, UserTypeEnum } from "@/TickApi";
import { computed, ComputedRef } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";

import { focus } from "@/directives";
import { smartFilter } from "@/helpers/arrayHelper";
import generateId from "@/helpers/guid";
import keyboard from "@/helpers/keyboard";
import { mount, unmount } from "@/helpers/mountHelper";
import { stringIsNullOrEmpty } from "@/helpers/stringHelper";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import PanelReduceSwitch from "./PanelReduceSwitch.vue";

export function removeUsersAndTeamsItemPanel(panelId: string) {
  unmount(panelId);
}

export function openUsersAndTeamsItemPanel(panelOptions: TickPanelOptions, title: string, typeFilters: AssigneeTypeEnum[], filterOnlyVoiceAvailable: boolean, onSelect: (to: usersAndTeamsSelection) => unknown, onClose: () => void) {
  const newPanelId = "UsersAndTeams_" + generateId();

  const emptySelection: usersAndTeamsSelection = {
    userIds: [],
    teamIds: [],
  }

  const activePanelId = mount(UsersAndTeamsPanel, {
    props: {
      title: title,
      typeFilters: typeFilters,
      panelOptions: panelOptions,
      modelValue: computed(() => emptySelection),
      noresults: "",
      filterOnlyVoiceAvailable: filterOnlyVoiceAvailable,
    },
    events: {
      close: () => {
        removeUsersAndTeamsItemPanel(activePanelId);
        onClose();
      },

      "update:modelValue": (to: usersAndTeamsSelection) => {
        onSelect(to);
        removeUsersAndTeamsItemPanel(activePanelId);
      },
    },
    loadComponents: [TickSettingsPanel]
  }, newPanelId);
}

export interface usersAndTeamsSelection {

  userIds: string[];
  teamIds: string[];

}

@Component({
  directives: { focus },
  emits: ["update:modelValue", "close"],
  components: {
    TickSettingsPanel,
    TickAssigneeDisplay,
    TickInput,
    PanelReduceSwitch
  },
})
export default class UsersAndTeamsPanel extends Vue {
  AssigneeTypeEnum = AssigneeTypeEnum;
  LanguagePath = LanguagePath

  @Prop() private title: string;
  @Prop() private typeFilters!: AssigneeTypeEnum[];
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private modelValue!: ComputedRef<usersAndTeamsSelection>;
  @Prop() private limitToOne: boolean;
  @Prop() private filterOnlyVoiceAvailable: boolean;
  private filterText = "";

  private maxNrOfItems = 5;
  private reduceUserResults = true;
  private reduceTeamResults = true;
  private keyboardId!: number;
  private highlightedIndex = -1; // -1 is no highlight
  private highlightedType = AssigneeTypeEnum.User;

  private userIsSelected(id: string): boolean {
    return this.model?.userIds?.indexOf(id) > -1;
  }
  private teamIsSelected(id: string): boolean {
    return this.model?.teamIds?.indexOf(id) > -1;
  }
  private get showSearch(): boolean {
    return this.allTeams.length > 1 || this.allUsers.length > 1;
  }

  private availableInPlan(costItem?: SubscriptionCostItemType) {
    return useUserStore().allowedView(null, costItem);
  }

  private close(byKeyboard: boolean) {
    this.$emit('close', byKeyboard);
  }
  private isHighlighted(index: number, type: AssigneeTypeEnum): boolean {
    return type == this.highlightedType && this.highlightedIndex == index;
  }
  private setHighLightIndex(newIndex: number) {
    this.highlightedIndex = newIndex;
    const totalUsersLength = this.reducedFilteredUsers.length - 1;
    const totalTeamsLength = this.reducedFilteredTeams.length - 1;

    if (this.highlightedType == AssigneeTypeEnum.User) {

      if (this.highlightedIndex < -1) {
        if (this.allowType(AssigneeTypeEnum.Team)) {
          this.highlightedIndex = totalTeamsLength
          this.highlightedType = AssigneeTypeEnum.Team
        } else {
          this.highlightedIndex = totalUsersLength
          this.highlightedType = AssigneeTypeEnum.User
        }

      }

      if (this.highlightedIndex > totalUsersLength) {
        if (this.allowType(AssigneeTypeEnum.Team)) {
          this.highlightedIndex = 0;  // back to first item in list
          this.highlightedType = AssigneeTypeEnum.Team
        } else {
          this.highlightedIndex = 0;  // back to first item in list
          this.highlightedType = AssigneeTypeEnum.User
        }
      }
    }

    if (this.highlightedType == AssigneeTypeEnum.Team) {

      if (this.highlightedIndex < -1) {
        if (this.allowType(AssigneeTypeEnum.User)) {
          this.highlightedIndex = totalUsersLength
          this.highlightedType = AssigneeTypeEnum.User
        } else {
          this.highlightedIndex = totalTeamsLength
          this.highlightedType = AssigneeTypeEnum.Team
        }
      }

      if (this.highlightedIndex > totalUsersLength) {
        if (this.allowType(AssigneeTypeEnum.User)) {
          this.highlightedIndex = 0;  // back to first item in list
          this.highlightedType = AssigneeTypeEnum.User
        } else {
          this.highlightedIndex = 0;  // back to first item in list
          this.highlightedType = AssigneeTypeEnum.Team
        }
      }

    }

  }


  private get firstAssignmentType() {
    return this.allowType(AssigneeTypeEnum.User) ? AssigneeTypeEnum.User : AssigneeTypeEnum.Team;
  }

  private get lastAssignmentType() {
    return this.allowType(AssigneeTypeEnum.Team) ? AssigneeTypeEnum.Team : AssigneeTypeEnum.User;
  }

  mounted() {
    if (!this.model.userIds) { this.model.userIds = []; }
    if (!this.model.teamIds) { this.model.teamIds = []; }

    // remove nulls from lists
    this.model.userIds = this.model.userIds.filter(p => p != null);
    this.model.teamIds = this.model.teamIds.filter(p => p != null);

    this.highlightedType = this.firstAssignmentType;

    this.keyboardId = keyboard.on("Down", () => {
      this.setHighLightIndex(this.highlightedIndex + 1);
    }, { ignoreInputFieldEvents: false });

    this.keyboardId = keyboard.on("Up", () => {
      this.setHighLightIndex(this.highlightedIndex - 1);
    }, { ignoreInputFieldEvents: false });


    this.keyboardId = keyboard.on("Enter", () => {
      let selectedIndex = this.highlightedIndex;

      if (selectedIndex == -1) { selectedIndex = 0; }

      switch (this.highlightedType) {
        case AssigneeTypeEnum.User:
          this.toggleUserAssignment(this.reducedFilteredUsers[selectedIndex].id);
          break;
        case AssigneeTypeEnum.Team:
          this.toggleTeamAssignment(this.reducedFilteredTeams[selectedIndex].id);
          break;
      }

    },
      { ignoreInputFieldEvents: false });

  }

  private beforeUnmount() {
    keyboard.off(this.keyboardId);
  }


  private toggleReduceUsers() {
    this.reduceUserResults = !this.reduceUserResults;
  }
  private toggleReduceTeams() {
    this.reduceTeamResults = !this.reduceTeamResults;
  }


  beforeMount() {
    useManagingStore().useTeams();
  }

  private get titleText(): string {
    if (!stringIsNullOrEmpty(this.title)) { return this.title; }
    const items: string[] = [];
    if (this.availableInPlan(SubscriptionCostItemType.User)) { items.push("Users") }
    if (this.availableInPlan(SubscriptionCostItemType.Teams)) { items.push("Teams") }

    const joined = items.join(" & ");

    return joined;
  }

  private get model() {
    return this.modelValue.value;
  }

  private allowType(type: AssigneeTypeEnum) {
    if (!this.typeFilters || !this.typeFilters.length || this.typeFilters.some(p => p == type)) { return true; }
    return false;
  }

  private get nrOfHiddenTeams() {
    return this.filteredTeams.length - this.reducedFilteredTeams.length;
  }

  private get nrOfHiddenUsers() {
    return this.filteredUsers.length - this.reducedFilteredUsers.length;
  }

  private get reducedFilteredTeams() {
    if (!this.reduceTeamResults) { return this.filteredTeams; }

    const items = this.filteredTeams;
    return items.slice(0, this.maxNrOfItems);
  }

  private get reducedFilteredUsers() {
    if (!this.reduceUserResults) { return this.filteredUsers; }
    const items = this.filteredUsers;
    return items.slice(0, this.maxNrOfItems);
  }

  private get filteredUsers() {
    if (!this.allowType(AssigneeTypeEnum.User)) { return [] }

    const items = smartFilter(this.filterText, this.allUsers, {
      filterProps: ['name', 'handle'],
    })

    return items;
  }

  private get allUsers() {
    if (!this.availableInPlan(SubscriptionCostItemType.User)) { return []; }
    return useUtilityDataStore().utilityData.users.filter(p => (this.filterOnlyVoiceAvailable ? p.voiceAvailable : true) && (p.deleted == false || this.userIsSelected(p.id)) && p.userType == UserTypeEnum.User);
  }

  private get filteredTeams() {
    if (!this.allowType(AssigneeTypeEnum.Team)) { return [] }

    return smartFilter(this.filterText, this.allTeams, {
      filterProps: ['name', 'handle'],
    })

  }
  private get allTeams() {
    if (!this.availableInPlan(SubscriptionCostItemType.Teams)) { return []; }
    return useManagingStore().teamSummaries.filter(p => (this.filterOnlyVoiceAvailable ? p.voiceAvailable : true) && p.deleted == false);
  }

  private toggleUserAssignment(id: string) {

    if (this.limitToOne) {
      if (this.model.userIds.includes(id)) {
        this.setAssignments(
          [],
          []
        );

      } else {
        this.setAssignments(
          [id],
          []
        );
      }
      this.close(false);
    } else {

      if (this.model.userIds.includes(id)) {
        this.setAssignments(
          this.model.userIds.slice().filter((l) => l !== id),
          this.model.teamIds
        );
      } else {
        this.setAssignments(
          [...this.model.userIds.slice(), id],
          this.model.teamIds
        );
      }
    }
  }

  private toggleTeamAssignment(id: string) {

    if (this.limitToOne) {
      if (this.model.teamIds.includes(id)) {
        this.setAssignments(
          [],
          []
        );
      } else {
        this.setAssignments(
          [],
          [id]
        );
      }
      this.close(false);
    } else {
      if (this.model.teamIds.includes(id)) {
        this.setAssignments(
          this.model.userIds,
          this.model.teamIds.slice().filter((l) => l !== id)
        );
      } else {
        this.setAssignments(this.model.userIds, [
          ...this.model.teamIds.slice(),
          id,
        ]);
      }
    }
  }
  private setAssignments(userIds: string[], teamIds: string[]) {
    this.$emit("update:modelValue", { userIds, teamIds });
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.assignable {
  width: 100%;

  &.highlighted {
    color: var(--c-contrast);
    background-color: var(--c-base-200);
  }
}

.moreitems-message {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  font-style: italic;
}

.title {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
