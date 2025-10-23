<template>
  <TickDropdown v-if="allowAdd" :options="options" @select="addItem" :indicator="this.indicator" :busy="this.busy" :icon="this.icon" :placeholder="$translate(title)"></TickDropdown>
</template>

<script lang="ts">
import { AuthorizationObjectType, LanguagePath, SubscriptionCostItemType } from "@/TickApi";
import { unlimited } from "@/helpers/guid";
import { askConfirmation } from "@/helpers/questionHelper";
import { translate } from "@/plugins/translatePlugin";
import { RouterToSubscription } from "@/router";
import useUserStore from "@/store/user";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickIcon from "../TickIcon.vue";
import BusyIndicator from "./BusyIndicator.vue";
import { getCostItemIndicator } from "./TickAddCostItemButton.vue";
import TickDropdown, { DropdownOption } from "./TickDropdown.vue";
import TickIndicator, { TickIndicatorData } from "./TickIndicator.vue";

@Component({
  emits: ["add"],
  components: { BusyIndicator, TickIcon, TickIndicator, TickDropdown },
})
export default class TickAddCostItemDropdownButton extends Vue {
  @Prop({ default: [] }) private options!: DropdownOption[];
  @Prop() private title!: LanguagePath;
  @Prop({ default: false }) private disabled: boolean;
  @Prop({ required: true }) private requiredAuth: AuthorizationObjectType;
  @Prop({ required: true }) private costItem: SubscriptionCostItemType;
  @Prop({ required: true }) private currentNr: number;
  @Prop({ required: false }) private busy: boolean;
  @Prop({ required: false }) private icon: string;


  private get allowAdd() {
    return useUserStore().allowedEdit(this.requiredAuth) && this.addAllowedInPlan;
  }

  private get addAllowedInPlan() {
    return useUserStore().allowedAddInPlan(this.costItem, this.currentNr)
  }

  private addItem(option) {
    if (this.disabled) { return; }

    if (!this.hasRoomToAdd) {
      this.onTryAddNoRoom(); return;
    }

    if (!this.allowAdd) { return; }
    this.$emit("add", option);
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
