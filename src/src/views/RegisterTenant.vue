<template>
  <div class="container">
    <TickForm :formWidth="1000" v-if="viewstate == ViewstateEnum.Register_preregister" @submit="tryPreRegister" :busy="loading" :buttonSize="'xxl'">
      <template #heading>Work smarter, not harder</template>
      <template #introduction>We're excited to get you on board. After entering your details we will send a verification e-mail to make sure it's you. </template>
      <template #error v-if="error">{{ this.error }}</template>
      <div class="form-side">
        <TickInput v-focus v-model="tenantEmailaddress" :invalidMessage="emailAddresInvalidMessage" :disabled="loading" placeholder="Your work e-mail address">Work email address
        </TickInput>

        <TickInput v-model="tenantName" :disabled="loading" placeholder="Your organization's name">Organization’s name</TickInput>
        <TickInput v-model="username" type="username" :disabled="loading" placeholder="Choose a username to log in with">Username</TickInput>
        <TickInput v-model="password" type="password" :disabled="loading" placeholder="Choose a password to login with">New password</TickInput>

        <TickHeading class="plans-header" v-if="showPlanSelector">Available plans</TickHeading>
        <div class="plans" v-if="showPlanSelector">
          <SubscriptionPlanItem @select="selectPlan(plan)" :plan="plan" v-for="plan in this.plans" :key="plan.id" />
        </div>

        <div>
          <template v-if="selectedPlanRequiresPayment">

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
          </template>

          <template v-if="showPlanSelector">
            <div>
              <TickButton class="view-benefits-button" @click="toggleBenefits" :size="Size.mini" :color="Color.contrast" :appearance="Appearance.secondary">{{ this.toggleBenefitsText }}
              </TickButton>
            </div>
            <div class="plan-benefits" v-if="showBenefits">
              <table class="styledTable odd-even ">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="numeric">Credits</th>
                    <th class="numeric">Max</th>
                  </tr>
                </thead>
                <tbody>
                  <PlanDataNumericItem :item="item" :credit="getCostItemCredit(item)" v-for="(item, index) in this.selectedPlanDataItems" :key="index" />
                </tbody>

              </table>
            </div>

          </template>
        </div>

      </div>
      <template #extrabuttons>

        <TickButton @click="toggleForcePlanSelector" :size="Size.XXL" :color="Color.contrast" :appearance="Appearance.secondary">{{ this.forcePlanSelectorText }}</TickButton>
      </template>
      <template #button>{{ this.registerText }}</template>
      <template #suffix v-if="selectedPlanRequiresPayment">Pay one cent for verification. <br />We will calculate your daily usage and auto collect at the first of each month. <br /> <router-link
          :to="{ name: 'Login' }">Login</router-link></template>
    </TickForm>

    <TickForm :formWidth="600" v-if="viewstate == ViewstateEnum.Register_register" @submit="tryRegister" :disabled="loading">
      <template #heading>Verify your email</template>
      <template #introduction>To make sure you’re you, we’ve just sent you an email with a verification code to {{ this.emailaddress }} <br /><br />Having trouble receiving the e-mail? Ask your IT
        department if they can help. </template>
      <template #error v-if="error">{{ this.error }}</template>

      <TickInput v-focus v-model="validationCode" :disabled="loading">Your verification code</TickInput>

      <template #button>Finish</template>
    </TickForm>

    <TickForm :formWidth="600" v-if="viewstate == ViewstateEnum.Register_waitForRegistrationComplete" :busy="true">
      <template #heading>
        {{ this.waitTitle }}
      </template>
      <template #introduction>

        {{ this.waitmessage }}
      </template>
    </TickForm>
  </div>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import EditorMessage from '@/components/molecules/EditorMessage.vue';
import BillingPlanBaseItem from '@/components/molecules/subscription/BillingPlanBaseItem.vue';
import BillingPlanNumericItem from '@/components/molecules/subscription/BillingPlanNumericItem.vue';
import PlanCreditItem from '@/components/molecules/subscription/PlanCreditItem.vue';
import PlanDataNumericItem from '@/components/molecules/subscription/PlanDataNumericItem.vue';
import SubscriptionPlanItem from '@/components/molecules/subscription/SubscriptionPlanItem.vue';
import TickForm from "@/components/molecules/TickForm.vue";
import { focus } from "@/directives";
import { getBillingCalculationPeriodName, getBillingPeriodName, GetCostItemSortOrder, getCurrencyName } from '@/helpers/enumsHelper';
import { generateShortId, unlimited } from '@/helpers/guid';
import { stringIsNullOrEmpty, stringIsValidEmail, stringIsValidWorkEmail } from '@/helpers/stringHelper';
import { ViewstateEnum } from '@/router';
import { getAvailablePlans } from '@/services/SubscriptionService';
import { getRegisterProgress, preRegister, register } from "@/services/TenantService";
import { AppBaseUrl } from "@/services/urls";
import { SubscriptionCostItemType, TenantSubscriptionPlanNumericItem, TickSubscriptionPlan } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';
@Component({
  directives: { focus },
  components: {
    TickForm, TickInput, SubscriptionPlanItem, BillingPlanBaseItem,
    BillingPlanNumericItem, TickButton, PlanDataNumericItem, TickHeading,
    EditorMessage, PlanCreditItem
  }
})
export default class Register extends Vue {
  Color = Color;
  Size = Size;
  Appearance = Appearance;
  ViewstateEnum = ViewstateEnum

  private viewstate: ViewstateEnum = ViewstateEnum.Register_preregister; //"waitforregistrationcomplete"; //;
  private loading = true;
  private error = "";
  private showBenefits = false;

  private emailaddress = process.env.VUE_APP_EMAIL || "";
  private tenantName = process.env.VUE_APP_TENANTNAME ? process.env.VUE_APP_TENANTNAME + generateShortId() : "";
  private password = process.env.VUE_APP_PASSWORD || "";
  private username = process.env.VUE_APP_EMAIL || "";

  private validationCode = "";
  private tenantUrlName = "";

  private waitTitle = "Checking verification code.."
  private waitmessage = "Please wait while we set up camp";
  private waitLoops = 0;
  private registrationTaskId = "";

  private plansIsFetching = false;
  private availablePlans: TickSubscriptionPlan[] = [];
  private selectedPlanId: string = null;

  private showPlanSelector = false;

  private registerAsSubTenantForPartnershipId: string = null;

  private get billingExplanation() {
    return `Billed ${getBillingPeriodName(this.selectedPlan?.billingPeriod)}`;
  }

  private get emailAddresInvalidMessage(): string {
    return this.workEmailNotWorkWarning
      ? "Use a work e-mail address to register."
      : ""
  }

  private get workEmailNotWorkWarning(): boolean {
    var devAllowedEmail = process.env.VUE_APP_EMAIL || "";
    if (this.emailaddress == devAllowedEmail) { return false; }

    if (stringIsNullOrEmpty(this.emailaddress)) { return false; }
    const isValidEmail = stringIsValidEmail(this.emailaddress);
    return isValidEmail && !stringIsValidWorkEmail(this.emailaddress);
  }

  private getCostItemCredit(item: TenantSubscriptionPlanNumericItem) {
    return this.selectedPlanCreditItems.find(p => p.type == item.type);
  }

  beforeMount() {

    const params = this.$route.params

    this.registerAsSubTenantForPartnershipId = params.partnershipId as string || null;


    this.showPlanSelector = !stringIsNullOrEmpty(params.planId as string);
    this.getPlans(params.planId as string || null);
  }

  private get registerText() {

    return this.selectedPlan
      ? `Register as ${this.selectedPlan?.name}`
      : 'Register';
  }
  private get forcePlanSelectorText() {
    return this.showPlanSelector ? "Hide plans" : "View plans";
  }
  private get toggleBenefitsText(): string {
    return this.showBenefits ? "minimize details" : "Show plan details";
  }
  private toggleForcePlanSelector() {
    this.showPlanSelector = !this.showPlanSelector;
  }

  private toggleBenefits() {
    this.showBenefits = !this.showBenefits;
  }

  private get tenantEmailaddress() {
    return this.emailaddress;
  }

  private set tenantEmailaddress(to: string) {
    this.emailaddress = to;

    const domain = (this.getDomainFromEmailAddress(to) || "").toLowerCase();
    const lowerTenantName = this.tenantName.toLowerCase();
    if (domain && (!lowerTenantName || domain.startsWith(lowerTenantName) || lowerTenantName.startsWith(domain))) {
      this.tenantName = domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    const localPart = (this.getLocalPartFromEmailAddress(to) || "").toLowerCase();
    const lowerUserName = this.username.toLowerCase();
    if (localPart && (!lowerUserName || localPart.startsWith(lowerUserName) || lowerUserName.startsWith(localPart))) {
      this.username = localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }

  }


  private getDomainFromEmailAddress(email: string): string {
    let channelAddressArr = email.split("@");
    const domain = channelAddressArr[1];
    if (!domain) { return null; }
    //remove tld etc
    let domainArr = domain.split(".");

    return domainArr[0];

  }

  private getLocalPartFromEmailAddress(email: string): string {
    let channelAddressArr = email.split("@");
    const local = channelAddressArr[0];
    if (!local) { return null; }
    //remove tld etc
    let localArr = local.split(".");

    return localArr[0];

  }



  private selectPlan(item: TickSubscriptionPlan) {
    this.selectedPlanId = item.id;

    for (let index = 0; index < this.plans.length; index++) {
      const plan = this.plans[index];

      plan.selected = plan.id == item.id

    }
  }

  private get selectedPlan() {
    return (this.plans || []).find(p => p.id == this.selectedPlanId);
  }

  private get selectedPlanCurrency() {
    return this.selectedPlan ? this.selectedPlan.currency : "";
  }

  private get selectedPlanBillingItems() {
    return this.selectedPlan ?
      this.selectedPlan.billingPlan != null ? (this.selectedPlan.billingPlan.numerics || []) : []
      : [];
  }

  private get selectedPlanCreditItems() {
    return this.selectedPlan ?
      this.selectedPlan.billingPlan != null ? (this.selectedPlan.planData?.credits || []) : []
      : [];
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


  private get billingCurrencyName() {
    return getCurrencyName(this.selectedPlan.currency);
  }

  private get billingTitle() {
    return `Subscription cost`;
  }
  private get billingBreakdown() {
    return `${this.selectedPlan.baseCost} ${this.billingCurrencyName} per ${getBillingCalculationPeriodName(this.selectedPlan.baseCostCalculationPeriod)}`;
  }

  private get billingDescription() {
    return `You enjoy the ${this.selectedPlan.name} plan`;
  }

  private get selectedPlanRequiresPayment() {
    return this.selectedPlan
      ? this.selectedPlan.baseCost != null && !this.selectedPlan.hasCustomBaseCost
      : false;
  }

  private get plans() {
    return this.availablePlans.sort(function (a, b) {

      return a.indexWeight - b.indexWeight
    });
  }

  private async getPlans(preSelectionId: string | null) {
    this.plansIsFetching = true;
    this.loading = true;
    await getAvailablePlans().then((plans) => {
      this.plansIsFetching = false;
      this.loading = false;
      const preSelectedPlan = preSelectionId ? plans.find(p => p.id == preSelectionId) : null;
      // if (!preSelectedPlan) {

      //   plans[0].selected = true;
      // } else {
      //   preSelectedPlan.selected = true;
      // }
      this.availablePlans = plans;
      this.selectPlan(preSelectedPlan ? preSelectedPlan : plans[0])

    })

  }

  private async tryPreRegister() {
    if (this.loading) { return; }

    const isValidAddress = stringIsValidEmail(this.emailaddress);
    if (!isValidAddress) {
      this.error = "Please provide a valid e-mail address."
      return;
    }

    if (this.workEmailNotWorkWarning) {
      this.error = "Please use your work email address."
      return;
    }

    this.loading = true;
    this.error = "";
    const response = await preRegister({
      emailAddress: this.emailaddress,
      tenantName: this.tenantName,
      newPassword: this.password,
      newUsername: this.username,
      planId: this.selectedPlanId,
      partnerShipId: this.registerAsSubTenantForPartnershipId,
    });
    this.loading = false;
    if (!response) {
      this.error = "Something went wrong. Please try again later."
      return;
    }


    if (response && response.success) {
      this.viewstate = ViewstateEnum.Register_register;
    } else {
      this.error = response.message;
    }
    this.tenantUrlName = response.tenantUrlName;
  }

  private async tryRegister() {
    if (this.loading) { return; }
    this.loading = true;
    this.error = "";
    const response = await register({ validationCode: this.validationCode });
    this.loading = false;
    if (!response) {
      this.error = "Something went wrong. Please try again later."
      return;
    }


    if (response.success) {
      this.viewstate = ViewstateEnum.Register_waitForRegistrationComplete;
      this.waitmessage = response.message;
      this.registrationTaskId = response.taskId;

      setTimeout(this.getRegistrationProgress, 5000);
    } else {
      this.error = response.message;
    }
  }

  private async getRegistrationProgress() {
    this.waitLoops++;

    const response = await getRegisterProgress({ registerTaskId: this.registrationTaskId, validationCode: this.validationCode });

    if (response) {
      if (response.taskFinished) {

        const redirectUrl = response.redirectUrl || `http://${this.tenantUrlName}.${AppBaseUrl}/`;
        window.open(redirectUrl, "_self");

      } else {
        this.waitmessage = response.message;
        this.waitTitle = "Making your Tick ready.."
      }
    }

    setTimeout(this.getRegistrationProgress, 5000);

  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.billing-explanation {
  padding: 10px;
}

.plan-benefits {
  margin-top: 20px;
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

.container {
  height: 100dvh;
  width: 100dvw;

  @include gradient-bg;

  .plans-header {
    margin-top: 20px;
    margin-bottom: 10px;
  }

  .plans {
    display: flex;
    gap: 30px;
    justify-content: center;

    margin: 20px;
  }

  .view-benefits-button {
    margin-top: 10px;
  }

  .plan-free {
    margin-top: 20px;
    font-size: $text-size-regular;
  }

}

.form-side {
  margin-bottom: 20px;
  display: grid;
  gap: 2px;
}

.gradient-background {
  background: linear-gradient(151deg, deepskyblue, darkviolet, blue);
  background-size: 180% 180%;
  animation: gradient-animation 9s ease infinite;
}

@keyframes gradient-animation {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}
</style>
