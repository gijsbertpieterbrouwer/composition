<template>
  <div class="action">
    <SidebarPanel id="ticket-general" :name="$translate(LanguagePath.App_FlowEditor_SideBar_CompleteTicket_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_CompleteTicket_Explanation) }}
      </template>
      <TickSwitch class="finish-checkbox" v-model="finishTicket" :disabled="disabled" :trueAsSuccess="true">
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_CompleteTicket_Confirm) }}
      </TickSwitch>
    </SidebarPanel>

    <DocuHolder class="docuHolder" :group="docuBlocks" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';

import StorageInput from "@/components/molecules/flow/sidebar/actions/molecules/StorageInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import { DocumentationGroup, FlowDefinitionAction, LanguagePath, TicketLogicSettingsData } from "@/TickApi";
import { TicketLogicActionSettings } from "@/TickApiModels";
import { jsonProxy } from "@/helpers/jsonProxy";
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import DocuHolder from '@/components/molecules/docublocks/DocuHolder.vue';
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";


@Component({
  emits: ["remove", "update"],
  components: { SidebarPanel, DocuHolder, StorageInput, TickIcon, TickCheckbox, TickTextarea, TickSwitch },
})
export default class TicketLogicAction extends Vue {
  LanguagePath = LanguagePath

  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: TicketLogicActionSettings;
  @Prop() private disabled!: boolean;

  private get docuBlocks(): DocumentationGroup[] {
    const r: DocumentationGroup[] = []
    r.push(DocumentationGroup.TicketLifecycle)
    return r;
  }

  private get data() {
    return jsonProxy<TicketLogicSettingsData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private set finishTicket(to: boolean) {
    this.data.finishTicket = to;
  }

  private get finishTicket() {
    return this.data.finishTicket == true;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.docuHolder {
  height: auto;
  margin-top: 100px;
}
</style>
