<template>
  <div class="container">
    <TickForm v-if="viewstate != 'validate'" @submit="requestResetEmail" :disabled="loading">
      <template #heading>Reset password</template>
      <template #introduction>Forgetting is only human.. We can send you a verification code to the emailaddress provided</template>
      <template #error v-if="error">{{ error }}</template>
      <TickInput v-focus v-model="username" :disabled="loading" placeholder="Your username">Your username</TickInput>
      <router-link :to="{ params: { viewstate: 'validate' } }">I already have a verification code</router-link>

      <template #button>Request reset link</template>
      <template #suffix>
        <router-link :to="{ name: 'Login' }">Login</router-link>
      </template>
    </TickForm>

    <TickForm v-if="viewstate === 'validate'" @submit="tryResetUsingValidationCode" :disabled="loading">
      <template #heading>Verify it's you</template>
      <template #introduction>
        Please enter the verification code we've just sent to your email address. The new password must be at least 8 characters, with a minimum of one uppercase, one lowercase, and one special
        character.

      </template>
      <template #error v-if="error">{{ error }}</template>

      <TickInput v-model="validationCode" :disabled="loading" placeholder="Your Verification code">Verification code</TickInput>
      <TickInput type="password" v-model="newPassword" :disabled="loading" placeholder="Make it hard to guess">New password</TickInput>
      <router-link :to="{ params: { viewstate: '' } }">Request again</router-link>

      <template #button>Start using Tick</template>
      <template #suffix>
        <router-link :to="{ name: 'Login' }">Login</router-link>
      </template>
    </TickForm>
  </div>
</template>

<script setup lang="ts">
import TickInput from "@/components/atoms/TickInput.vue";
import TickForm from "@/components/molecules/TickForm.vue";
import { getTenantUrlNameFromHostname } from '@/helpers';
import { TickRouteParams, ViewName } from '@/router';
import { requestUserPasswordReset, resetPassword } from '@/services/AuthenticationService';
import { getTenantInfo } from "@/services/TenantService";
import { onBeforeMount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const viewstate = ref("request");
const tenantIsFetching = ref(false);
const tenantId = ref("");
const loading = ref(false);
const error = ref("");
const username = ref(process.env.VUE_APP_EMAIL || "");
const newPassword = ref("");
const validationCode = ref("");
const waitmessage = ref("Please wait");

watch(
  () => route.params,
  (to: TickRouteParams, from: TickRouteParams) => {
    if (to.viewstate !== from.viewstate) {
      viewstate.value = to.viewstate ?? "";
    }
  }
);

onBeforeMount(() => {
  const params = route.params as TickRouteParams;
  if (params.viewstate) {
    viewstate.value = params.viewstate;
  }

  trySetTenantId();
});

const trySetTenantId = async () => {
  tenantIsFetching.value = true;

  const response = await getTenantInfo({ tenantUrlName: getTenantUrlNameFromHostname(window.location.hostname) });
  if (!response) {
    error.value = "Tick is currently unavailable. Please try again later.";
    return;
  }

  if (response && response.success) {
    tenantId.value = response.tenantId;
    tenantIsFetching.value = false;
    return;
  }

  tenantId.value = "";
  router.push({ name: ViewName.NoTenant, params: { reason: 'doesnotexist' } });
};

const tryResetUsingValidationCode = async () => {
  if (loading.value) { return; }
  loading.value = true;
  error.value = "";

  try {
    const data = await resetPassword({
      tenantId: tenantId.value,
      newPassword: newPassword.value,
      validationCode: validationCode.value,
    });

    loading.value = false;

    if (data.success) {
      router.push({ name: ViewName.Login, params: { reason: 'Your new password is saved, try it!' } });
    } else {
      error.value = data.message ?? "";
    }
  } catch (response: any) {
    loading.value = false;
    error.value = response.message;
  }
};

const requestResetEmail = async () => {
  if (loading.value) { return; }

  loading.value = true;
  error.value = "";

  try {
    await requestUserPasswordReset({
      tenantId: tenantId.value,
      userName: username.value,
    });

    loading.value = false;
    router.push({ params: { ...route.params, viewstate: "validate" } });
    waitmessage.value = "";
  } catch (response: any) {
    loading.value = false;
    waitmessage.value = response.message;
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.container {
  height: 100dvh;
  width: 100dvw;

  @include gradient-bg;
}
</style>