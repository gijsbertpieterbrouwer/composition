<template>
  <template v-if="hasActiveItem">
    <PartnerShipTenantEditor :activeId="selectedItemId" />
  </template>
  <template v-else>


    <TickScreen title="Your partnership">
      <template v-slot:actions>
        <!-- <TickButton @click="addAdapter">New adapter</TickButton> -->
      </template>

      <template v-slot:default>

        <TickEditorPanel :name="subTenantsPanelTitle">
          <!-- <template v-slot:explainer>
          When on a subscription plan we calculate your usage on a daily basis, every billing period an invoice is created and billed.<br /> To not bother you we try to do the payment as easy as
          possible; via a automatic payments mandate.
        </template> -->

          <div class="list">
            <TickListItem @select="selectSubtenant" :clickData="item" icon="subscription" :name="item.name" v-for="item in this.subTenants" :key="item.id" title="View tenant details">
              <div class="labels">
                <TickLabel v-if="item.subscriptionName" :title="item.subscriptionName" :disableCollapse="true" :name="item.subscriptionName" :color="ColorsEnum.Yellow" :allowRemove="false" />
                <TickLabel v-if="!item.ispaying" title="Non paying tenant" :disableCollapse="true" name="FREE" :color="ColorsEnum.Lime" :allowRemove="false" />
              </div>
              <template v-slot:actions>
                <!-- <TickButton @click.stop="endTenantSubscription(item.id)" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini" title="Remove this tenant">
                  End subscription
                </TickButton> -->

              </template>
            </TickListItem>
          </div>
        </TickEditorPanel>

      </template>
    </TickScreen>
  </template>
</template>



<script lang="ts">
import { Component, Vue, Watch } from 'vue-facing-decorator';

import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from '@/components/atoms/TickCheckbox.vue';
import TickLabel from "@/components/atoms/TickLabel.vue";
import TickListItem from '@/components/atoms/TickListItem.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import PartnerShipTenantEditor from '@/components/molecules/partnership/PartnerShipTenantEditor.vue';
import InvoiceStatusLabel from '@/components/molecules/subscription/InvoiceStatusLabel.vue';
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import { TickRouteParams } from '@/router';
import usePartnershipStore from '@/store/partnership';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, ColorsEnum, TenantInvoiceStatus, TenantOverviewSummary } from '@/TickApi';

@Component({
  directives: { focus },
  // eslint-disable-next-line no-dupe-keys
  components: { TickButton, TickIcon, TickScreen, TickEditorPanel, TickListItem, TickCheckbox, InvoiceStatusLabel, TickLabel, PartnerShipTenantEditor },
})
export default class TickTenantPartnerDashboard extends Vue {
  TenantInvoiceStatus = TenantInvoiceStatus;
  Appearance = Appearance
  Color = Color
  Size = Size
  ColorsEnum = ColorsEnum

  private selectedItemId: string = null;

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get editallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace)
  }

  private get subTenants() {
    return this.partnershipData?.currentPartnershipData?.subTenants || [];
  }

  private get partnershipData() {
    return usePartnershipStore().getCurrent
  }

  private get subTenantsPanelTitle(): string {
    // const l = this.subTenants.length;
    const payingNumber = this.subTenants.filter(p => p.ispaying).length;
    // const payingTitle = payingNumber == 1
    //   ? '(1 paying)'
    //   : `${payingNumber} paying`;

    return (payingNumber == 1)
      ? `1 paying registered tenant`
      : `${payingNumber} paying tenants registered`

  }

  private endTenantSubscription(tenantId: string) {
    if (!confirm("Are you sure, ending the subscription will remove this tenant and destroy all it's Tick data.")) { return; }
    usePartnershipStore().endSubscription(tenantId);
  }


  mounted() {
    usePartnershipStore().use();

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  private selectSubtenant(item: TenantOverviewSummary) {
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

  .labels {
    display: flex;
    gap: 5px;
  }
}
</style>
