<template>
  <div v-if="show" class="timeline-item" :class="{
    'continuous-line': this.continuousLine,
    'bottom-spacing': this.bottomSpacing,
  }">
    <div class="icon-slot">
      <div class="icon-padding" :style="{ height: `${this.iconPaddingPx}px` }" />
      <div class="icon-container" :class="`type-${this.icon}`">
        <TickIcon :name="icon" class="icon" v-if="icon !== 'user'" />
        <UserIcon class="user-icon" :userId="userId" :sizePx="20" v-else-if="userId" />
      </div>
    </div>

    <div class="content">
      <slot />
      <span class="timeline-date subdued" :title="tooltipDate">{{ this.displayDateToShow }}</span>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import TickIcon from "@/components/TickIcon.vue";
import UserIcon from "@/components/atoms/UserIcon.vue";
import { displayDate, displayDistanceToNowDate } from "@/helpers/dateHelper";

@Component({
  components: {
    TickIcon,
    UserIcon,
  },
})
export default class TimelineItem extends Vue {
  @Prop() private icon!: string;
  @Prop({ default: true }) private continuousLine!: boolean;
  @Prop({ default: 0 }) private iconPaddingPx!: number;
  @Prop({ default: true }) private bottomSpacing!: boolean;
  @Prop() private userId?: string;
  @Prop({ default: null }) private date?: Date;

  @Prop() private important?: boolean;
  @Prop() private hideIfTrivial?: boolean;

  private get show() {
    return this.important || !this.hideIfTrivial;
  }

  private get hasDate(): boolean {
    return this.date != null;
  }

  private get displayDateToShow() {
    return this.hasDate ? displayDistanceToNowDate(this.date) : "";
  }

  private get tooltipDate() {
    return this.hasDate ? displayDate(this.date) : "";
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.timeline-date {

  margin-left: 20px;
  font-size: $text-size-regular;

}

.timeline-item {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 0 16px;
  padding-left: 8px;

  // grid-template-rows: auto;
  // grid-template-areas: "icon content"
  //   "footer";
}

.icon-slot {
  //grid-area: icon;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.icon-padding {
  background-color: var(--c-base-300);
}

.user-icon {
  transform: scale(1.2);
}

.icon-container {
  height: 20px;
  background-color: var(--c-base);
  color: var(--c-morning-light);
  border-radius: 999px;
  border: 2px solid var(--c-base);
  display: grid;
  place-items: center;

  svg {
    width: 12px;
    height: 12px;
  }

  &.type-ticket {
    color: var(--c-contrast);
  }


  &.type-flow {
    background-color: var(--c-sky-neon);
  }

  &.type-inbound {
    background-color: var(--c-grey-neon);
    // color: var(--c-contrast);
  }

  &.type-outbound {
    background-color: var(--c-blue-neon);
  }

  &.type-note {
    background-color: var(--c-primary);
    color: var(--c-evening-dark);
  }

  &.type-task {
    background-color: var(--c-pink-neon);
  }

  &.type-sla {
    background-color: var(--c-red-night);
  }

  &.type-finish {
    color: var(--c-evening-dark);
    background-color: var(--c-lime-day);
  }


  &.type-phone {
    color: var(--c-evening-dark);
    background-color: var(--c-lime-day);

    svg {
      width: 10px;
      height: 10px;
    }
  }

  &.type-ticket {
    color: var(--c-contrast);
  }

  &.type-user {
    border: none;
  }
}

.icon {
  width: 12px;
  height: 12px;
}

.content {
  // grid-area: content;
  border-left: 1px solid var(--c-ticket-timeline);
  padding-left: 26px;
  transform: translateX(-26px);
  display: flex;
  align-items: first baseline
}

.continuous-line .icon-padding {
  visibility: hidden;
}

.bottom-spacing .content {
  padding-bottom: 16px;
  width: calc(100% + 47px);
}
</style>
