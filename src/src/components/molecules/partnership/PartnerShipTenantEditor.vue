<template>
  <TickScreen :loading="!loaded" :title="tenantName">
    <template v-slot:actions>

      <TickButton @click.stop="endTenantSubscription(this.activeId)" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular" title="Remove this tenant">
        End subscription
      </TickButton>

    </template>

    <template v-slot:default>

      <TickEditorPanel name="Tenant">

        <TickInput :disabled="true" v-model="tenantName">Name</TickInput>
        <TickInput :disabled="true" v-model="tenantEmail">E-mail</TickInput>
        <TickInput :disabled="true" v-model="subscriptionPlan">Plan</TickInput>
        <TickInput :disabled="true" v-model="tenantUrl">Url</TickInput>
      </TickEditorPanel>

      <TickEditorPanel name="Stats">
        <div class="stats">
          <TickCounter class="counter" :size="CounterSize.Regular" :value="nrOfUsers" :unit="''" :title="'Users'" :color="ColorsEnum.BoldLime" />
          <TickCounter class="counter" :size="CounterSize.Regular" :value="nrOfFlows" :unit="''" :title="'Flows'" :color="ColorsEnum.SubtlePink" />
        </div>
      </TickEditorPanel>

      <TickEditorPanel name="Users">
        <div class="list">
          <TickListItem :noBGColor="true" :name="user.name" v-for="user in this.users" :key="user.id">
            <template v-slot:icon>
              <TickAvatar :color="user.color" class="user-icon" :fileUrl="user.avatarUrl" :sizePx="30" :online="user.loggedIn" :name="user.name" />
            </template>

            <template #actions>

              <TickButton @click.stop="openTickForUser(user)" :appearance="Appearance.primary" :color="Color.primary" :size="Size.mini" title="Login as this user">
                Login as user
              </TickButton>
              <TickButton @click.stop="resetUserPassword(user)" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini" title="Reset this users password">
                Reset password
              </TickButton>

            </template>
            <template v-if=user.isAdmin>Administrator</template>
            <template v-else>User</template>


          </TickListItem>
        </div>

      </TickEditorPanel>

      <TickEditorPanel name="Last invoices (12 month)">
        <InvoiceListItem :disabled="true" :data="item" v-for="item in this.invoices" :key="item.id" />
      </TickEditorPanel>

    </template>
  </TickScreen>

</template>

<script lang="ts">

import LabelList from '@/components/atoms/LabelList.vue';
import TickAvatar from '@/components/atoms/TickAvatar.vue';
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickCounter, { CounterSize } from '@/components/atoms/TickCounter.vue';
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickListItem from '@/components/atoms/TickListItem.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickIcon from '@/components/TickIcon.vue';
import { resetPartnershipSubTenantUserPassword } from '@/services/PartnershipService';
import { AppBaseUrl, openUrl } from '@/services/urls';
import usePartnershipStore from '@/store/partnership';
import useUserStore from '@/store/user';
import { ColorsEnum, TenantOverview, TenantUserSummary } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import TickTimelineChart from '../charting/TickTimelineChart.vue';
import AdapterHeaderEditor from '../dataadapters/AdapterHeaderEditor.vue';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import EditorMessage, { EditorMessageType } from '../EditorMessage.vue';
import InvoiceListItem from '../subscription/InvoiceListItem.vue';

@Component({
  emits: ["deleted", "saved"],
  components: {
    TickInput, TickTextArea, TickButton, TickCheckbox, TickScreen,
    TickEditorPanel, TickDropdown, LabelList, TickSwitch, AdapterHeaderEditor, TickSelector, EditorMessage, TickTimelineChart,
    TickCounter, InvoiceListItem, TickAvatar, TickListItem, TickIcon
  },
})
export default class PartnerShipTenantEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  ColorsEnum = ColorsEnum
  EditorMessageType = EditorMessageType
  CounterSize = CounterSize

  @Prop() private activeId!: string;
  // private data: TickEventSubscription = null;
  private loaded = false;
  private tenantOverview: TenantOverview = null;

  private resetUserPassword(user: TenantUserSummary) {
    resetPartnershipSubTenantUserPassword(this.activeId, useUserStore().activeWorkspaceId, user.id);
  }
  private openTickForUser(user: TenantUserSummary) {
    openUrl(`${this.tenantUrl}/?username=${user.emailAddress}`);
  }
  private endTenantSubscription(tenantId: string) {
    if (!confirm("Are you sure, ending the subscription will remove this tenant and destroy all it's Tick data.")) { return; }
    usePartnershipStore().endSubscription(tenantId);
  } private get tenantUrl() {
    return `${this.tenantOverview?.urlName}.${AppBaseUrl()}`;
  }

  private get users() {
    return this.tenantOverview?.users;
  }
  private get subscriptionPlan() {
    return this.tenantOverview?.subscriptionName;
  }
  private get invoices() {
    return this.tenantOverview?.invoices || [];
  }

  private get nrOfFlows(): number {
    return this.tenantOverview?.flowCount;
  }
  private get nrOfUsers(): number {
    return this.tenantOverview?.userCount;
  }
  private get tenantName() {
    return this.tenantOverview?.name;
  }
  private get tenantEmail() {
    return this.tenantOverview?.defaultEmailAddress;
  }

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    usePartnershipStore().getSubTenant(id).then((d) => {
      this.loaded = true;
      this.tenantOverview = d;
    });
  }


  mounted() {
    this.activate(this.activeId);
  }




  private get readyForSave() {
    return true;//this.allowEdit && this.isValidWebhookUrl && this.domainIsVerified;
  }

  private save() {
    // useEventSubscriptionsStore().save(this.data.id);
    this.$emit("saved");
  }
  private delete() {
    // useEventSubscriptionsStore().delete(this.data.id);
    this.$emit("deleted");
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.stats {
  display: flex;
  gap: 20px;

  .counter {
    border: solid 1px #e2e2e2;
    border-radius: 8px;
    padding: 10px 60px;
  }
}

.user-icon {
  position: relative;
  display: inline-block;


  .admin-icon {
    position: absolute;
    left: 20px;
    top: -3px;
    color: var(--c-contrast);
    height: 40%;
    width: 40%;
  }
}
</style>
