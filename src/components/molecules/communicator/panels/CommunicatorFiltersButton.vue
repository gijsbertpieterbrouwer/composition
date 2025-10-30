<template>
  <div class="buttons-wrapper">
    <TickButton @click="toggleOpen" ref="toggleButton" v-closable="close" icon="filter" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini" :indicator="filterIndicator">{{
      $translate(LanguagePath.App_TaskList_Filter_Button) }}</TickButton>
  </div>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import { TickIndicatorData } from "@/components/atoms/TickIndicator.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { closable } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { getActiveFiltersNr } from "@/helpers/taskHelper";
import { translate } from "@/plugins/translatePlugin";
import { ColorsEnum, CommunicatorFilterOptions, LanguagePath } from "@/TickApi";
import { unref } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import CommunicatorFiltersEditor from "./CommunicatorFiltersEditor.vue";

@Component({
  components: { TickButton, TickIcon, TickHeading },
  emits: ["filtersUpdated"],
  directives: { closable },
})
export default class CommunicatorFiltersButton extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop({ required: true }) private data!: CommunicatorFilterOptions;

  private showOpen = false;
  private activePanel = "";

  private close() {
    this.showOpen = false;
  }

  private toggleOpen() {
    this.showOpen = !this.showOpen;
    this.togglePanel();
  }

  private get hasActiveFilters() {
    return this.activeFiltersNr > 0;
  }

  private get activeFiltersNr() {
    return getActiveFiltersNr(this.data);
  }

  private get filterIndicator(): TickIndicatorData {
    let nrOfFilters = this.activeFiltersNr;
    const title = nrOfFilters > 1 ? translate(LanguagePath.App_FilterIndicator_Title_Multi, [{ path: 'nr', value: nrOfFilters.toString() }]) : translate(LanguagePath.App_FilterIndicator_Title_Single, [{ path: 'nr', value: nrOfFilters.toString() }]);

    return nrOfFilters > 0 ? {
      color: ColorsEnum.Black,
      title: title,
      tooltip: title
    } : null;
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
      title: "CommunicatorFiltersEditor",
      from: getRefElementDOMRect(this, "toggleButton")
    }

    this.activePanel = mount(CommunicatorFiltersEditor, {
      props: {
        data: unref(this.data),
        panelOptions: panelOptions,
      },
      events: {
        close: () => {
          this.closePanel();
        },
        select: (to: CommunicatorFilterOptions) => {
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


  private updateFilters(newFilters?: CommunicatorFilterOptions) {
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
  justify-content: left;
}
</style>
