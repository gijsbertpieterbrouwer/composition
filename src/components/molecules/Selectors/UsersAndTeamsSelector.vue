<template>
  <div class="assignment-selector">
    <button class="toggle-button" ref="toggleButton" @click="togglePanel" :disabled="disabled" :class="{ 'disableOverlap': this.disableOverlap }">
      <UserIcon class="assignee" :showName="showName" :disabled="true" v-for="(id, index) in this.userIds" :key="id" :userId="id" :sizePx="24" :style="{
        zIndex:
          this.modelValue.teamIds.length +
          (this.modelValue.userIds.length - index),
      }" />
      <TeamIcon class="assignee" :showName="showName" v-for="(id, index) in this.teamIds" :sizePx="24" :key="id" :teamId="id" :style="{ zIndex: this.modelValue.teamIds.length - index }" />
      <div class="empty-placeholder" v-if="!hasAssignees">
        <TickIcon name="assignee" class="icon" />
        {{ this.formattedEmptyLabel }}
      </div>
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";

import { AssigneeTypeEnum, LanguagePath } from "@/TickApi";
import TickIcon from "@/components/TickIcon.vue";
import TeamIcon from "@/components/atoms/TeamIcon.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import UserIcon from "@/components/atoms/UserIcon.vue";
import UsersAndTeamsPanel from "@/components/panels/UsersAndTeamsPanel.vue";
import { translate } from '@/plugins/translatePlugin';
import { computed } from "vue";

export interface UsersAndTeamsSelection {
  userIds: string[];
  teamIds: string[]
}

@Component({
  emits: ["update:modelValue"],
  components: {
    TeamIcon,
    UserIcon,
    TickIcon,
  },
})
export default class UsersAndTeamsSelector extends Vue {

  @Prop({ default: { userIds: [], teamIds: [] } }) private modelValue: UsersAndTeamsSelection;
  @Prop() private typeFilters: AssigneeTypeEnum[];
  @Prop() private title: string;
  @Prop() private disabled: boolean;
  @Prop() private overlapAfter: number;
  @Prop() private emptyLabel: string;
  @Prop() private allowAsSubDialog: boolean;
  @Prop() private limitToOne: boolean;

  private activePanel = "";

  private get formattedEmptyLabel() {
    return this.emptyLabel || translate(LanguagePath.App_UserTeamSelector_EmptyLabel)
  }

  private get disableOverlap() {
    if (!this.overlapAfter) { return false; }
    return !((this.userIds.length + this.teamIds.length) > this.overlapAfter);
  }

  private get hasAssignees(): boolean {
    return this.teamIds.length >= 1 || this.userIds.length >= 1;
  }

  private get showName(): boolean {
    return this.teamIds.length + this.userIds.length == 1;
  }

  private get userIds() {
    return this.modelValue.userIds || [];
  }

  private get teamIds() {
    return this.modelValue.teamIds || [];
  }

  private togglePanel() {
    if (this.activePanel) {
      this.closePanel(false);
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.disabled) {
      return;
    }

    if (this.activePanel) {
      return;
    }
    const panelOptions: TickPanelOptions = {
      title: "UsersAndTeamsPanel",
      from: getRefElementDOMRect(this, "toggleButton"),
      allowAsSubDialog: this.allowAsSubDialog,
    }

    this.activePanel = mount(UsersAndTeamsPanel, {
      props: {
        panelOptions: panelOptions,
        modelValue: computed(() => this.modelValue),
        typeFilters: this.typeFilters || [],
        title: this.title,
        limitToOne: this.limitToOne,
      },
      events: {
        close: (byKeyboard: boolean) => {
          this.closePanel(byKeyboard);
        },
        "update:modelValue": (to: UsersAndTeamsSelection) => {
          this.$emit("update:modelValue", to);
        },
      },
    });
  }

  private closePanel(byKeyboard: boolean) {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";
    if (byKeyboard == true) {
      (this.$refs.toggleButton as HTMLElement)?.focus();
    }
  }


  mounted() {
    if (!this.modelValue.userIds) { this.modelValue.userIds = []; }
    if (!this.modelValue.teamIds) { this.modelValue.teamIds = []; }

    // remove nulls from lists
    this.modelValue.userIds = this.modelValue.userIds.filter(p => p);
    this.modelValue.teamIds = this.modelValue.teamIds.filter(p => p);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.toggle-button {
  padding: 4px;
  border-radius: 2px;
  height: 32px;
  transition: background-color 200ms ease;
  display: flex;
  align-items: center;



  &:hover:not([disabled]) {
    background-color: var(--c-base-200);
  }


  .assignee:not(:first-child) {
    margin-left: 3px;
  }


  &:not(.disableOverlap) {
    .assignee:not(:first-child) {
      margin-left: -10px;
    }
  }

  .empty-placeholder {
    padding: 0 4px;
    @include font-inter;
    font-weight: 500;
    letter-spacing: 0.02em;
    font-size: 10px;
    line-height: 16px;
    text-transform: capitalize;
    white-space: nowrap;

    border-radius: 2px;
    transition: all 0.3s ease;
    color: var(--c-contrast);
    display: inline-flex;
    gap: 4px;
    align-items: center;
    background-color: var(--c-base-300);

    .icon {
      width: 10px;
      height: 10px;
    }
  }
}
</style>
