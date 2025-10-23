<template>
  <DropdownPanel v-model="model" @action="onActionButtonAction" @select="select" :options="availableOptions" :actionButtons="actionButtons" :panelOptions="panelOptions" @close="$emit('close')">
    <template #title>{{ $translate(LanguagePath.CannedResponses) }}</template>
  </DropdownPanel>
</template>

<script lang="ts">
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import CannedResponseCreatorPanel from "@/components/panels/CannedResponseCreatorPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import { translate } from '@/plugins/translatePlugin';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import useUtilityDataStore from "@/store/utilitydata";
import { LanguagePath, TickCannedResponseDefinition } from "@/TickApi";
import { ComputedRef } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import { DropdownOption } from "../atoms/TickDropdown.vue";
import TickIcon from "../TickIcon.vue";
import DropdownPanel, { DropdownActionButton } from "./DropdownPanel.vue";
import PanelReduceSwitch from "./PanelReduceSwitch.vue";

@Component({
  directives: { focus },
  emits: ["update:modelValue", "close"],
  components: {
    TickSettingsPanel,
    TickIcon,
    TickInput,
    PanelReduceSwitch,
    DropdownPanel,
    CannedResponseCreatorPanel
  },
})
export default class CannedResponsesPanel extends Vue {
  LanguagePath = LanguagePath
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private modelValue!: ComputedRef<string>;

  private activePanel = "";


  private get model() {
    return this.modelValue;
  }
  private select(to: DropdownOption) {
    this.$emit("update:modelValue", to.id);
  }

  private get availableOptions(): DropdownOption[] {
    let options = this.allItems.map((item) => ({
      text: item.name,
      id: item.id,
    }))

    return options;
  }

  private get allItems() {
    return useUtilityDataStore().utilityData.cannedResponseDefinitions;
  }

  private get actionButtons(): DropdownActionButton[] {
    return [
      {
        id: 'add',
        text: translate(LanguagePath.App_Add),
      }
    ]
  }

  private onActionButtonAction(option: DropdownActionButton) {
    switch (option.id) {
      case 'add':
        this.startCreateNew();
        break;
    }
  }



  private startCreateNew() {
    useManagingStore().addCannedResponse().then((newItem) => {
      useUtilityDataStore().use(useUserStore().activeWorkspaceId);
      this.togglePanel(newItem);
    })
  }

  private togglePanel(item: TickCannedResponseDefinition) {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel(item);
    }
  }

  private openPanel(item: TickCannedResponseDefinition) {
    if (this.activePanel) { return; }

    this.activePanel = mount(CannedResponseCreatorPanel, {
      props: {
        selectedItemId: item.id,
      },
      loadComponents: [],
      events: {
        close: (newCannedResponseId?: string) => {
          this.closePanel();
          if (newCannedResponseId) {
            this.select({
              id: newCannedResponseId,
              text: "",
            })
          }
        },
      },
    });
  }


  private closePanel() {
    unmount(this.activePanel);
    this.activePanel = "";
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
