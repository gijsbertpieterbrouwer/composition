<template>
  <div class="buttons-wrapper">
    <TickButton @click="toggleOpen" ref="toggleButton" v-closable="close" icon="eye" :title="$translate(LanguagePath.App_TicketList_Option_Button_Tooltip)" :appearance="Appearance.transparent"
      :color="Color.contrast" :size="Size.mini"></TickButton>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import { closable } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { TicketFilterOptions, LanguagePath } from "@/TickApi";
import TicketListOptionsEditor from "./TicketListOptionsEditor.vue";

@Component({
  components: { TickButton, TickIcon, TickHeading },
  emits: ["filtersUpdated"],
  directives: { closable },
})
export default class TicketListOptionsButton extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  private showOpen = false;
  private activePanel = "";


  private close() {
    this.showOpen = false;
  }

  private toggleOpen() {
    this.showOpen = !this.showOpen;
    this.togglePanel();
  }


  private togglePanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.activePanel) { return; }

    const panelOptions: TickPanelOptions = {
      title: "TicketListOptionsEditor",
      from: getRefElementDOMRect(this, "toggleButton")
    }

    this.activePanel = mount(TicketListOptionsEditor, {
      props: {
        //data: unref(this.data),
        panelOptions: panelOptions,
      },
      events: {
        close: () => {
          this.closePanel();
        },
        select: (to: TicketFilterOptions) => {
          this.closePanel();
          this.updateFilters(to);
        },
        removeFilters: () => {
          this.closePanel();
          this.removeFilters();
        }
      },
    });
  }

  private removeFilters() {
    this.updateFilters(null)
  }


  private updateFilters(newFilters?: TicketFilterOptions) {
    this.$emit("filtersUpdated", newFilters);
  }
  private closePanel() {
    if (!this.activePanel) { return; }



    unmount(this.activePanel);
    this.activePanel = "";
  }


}
</script>
<style lang="scss" scoped>
@import "@/styles/theme";

.buttons-wrapper {
  display: flex;
  justify-content: right;
}
</style>
