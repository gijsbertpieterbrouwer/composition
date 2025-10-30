<template>
  <MenuListItem @select="$emit('select', this.data)" :title="title" :subtitle="subtitle" :selected="selected" :attention="false">
    <template #indicators>
      <TickIcon v-if="isHomeDashboard" name="home" />
    </template>
  </MenuListItem>
</template>

<script lang="ts">
import MenuListItem from '@/components/atoms/MenuListItem.vue';
import TickIcon from '@/components/TickIcon.vue';
import useUserStore from '@/store/user';
import { TickDashboardSummary } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';

@Component({
  emits: ["select"],
  components: { TickIcon, MenuListItem }
})
export default class DashboardListItem extends Vue {
  @Prop() private data: Required<TickDashboardSummary>;
  @Prop() private selected: boolean;

  private get homeDashboardId() {
    return useUserStore().getHomeDashboardId();
  }

  private get isHomeDashboard(): boolean {
    return this.data.id == this.homeDashboardId;
  }

  private get title() {
    return '';//this.data.name
  }

  private get subtitle() {
    return this.data.name;// '';// translate(LanguagePath.Dashboard);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
