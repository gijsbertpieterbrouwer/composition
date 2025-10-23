<template>
  <TickFocusScreen :noSidebar="!showSidebar">
    <router-view></router-view>
    <template #sidebar>
      <router-view name="sidebar" />
    </template>
    <template #list>
      <TickSettingsMenu />
    </template>
  </TickFocusScreen>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';
import TickFocusScreen from '@/components/atoms/TickFocusScreen.vue';
import TickSettingsMenu from '@/components/TickSettingsMenu.vue';
import useViewstateStore from '@/store/viewstate';

@Component({
  components: { TickFocusScreen, TickSettingsMenu }
})
export default class TickSettingsBase extends Vue {
  private get showSidebar() {
    if (this.$route.meta?.hideSideBar) { return false; }

    return useViewstateStore().canShowFull;
  }

}
</script>


<style lang="scss" scoped>
@import "@/styles/theme";
</style>