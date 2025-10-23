<template>
  <div class="container">
    <TickForm v-if="viewstate != 'validate'" @submit="requestResetEmail" :disabled="loading">
      <template #heading>Reset password</template>
      <template #introduction>Forgetting is only human.. We can send you a verification code to the emailaddress provided</template>
      <template #error v-if="error">{{ this.error }}</template>
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
      <template #error v-if="error">{{ this.error }}</template>

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

<script lang="ts">
import { Component, Vue, Watch } from 'vue-facing-decorator';

import TickForm from "@/components/molecules/TickForm.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import { getTenantInfo } from "@/services/TenantService";
import { requestUserPasswordReset, resetPassword } from '@/services/AuthenticationService';
import { getTenantUrlNameFromHostname } from '@/helpers';
import { TickRouteParams, ViewName } from '@/router';
import { focus } from "@/directives";
@Component({
  directives: { focus },
  components: { TickForm, TickInput }
})
export default class ResetPassword extends Vue {
  private viewstate = "request";
  private tenantIsFetching = false;
  private tenantId = "";
  private loading = false;
  private error = "";

  private username = process.env.VUE_APP_EMAIL || "";;

  private newPassword = "";
  private validationCode = "";

  private waitmessage = "Please wait";

  @Watch("$route.params")
  private routeParamsChanged(to: TickRouteParams, from: TickRouteParams) {
    if (to.viewstate != from.viewstate) {
      this.viewstate = to.viewstate;
    }

  }

  private beforeMount() {
    const params = this.$route.params as TickRouteParams
    if (params.viewstate) {
      this.viewstate = params.viewstate;
    }

    this.trySetTenantId();
  }


  private async trySetTenantId() {
    this.tenantIsFetching = true;

    const response = await getTenantInfo({ tenantUrlName: getTenantUrlNameFromHostname(window.location.hostname) });
    if (!response) {
      this.error = "Tick is currently unavailable. Please try again later.";
      return;
    }

    if (response && response.success) {
      this.tenantId = response.tenantId;
      this.tenantIsFetching = false;
      return;
    }

    this.tenantId = "";
    this.$router.push({ name: ViewName.NoTenant, params: { reason: 'doesnotexist' } });

  }

  private async tryResetUsingValidationCode() {
    if (this.loading) { return; }
    this.loading = true;
    this.error = "";
    resetPassword({
      tenantId: this.tenantId,
      newPassword: this.newPassword,
      validationCode: this.validationCode,
    }).then((data) => {
      //success => go to login
      this.loading = false;

      if (data.success) {

        this.$router.push({ name: ViewName.Login, params: { reason: 'Your new password is saved, try it!' } });
      } else {
        this.error = data.message;
      }

    }, (response) => {
      //failed
      this.loading = false;
      this.error = response.message;
    })

  }


  private async requestResetEmail() {
    if (this.loading) { return; }

    this.loading = true;
    this.error = "";
    requestUserPasswordReset({
      tenantId: this.tenantId,
      userName: this.username,
    }).then(() => {
      this.loading = false;
      //this.viewstate = "validate";
      this.$router.push({ params: { ...this.$route.params, viewstate: "validate" } });
      this.waitmessage = "";
    }, (response) => {
      this.loading = false;
      this.waitmessage = response.message;
    })


  }

}
</script>


<style lang="scss" scoped>
@import "@/styles/theme";

.container {
  height: 100dvh;
  width: 100dvw;

  @include gradient-bg;
}
</style>
