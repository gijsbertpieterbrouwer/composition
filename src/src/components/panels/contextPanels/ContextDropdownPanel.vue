<template>
  <TickSettingsPanel v-if="hasOptions" :panelOptions="panelOptions" @close="close" :header="false" :noPadding="true">
    <div class="header">
      <div class="title">
        <slot name="title" />{{ this.title }}
      </div>
      <!-- <div class="actions">
        <slot name="actions" />
      </div> -->
    </div>
    <div class="content">

      <div class="list">
        <template v-for="item in this.options" :key="item.id">
          <div v-if="item.type && item.type == DropdownOptionType.spacer" class="item spacer"></div>
          <button v-else class="item" @click="selectItem(item)">
            <TickIcon v-if="item.icon" :name="item.icon" />
            <span class="name">{{ item.text }}</span>
          </button>


        </template>
      </div>
    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import TickInput from "@/components/atoms/TickInput.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { Component, Prop, Vue } from "vue-facing-decorator";

//import TickIcon from "@/components/atoms/TickIcon.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import { DropdownOption, DropdownOptionType } from "@/components/atoms/TickDropdown.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { DropdownActionButton } from "../DropdownPanel.vue";


export function removeContextDropdownPanel() {
  unmount("contextMenu");
}

export function openContextDropdownPanel(e: MouseEvent, options: DropdownOption[], title: string) {
  mount(ContextDropdownPanel, {
    props: {
      mouseEvent: e,
      options: options,
      actionButtons: [],
      title: title,
    },
    events: {
      close: () => {
        removeContextDropdownPanel();
      },
      select: (d: DropdownOption) => {
        return d;
      }
    },
  }, "contextMenu");
}


@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickSettingsPanel,
    TickIcon,
    TickInput,
    TickButton
  },
})
export default class ContextDropdownPanel extends Vue {
  Size = Size;
  Color = Color;
  Appearance = Appearance;
  DropdownOptionType = DropdownOptionType
  @Prop({ default: {} }) private mouseEvent!: MouseEvent;
  @Prop({ default: [] }) private options!: DropdownOption[];
  @Prop({ default: [] }) private actionButtons!: DropdownActionButton[];
  @Prop({ default: "" }) private title: string;

  private get panelOptions(): TickPanelOptions {
    //const from = (this.mouseEvent.target as HTMLElement).getBoundingClientRect();

    return {
      //from: from,
      title: "ContextDropdownPanel",
      x: this.mouseEvent.clientX,
      y: this.mouseEvent.clientY,
    }
  }

  private get hasOptions(): boolean {
    return this.options?.length > 0
  }

  mounted() {
    if (!this.hasOptions) { this.close(); }
  }

  private close() {
    this.$emit("close");
  }
  private selectItem(to: DropdownOption) {
    this.close();
    if (to.onSelect) { to.onSelect(); }
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.header {
  display: flex;
  padding: 10px 10px 0px 10px;

  .title {
    flex-grow: 1;
    @include font-outfit;
    text-transform: uppercase;
    font-size: $text-size-regular;
    font-weight: 600;
    line-height: 20px;
    align-self: center;
  }

  button {
    flex-shrink: 0;
    opacity: 0.6;
  }
}

.list {
  min-width: 200px;
  //border-radius: 4px;
  overflow: hidden;

  .item {
    font-size: $text-size-regular;
    display: flex;
    align-items: center;
    line-height: 16px;
    padding: 10px 12px;
    gap: 8px;
    width: calc(100% + 8px);
    transition: background-color 200ms ease;
    margin: 0 -4px;

    .name {
      display: block;
      flex-grow: 1;
    }

    &:not(.spacer) {
      &:hover {
        color: var(--c-contrast);
        background-color: var(--c-base-300);
      }
    }


    &.spacer {
      height: 1px;
      border-bottom: solid 1px var(--c-menu-border);
      margin-top: 1px;
      margin-bottom: 5px;
    }



  }

}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding-top: 20px;
  padding-bottom: 10px;

}
</style>
