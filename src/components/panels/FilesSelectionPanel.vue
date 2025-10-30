<template>

  <DropdownPanel ref="addButton" v-model="model" @select="select" :noresults="$translate(LanguagePath.App_FilesPanel_NoData)" :options="availableOptions" :panelOptions="panelOptions"
    @action="onActionButtonAction" :actionButtons="filesPanelActionButtons" @close="close">
    <template #title>{{ $translate(LanguagePath.Files) }}</template>
  </DropdownPanel>

</template>

<script lang="ts">
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import { focus } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import { translate } from "@/plugins/translatePlugin";
import useCollectionsStore from "@/store/collections";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { AuthorizationObjectType, FileLink, LanguagePath, WorkspaceFileSummary } from "@/TickApi";
import { ComputedRef } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import { DropdownOption } from "../atoms/TickDropdown.vue";
import FilesUploadPanel from "../molecules/files/FilesUploadPanel.vue";
import DropdownPanel, { DropdownActionButton } from "./DropdownPanel.vue";

@Component({
  directives: { focus },
  emits: ["update:modelValue", "close"],
  components: {

    DropdownPanel,
    FilesUploadPanel
  },
})
export default class FilesSelectionPanel extends Vue {
  LanguagePath = LanguagePath
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private modelValue!: ComputedRef<FileLink>;

  private get model() {
    return this.modelValue;
  }
  private select(to: DropdownOption) {
    const d = to.data as WorkspaceFileSummary;
    this.$emit("update:modelValue", d.link, d);
  }

  private get filesPanelActionButtons(): DropdownActionButton[] {
    const allowAdd = useUserStore().allowedEdit(AuthorizationObjectType.Ticket)

    if (allowAdd) {
      return [
        {
          id: 'add',
          text: translate(LanguagePath.App_Add)
        }
      ]
    } else {
      return [];
    }
  }

  private onActionButtonAction(option: DropdownActionButton) {

    switch (option.id) {
      case 'add':
        //this.startCreateNew();
        //this.close();
        this.togglePanelFor("addButton")
        break;
    }
  }

  private close() {
    this.$emit('close');
  }

  private get availableOptions(): DropdownOption[] {

    let options = this.allItems.map((item) => ({
      text: item.name,
      id: item.id,
      data: item,
    }))

    return options;
  }

  private get allItems() {
    return useUtilityDataStore().utilityData.files;
  }

  private activePanel = {
    group: "",
    panelId: "",
    conditionId: "",
  }

  private togglePanelFor(fromRef: string) {
    const isCurrentActivePanel = (this.activePanel.group === fromRef);
    this.closeActivePanel();

    if (isCurrentActivePanel) {
      return;
    }

    this.activePanel.group = fromRef;
    this.activePanel.panelId = this.openPanel(fromRef, {});
  }


  beforeUnmount() {
    this.closeActivePanel();
  }

  private closeActivePanel() {
    if (this.activePanel.panelId) {
      unmount(this.activePanel.panelId);
    }

    this.activePanel.group = "";
    this.activePanel.panelId = "";

  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openPanel(id: string, props?: Record<string, any>) {
    //const control = getRefElement(this, id);

    return mount(FilesUploadPanel, {
      props: {
        ...props,
      },
      events: {
        exit: () => {
          this.closeActivePanel();
          useCollectionsStore().use();
        },
      }
    });
  }
}


</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>