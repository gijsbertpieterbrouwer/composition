<template>
  <div class="buttons-wrapper">
    <TickButton @click="toggleOpen" ref="toggleButton" v-closable="close" icon="filter" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini" :indicator="filterIndicator"> {{
      $translate(LanguagePath.App_Ticket_Filter_Button) }}</TickButton>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import { closable } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { unref } from "vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import TicketFiltersEditor from "./TicketFiltersEditor.vue";
import { ColorsEnum, LanguagePath, TicketFilterOptions } from "@/TickApi";
import { TickIndicatorData } from "@/components/atoms/TickIndicator.vue";
import { getActiveFiltersNr } from "@/helpers/ticketHelper";
import { translate } from "@/plugins/translatePlugin";


@Component({
  components: { TickButton, TickIcon, TickHeading },
  emits: ["filtersUpdated"],
  directives: { closable },
})
export default class TicketFiltersButton extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop({ required: true }) private data!: TicketFilterOptions;

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
      title: "TicketFiltersEditor",
      from: getRefElementDOMRect(this, "toggleButton")
    }

    this.activePanel = mount(TicketFiltersEditor, {
      props: {
        data: unref(this.data),
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
  justify-content: left;
  //width: 100%;

}
</style>
