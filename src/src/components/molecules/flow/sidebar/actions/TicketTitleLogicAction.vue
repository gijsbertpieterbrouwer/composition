<template>
  <div class="action">
    <SidebarPanel id="ticket-rename" :name="$translate(LanguagePath.App_FlowEditor_SideBar_RenameTicket_Ticket)">

      <TickInput v-model.lazy="title" :disabled="disabled" v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }" />
    </SidebarPanel>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';

import StorageInput from "@/components/molecules/flow/sidebar/actions/molecules/StorageInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import { FlowDefinitionAction, LabelActionType, LanguagePath, StorageLocation, TicketLogicTitleActionData } from "@/TickApi";
import { TicketLabelsLogicActionSettings } from "@/TickApiModels";
import { jsonProxy } from "@/helpers/jsonProxy";

import LabelList from "@/components/atoms/LabelList.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import { getFlowReadStorageLocations } from '@/helpers/enumsHelper';
import { tokenize } from '@/directives';
@Component({
  directives: { tokenize },
  emits: [],
  components: { SidebarPanel, StorageInput, TickIcon, TickCheckbox, TickTextarea, LabelList, TickDropdown, TickInput },
})
export default class TicketTitleLogicAction extends Vue {
  LabelActionType = LabelActionType;
  StorageLocation = StorageLocation;
  LanguagePath = LanguagePath
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: TicketLabelsLogicActionSettings;
  @Prop() private disabled!: boolean;

  private get readLocations() {
    return getFlowReadStorageLocations();
  }


  private get data() {
    return jsonProxy<TicketLogicTitleActionData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private get title() {
    return this.data.title || "";
  }

  private set title(to: string) {
    this.data.title = to;
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
