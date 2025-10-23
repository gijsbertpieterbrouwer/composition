<template>
  <TickButton @click="addItem" :indicator="this.indicator" :busy="this.busy" :icon="this.icon" :appearance="this.appearance" :color="this.color" :size="this.size">{{ $translate(title)
  }}</TickButton>
</template>

<script lang="ts">
import { AuthorizationObjectType, ColorsEnum, LanguagePath, SubscriptionCostItemType } from "@/TickApi";
import { unlimited } from "@/helpers/guid";
import { askConfirmation } from "@/helpers/questionHelper";
import { translate } from "@/plugins/translatePlugin";
import { RouterToSubscription } from "@/router";
import useUserStore from "@/store/user";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickIcon from "../TickIcon.vue";
import BusyIndicator from "./BusyIndicator.vue";
import { Appearance, Color, Size } from "./TickButton.vue";
import TickIndicator, { TickIndicatorData } from "./TickIndicator.vue";


export function getCostItemIndicator(maxInPlan: number, currentNr: number): TickIndicatorData {

  if (maxInPlan == unlimited) {
    return null;
  } // unlimited, no need to say

  const percentageUsed = Math.round((currentNr / maxInPlan) * 100);

  if (maxInPlan <= currentNr) {
    return {
      title: `${currentNr}/${maxInPlan}`,
      color: ColorsEnum.Red,
    }
  }

  if (percentageUsed > 75) {
    return {
      title: `${currentNr}/${maxInPlan}`,
      color: ColorsEnum.Lime,
    }
  } else {
    return null;
  }
}


@Component({
  emits: ["add"],
  components: { BusyIndicator, TickIcon, TickIndicator },
})
export default class TickAddCostItemButton extends Vue {

  @Prop() private title!: LanguagePath;
  @Prop({ default: false }) private disabled: boolean;
  @Prop({ required: true }) private requiredAuth: AuthorizationObjectType;
  @Prop({ required: true }) private costItem: SubscriptionCostItemType;
  @Prop({ required: true }) private currentNr: number;
  @Prop({ required: false }) private busy: boolean;
  @Prop({ required: false }) private icon: string;
  @Prop() private appearance: Appearance;
  @Prop() private color: Color;
  @Prop() private size: Size;

  private get allowAdd() {
    return useUserStore().allowedEdit(this.requiredAuth) && this.addAllowedInPlan;
  }

  private get addAllowedInPlan() {
    return useUserStore().allowedAddInPlan(this.costItem, this.currentNr)
  }

  private addItem() {
    if (this.disabled) { return; }

    if (!this.hasRoomToAdd) {
      this.onTryAddNoRoom(); return;
    }

    if (!this.allowAdd) { return; }
    this.$emit("add");
  }

  private get maxInPlan(): number {
    return useUserStore().maxAllowedInPlan(this.costItem);
  }

  private get hasRoomToAdd() {
    return this.maxInPlan == unlimited || this.maxInPlan > this.currentNr;
  }

  private get indicator(): TickIndicatorData {
    return getCostItemIndicator(this.maxInPlan, this.currentNr);
  }

  private onTryAddNoRoom() {
    askConfirmation((to: boolean) => {
      if (to) { RouterToSubscription(); }

    }, translate(LanguagePath.App_AddCostItemButton_RouterToSubscription_Confirmation), true)
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
