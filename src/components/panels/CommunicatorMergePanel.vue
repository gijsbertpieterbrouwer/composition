<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>{{ $translate(LanguagePath.App_CommunicatorMergePanel_Title) }}</template>

    <template #actions>
    </template>
    <div class="content">
      <CommunicatorIcon :communicator="communicator" :sizePx="30" :showName="true" />

      <!-- <CommunicatorSelector @select="onSelectSlave" :hideChannels="true" :selection="startingSlaveCommunicator" /> -->
      {{ $translate(LanguagePath.App_CommunicatorMergePanel_MergeInto) }}
      <CommunicatorSelector @select="onSelectMaster" :allowAsSubDialog="true" :hideChannels="true" :ignoreCommunicatorIds="ignoreCommunicatorIds" :selectionType="CommunicatorSelectorType.name" />
    </div>
    <template #footer>
      <TickButton @click="startMerge" :busy="busymerging">{{ $translate(LanguagePath.App_CommunicatorMergePanel_Merge_Title) }}</TickButton>
    </template>

  </TickDialogPanel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import TickButton, { Appearance as ButtonAppearance, Size as ButtonSize, Color as ButtonColor, } from "@/components/atoms/TickButton.vue";
import { focus } from "@/directives";
import CommunicatorSelector, { CommunicatorAddressOption, CommunicatorSelectorType } from "../molecules/Selectors/CommunicatorSelector.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { TickCommunicator, TickTicketCommunicator, LanguagePath } from "@/TickApi";
import CommunicatorIcon from "../atoms/CommunicatorIcon.vue";
import useTicketsStore from "@/store/tickets";

export function removeMergeCommunicatorPanel() {
  unmount("mergeCommunicators");
}

export function openMergeCommunicatorPanel(slave: TickCommunicator) {
  mount(CommunicatorMergePanel, {
    props: {
      communicator: slave,
    },
    events: {
      close: () => {
        removeMergeCommunicatorPanel();
      },
      // select: (d: DropdownOption) => {
      //   return d;
      // }
    },
  }, "mergeCommunicators");
}


@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    CommunicatorSelector,
    CommunicatorIcon
  },
})
export default class CommunicatorMergePanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath
  CommunicatorSelectorType = CommunicatorSelectorType

  @Prop() private communicator!: TickCommunicator | TickTicketCommunicator;

  private busymerging = false;
  private masterCommunicatorId = "";
  private masterCommunicatorName = "";

  private get ignoreCommunicatorIds(): string[] {
    return [this.communicator.id]
  }

  private startMerge() {
    useTicketsStore().mergeCommunicator(this.communicator.id, this.masterCommunicatorId, this.masterCommunicatorName).then(() => {

      this.close();
    })
  }

  private onSelectMaster(to: CommunicatorAddressOption) {
    this.masterCommunicatorId = to.communicator?.id;
  }


  private close() {
    this.$emit("close");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 700px;
  display: grid;
  gap: 10px;


}
</style>
