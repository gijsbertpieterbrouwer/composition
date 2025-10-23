<template>
  <div class='container'>
    <TickForm class='form' :busy="busy">
      <template #heading>{{ this.headerTitle }}</template>
      <template #error v-if="error">{{ this.error }}</template>


      <div v-if="showsuccess">
        <HappyIndicator text="This works great! Your integration is set up. You can close this page and enjoy the integration." />
      </div>

    </TickForm>

  </div>
  <div class="bg2"></div>
  <div class="bg"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';
import TickForm from "@/components/molecules/TickForm.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import HappyIndicator from '@/components/atoms/HappyIndicator.vue';
import SalesRegisterBlock from '@/components/molecules/sales/SalesRegisterBlock.vue';
import { focus } from "@/directives";
import { stringIsNullOrEmpty } from '@/helpers/stringHelper';
import { activateShopifyWorkspaceIntegration, activateSlackWorkspaceIntegration, } from "@/services/WorkspaceIntegrationsService";

export enum LoginReason {
  registersuccess = "registersuccess",
}

@Component({
  directives: { focus },
  components: { TickForm, TickInput, HappyIndicator, SalesRegisterBlock }
})
export default class ActivateIntegration extends Vue {
  private busy = false;
  private error = "";
  private showsuccess = false;

  private get headerTitle() {
    return "Connecting..";
  }

  private activateForSlack(tenantId: string, integrationId: string, code: string) {
    if (stringIsNullOrEmpty(tenantId) || stringIsNullOrEmpty(integrationId) || stringIsNullOrEmpty(code)) {
      this.error = "There was an error, please try again."
    } else {
      activateSlackWorkspaceIntegration(tenantId, integrationId, code).then((d) => {
        if (d.active) {
          this.showsuccess = true;
        }
      });
    }
  }

  private activateForShopify(tenantId: string, integrationId: string, code: string) {
    if (stringIsNullOrEmpty(tenantId) || stringIsNullOrEmpty(integrationId) || stringIsNullOrEmpty(code)) {
      this.error = "There was an error, please try again."
    } else {
      activateShopifyWorkspaceIntegration(tenantId, integrationId, code).then((d) => {
        if (d.active) {
          this.showsuccess = true;
        }
      });
    }
  }

  private activateIntegration() {
    const code = this.$route.query.code as string;

    //Slack
    const tenantId = this.$route.params.tenantId as string;
    const integrationId = this.$route.params.integrationId as string;

    if (tenantId && integrationId && code) {
      this.activateForSlack(tenantId, integrationId, code);
      return;
    }

    //shopify
    const shopifyState = this.$route.query.state as string;
    if (shopifyState && shopifyState.includes("shopify")) {
      const shopifyStateParts = shopifyState.split("_");
      this.activateForShopify(shopifyStateParts[1], shopifyStateParts[2], code)
    }
    return;
  }

  private mounted() {
    this.activateIntegration();

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
