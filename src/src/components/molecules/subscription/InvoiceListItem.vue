<template>
  <TickListItem @select="downloadInvoicePdf" :clickData="item" icon="download" :name="item.description" :title="itemTitle">
    {{ this.getInvoicePriceDescription }}

    <InvoiceStatusLabel v-if="item.status != TenantInvoiceStatus.ReadyForManualCollection" :status="item.status" />

    <template v-slot:actions>
      <TickButton @click.stop="startPayInvoice" :appearance="Appearance.primary" :color="Color.contrast" icon="check" :title="$translate(LanguagePath.App_BillingInvoiceListItem_PayButton_Tooltip)"
        v-if="getInvoiceShowPayButton">
        {{ this.getPayButtonText }}
      </TickButton>

    </template>
  </TickListItem>
</template>


<script lang="ts">
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import { getCurrencyName } from '@/helpers/enumsHelper';
import { notifyError, notifyMessage } from '@/notify';
import { translate } from '@/plugins/translatePlugin';
import URL, { ApiBaseUrl, openUrl } from "@/services/urls";
import useAppStore from '@/store/app';
import useSubscriptionStore from '@/store/subscription';
import { LanguagePath, TenantInvoiceStatus, TickInvoice } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import InvoiceStatusLabel from './InvoiceStatusLabel.vue';

@Component({ components: { TickListItem, TickButton, InvoiceStatusLabel } })
export default class InvoiceListItem extends Vue {
  TenantInvoiceStatus = TenantInvoiceStatus
  Appearance = Appearance
  Color = Color
  LanguagePath = LanguagePath
  @Prop() private data!: TickInvoice;
  @Prop() private disabled!: boolean;

  private get itemTitle() {
    return this.disabled
      ? translate(LanguagePath.App_BillingInvoiceListItem_Download_OnlyForTenant_Title)
      : translate(LanguagePath.App_BillingInvoiceListItem_Download_Title);
  }

  private get item() {
    return this.data;
  }
  private get getPayButtonText() { //item: TickInvoice
    return translate(LanguagePath.App_BillingInvoiceListItem_PayButton_Title);
  }

  private startPayInvoice() {
    if (this.item.status == TenantInvoiceStatus.Paid) { return; }
    if (this.item.status == TenantInvoiceStatus.Pending) { return; }

    useSubscriptionStore().manualPayInvoice(this.item.id).then((d) => {
      notifyMessage("Payment started", "Please continue the process at the bank.")
      if (d && d.paymentProviderLink) {
        //window.open(d.paymentProviderLink, "new");
        openUrl(d.paymentProviderLink);
      } else {
        notifyError("Oops, there is an issue", "It seems something is wrong here, please contact support.")
      }
    });
  }


  private downloadInvoicePdf() {
    if (this.disabled) { return; }
    const token = useAppStore().token;
    openUrl(`${ApiBaseUrl()}/${URL.getInvoicePdf}/${this.item.id}?token=${token}`);
  }


  private get getInvoicePriceDescription() {
    const c = getCurrencyName(this.item.currency);
    return `${this.item.totalCostIncludingVAT.toFixed(2)} ${c}`;
  }

  // private get getInvoiceIsPending() {
  //   return this.item.status == TenantInvoiceStatus.Pending;
  // }

  private get getInvoiceShowPayButton() {
    if (this.disabled) { return false; }
    return this.item.status == TenantInvoiceStatus.ReadyForManualCollection;
  }


  // private get getStatusDescription() {
  //   switch (this.item.status) {
  //     case TenantInvoiceStatus.Paid: return "Paid";
  //     case TenantInvoiceStatus.ReadyForAutoCollection: return "Collected soon via automatic payment";
  //     case TenantInvoiceStatus.ReadyForManualCollection: return "Ready for payment";
  //     case TenantInvoiceStatus.Pending:
  //     default: return "Pending";
  //   }
  // }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
