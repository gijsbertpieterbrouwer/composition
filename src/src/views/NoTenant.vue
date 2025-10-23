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

<script lang="ts">
import { Component, Vue, Watch } from 'vue-facing-decorator';

import * as LOG from '@/log';

import TickInput from "@/components/atoms/TickInput.vue";
import TickForm from "@/components/molecules/TickForm.vue";
import { RouterToRegisterTenant, TickRouteParams } from "@/router";

import SalesRegisterBlock from '@/components/molecules/sales/SalesRegisterBlock.vue';
import { focus } from "@/directives";
import { getTenantInfo } from "@/services/TenantService";
import { AppBaseUrl } from "@/services/urls";
@Component({
  directives: { focus },
  components: { TickForm, TickInput, SalesRegisterBlock }
})
export default class NoTenant extends Vue {
  private loading = false;
  private error = "";
  private tenantUrlName = process.env.VUE_APP_TENANTNAME || "";
  private reasonCode = "";
  private reason = "";

  @Watch("$route.params")
  private routeParamsChanged(to: TickRouteParams, from: TickRouteParams) {
    if (to.reason != from.reason) {
      this.setReason(to.reason);
    }
  }

  private mounted() {
    this.setReason(this.$route.params.reason as string);
  }

  private setReason(to: string) {
    this.reasonCode = to;

    switch (this.reasonCode) {
      case "doesnotexist":
        this.reason = "The private tenant url you provided does not exist. Do you want to try again, or maybe register a new tenant?"
        break;
      default:
    }
  }

  private async tryNavigateToTenant() {
    if (this.error) {
      RouterToRegisterTenant();
    }

    LOG.debug('navigation to tenant start');
    this.error = "";
    this.loading = true;

    const response = await getTenantInfo({ tenantUrlName: this.tenantUrlName });
    this.loading = false;

    if (response && response.success) {
      window.open(`http://${response.tenantUrlName}.${AppBaseUrl()}/`, "_self");
    } else {
      this.error = "The tenant you were looking for seems not to exist, do you want to register instead?"
    }
  }
}
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
