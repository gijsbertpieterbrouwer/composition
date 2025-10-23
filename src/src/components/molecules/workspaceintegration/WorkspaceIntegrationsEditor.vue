<template>
  <div class="wrapper">

    <TickItemSummaryBlock v-if="!exist(IntegrationType.Slack)" :title="'Slack'" :icon="integrationIcon(IntegrationType.Slack)">
      Connect Tick to your Slack workspace and also receive Tick-notifications when not logged in into Tick.
      <div class="disclaimer">Use the same e-mail address for Tick and Slack.</div>

      <template #actions>
        <!-- <TickButton @click="addIntegration(IntegrationType.Slack)" :appearance="Appearance.primary" :color="Color.contrast">Add integration</TickButton> -->
        <TickButton v-if="!exist(IntegrationType.Slack)" @click="addIntegration(IntegrationType.Slack)" :appearance="Appearance.secondary" :color="Color.contrast">Connect slack
        </TickButton>
        <template v-else>
          <!-- <TickButton @click="testWorkspaceIntegration(IntegrationType.Slack)" :appearance="Appearance.secondary" :color="Color.contrast">Test</TickButton>
          <TickButton @click="removeIntegration(IntegrationType.Slack)" :appearance="Appearance.primary" :color="Color.secondary">Remove Slack</TickButton> -->

        </template>
      </template>
    </TickItemSummaryBlock>


    <TickItemSummaryBlock :title="'Shopify'" :icon="integrationIcon(IntegrationType.Shopify)">
      Integrate Shopify into Tick, see your customers orders, etc.
      <br /> <br />

      <TickInput v-model="shopifyUrl" placeholder="https://yourdomain.myshopify.com" />

      <template #actions>
        <TickButton @click="addIntegration(IntegrationType.Shopify)" :appearance="Appearance.secondary" :color="Color.contrast">Connect Shopify shop
        </TickButton>

      </template>
    </TickItemSummaryBlock>
  </div>


  <div class="list">
    <!-- @select="selectIntegration(item)"  -->
    <TickListItem :icon="integrationIcon(item.type)" :name="item.name" v-for="item in this.existingIntegrations" :key="item.id">
      {{ this.getIntegrationSubtitle(item) }}

      <template v-slot:actions>

        <TickButton v-if="item.type == IntegrationType.Slack" @click="testWorkspaceIntegration(item)" :appearance="Appearance.secondary" :color="Color.secondary">Test
        </TickButton>

        <TickButton @click.stop="removeSpecificIntegration(item)" :appearance="Appearance.secondary" :color="Color.contrast" icon="delete" title="Remove this integration">
          Remove
        </TickButton>

      </template>
    </TickListItem>
  </div>

</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { AuthorizationObjectType, IntegrationType, TickAddShopifyIntegrationData, TickShopifyWorkspaceIntegrationViewData, TickWorkspaceIntegration } from "@/TickApi";
import { Component, Vue } from "vue-facing-decorator";
import TickEditorPanel from "../editor/TickEditorPanel.vue";
import TickScreen from "../editor/TickScreen.vue";

import TickHeading from "@/components/atoms/TickHeading.vue";
import Ticklabel from "@/components/atoms/TickLabel.vue";
import useUserStore from "@/store/user";

import TickItemSummaryBlock from "@/components/atoms/TickItemSummaryBlock.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickIcon from "@/components/TickIcon.vue";
import { getHostNameFromUrl } from "@/helpers/stringHelper";
import { openUrl } from "@/services/urls";
import { testWorkspaceIntegration } from "@/services/WorkspaceIntegrationsService";
import useManagingStore from "@/store/managingStore";

@Component({
  emits: ["saved"],
  components: {
    TickInput,
    TickTextArea,
    TickButton,
    TickCheckbox,
    ThenHr,
    TickScreen,
    TickEditorPanel,
    Ticklabel,
    TickSelector,
    TickHeading,
    TickIcon, TickItemSummaryBlock, TickListItem

  },
})
export default class WorkspaceIntegrationsEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  IntegrationType = IntegrationType

  private integrationData: object = null;

  private shopifyUrl: string = null;

  private integrationIcon(type: IntegrationType): string {

    switch (type) {
      case IntegrationType.Slack: return "slackcolor";
      case IntegrationType.Shopify: return "slackcolor";
      default: return "";
    }
  }

  private get disabled(): boolean {
    return !this.editallowed;
  }

  private get editallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace)
  }

  private getShopifyIntegrationSubtitle(integration: TickWorkspaceIntegration) {
    const shopifyViewData: TickShopifyWorkspaceIntegrationViewData = JSON.parse(integration.viewDataJson || "{}");
    return shopifyViewData.shopifyDomain || "Retrieving Shopify information";
  }

  private getIntegrationSubtitle(integration: TickWorkspaceIntegration) {
    switch (integration.type) {
      case IntegrationType.Slack: return "Sending Slack notifications (use in SLA)";
      case IntegrationType.Shopify:
        return this.getShopifyIntegrationSubtitle(integration);

      default: return "";
    }
  }

  private get existingIntegrations() {
    return useManagingStore().workspaceIntegrations || [];
  }

  private mounted() {
    this.refreshData()
  }

  private refreshData() {
    useManagingStore().useWorkspaceIntegrationS();
  }

  private exist(type: IntegrationType): boolean {
    return this.existingIntegrations.some(p => p.type == type);
  }

  // private existingIntegration(type: IntegrationType): TickWorkspaceIntegration {
  //   return this.existingIntegrations.find(p => p.type == type);
  // }

  private get shopifyIntegrationData(): TickAddShopifyIntegrationData {
    const url = this.shopifyUrl;
    const shopifyRegex = /^https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com\/?/
    const isValid = shopifyRegex.test(url);

    const domain = getHostNameFromUrl(url);

    if (!isValid) { return null; }

    return {
      shopifyDomain: domain
    }
  }

  private calcIntegrationData(type: IntegrationType): object {
    switch (type) {
      case IntegrationType.Slack: return null;
      case IntegrationType.Shopify: return this.shopifyIntegrationData;
      default: return null;
    }
  }

  private addIntegration(type: IntegrationType) {

    useManagingStore().addWorkspaceIntegration(type, this.calcIntegrationData(type)).then((data) => {
      if (data.active) { this.refreshData() }
      else {
        if (data.redirectUrl) {
          openUrl(data.redirectUrl);
        }
      }
    });

  }

  private removeSpecificIntegration(integration: TickWorkspaceIntegration) {
    if (!integration) { return; }

    useManagingStore().deleteWorkspaceIntegration(integration.id);
  }
  // private removeIntegration(type: IntegrationType) {
  //   const existing = this.existingIntegration(type);
  //   if (!existing) { return; }

  //   useManagingStore().deleteWorkspaceIntegration(existing.id).then((data) => {
  //     // do nothing, auto refresh in store
  //   });
  // }

  private testWorkspaceIntegration(integration: TickWorkspaceIntegration) {
    if (!integration) { return; }

    testWorkspaceIntegration(integration.id);

  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
}

.wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  .disclaimer {
    font-style: italic;
    font-size: $text-size-regular;
    margin-top: 20px;
    font-weight: 100;
  }

}
</style>
