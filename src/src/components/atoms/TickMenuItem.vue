<template>
  <component v-if="!isHyperlink && this.workspaceName" :is="type" class="tick-menu-item" :to="{ name: this.to, params: { workspaceName: this.workspaceName } }">

    <TickIcon v-if="icon" class="icon" :class="{ 'large': this.largeIcon }" :name="icon" />
    <TickIndicator v-if="indicator" class="indicator" :indicator="indicator" />
    <span class="content">
      <slot v-if="!collapsed" />
    </span>
    <span class="suffix">
      <slot name="suffix" />
    </span>
  </component>

  <a v-else-if="isHyperlink" class="tick-menu-item" :href="to" target="new">
    <TickIcon v-if="icon" class="icon" :class="{ 'large': this.largeIcon }" :name="icon" />
    <TickIndicator v-if="indicator" class="indicator" :indicator="indicator" />
    <span class="content">
      <slot v-if="!collapsed" />
    </span>
    <span class="suffix">
      <slot name="suffix" />
    </span>
  </a>

</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import UserIcon from "@/components/atoms/UserIcon.vue";
import useUserStore from "@/store/user";
import { Component, Prop, Vue } from "vue-facing-decorator";

import { ViewName } from "@/router";
import TickIndicator, { TickIndicatorData } from "./TickIndicator.vue";



@Component({ components: { TickIcon, UserIcon, TickIndicator } })
export default class TickMenuItem extends Vue {
  @Prop() private to!: ViewName;
  @Prop({ required: false }) private icon!: string;
  @Prop() private indicator?: TickIndicatorData;
  @Prop() private collapsed: boolean;

  @Prop() private largeIcon?: boolean;
  private get workspaceName() {
    const ws = useUserStore().activeWorkspace;
    return ws ? ws.urlName : "";
  }

  get type() {
    return (this.to) ? "router-link" : "button";
  }

  private get isHyperlink(): boolean {
    var itemData = this.to as unknown;
    var a = document.createElement('a');
    a.href = itemData as string;
    return (a.host && a.host != window.location.host);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.tick-menu-item {
  position: relative;
  //margin: 8px;
  //overflow: hidden;
  text-decoration: none;
  color: inherit;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: background-color 0.5s ease;

  display: flex;

  height: 40px;
  min-height: 40px;
  gap: 12px;
  align-items: center;
  justify-items: center;
  padding-left: 12px;

  &:hover {
    color: var(--c-contrast);
    background-color: var(--c-base);
  }

  .suffix,
  .icon {
    flex-shrink: 0;
    // scale: 1.4;

    &.large {
      width: 20px;
      height: 20px;
    }
  }

  .indicator {
    //position: relative;
    left: 23px;
    top: 4px;
  }

  .content {
    display: inline-flex;
    align-items: center;
    justify-content: left;
    @include font-outfit;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
    flex-grow: 1;
    overflow: hidden;
    max-height: 40px;


    &:first-letter {
      text-transform: capitalize
    }

  }


}

.router-link-active {
  border-style: solid;
  border-color: var(--c-contrast);
}
</style>
