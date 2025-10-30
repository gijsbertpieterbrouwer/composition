<template>
  <div class='container'>
    <TickForm class='form' @submit="tryAuthenticate" :disabled="tenantIsFetching" :busy="busySignIn">
      <template #heading>{{ this.headerTitle }}</template>
      <!-- <template #heading>Provide<template v-if="!tenantIsFetching">to {{ tenantName }}</template>.</template> -->
      <template #error v-if="error">{{ this.error }}</template>


      <div v-if="showregistersuccess">
        <HappyIndicator text="This works great! The next step is to log in and enjoy Tick!" />
      </div>

      <TickInput v-focus v-model="username" :disabled="busySignIn || this.tenantIsFetching" placeholder="Your username or e-mail address">Username</TickInput>
      <TickInput type="password" v-model="password" :disabled="busySignIn || this.tenantIsFetching" placeholder="Your password">Password</TickInput>
      <router-link :to="{ name: 'ResetUserPassword' }">I forgot my password</router-link>

      <template #button>Log in</template>
      <template #suffix>
        <div class="teaser" v-if="showRegisterSalesTeaser">
          <SalesRegisterBlock />
        </div>
      </template>
    </TickForm>

  </div>
  <div class="bg2"></div>
  <div class="bg"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';

import * as LOG from '@/log';
import { login } from "@/services/AuthenticationService";
import { getTenantInfo } from "@/services/TenantService";
import { getTenantUrlNameFromHostname } from "@/helpers";

import TickForm from "@/components/molecules/TickForm.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import useAppStore from '@/store/app';
import HappyIndicator from '@/components/atoms/HappyIndicator.vue';
import SalesRegisterBlock from '@/components/molecules/sales/SalesRegisterBlock.vue';
import { RouterToHome } from '@/router';
import { focus } from "@/directives";
export enum LoginReason {
  registersuccess = "registersuccess",
}

@Component({
  directives: { focus },
  components: { TickForm, TickInput, HappyIndicator, SalesRegisterBlock }
})
export default class Login extends Vue {
  private tenantIsFetching = true;
  private busySignIn = false;
  private tenantId = "";
  private tenantName = "";

  private loading = false;
  private error = "";
  private username = process.env.VUE_APP_EMAIL || "";
  private password = process.env.VUE_APP_PASSWORD || "";

  private showregistersuccess = false;


  private get headerTitle() {
    return this.tenantName ? `${this.tenantName}` : "Sign in for ...";
  }

  private get showRegisterSalesTeaser() {
    return !this.showregistersuccess;
  }

  private beforeMount() {
    this.trySetTenantId();

    if (this.$route.params.reason) {
      if (this.$route.params.reason.toString().toLowerCase() == LoginReason.registersuccess) {
        this.showregistersuccess = true;
      }
    }

    if (this.$route.query.username) {
      this.username = this.$route.query.username as string;
    }


  }

  private async trySetTenantId() {
    this.tenantIsFetching = true;

    const response = await getTenantInfo({ tenantUrlName: getTenantUrlNameFromHostname(window.location.hostname) });
    if (!response) {
      this.error = "Tick is currently unavailable. Please try again later.";

      setTimeout(() => {
        this.trySetTenantId();
      }, 2000);


      return;
    }

    if (response && response.success) {
      this.tenantId = response.tenantId;
      this.tenantName = response.tenantName;
      this.tenantIsFetching = false;
      this.error = ""
      return;
    }

    this.tenantId = "";
    this.tenantName = "";

    this.$router.push({ name: 'NoTenant', params: { reason: 'doesnotexist' } });
  }


  private onLoginSuccess() {
    this.busySignIn = false;

    if (this.$route.query && this.$route.query.from) {
      this.$router.replace(this.$route.query.from as string);
    } else {
      RouterToHome();
    }


  }

  private async tryAuthenticate() {
    if (this.busySignIn) { return; }

    if (!this.tenantId) { return; }
    LOG.debug('[LOGIN:Start]authentication start');
    this.error = "";

    this.busySignIn = true


    const response = await login({
      tenantId: this.tenantId,
      username: this.username,
      password: this.password,
      deviceId: useAppStore().getDeviceId(),
      deviceName: useAppStore().getDeviceName(),
    });


    if (response && response.success) {
      this.error = "";
      setTimeout(this.onLoginSuccess, 500);
      return;
    }
    this.busySignIn = false;
    this.error = response?.message;

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
  width: 100vw;
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
  width: 100vw;
  z-index: 23;




  a {
    color: $black !important;
  }

  .mandate-success {
    color: $success;
    width: 300px;
  }

  .teaser {
    width: 400px;
  }

}
</style>
