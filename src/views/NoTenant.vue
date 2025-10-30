<template>
  <div class="container">
    <TickForm @submit="tryNavigateToTenant">
      <template #heading>Sign in</template>
      <template #introduction>Every organization has their own private url to access Tick. Enter your organization’s name
        below and we’ll redirect you.</template>
      <template #error v-if="error || reason">{{ error }} {{ reason }}</template>

      <TickInput v-focus :disabled="loading" v-model="tenantUrlName">Your organization’s name</TickInput>

      <template #button>Next</template>
      <template #suffix>
        <div class="teaser">
          <SalesRegisterBlock />
        </div>
      </template>

    </TickForm>
  </div>
  <div class="bg2"></div>
  <div class="bg"></div>
</template>

<script setup lang="ts">
import * as LOG from '@/log';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import TickInput from "@/components/atoms/TickInput.vue";
import TickForm from "@/components/molecules/TickForm.vue";
import { RouterToRegisterTenant, TickRouteParams } from "@/router";

import SalesRegisterBlock from '@/components/molecules/sales/SalesRegisterBlock.vue';
import { getTenantInfo } from "@/services/TenantService";
import { AppBaseUrl } from "@/services/urls";

const route = useRoute();

const loading = ref(false);
const error = ref("");
const tenantUrlName = ref(process.env.VUE_APP_TENANTNAME || "");
const reasonCode = ref("");
const reason = ref("");

watch(
  () => route.params,
  (to: TickRouteParams, from: TickRouteParams) => {
    if (to.reason !== from.reason) {
      setReason(to.reason as string);
    }
  }
);

onMounted(() => {
  setReason(route.params.reason as string);
});

const setReason = (to: string) => {
  reasonCode.value = to;

  switch (reasonCode.value) {
    case "doesnotexist":
      reason.value = "The private tenant url you provided does not exist. Do you want to try again, or maybe register a new tenant?";
      break;
    default:
      reason.value = "";
  }
};

const tryNavigateToTenant = async () => {
  if (error.value) {
    RouterToRegisterTenant();
    return;
  }

  LOG.debug('navigation to tenant start');
  error.value = "";
  loading.value = true;

  try {
    const response = await getTenantInfo({ tenantUrlName: tenantUrlName.value });
    loading.value = false;

    if (response && response.success) {
      window.open(`http://${response.tenantUrlName}.${AppBaseUrl()}/`, "_self");
    } else {
      error.value = "The tenant you were looking for seems not to exist, do you want to register instead?";
    }
  } catch (e) {
    loading.value = false;
    error.value = "Something went wrong. Please try again later.";
    LOG.error('Error navigating to tenant:', e);
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.bg {
  // background IMG
  height: 100dvh;
  width: 100dvw;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 1;


  background-image: url('../media/loginbg.png');
  background-size: cover;
  filter: blur(8px); // blur because low image quality
  transform: scale(1.1); // no white blur on edge

  opacity: 1;

}

.bg2 {
  // Green fade
  height: 100dvh;
  width: 100dvw;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 2;

  opacity: 0.5;
  @include gradient-bg;
}

.container {
  position: fixed;
  height: 100dvh;
  width: 100dvw;
  z-index: 23;

  // @include gradient-bg;

  .teaser {
    width: 400px;
  }
}
</style>