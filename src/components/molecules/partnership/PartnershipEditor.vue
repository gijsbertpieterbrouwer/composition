<template>
  <template v-if="loaded">
    <TickScreen title="Partnership">
      <template v-slot:actions>
        <TickButton v-if="hasActivePartnership && isGlobalAdmin" :busy="busyWithServer" @click="endPartnership" :color="Color.contrast" :appearance="Appearance.secondary"> {{
          $translate(LanguagePath.App_PartnershipEditor_EndPartnership_Title) }}</TickButton>
      </template>

      <template v-slot:default>

        <!-- GET PARTNERSHIP -->

        <TickEditorPanel :name="$translate(LanguagePath.App_PartnershipEditor_StartAffiliatePartnership_Title)" v-if="!hasActivePartnership">
          <template v-slot:explainer>
            {{ $translate(LanguagePath.App_PartnershipEditor_StartAffiliatePartnership_Explanation) }}
          </template>

          <template v-if="tenantSuitableForPartnership">
            <TickSwitch :disabled="!invoicingViaPartnerIsAllowed" v-model="affiliateFinanceViaPartner"> {{
              $translate(LanguagePath.App_PartnershipEditor_StartAffiliatePartnership_PayForSubtenants_Title) }}
              <span v-if="!invoicingViaPartnerIsAllowed">{{ $translate(LanguagePath.App_PartnershipEditor_StartAffiliatePartnership_PayForSubtenants_MandateRequired_Title) }}</span>
            </TickSwitch>

            <TickInput :disabled="!affiliateFinanceViaPartner" v-model="affiliateInvoiceEmailAddresses" :placeholder="'invoice@yourdomain.com, administration@yourdomain.com'">
              {{ $translate(LanguagePath.App_PartnershipEditor_StartAffiliatePartnership_Email_Title) }}
            </TickInput>

          </template>
          <template v-else>

            <EditorMessage v-for="(reason, index) in this.reasonsNotSuitableForPartnership" :key="index" :type="EditorMessageType.Warning" title="You cannot become a partner yet." :message="reason" />

          </template>

          <br /> <br />
          <EditorMessage v-if="affiliateFinanceViaPartner" :type="EditorMessageType.Message" title="You pay for sub tenants"
            message="Invoice and collection of payments will proceed via this tenant." />
          <TickButton :disabled="!tenantSuitableForPartnership" :busy="busyWithServer" @click="startPartnership"> {{
            $translate(LanguagePath.App_PartnershipEditor_StartAffiliatePartnership_StartButton_Title) }}</TickButton>

        </TickEditorPanel>


        <!-- PARTNERSHIP DETAILS -->
        <TickEditorPanel :name="currentPartnershipName" v-if="hasActivePartnership">
          <template v-slot:explainer>
            {{ this.currentPartnershipDescription }} <br /><br />
          </template>

          <TickCounter :size="CounterSize.Regular" :value="nrOfSubTenants" :unit="subTenantsUnit" :title="$translate(LanguagePath.App_PartnershipEditor_TenantsCounter_Title)" />

          <div>
            <TickCheckbox :disabled="true" v-model="affiliate_InvoiceViaPartner">Pay for your sub tenants</TickCheckbox>
            <TickInput :disabled="true" v-model="affiliate_InvoiceMails">Invoice email addresses (used when paying for sub tenants)</TickInput>
          </div>
          <div>


            <div v-for="(discount, index) in this.currentPartnership_discountRules" :key="index">
              {{ this.discount }}
            </div>


          </div>

        </TickEditorPanel>


        <TickEditorPanel :name="$translate(LanguagePath.App_PartnershipEditor_RegisterSubTenant_Title)" v-if="hasActivePartnership">
          <template v-slot:explainer>
            {{ $translate(LanguagePath.App_PartnershipEditor_RegisterSubTenant_Explanation) }}
          </template>

          <TickButton @click="registerSubTenant" :size="Size.XXL" icon="check" :appearance="Appearance.primary"> {{
            $translate(LanguagePath.App_PartnershipEditor_RegisterSubTenant_RegisterButton_Title)
          }}</TickButton>
          <!-- <a :href="registerSubTenantLink">Register sub tenant</a> -->

          <br /><br />
          {{ $translate(LanguagePath.App_PartnershipEditor_RegisterSubTenant_RegisterUrl_Prefix) }}
          <br /><br />

          <TickButton @click="copyRegistrationLink" :size="Size.regular" :appearance="Appearance.secondary" :color="Color.contrast"> {{ $translate(LanguagePath.App_Copy) }}</TickButton>

          <span class="registrationUrl" @click="copyRegistrationLink">{{ this.registerSubTenantLink }}</span>

        </TickEditorPanel>


      </template>
    </TickScreen>
  </template>
</template>


<script lang="ts">
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickCheckbox from '@/components/atoms/TickCheckbox.vue';
import TickCounter, { CounterSize } from '@/components/atoms/TickCounter.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import { onConfirmation } from '@/helpers/questionHelper';
import { copyToClipboard, splitStringMulti } from '@/helpers/stringHelper';
import { translate } from '@/plugins/translatePlugin';
import { openUrl } from '@/services/urls';
import usePartnershipStore from '@/store/partnership';
import useUserStore from '@/store/user';
import { LanguagePath } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';

@Component({ components: { TickScreen, TickEditorPanel, TickButton, TickSwitch, TickInput, EditorMessage, TickCounter, TickCheckbox } })
export default class PartnershipEditor extends Vue {
  Color = Color;
  Appearance = Appearance;
  Size = Size;
  EditorMessageType = EditorMessageType;
  CounterSize = CounterSize
  LanguagePath = LanguagePath

  private affiliateInvoiceEmailAddresses = "";
  private affiliateFinanceViaPartner = false;

  private busyWithServer = false;

  private get isGlobalAdmin() {
    return useUserStore().isGlobalAdmin;
  }

  private copyRegistrationLink() {
    copyToClipboard(this.registerSubTenantLink);
  }

  private registerSubTenant() {
    openUrl(this.registerSubTenantLink);
    // window.open(this.registerSubTenantLink, "_blank");
  }


  private get registerSubTenantLink(): string {

    return this.currentPartnership?.registerSubTenantUrl;

  }

  private get hasActivePartnership() {
    return this.currentPartnership?.active;
  }

  private get currentPartnershipName() {
    return this.currentPartnership?.name;
  }
  private get currentPartnershipDescription() {
    return this.currentPartnership?.description;
  }
  private get partnershipData() {
    return usePartnershipStore().getCurrent
  }

  private get invoicingViaPartnerIsAllowed() {
    return this.partnershipData?.allowInvoicingViaPartner;
  }

  private get tenantSuitableForPartnership() {
    return this.partnershipData?.allowStartAsPartner;
  }

  private get loaded() {
    return this.partnershipData != null;
  }

  private get nrOfSubTenants(): number {
    return this.currentPartnership?.subTenants?.length || 0;
  }

  private get subTenantsUnit(): string {
    return this.nrOfSubTenants > 1 ? translate(LanguagePath.Tenants) : translate(LanguagePath.Tenant);
  }

  private get reasonsNotSuitableForPartnership(): string[] {
    return this.partnershipData.reasonsNotAllowStartAsPartner || [];
  }

  private get currentPartnership() {
    return this.partnershipData?.currentPartnershipData;
  }


  private get affiliate_InvoiceViaPartner() {
    return this.currentPartnership?.financeViaPartnerShip;
  }
  private get affiliate_InvoiceMails() {
    return this.currentPartnership?.invoiceMailAddresses;
  }

  private get currentPartnership_discountRules(): unknown[] {
    return [];//this.currentPartnership?.discountRules;
  }

  mounted() {
    usePartnershipStore().use();
  }


  private startPartnership() {
    this.busyWithServer = true;
    var emailAddresses = splitStringMulti(this.affiliateInvoiceEmailAddresses, [",", ";"]);
    var financeViaPartner = this.affiliateFinanceViaPartner;
    usePartnershipStore().startAffiliatePartnership(financeViaPartner, emailAddresses).then(() => {
      this.busyWithServer = false;
    });
  }

  private endPartnership() {
    onConfirmation(() => {
      this.busyWithServer = true;
      usePartnershipStore().endPartnership(this.currentPartnership.id).then(() => {
        this.busyWithServer = false;
      });

    });




  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.registrationUrl {
  font-style: italic;
  font-size: 0.7em;
}
</style>
