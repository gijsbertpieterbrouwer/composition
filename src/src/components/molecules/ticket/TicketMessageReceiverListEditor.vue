<template>
  <div class="wrapper">
    <TicketMessageReceiver class="receiver" :item="item" v-for="(item, index) in list" :key="item.communicatorAddressId" @remove="remove(index)" />
    <CommunicatorSelector class="adder" @select="addCommunicatorAddress" :hideChannels="true" :resetAfterSelection="true" :availableCommunicationTypes="availableCommunicationTypes" />
    <!-- <TickButton class="adder" :round="true" icon="plus" :appearance="ButtonAppearance.secondary" :color="ButtonColor.contrast" :size="ButtonSize.mini" /> -->
  </div>
</template>

<script lang="ts">
import TickButton, {
  Appearance as ButtonAppearance,
  Color as ButtonColor,
  Size as ButtonSize,
} from "@/components/atoms/TickButton.vue";
import useUtilityDataStore from "@/store/utilitydata";
import { AddMessageRequestReceiver, CommunicationType, LanguagePath } from "@/TickApi";
import { Component, Prop, VModel, Vue } from "vue-facing-decorator";
import CommunicatorSelector, { CommunicatorAddressOption } from "../Selectors/CommunicatorSelector.vue";
import TicketMessageReceiver from "./TicketMessageReceiver.vue";

@Component({
  emits: ["update:modelValue"],
  components: {
    TickButton, TicketMessageReceiver, CommunicatorSelector
  },
})
export default class TicketMessageReceiverListEditor extends Vue {
  LanguagePath = LanguagePath
  ButtonSize = ButtonSize;
  ButtonAppearance = ButtonAppearance;
  ButtonColor = ButtonColor;

  @VModel() private modelValue!: AddMessageRequestReceiver[];
  @Prop() private disabled!: boolean;

  private get list() {
    return this.modelValue?.filter(p => p.communicationType != CommunicationType.Phone) || [];
  }

  private remove(index: number) {
    this.modelValue.splice(index, 1);
  }

  private get availableCommunicationTypes(): CommunicationType[] {
    return [CommunicationType.Email];
  }

  private addCommunicatorAddress(address: CommunicatorAddressOption) {
    if (!address.communicatorAddressId) { return; }

    const typeChannels = useUtilityDataStore().utilityData.communicationChannels.filter(p => p.communicationType == address.communicationType);
    const otherSameTypeReceivers = this.modelValue.find(p => p.communicationType == address.communicationType);

    let chosenChannel = typeChannels.length == 1
      ? typeChannels[0]
      : otherSameTypeReceivers != null ? otherSameTypeReceivers.communicationChannelId : null;

    if (typeChannels && !chosenChannel) {
      chosenChannel = typeChannels[0];
    }

    if (chosenChannel) {
      this.modelValue.push({
        address: address.communicatorAddress,
        communicationChannelId: typeChannels[0].id,
        communicatorAddressId: address.communicatorAddressId,
        communicatorId: address.communicator.id,
        name: address.communicator.name,
        communicationType: address.communicationType
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  display: inline-flex;
  gap: 10px;

  background-color: var(--c-base-300);
  //color: var(--c-contrast);

  border-radius: 8px;
  padding: 0 4px;
  font-size: $text-size-regular;
  line-height: 16px;
  flex-grow: 1;
  flex-wrap: wrap;
  row-gap: 0px;

  &:not([disabled]):focus {
    border-color: $grey900;
  }

  &[disabled] {
    border-color: $grey200;
    opacity: 0.5;
  }

  .receiver {
    display: inline-flex;

  }

  .adder {
    flex-grow: 1;
    height: 27px;
    overflow: hidden;
  }

}
</style>
