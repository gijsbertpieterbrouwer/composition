<template>
  <TickFocusScreen>
    <template v-if="hasActiveItem">
      Show selected invoice {{ selectedItemId }}
      <!-- <DataBagEditor :activeId="selectedItemId" /> -->
    </template>
    <template v-else>
      <TickScreen title="Billing">
        <template v-slot:actions>
          <TickButton v-if="isGlobalAdmin" @click="revokeMandate" :color="TickButtonColor.contrast" :appearance="TickButtonAppearance.secondary">Cancel automatic payments</TickButton>
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
                <InvoiceListItem :disabled="!editallowed" :data="item" v-for="item in summaries" :key="item.id" />

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
  </TickFocusScreen>
</template>

<script setup lang="ts">
import TickButton from "@/components/atoms/TickButton.vue";
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import { toDate } from '@/helpers/dateHelper';
import { notifyError, notifyMessage } from '@/notify';
import { TickRouteParams } from '@/router';
import useSubscriptionStore from '@/store/subscription';
import { AuthorizationObjectType, TenantInvoiceStatus, TickDataBagSummary, TickInvoice } from '@/TickApi';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import InvoiceListItem from '@/components/molecules/subscription/InvoiceListItem.vue';
import { TickButtonAppearance, TickButtonColor } from '@/helpers/enumsHelper';
import { openUrl } from "@/services/urls";
import useUserStore from '@/store/user';

const route = useRoute();
const router = useRouter();

const subscriptionStore = useSubscriptionStore();
const userStore = useUserStore();
const selectedItemId = ref<string | undefined>("");

const isGlobalAdmin = computed(() => userStore.isGlobalAdmin);

const revokeMandate = () => {
  if (!confirm("Are you sure? Please only do this when trying to renew your mandate")) { return; }
  subscriptionStore.revokeMandate();
};

const createMandate = () => {
  subscriptionStore.createMandate().then((d) => {
    notifyMessage("Creating mandate started", "Please continue the process at the bank.");
    if (d && d.paymentProviderLink) {
      openUrl(d.paymentProviderLink);
    } else {
      notifyError("Oops, there is an issue", "It seems something is wrong here, please contact support.");
    }
  });
};

const hasActiveItem = computed(() => !!selectedItemId.value && selectedItemId.value !== "");

const getCreationDate = (item: TickInvoice) => {
  return toDate(item.creationDate ?? new Date());  // Safe default
};

const billingInfo = computed(() => subscriptionStore.billingInfo);

const summaries = computed(() => subscriptionStore.invoices ?? []);

const getPayButtonText = () => "Pay invoice";  // Unchanged

const editallowed = computed(() => userStore.allowedEdit(AuthorizationObjectType.Workspace));

const startPayInvoice = (item: TickInvoice) => {
  if (!item.id) { return; }
  if (item.status === TenantInvoiceStatus.Paid) { return; }
  if (item.status === TenantInvoiceStatus.Pending) { return; }

  subscriptionStore.manualPayInvoice(item.id).then((d) => {
    notifyMessage("Payment started", "Please continue the process at the bank.");
    if (d && d.paymentProviderLink) {
      openUrl(d.paymentProviderLink);
    } else {
      notifyError("Oops, there is an issue", "It seems something is wrong here, please contact support.");
    }
  });
};

const selectItem = (item: TickDataBagSummary) => {
  router.push({ params: { ...route.params, id: item.id } });
};

onMounted(() => {
  subscriptionStore.useInvoices();
  subscriptionStore.useBilling();
  if (route.params.id) {
    selectedItemId.value = route.params.id.toString();
  }
});

watch(
  () => route.params,
  (to: TickRouteParams) => {
    selectedItemId.value = to.id ?? undefined;
  }
);
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