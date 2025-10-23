<template>
  <label class="status-label " :class="statusClass">
    {{ this.statusDescription }}
  </label>
</template>

<script lang="ts">
import { TenantInvoiceStatus, LanguagePath } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { translate } from '@/plugins/translatePlugin';

@Component({
})
export default class InvoiceStatusLabel extends Vue {
  @Prop() private status!: TenantInvoiceStatus;

  private get statusDescription(): string {
    switch (this.status) {
      case TenantInvoiceStatus.Paid: return translate(LanguagePath.App_BillingInvoiceStatusLabel_Paid);
      case TenantInvoiceStatus.Pending: return translate(LanguagePath.App_BillingInvoiceStatusLabel_Pending);
      case TenantInvoiceStatus.ReadyForAutoCollection: return translate(LanguagePath.App_BillingInvoiceStatusLabel_ReadyForAutoCollection);
      case TenantInvoiceStatus.ReadyForManualCollection: return translate(LanguagePath.App_BillingInvoiceStatusLabel_ReadyForManualCollection);
      default: return "-"
    }
  }

  private get statusClass(): string {
    switch (this.status) {
      case TenantInvoiceStatus.Paid: return "paid";
      case TenantInvoiceStatus.Pending: return "pending";
      case TenantInvoiceStatus.ReadyForAutoCollection: return "autocollect";
      case TenantInvoiceStatus.ReadyForManualCollection: return "manualpay";
      default: return "Unknown"
    }
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.status-label {
  padding: 0 4px;
  @include font-inter;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  white-space: nowrap;
  border-radius: 2px;
  transition: all 0.3s ease;
  color: $white;
  background-color: #5a5a5a;



  &.paid {
    background-color: $success;
  }

  &.pending {
    background-color: $brand2;
    color: $black;
  }

  &.autocollect {
    background-color: $brand2;
    color: $black;
  }

  &.manualpay {
    background-color: $brand;

  }
}
</style>
