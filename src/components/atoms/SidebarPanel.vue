<template>
  <div class="panel" :class="openClass">
    <div class="header">

      <TickButton v-if="canToggleOpen" @click="toggleOpen" :title="toggleTitle" class="opener" :icon="openerIcon" :appearance="Appearance.transparent" :round="true" :class="openClass" />
      <TickHeading class="title" :size="Size.small">{{ this.name }} <span class="state">{{ this.stateTitle }}</span></TickHeading>

      <div class="content">
        <slot name="header" />
      </div>
    </div>
    <div class="subheader" :class="openClass">
      <slot name="subheader" />
    </div>
    <div class="content" :class="openClass">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { LanguagePath } from '@/TickApi';
import TickIcon from '@/components/TickIcon.vue';
import TickHeading, { Size } from '@/components/atoms/TickHeading.vue';
import { stringIsNullOrEmpty } from '@/helpers/stringHelper';
import { translate } from '@/plugins/translatePlugin';
import useViewstateStore, { InterfaceStateType } from '@/store/viewstate';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickButton, { Appearance, Color } from './TickButton.vue';
@Component({
  emits: ["action", "toggle"],
  components: { TickIcon, TickHeading, TickButton }
})
export default class SidebarPanel extends Vue {
  Size = Size
  Appearance = Appearance
  Color = Color
  @Prop({ default: '' }) private name!: string;
  @Prop({ default: '' }) private id!: string;

  private get toggleTitle() {
    if (!this.canToggleOpen) { return ""; }
    return this.showCollapsed ? translate(LanguagePath.APP_SidebarPanel_Open_Title) : translate(LanguagePath.APP_SidebarPanel_Close_Title);
  }

  private get canToggleOpen() {
    return !stringIsNullOrEmpty(this.id);
  }
  private get stateTitle(): string {
    return this.showCollapsed ? `(${translate(LanguagePath.APP_SidebarPanel_Closed_Title).toLowerCase()}) ` : "";
  }


  private get showCollapsed() {
    if (!this.canToggleOpen) { return false; }
    return useViewstateStore().has(InterfaceStateType.SidebarPanelCollapsed, this.id);
  }

  private toggleOpen() {
    useViewstateStore().toggle(InterfaceStateType.SidebarPanelCollapsed, this.id);
    this.$emit("toggle");
  }

  private get openerIcon() {
    return "chevron-down";
  }

  private get openClass() {
    return !this.showCollapsed ? "open" : "closed";
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.opener {
  &.open {
    transform: rotate(-360deg);
    transition: transform 150ms ease;
  }

  &.closed {
    transform: rotate(-180deg);
    transition: transform 150ms ease;
  }
}



.panel {
  margin-bottom: 50px;
  margin-top: 10px;
  display: grid;
  gap: 5px;
  padding: 1px; //used for border



  &.open {}

  &.closed {
    margin-bottom: 10px;
    transition: 150ms ease;


  }


  .header {
    display: flex;
    flex-wrap: nowrap;
    gap: 5px;
    justify-content: center;

    .state {
      opacity: 0.7;
      font-size: 0.7em;
    }

    .title {
      flex-grow: 1;
    }

    .content {
      // min-width: 55px;
    }
  }

  .subheader {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    font-size: 0.7em;
    //opacity: 0.7;

    &.open {}

    &.closed {
      display: none;
    }
  }

  .content {
    display: grid;
    gap: 10px;
    padding-left: 0px;

    &.open {}

    &.closed {
      display: none;
    }



  }
}
</style>
