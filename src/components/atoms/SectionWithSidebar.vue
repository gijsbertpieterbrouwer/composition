<template>

  <div class="section-with-sidebar" :class="[this.orientation, `toggle-${this.toggleLocation}`]">
    <section class="view">
      <slot />
    </section>
    <div class="sidebar" v-if="!hideSidebar" :class="[{ 'collapsible': this.collapsible, 'collapsed': this.collapsed, 'in-secondary': this.InSecondary }]"
      :style="{ 'width': this.calculatedMaxSidebarWidth }">
      <button class="header" @click="$emit('toggle')" :disabled="!collapsible" v-if="hasHeader">
        <TickIcon class="icon" name="expand" v-if="collapsible" />
        <div class="label">
          <slot name="sidebar-label" />
        </div>
      </button>
      <slot name="sidebar" />
    </div>
  </div>
</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import { Component, Prop, Vue } from "vue-facing-decorator";

export enum SidebarColor {
  Primary,
  Secondary
}

@Component({
  emits: ["toggle"],
  components: { TickIcon },
})
export default class SectionWithSidebar extends Vue {
  @Prop({ default: false }) private collapsible!: boolean;
  @Prop({ default: false }) private collapsed!: boolean;
  @Prop({ default: "ltr" }) private orientation!: "ltr" | "rtl";
  @Prop({ default: "top" }) private toggleLocation!: "top" | "bottom";
  @Prop({ default: true }) private sidebarHeader!: boolean;
  @Prop({ default: false }) private hideSidebar!: boolean;
  @Prop() private maxSidebarWidth: number;
  @Prop({ default: SidebarColor.Primary }) private color!: SidebarColor;

  private get calculatedMaxSidebarWidth() {

    const defMaxWidth = 'clamp(250px, 25%, 800px)'

    if (this.collapsed) { return '56px' }

    return this.maxSidebarWidth
      ? `${this.maxSidebarWidth}px`
      : defMaxWidth;


    // const defaultMinWidth = 364;
    //const defaultCollapsedWidth = 56;

    //const openWidth = defaultMinWidth;

    // return this.collapsed
    //   ? `${defaultCollapsedWidth}px`
    //   : `clamp(${openWidth}px, 500px, 1000px)`;
  }

  private get hasHeader() {
    return this.sidebarHeader || this.collapsible;
  }

  private get InSecondary() {
    return this.color == SidebarColor.Secondary;
  }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";



.section-with-sidebar {
  display: flex;

  .view {
    height: 100dvh;
  }

  .sidebar {
    &:not(.collapsed) {
      width: clamp(250px, 25%, 800px)
    }

    &.collapsed {
      width: 56px;
    }

  }

}

section {
  flex-grow: 1;
}

.sidebar {
  //width: auto;
  flex-shrink: 0;
  transition: width 0.3s ease;
  display: flex;
  position: sticky;
  top: 0;
  background-color: var(--c-base);
  //border-right: 1px solid var(--c-base-200);


  .header {
    display: flex;
    height: 64px;
    padding: 16px 12px;
    width: 100%;

    background-color: var(--c-menu-background);
    border-right: 1px solid var(--c-menu-border);

    .label {
      display: block;
      flex-grow: 1;
      flex-shrink: 1;
      overflow: hidden;
      line-height: 32px;
      @include font-inter;
      font-size: 20px;
      white-space: nowrap;
      transition: opacity 0.3s ease-in;

      span {
        padding-left: 12px;
      }
    }

    .icon {
      flex-shrink: 0;
      margin: 8px;
      transition: all 0.3s ease;
      color: $grey600;
    }
  }

  &.in-secondary {
    background-color: var(--c-base-200);

    .header {
      background-color: var(--c-base-200);
    }
  }


}



.section-with-sidebar {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  &.toggle-top>.sidebar {
    flex-direction: column;
  }

  &.toggle-bottom>.sidebar {
    flex-direction: column-reverse;

    .header {
      height: 56px;
    }
  }

  &.ltr {
    flex-direction: row;

    >.sidebar.collapsed>.header .icon {
      transform: rotate(180deg);
    }
  }

  &.rtl {
    flex-direction: row-reverse;

    >.sidebar {
      //border-right: 1px solid var(--border-color);

      &:not(.collapsed)>.header .icon {
        transform: rotate(180deg);
      }
    }
  }
}

.sidebar.collapsed .header>.label {
  opacity: 0;
}
</style>
