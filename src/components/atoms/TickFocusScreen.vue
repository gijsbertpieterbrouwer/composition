<template>
  <div class="focus-screen" :class="{ 'no-list': this.noList, 'no-sidebar': !this.showSidebar, 'no-padding': this.noPadding }">
    <section class="list" v-if="!noList">
      <slot name="list" />
    </section>
    <section class="view">
      <slot />
    </section>
    <section class="sidebar" v-if="showSidebar">
      <slot name="sidebar" />
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component
export default class TickFocusScreen extends Vue {
  @Prop({ default: false }) private noSidebar!: boolean;
  @Prop({ default: false }) private noPadding!: boolean;
  @Prop({ default: false }) private noList!: boolean;

  private get showSidebar() {
    return !this.noSidebar;
  }



}
</script>

<style lang="scss" scoped>
.focus-screen {
  display: grid;
  grid-template-columns: clamp(200px, 25%, 500px) 1fr clamp(250px, 25%, 800px);
  grid-template-areas: "list main sidebar";
  gap: 16px;
  padding: 8px 16px 0 16px;

  &.no-sidebar {
    grid-template-columns: clamp(200px, 25%, 400px) 1fr;
    grid-template-areas: "list main";
  }

  &.no-sidebar.no-list {
    grid-template-columns: auto;
    grid-template-areas: "main";
  }


  &:not(.no-padding) {

    .view {
      padding: 0 50px;

    }
  }


  .list {
    grid-area: list;
    overflow-y: auto;
    position: relative;
  }

  .view {
    grid-area: main;
    background-color: var(--c-base);
    border-radius: 12px 12px 0 0;
    overflow-y: auto;



  }

  .sidebar {
    grid-area: sidebar;
    overflow-y: auto;
  }

  // FIXME: Ruben responsiveness: under 1200px & above 1800px
}
</style>
