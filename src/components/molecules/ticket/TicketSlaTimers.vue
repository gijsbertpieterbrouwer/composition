<template>
  <template v-if="hasActiveTimers">
    <TickCountdown :to="firstDueTimerDueDateTicks" :from="firstDueTimerCountDownTicks" />
  </template>
</template>

<script lang="ts">
import { SlaTimer } from "@/TickApi";
import MenuListItem from "@/components/atoms/MenuListItem.vue";
import TickCountdown from "@/components/atoms/TickCountdown.vue";
import useAppStore from "@/store/app";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: ["select"],
  components: { MenuListItem, TickCountdown }
})
export default class TicketSlaTimers extends Vue {
  @Prop({ default: [] }) private timers: Required<SlaTimer[]>;

  private get nowUtcTicks() {
    return useAppStore().nowUtcTicks;
  }

  private get firstDueTimerCountDownTicks(): number {
    const dueTimer = this.firstDueTimer;
    if (!dueTimer) { return 0 }

    var start = dueTimer.countDownStartDateTicks || this.firstDueTimerDueDateTicks;

    return start;
  }

  private get firstDueTimerDueDateTicks(): number {
    const dueTimer = this.firstDueTimer;
    if (!dueTimer) { return 0 }

    var dueTicks = dueTimer.dueDateTicks || this.nowUtcTicks;

    return dueTicks;
  }

  private get activeTimers(): SlaTimer[] {
    if (!this.timers || !this.timers.length) { return []; }

    const reducedTimers = this.timers.filter(p =>
      p.dueDateTicks >= this.nowUtcTicks
      && p.countDownStartDateTicks <= this.nowUtcTicks
    );

    return reducedTimers;
  }

  private get firstDueTimer(): SlaTimer | null {
    if (!this.hasActiveTimers) { return null; }

    const min = this.activeTimers.reduce((prev, curr) => prev.dueDateTicks < curr.dueDateTicks ? prev : curr);

    return min;
  }

  private get hasActiveTimers(): boolean {
    if (!this.activeTimers || !this.activeTimers.length) { return false; }
    return true;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
