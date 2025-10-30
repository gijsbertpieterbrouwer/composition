<template>
  <div class="container">
    <TickForm :formWidth="1000" v-if="viewstate === ViewstateEnum.Register_preregister" @submit="tryPreRegister" :busy="loading" :buttonSize="'xxl'">
      <template #heading>Work smarter, not harder</template>
      <template #introduction>We're excited to get you on board. After entering your details we will send a verification e-mail to make sure it's you. </template>
      <template #error v-if="error">{{ error }}</template>
      <div class="form-side">
        <TickInput v-focus v-model="tenantEmailaddress" :invalidMessage="emailAddresInvalidMessage" :disabled="loading" placeholder="Your work e-mail address">Work email address
        </TickInput>

        <TickInput v-model="tenantName" :disabled="loading" placeholder="Your organization's name">Organization’s name</TickInput>
        <TickInput v-model="username" type="username" :disabled="loading" placeholder="Choose a username to log in with">Username</TickInput>
        <TickInput v-model="password" type="password" :disabled="loading" placeholder="Choose a password to login with">New password</TickInput>

        <TickHeading class="plans-header" v-if="showPlanSelector">Available plans</TickHeading>
        <div class="plans" v-if="showPlanSelector">
          <SubscriptionPlanItem @select="selectPlan(plan)" :plan="plan" v-for="plan in plans" :key="plan.id" />
        </div>

        <div>
          <template v-if="selectedPlanRequiresPayment">

            <BillingPlanBaseItem :currency="selectedPlanCurrency" :title="billingTitle" :breakdown="billingBreakdown" :description="billingDescription" />

            <!-- <div class="credits">
              <PlanCreditItem :item="item" v-for="(item, index) in this.selectedPlanCreditItems" :key="index" />
            </div> -->

            <div class="billing-items">
              <BillingPlanNumericItem :currency="selectedPlanCurrency" :item="item" v-for="(item, index) in selectedPlanBillingItems" :key="index" />
            </div>

            <div class="billing-explanation">
              {{ billingExplanation }}
            </div>
          </template>

          <template v-if="showPlanSelector">
            <div>
              <TickButton class="view-benefits-button" @click="toggleBenefits" :size="TickButtonSize.mini" :color="TickButtonColor.contrast" :appearance="TickButtonAppearance.secondary">{{
                toggleBenefitsText }}
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
                  <PlanDataNumericItem :item="item" :credit="getCostItemCredit(item)" v-for="(item, index) in selectedPlanDataItems" :key="index" />
                </tbody>

              </table>
            </div>

          </template>
        </div>

      </div>
      <template #extrabuttons>

        <TickButton @click="toggleForcePlanSelector" :size="TickButtonSize.XXL" :color="TickButtonColor.contrast" :appearance="TickButtonAppearance.secondary">{{ forcePlanSelectorText }}</TickButton>
      </template>
      <template #button>{{ registerText }}</template>
      <template #suffix v-if="selectedPlanRequiresPayment">Pay one cent for verification. <br />We will calculate your daily usage and auto collect at the first of each month. <br /> <router-link
          :to="{ name: 'Login' }">Login</router-link></template>
    </TickForm>

    <TickForm :formWidth="600" v-if="viewstate === ViewstateEnum.Register_register" @submit="tryRegister" :disabled="loading">
      <template #heading>Verify your email</template>
      <template #introduction>To make sure you’re you, we’ve just sent you an email with a verification code to {{ emailaddress }} <br /><br />Having trouble receiving the e-mail? Ask your IT
        department if they can help. </template>
      <template #error v-if="error">{{ error }}</template>

      <TickInput v-focus v-model="validationCode" :disabled="loading">Your verification code</TickInput>

      <template #button>Finish</template>
    </TickForm>

    <TickForm :formWidth="600" v-if="viewstate === ViewstateEnum.Register_waitForRegistrationComplete" :busy="true">
      <template #heading>
        {{ waitTitle }}
      </template>
      <template #introduction>

        {{ waitmessage }}
      </template>
    </TickForm>
  </div>
</template>

<script setup lang="ts">
import TickButton from '@/components/atoms/TickButton.vue';
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import BillingPlanBaseItem from '@/components/molecules/subscription/BillingPlanBaseItem.vue';
import BillingPlanNumericItem from '@/components/molecules/subscription/BillingPlanNumericItem.vue';
import PlanDataNumericItem from '@/components/molecules/subscription/PlanDataNumericItem.vue';
import SubscriptionPlanItem from '@/components/molecules/subscription/SubscriptionPlanItem.vue';
import TickForm from "@/components/molecules/TickForm.vue";
import { getBillingCalculationPeriodName, getBillingPeriodName, GetCostItemSortOrder, getCurrencyName, TickButtonAppearance, TickButtonColor, TickButtonSize } from '@/helpers/enumsHelper';
import { generateShortId, unlimited } from '@/helpers/guid';
import { stringIsNullOrEmpty, stringIsValidEmail, stringIsValidWorkEmail } from '@/helpers/stringHelper';
import { ViewstateEnum } from '@/router';
import { getAvailablePlans } from '@/services/SubscriptionService';
import { getRegisterProgress, preRegister, register } from "@/services/TenantService";
import { AppBaseUrl } from "@/services/urls";
import { BillingCalculationPeriod, BillingPeriod, CurrencyType, SubscriptionCostItemType, TenantSubscriptionPlanNumericItem, TickSubscriptionPlan } from '@/TickApi';
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const viewstate = ref(ViewstateEnum.Register_preregister);
const loading = ref(true);
const error = ref("");
const showBenefits = ref(false);

const emailaddress = ref(process.env.VUE_APP_EMAIL || "");
const tenantName = ref(process.env.VUE_APP_TENANTNAME ? process.env.VUE_APP_TENANTNAME + generateShortId() : "");
const password = ref(process.env.VUE_APP_PASSWORD || "");
const username = ref(process.env.VUE_APP_EMAIL || "");

const validationCode = ref("");
const tenantUrlName = ref("");

const waitTitle = ref("Checking verification code..");
const waitmessage = ref("Please wait while we set up camp");
const waitLoops = ref(0);
const registrationTaskId = ref("");

const plansIsFetching = ref(false);
const availablePlans = ref<TickSubscriptionPlan[]>([]);
const selectedPlanId = ref<string | null>(null);

const showPlanSelector = ref(false);

const registerAsSubTenantForPartnershipId = ref<string | null>(null);

const tenantEmailaddress = computed({
  get() {
    return emailaddress.value;
  },
  set(to: string) {
    emailaddress.value = to;

    const domain = getDomainFromEmailAddress(to)?.toLowerCase() ?? "";
    const lowerTenantName = tenantName.value.toLowerCase();
    if (domain && (!lowerTenantName || domain.startsWith(lowerTenantName) || lowerTenantName.startsWith(domain))) {
      tenantName.value = domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    const localPart = getLocalPartFromEmailAddress(to)?.toLowerCase() ?? "";
    const lowerUserName = username.value.toLowerCase();
    if (localPart && (!lowerUserName || localPart.startsWith(lowerUserName) || lowerUserName.startsWith(localPart))) {
      username.value = localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }
  }
});

const emailAddresInvalidMessage = computed(() => {
  return workEmailNotWorkWarning.value
    ? "Use a work e-mail address to register."
    : "";
});

const workEmailNotWorkWarning = computed(() => {
  const devAllowedEmail = process.env.VUE_APP_EMAIL || "";
  if (emailaddress.value === devAllowedEmail) { return false; }

  if (stringIsNullOrEmpty(emailaddress.value)) { return false; }
  const isValidEmail = stringIsValidEmail(emailaddress.value);
  return isValidEmail && !stringIsValidWorkEmail(emailaddress.value);
});

const getCostItemCredit = (item: TenantSubscriptionPlanNumericItem) => {
  return selectedPlanCreditItems.value.find(p => p.type === item.type);
};

const registerText = computed(() => {
  return selectedPlan.value
    ? `Register as ${selectedPlan.value?.name}`
    : 'Register';
});

const forcePlanSelectorText = computed(() => {
  return showPlanSelector.value ? "Hide plans" : "View plans";
});

const toggleBenefitsText = computed(() => {
  return showBenefits.value ? "minimize details" : "Show plan details";
});

const toggleForcePlanSelector = () => {
  showPlanSelector.value = !showPlanSelector.value;
};

const toggleBenefits = () => {
  showBenefits.value = !showBenefits.value;
};

const selectedPlan = computed(() => {
  return availablePlans.value.find(p => p.id === selectedPlanId.value);
});

const selectedPlanCurrency = computed(() => {
  return selectedPlan.value?.currency ?? "";
});

const selectedPlanBillingItems = computed(() => {
  return selectedPlan.value
    ? selectedPlan.value.billingPlan?.numerics ?? []
    : [];
});

const selectedPlanCreditItems = computed(() => {
  return selectedPlan.value
    ? selectedPlan.value.planData?.credits ?? []
    : [];
});

const selectedPlanDataItems = computed(() => {
  const items = selectedPlan.value?.planData?.numerics ?? [] as TenantSubscriptionPlanNumericItem[];  // Assert type after fallback
  const forbidden = [SubscriptionCostItemType.MaxFileSize, SubscriptionCostItemType.Seats, SubscriptionCostItemType.FlowsAction];
  const selectedItems = items.filter(p => !forbidden.includes(p.type) && (p.value === unlimited || p.value > 0));

  const sortOrder = GetCostItemSortOrder();

  return selectedItems.sort((a, b) => sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type));
});

const billingExplanation = computed(() => {
  return `Billed ${getBillingPeriodName(selectedPlan.value?.billingPeriod ?? BillingPeriod.Month)}`;
});

const billingCurrencyName = computed(() => {
  return getCurrencyName(selectedPlan.value?.currency ?? CurrencyType.Euro);
});

const billingTitle = computed(() => 'Subscription cost');

const billingBreakdown = computed(() => {
  return `${selectedPlan.value?.baseCost ?? 0} ${billingCurrencyName.value} per ${getBillingCalculationPeriodName(selectedPlan.value?.baseCostCalculationPeriod ?? BillingCalculationPeriod.Month)}`;
});

const billingDescription = computed(() => {
  return `You enjoy the ${selectedPlan.value?.name ?? 'Free'} plan`;
});

const selectedPlanRequiresPayment = computed(() => {
  return selectedPlan.value
    ? selectedPlan.value.baseCost != null && !selectedPlan.value.hasCustomBaseCost
    : false;
});

const plans = computed(() => {
  return [...availablePlans.value].sort((a, b) => a.indexWeight - b.indexWeight);
});

const getPlans = async (preSelectionId: string | null) => {
  plansIsFetching.value = true;
  loading.value = true;
  try {
    const plansData = await getAvailablePlans();
    plansIsFetching.value = false;
    loading.value = false;
    const preSelectedPlan = preSelectionId ? plansData.find(p => p.id === preSelectionId) : null;
    availablePlans.value = plansData;
    selectPlan(preSelectedPlan ?? plansData[0]);
  } catch (e) {
    plansIsFetching.value = false;
    loading.value = false;
    console.error('Error fetching plans:', e);
  }
};

const tryPreRegister = async () => {
  if (loading.value) { return; }

  const isValidAddress = stringIsValidEmail(emailaddress.value);
  if (!isValidAddress) {
    error.value = "Please provide a valid e-mail address.";
    return;
  }

  if (workEmailNotWorkWarning.value) {
    error.value = "Please use your work email address.";
    return;
  }

  loading.value = true;
  error.value = "";
  try {
    const response = await preRegister({
      emailAddress: emailaddress.value,
      tenantName: tenantName.value,
      newPassword: password.value,
      newUsername: username.value,
      planId: selectedPlanId.value ?? '',
      partnerShipId: registerAsSubTenantForPartnershipId.value ?? undefined,
    });
    loading.value = false;
    if (!response) {
      error.value = "Something went wrong. Please try again later.";
      return;
    }

    if (response && response.success) {
      viewstate.value = ViewstateEnum.Register_register;
    } else {
      error.value = response.message ?? "";
    }
    tenantUrlName.value = response.tenantUrlName ?? '';
  } catch (e) {
    loading.value = false;
    error.value = "Something went wrong. Please try again later.";
  }
};

const tryRegister = async () => {
  if (loading.value) { return; }
  loading.value = true;
  error.value = "";
  try {
    const response = await register({ validationCode: validationCode.value });
    loading.value = false;
    if (!response) {
      error.value = "Something went wrong. Please try again later.";
      return;
    }

    if (response.success) {
      viewstate.value = ViewstateEnum.Register_waitForRegistrationComplete;
      waitmessage.value = response.message ?? '';
      registrationTaskId.value = response.taskId ?? '';

      setTimeout(getRegistrationProgress, 5000);
    } else {
      error.value = response.message ?? '';
    }
  } catch (e) {
    loading.value = false;
    error.value = "Something went wrong. Please try again later.";
  }
};

const getRegistrationProgress = () => {
  waitLoops.value++;

  getRegisterProgress({ registerTaskId: registrationTaskId.value, validationCode: validationCode.value })
    .then((response) => {
      if (response) {
        if (response.taskFinished) {
          const redirectUrl = response.redirectUrl || `http://${tenantUrlName.value}.${AppBaseUrl()}/`;
          window.open(redirectUrl, "_self");
        } else {
          waitmessage.value = response.message ?? '';
          waitTitle.value = "Making your Tick ready..";
        }
      }
    })
    .finally(() => {
      setTimeout(getRegistrationProgress, 5000);
    });
};

const getDomainFromEmailAddress = (email: string): string | null => {
  const channelAddressArr = email.split("@");
  const domain = channelAddressArr[1];
  if (!domain) { return null; }
  const domainArr = domain.split(".");
  return domainArr[0] ?? null;
};

const getLocalPartFromEmailAddress = (email: string): string | null => {
  const channelAddressArr = email.split("@");
  const local = channelAddressArr[0];
  if (!local) { return null; }
  const localArr = local.split(".");
  return localArr[0] ?? null;
};

const selectPlan = (item: TickSubscriptionPlan) => {
  selectedPlanId.value = item.id;

  availablePlans.value.forEach((plan) => {
    plan.selected = plan.id === item.id;
  });
};

onBeforeMount(() => {
  const params = route.params;
  registerAsSubTenantForPartnershipId.value = params.partnershipId as string || null;

  showPlanSelector.value = !stringIsNullOrEmpty(params.planId as string);
  getPlans(params.planId as string || null);
});
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