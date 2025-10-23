<template>
  <div class="wrapper">
    <ul v-if="hasAny" class="list">
      <DashboardListItem class="list-item" :selected="ItemIsSelected(item)" v-for="item in this.list" :key="item.id" :data="item" @select="selectItem(item)" />
    </ul>

    <TickButton v-if="allowAdd" @click="startAddDashboard" class="addbutton" :appearance="Appearance.primary" :color="Color.contrast" :size="Size.XXL" icon="plus" :round="true">
    </TickButton>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import SectionWithSidebar from "@/components/atoms/SectionWithSidebar.vue";
import { DashboardTemplateType, SubscriptionCostItemType, TickDashboardSummary } from '@/TickApi';
import keyboard from '@/helpers/keyboard';
import DashboardListItem from './DashboardListItem.vue';
import useDashboardsStore from '@/store/dashboards';
import TickButton, { Color, Size, Appearance } from '@/components/atoms/TickButton.vue';
import useUserStore from '@/store/user';

@Component({
  emits: ["select"],
  components: { DashboardListItem, SectionWithSidebar, TickButton }
})
export default class DashboardList extends Vue {
  @Prop() private activeId!: string;
  Size = Size
  Color = Color
  Appearance = Appearance
  private get hasAny() {
    return this.list.length;
  }

  private get allowAdd(): boolean {
    return this.addAllowedInPlan;
  }
  private get addAllowedInPlan() {
    const currentNr = this.summaries.length;
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.CustomDashboard, currentNr)
  }

  private get summaries(): TickDashboardSummary[] {
    return useDashboardsStore().dashboardSummaries || [];
  }

  private get list(): TickDashboardSummary[] {
    return this.summaries;
  }

  private ItemIsSelected(item: TickDashboardSummary) {
    return this.activeId == item.id;
  }

  private keyboardIds: number[] = [];

  mounted() {
    useDashboardsStore().use();

    this.keyboardIds.push(keyboard.on("PageUp", () => {
      if (this.currentTaskIndex < 1) { return; }

      const itemToShow = this.list[this.currentTaskIndex - 1];
      this.selectItem(itemToShow);
    }, {
      ignoreInputFieldEvents: true
    }));

    this.keyboardIds.push(keyboard.on("PageDown", () => {
      if (this.currentTaskIndex >= this.list.length - 1) { return; }

      const itemToShow = this.list[this.currentTaskIndex + 1];
      this.selectItem(itemToShow);
    }, {
      ignoreInputFieldEvents: true
    }));

  }

  private selectItem(item: TickDashboardSummary) {
    this.$emit('select', item)
  }

  private beforeUnmount() {
    keyboard.off(this.keyboardIds);
  }

  private get currentTaskIndex() {
    const currentIndex = this.list.findIndex(p => p.id == this.activeId);
    return currentIndex;
  }

  private startAddDashboard() {
    useDashboardsStore().createDashboard(DashboardTemplateType.Custom).then((newDashboard) => {
      this.selectItem(newDashboard);
    });
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.wrapper {
  height: 100%;
  padding-top: 50px;

  .list {
    display: grid;
    gap: 5px;
  }

  .addbutton {
    position: absolute;
    bottom: 20px;
    right: 10px;

  }
}
</style>
