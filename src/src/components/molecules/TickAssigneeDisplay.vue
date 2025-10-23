<template>
  <button class="assignee-display" @click="$emit('toggle', this.id)" :class="{ selected: this.selected }">
    <UserIcon v-if="type === AssigneeTypeEnum.User" class="icon" :sizePx="24" :userId="id" :disabled="true" />
    <TeamIcon v-if="type === AssigneeTypeEnum.Team" class="icon" :sizePx="24" :teamId="id" />
    <div class="name">{{ this.name }}</div>
    <div class="handle">{{ this.handle }}</div>
    <TickIcon name="check" class="check" v-if="selected" />
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import TeamIcon from "@/components/atoms/TeamIcon.vue";
import TickIcon from "@/components/TickIcon.vue";
import UserIcon from "@/components/atoms/UserIcon.vue";

import { AssigneeTypeEnum } from "@/TickApi";

@Component({
  emits: ["toggle"],
  components: {
    TeamIcon,
    TickIcon,
    UserIcon,
  },
})
export default class TickAssigneeDisplay extends Vue {
  AssigneeTypeEnum = AssigneeTypeEnum;

  @Prop() private selected!: boolean;

  @Prop() private id!: string;
  @Prop() private name!: string;
  @Prop() private handle!: string;
  @Prop() private type!: AssigneeTypeEnum;
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
// TODO: hover state

.assignee-display {
  padding: 4px 8px;
  align-items: center;
  width: 100%;
  display: grid;
  gap: 0 8px;
  grid-template-columns: 24px 1fr auto;
  grid-template-rows: 20px 16px;
  grid-template-areas: "icon name selected" "icon handle selected";
  border-radius: 4px;
  transition: background-color 200ms ease;
  margin: 0 -8px;

  &:hover {
    color: var(--c-contrast);
    background-color: var(--c-base-300);
  }
}

.icon {
  grid-area: icon;
}

.name {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  grid-area: name;
}

.handle {
  grid-area: handle;
  opacity: 0.6;
  font-size: $text-size-regular;
  line-height: 16px;
  font-weight: 500;
}

.check {
  grid-area: selected;
}
</style>
