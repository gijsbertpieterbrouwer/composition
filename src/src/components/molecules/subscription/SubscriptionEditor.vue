<template>

  <TickScreen :loading="!loaded" title="Subscription plan">
    <template v-slot:actions>
      <TickButton v-if="this.isGlobalAdmin" icon="delete" @click="openRemoveTenantPanel" :appearance="Appearance.secondary" :color="Color.failure">{{
        $translate(LanguagePath.App_SubscriptionEditor_RemoveTenant_Title) }}
      </TickButton>
    </template>

    <template v-slot:default>
      <div class="wrapper">
        <div class="plans">
          <SubscriptionPlanItem @select="selectPlan(plan)" :plan="plan" v-for="plan in this.plans" :key="plan.id" />
        </div>

        <div class="plan-benefits">
          <table class="styledTable odd-even ">
            <thead>
              <tr>
                <th>{{ $translate(LanguagePath.App_Description) }}</th>
                <th class="numeric">{{ $translate(LanguagePath.Credits) }}</th>
                <th class="numeric">{{ $translate(LanguagePath.Max) }}</th>
              </tr>
            </thead>
            <tbody>
              <PlanDataNumericItem :item="item" :credit="getCostItemCredit(item)" v-for="(item, index) in this.selectedPlanDataItems" :key="index" />
            </tbody>

          </table>
        </div>

        <template v-if="selectedPlanRequiresPayment">
          <div class="plan-items">
            <BillingPlanBaseItem :currency="selectedPlanCurrency" :title="billingTitle" :breakdown="billingBreakdown" :description="billingDescription" />

            <!-- <div class="credits">
              <PlanCreditItem :item="item" v-for="(item, index) in this.selectedPlanCreditItems" :key="index" />
            </div> -->

            <div class="billing-items">
              <BillingPlanNumericItem :currency="selectedPlanCurrency" :item="item" v-for="(item, index) in this.selectedPlanBillingItems" :key="index" />
            </div>

            <div class="billing-explanation">
              {{ this.billingExplanation }}
            </div>
          </div>

        </template>
        <template v-else-if="selectedPlanIsCustom">
          <div class="billing-explanation">{{ $translate(LanguagePath.App_SubscriptionEditor_CustomPlanSelected_Explanation) }}</div>
        </template>

        <template v-else>
          <div class="billing-explanation">
            {{ $translate(LanguagePath.App_SubscriptionEditor_FreeLanSelected_Explanation) }}
          </div>
        </template>


        <div class="inputs" v-if="selectedPlanRequiresPayment && this.showStartPlanButton">
          <TickInput v-model="billingName"> {{ $translate(LanguagePath.App_SubscriptionEditor_BillingName_Title) }}</TickInput>
          <TickInput v-model="billingEmail">{{ $translate(LanguagePath.App_SubscriptionEditor_BillingEmail_Title) }}</TickInput>
        </div>
        <TickButton v-if="showStartPlanButton" @click="startSubscription" class="startPaymentButton" :busy="busySubscribing" :appearance="Appearance.primary" :size="Size.XXL">{{
          this.startSubscriptionButtonText }}</TickButton>


      </div>

    </template>
  </TickScreen>

</template>


<script lang="ts">
import TickButton, { Appearance, Color, Size, } from '@/components/atoms/TickButton.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import TenantRemovePanel from '@/components/panels/TenantRemovePanel.vue';
import { getBillingCalculationPeriodName, getBillingPeriodName, GetCostItemSortOrder, getCurrencyName } from '@/helpers/enumsHelper';
import { unlimited } from '@/helpers/guid';
import { mount, unmount } from '@/helpers/mountHelper';
import { translate } from '@/plugins/translatePlugin';
import { openUrl } from '@/services/urls';
import useSubscriptionStore from '@/store/subscription';
import useUserStore from '@/store/user';
import { LanguagePath, SubscriptionActivationStatus, SubscriptionCostItemType, TenantSubscriptionPlanNumericItem, TickSubscribeRequest, TickSubscriptionPlan } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';
import BillingPlanBaseItem from './BillingPlanBaseItem.vue';
import BillingPlanNumericItem from './BillingPlanNumericItem.vue';
import PlanCreditItem from './PlanCreditItem.vue';
import PlanDataNumericItem from './PlanDataNumericItem.vue';
import SubscriptionPlanItem from './SubscriptionPlanItem.vue';

@Component({ components: { TickScreen, TickEditorPanel, BillingPlanNumericItem, TickButton, BillingPlanBaseItem, TickInput, SubscriptionPlanItem, PlanDataNumericItem, PlanCreditItem } })
export default class SubscriptionEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  private activePanel = "";
  private billingEmail = "";
  private billingName = "";
  private busySubscribing = false;

  private get isGlobalAdmin() {
    return useUserStore().isGlobalAdmin;
  }

  private get loaded() {
    return this.savedSelectedPlan != null;
  }

  private get showStartPlanButton() {
    if (!this.isGlobalAdmin) { return false; }

    var saved = this.savedSelectedPlan;
    var selected = this.selectedPlan;

    if (saved == null) { return true; }
    if (selected == null) { return false; }

    if (saved.id == selected.id) {
      return false;
    }

    if (!selected.allowSubscribe) {
      return false;
    }

    return true;
  }

  private getCostItemCredit(item: TenantSubscriptionPlanNumericItem) {
    return this.selectedPlanCreditItems.find(p => p.type == item.type);
  }

  private get billingTitle() {
    return translate(LanguagePath.App_SubscriptionEditor_PlanName_Title);
  }
  private get billingBreakdown() {
    return translate(LanguagePath.App_SubscriptionEditor_BillingBreakdown_Title, [
      { path: 'baseCost', value: this.selectedPlan?.baseCost.toString() },
      { path: 'currencyName', value: this.billingCurrencyName },
      { path: 'periodName', value: getBillingCalculationPeriodName(this.selectedPlan?.baseCostCalculationPeriod) },
    ]) //`${this.selectedPlan?.baseCost} ${this.billingCurrencyName} per ${getBillingCalculationPeriodName(this.selectedPlan?.baseCostCalculationPeriod)}`;
  }

  private get billingDescription() {
    return translate(LanguagePath.App_SubscriptionEditor_BillingDescription, { path: 'name', value: this.selectedPlan?.name });
  }

  private get billingExplanation() {
    return translate(LanguagePath.App_SubscriptionEditor_BillingPeriodExplanation, { path: 'period', value: getBillingPeriodName(this.selectedPlan?.billingPeriod) });
  }

  private get billingCurrencyName() {
    return getCurrencyName(this.selectedPlan?.currency);
  }

  private get screenSubtitle() {
    return translate(LanguagePath.App_SubscriptionEditor_CurrentPlan_BillingDescription, { path: 'name', value: this.savedSelectedPlan?.name });
  }
  private get savedSelectedPlan() {
    return this.plans.find(p => p.id == this.subscription.savedPlanId);
  }

  private get startSubscriptionButtonText() {
    return translate(LanguagePath.App_SubscriptionEditor_StartPlan_Button_Title);
  }

  // private get hasAutoPaymentMandate() {
  //   return this.subscription.hasAutoPaymentMandate || false;
  // }


  private selectPlan(plan: TickSubscriptionPlan) {
    if (this.plans?.length == 1) { return; }


    this.selectedPlan.selected = false;
    let newlySelected = this.plans.find(p => p.id == plan.id)

    newlySelected.selected = true;
  }

  private get selectedPlanIsCustom(): boolean {
    return this.selectedPlan?.hasCustomBaseCost;
  }

  private get selectedPlanRequiresPayment() {
    return this.selectedPlan?.baseCost != null && !this.selectedPlan.hasCustomBaseCost;
  }

  private get selectedPlanCurrency() {
    return this.selectedPlan?.currency;
  }

  private get selectedPlanCreditItems() {
    return this.selectedPlan ?
      this.selectedPlan.billingPlan != null ? (this.selectedPlan.planData?.credits || []) : []
      : [];
  }

  private get selectedPlanBillingItems() {
    return this.selectedPlan?.billingPlan != null ? (this.selectedPlan?.billingPlan.numerics || []) : [];
  }
  private get selectedPlanDataItems() {
    const items = this.selectedPlan?.planData != null ? (this.selectedPlan?.planData.numerics || []) : [];
    const forbidden = [SubscriptionCostItemType.MaxFileSize, SubscriptionCostItemType.Seats, SubscriptionCostItemType.FlowsAction];
    const selectedItems = items.filter(p => !forbidden.some(a => a == p.type) && (p.value == unlimited || p.value > 0));

    var sortOrder = GetCostItemSortOrder();

    return selectedItems.sort(
      function (a, b) {
        return sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type);
      }
    );
  }


  private get selectedPlan() {
    return this.plans.find(p => p.selected);
  }

  private get plans() {

    const plans = (this.subscription?.plans || []).filter(p => p.allowSubscribe || p.id == this.subscription.savedPlanId) || [];
    return plans.sort(function (a, b) {
      return a.indexWeight - b.indexWeight;
    });
  }

  private get subscription() {
    return useSubscriptionStore().subscription;
  }

  private startSubscription() {

    const req: TickSubscribeRequest = {
      planId: this.selectedPlan?.id,
      billingEmail: this.billingEmail,
      billingName: this.billingName,
    }
    this.busySubscribing = true;
    useSubscriptionStore().subscribe(req).then((data) => {
      useSubscriptionStore().use();
      this.busySubscribing = false;

      if (data.status == SubscriptionActivationStatus.NeedsPaymentProviderVerification) {
        // window.open(data.paymentProviderLink, "new");
        openUrl(data.paymentProviderLink);
      }
    });
  }

  mounted() {
    useSubscriptionStore().use();
  }





  private openRemoveTenantPanel() {
    this.togglePanel();
  }

  private togglePanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.activePanel) {
      return;
    }

    this.activePanel = mount(TenantRemovePanel, {
      props: {
      },
      events: {
        close: () => {
          this.closePanel();
        },
      },
    });
  }

  private closePanel() {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.planExplainer {
  padding: 10px;
  font-style: NORMAL;
  font-size: $text-size-regular;

}

.plans {
  display: flex;
  gap: 30px;
  justify-content: center;

}

.plan-benefits {
  padding: 10px;
  background-color: var(--c-base-100);
  border-radius: 8px;

  th {
    font-size: 14px;
    font-weight: 600;
  }

  tr {
    height: 37px;
  }

  th,
  tr:not(:last-child) {
    border-bottom: 1pt solid var(--c-base-300);
  }
}

.plan-items {
  background-color: var(--c-base-100);
  border-radius: 8px;
}

.billing-explanation {
  padding: 10px;
  font-style: normal;
  opacity: 0.7;
}

.startPaymentButton {
  margin-top: 10px;
}

.remove-tenant-wrapper {
  margin-top: 30px;
}

.inputs {}

.wrapper {
  display: grid;
  gap: 20px;
  padding-bottom: 50px;
}
</style>
