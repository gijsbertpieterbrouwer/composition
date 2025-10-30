<template>
  <div class="team-icon-wrapper">
    <div class="team-icon" :title="tooltip" :class="colorName" :style="{
      width: this.widthtAsPixels,
      height: this.heightAsPixels,
      borderRadius: `${this.sizePx * 0.2}px`,
      fontSize: `${this.sizePx * 0.4}px`,
    }">
      {{ this.title }}
    </div>
    <span v-if="showName">{{ this.name }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import { getColorName } from "@/helpers/colorsHelper";
import { calcInitials } from "@/helpers/stringHelper";
import { debug } from "@/log";
import useUtilityDataStore from "@/store/utilitydata";
import { ColorsEnum } from "@/TickApi";

@Component
export default class TeamIcon extends Vue {
  @Prop() private teamId!: string;
  @Prop({ default: 40 }) private sizePx!: number;
  @Prop() private showName: boolean;

  private get heightAsPixels() {
    return `${this.sizePx}px`;
  }

  private get widthtAsPixels() {
    return `${this.sizePx}px`;
  }

  private get name() {
    return this.team?.name;
  }

  private get team() {
    useUtilityDataStore().team
    const team = useUtilityDataStore().team(this.teamId)
    if (team) { return team; } else {
      debug("Could not find team with id:" + this.teamId);
      return {
        id: this.teamId,
        name: "-",
        color: ColorsEnum.Grey,
      };
    }
  }
  private get tooltip() {
    return this.team?.name;
  }
  private get title() {
    return calcInitials(this.team?.name);
  }

  private get colorName() {
    if (!this.team.color) {
      return "";
    }

    return getColorName(this.team.color);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.team-icon-wrapper {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;

  .team-icon {
    width: 40px;
    height: 40px;
    border-radius: 6px;

    display: grid;
    place-content: center;
    overflow: hidden;

    @include font-inter;
    font-weight: 500;
    font-size: 0.6em;

    background-color: var(--c-base-300);
    border: 1px solid var(--c-base-500);
    color: var(--c-contrast);

    @include neon-bg;
  }
}
</style>
