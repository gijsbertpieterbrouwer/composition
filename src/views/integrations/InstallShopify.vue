<template>
  <div class='container'>
    <TickForm class='form' :busy="busy || this.busySignIn" @submit="install">
      <template #heading>{{ this.headerTitle }}</template>
      <template #error v-if="error">{{ this.error }}</template>

      <div v-if="showsuccess">
        <HappyIndicator text="This works great! Your integration is set up. You can close this page and enjoy the integration." />
      </div>

      <TickInput v-focus v-model="tenantUrlName" :disabled="busySignIn || this.tenantIsFetching" placeholder="Your username or e-mail address">Username</TickInput>
      <TickInput v-focus v-model="username" :disabled="busySignIn || this.tenantIsFetching" placeholder="Your username or e-mail address">Username</TickInput>
      <TickInput type="password" v-model="password" :disabled="busySignIn || this.tenantIsFetching" placeholder="Your password">Password</TickInput>

      <template #button>Install Shopify</template>
    </TickForm>

  </div>
  <div class="bg2"></div>
  <div class="bg"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';
import { login, ViewAuthenticationResponse } from "@/services/AuthenticationService";
import { getTenantInfo } from "@/services/TenantService";
import TickForm from "@/components/molecules/TickForm.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import useAppStore from '@/store/app';
import HappyIndicator from '@/components/atoms/HappyIndicator.vue';
import SalesRegisterBlock from '@/components/molecules/sales/SalesRegisterBlock.vue';
import { focus } from "@/directives";
import { stringIsNullOrEmpty } from '@/helpers/stringHelper';

export enum LoginReason {
  registersuccess = "registersuccess",
}

@Component({
  directives: { focus },
  components: { TickForm, TickInput, HappyIndicator, SalesRegisterBlock }
})
export default class InstallShopify extends Vue {
  private busy = false;
  private busySignIn = false;
  private tenantIsFetching = false;
  private error = "";
  private showsuccess = false;

  private username = process.env.VUE_APP_EMAIL || "";
  private password = process.env.VUE_APP_PASSWORD || "";
  private tenantUrlName = process.env.VUE_APP_TENANTNAME || "";
  private tenantId = "";
  private tenantName = "";

  private get headerTitle() {
    return "Install Shopify";
  }

  private mounted() {
    const hmac = this.$route.query.hmac as string;
    const shopUrl = this.$route.query.shop as string;
    //const timestamp = this.$route.query.timestamp as string;
    //const authenticated = useAppStore().authenticated

    //console.log("authenticated", authenticated)

    if (stringIsNullOrEmpty(hmac) || stringIsNullOrEmpty(shopUrl)) {
      this.error = "There was an error, please try again."
    } else {
      // activateSlackWorkspaceIntegration(tenantId, integrationId, code).then((d) => {
      //   if (d.active) {
      //     this.showsuccess = true;
      //   }
      // });
    }

  }


  private async install() {
    if (this.busy) { return; }
    this.busy = true;
    this.error = "";

    this.fetchTenantInfo().then((r) => {
      if (!r) { return; }

      this.login().then((d) => {
        if (!d.success) {
          this.error = "invalid credentials, please try again";
          return;
        }

        //this.installShopify()

      });
    });


    // requestUserPasswordReset({
    //   tenantId: this.tenantId,
    //   userName: this.username,
    // }).then(() => {
    //   this.busy = false;
    //   //this.viewstate = "validate";
    //   this.$router.push({ params: { ...this.$route.params, viewstate: "validate" } });
    //   this.waitmessage = "";
    // }, (response) => {
    //   this.loading = false;
    //   this.waitmessage = response.message;
    // })

  }

  //   private async installShopifyIntegration():Promise<boolean>{
  //     addWorkspaceIntegration(useUserStore().activeWorkspaceId, IntegrationType.Shopify).then((d) => {

  //       activateShopifyWorkspaceIntegration

  // return true;
  //     });
  //   }

  private async login(): Promise<ViewAuthenticationResponse> {
    const response = await login({
      tenantId: this.tenantId,
      username: this.username,
      password: this.password,
      deviceId: useAppStore().getDeviceId(),
      deviceName: useAppStore().getDeviceName(),
    });
    return response;
  }


  private async fetchTenantInfo(): Promise<boolean> {
    this.tenantIsFetching = true;

    const response = await getTenantInfo({ tenantUrlName: this.tenantUrlName });
    if (!response) { this.error = "Tick is currently not able to verify this session." }

    if (response && response.success) {
      this.tenantId = response.tenantId;
      this.tenantName = response.tenantName;
      this.tenantIsFetching = false;
      this.error = ""
      return true;
    }
    return false;
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


  background-image: url('../../media/loginbg.png');
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
