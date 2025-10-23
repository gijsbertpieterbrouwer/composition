<template>
  <template v-if="hasActiveItem">
    Show selected invoice {{ this.selectedItemId }}
    <!-- <DataBagEditor :activeId="selectedItemId" /> -->
  </template>
  <template v-else>
    <TickScreen title="Billing">
      <template v-slot:actions>
        <TickButton v-if="this.isGlobalAdmin" @click="revokeMandate" :color="Color.contrast" :appearance="Appearance.secondary">Cancel automatic payments</TickButton>
      </template>

      <template v-slot:default>

        <TickEditorPanel name="Billing settings">
          <template v-slot:explainer>
            When on a subscription plan we calculate your usage on a daily basis, every billing period an invoice is created and billed.<br /> To not bother you we try to do the payment as easy as
            possible; via a automatic payments mandate.
          </template>

          <br /><br />
          <template v-if="!billingInfo.hasMandate">
            <TickButton @click="createMandate" icon="plus">Create mandate <span class="buttonExtraInfo">(cost 1 cent)</span></TickButton>
          </template>
          <template v-if="billingInfo.hasMandate">
            Billing & payment happens automatically at the first of each month
          </template>

        </TickEditorPanel>

        <TickEditorPanel name="Invoices">


          <template v-if="summaries.length">
            <div class="list">
              <InvoiceListItem :disabled="!editallowed" :data="item" v-for="item in this.summaries" :key="item.id" />

              <!-- <TickListItem @select="downloadInvoicePdf" :clickData="item" icon="download" :name="item.description" v-for="item in this.summaries" :key="item.id" title="Download invoice">

                {{ this.getInvoicePriceDescription(item) }}

                <InvoiceStatusLabel v-if="item.status != TenantInvoiceStatus.ReadyForManualCollection" :status="item.status" />

                <template v-slot:actions>
                  <TickButton @click.stop="startPayInvoice(item)" :appearance="Appearance.primary" :color="Color.contrast" icon="check" title="Pay invoice"
                    v-if="getInvoiceShowPayButton(item)">
                    {{ this.getPayButtonText() }}
                  </TickButton>

                </template>
  </TickListItem> -->
            </div>

          </template>
          <template v-else>
            No invoices yet to show
          </template>

        </TickEditorPanel>
      </template>

    </TickScreen>
  </template>
</template>



<script lang="ts">
import { Component, Vue, Watch } from 'vue-facing-decorator';

import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from '@/components/atoms/TickCheckbox.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import InvoiceStatusLabel from '@/components/molecules/subscription/InvoiceStatusLabel.vue';
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import { toDate } from '@/helpers/dateHelper';
import { notifyError, notifyMessage } from '@/notify';
import { TickRouteParams } from '@/router';
import useSubscriptionStore from '@/store/subscription';
import { AuthorizationObjectType, TenantInvoiceStatus, TickDataBagSummary, TickInvoice } from '@/TickApi';

import InvoiceListItem from '@/components/molecules/subscription/InvoiceListItem.vue';
import { openUrl } from "@/services/urls";
import useUserStore from '@/store/user';

@Component({
  directives: { focus },
  // eslint-disable-next-line no-dupe-keys
  components: { TickButton, TickIcon, TickScreen, TickEditorPanel, TickListItem, TickCheckbox, InvoiceStatusLabel, InvoiceListItem },
})
export default class TickBilling extends Vue {
  TenantInvoiceStatus = TenantInvoiceStatus;
  Appearance = Appearance
  Color = Color
  Size = Size

  private selectedItemId = "";

  private get isGlobalAdmin() {
    return useUserStore().isGlobalAdmin;
  }

  private revokeMandate() {
    if (!confirm("Are you sure? Please only do this when trying to renew your mandate")) { return; }
    useSubscriptionStore().revokeMandate();
  }

  private createMandate() {
    useSubscriptionStore().createMandate().then((d) => {
      notifyMessage("Creating mandate started", "Please continue the process at the bank.")
      if (d && d.paymentProviderLink) {
        // window.open(d.paymentProviderLink, "new");
        openUrl(d.paymentProviderLink);
      } else {
        notifyError("Oops, there is an issue", "It seems something is wrong here, please contact support.")
      }
    });
  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }


  private getCreationDate(item: TickInvoice) {
    return toDate(item.creationDate);
  }


  private get billingInfo() {
    return useSubscriptionStore().billingInfo;
  }

  private get summaries() {
    return useSubscriptionStore().invoices;
  }

  private getPayButtonText() { //item: TickInvoice
    return "Pay invoice"
  }

  // private getInvoicePriceDescription(item: TickInvoice) {
  //   const c = getCurrencyName(item.currency);
  //   return `${item.totalCostIncludingVAT.toFixed(2)} ${c}`;
  // }

  // private getInvoiceIsPending(item: TickInvoice) {
  //   return item.status == TenantInvoiceStatus.Pending;
  // }

  // private getInvoiceShowPayButton(item: TickInvoice) {
  //   return item.status == TenantInvoiceStatus.ReadyForManualCollection;
  // }


  // private getStatusDescription(item: TickInvoice) {
  //   switch (item.status) {
  //     case TenantInvoiceStatus.Paid: return "Paid";
  //     case TenantInvoiceStatus.ReadyForAutoCollection: return "Collected soon via automatic payment";
  //     case TenantInvoiceStatus.ReadyForManualCollection: return "Ready for payment";
  //     case TenantInvoiceStatus.Pending: return "Pending";
  //   }
  // }

  private get editallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace)
  }

  // private downloadInvoicePdf(item: TickInvoice) {
  //   if (!this.editallowed) { return; }
  //   const token = useAppStore().token;
  //   // window.open(`${ApiBaseUrl()}/${URL.getInvoicepdf}/${item.id}?token=${token}`, "_blank")
  //   openUrl(`${ApiBaseUrl()}/${URL.getInvoicepdf}/${item.id}?token=${token}`);
  // }

  private startPayInvoice(item: TickInvoice) {
    if (item.status == TenantInvoiceStatus.Paid) { return; }
    if (item.status == TenantInvoiceStatus.Pending) { return; }

    useSubscriptionStore().manualPayInvoice(item.id).then((d) => {
      notifyMessage("Payment started", "Please continue the process at the bank.")
      if (d && d.paymentProviderLink) {
        //window.open(d.paymentProviderLink, "new");
        openUrl(d.paymentProviderLink);
      } else {
        notifyError("Oops, there is an issue", "It seems something is wrong here, please contact support.")
      }
    });
  }

  mounted() {
    useSubscriptionStore().useInvoices();
    useSubscriptionStore().useBilling();
    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  private selectItem(item: TickDataBagSummary) {
    this.$router.push({ params: { ...this.$route.params, id: item.id } });
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  overflow: hidden;
}

.buttonExtraInfo {
  font-size: 9px;
  margin-left: 10px;
}
</style>
