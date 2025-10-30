<template>
  <TickDialogPanel class="panel" @close="close">
    <template #title>{{ $translate(LanguagePath.App_TenantRemovePanel_Title) }}</template>

    <div class="content">
      <span class="explanation" v-if="!callerIsAdmin">
        <TickIcon name="warning" />Only Administrators are allowed to perform this action.
      </span>

      <template v-if="!requestApproved">
        <TickHeading size="normal">{{ $translate(LanguagePath.App_TenantRemovePanel_ReadFirst_Title) }}</TickHeading>
        <div>
          {{ $translate(LanguagePath.App_TenantRemovePanel_Read_Title) }}
          <ol class="removal-list">
            <li>{{ $translate(LanguagePath.App_TenantRemovePanel_Read_AllData_Title) }}</li>
            <li>{{ $translate(LanguagePath.App_TenantRemovePanel_Read_Permanent_Title) }}</li>
          </ol>
        </div>

        <div class="final-check">
          <TickCheckbox :disabled="!callerIsAdmin" v-model="finalAnswer">{{ $translate(LanguagePath.App_TenantRemovePanel_ConfirmationCheck_Title) }}</TickCheckbox>
        </div>
      </template>

      <template v-else>
        <TickHeading size="normal">{{ $translate(LanguagePath.App_TenantRemovePanel_Pending_Title) }}</TickHeading>
        <span class="explanation">
          {{ $translate(LanguagePath.App_TenantRemovePanel_Pending_Explanation) }}
        </span>
      </template>
    </div>

    <template #footer>
      <template v-if="!requestApproved">
        <TickButton v-if="busyRethinking" @click="stopRemoval" :appearance="ButtonAppearance.secondary">
          {{ $translate(LanguagePath.App_TenantRemovePanel_Reconsider_Title) }}
          <TickCountdown :to="rethinkTimerToTicks" :from="rethinkTimerFromTicks" />
        </TickButton>
        <TickButton v-else :busy="busyRequesting" :disabled="!callerIsAdmin" @click="requestRemoval">
          {{ $translate(LanguagePath.App_TenantRemovePanel_RemoveButton_Title) }}
        </TickButton>
      </template>
      <template v-else>
        <TickButton @click="toAppBase">{{ $translate(LanguagePath.App_TenantRemovePanel_LogoutRequest_Title) }}</TickButton>
      </template>
    </template>
  </TickDialogPanel>
</template>

<script lang="ts">
import TickButton, { Appearance as ButtonAppearance } from '@/components/atoms/TickButton.vue';
import TickCheckbox from '@/components/atoms/TickCheckbox.vue';
import TickCountdown from '@/components/atoms/TickCountdown.vue';
import TickHeading from '@/components/atoms/TickHeading.vue';
import TickDialogPanel from '@/components/panels/TickDialogPanel.vue';
import TickIcon from '@/components/TickIcon.vue';
import { dateToTicks } from '@/helpers/dateHelper';
import { debugAction } from '@/log';
import { notifyMessage } from '@/notify';
import { translate } from '@/plugins/translatePlugin';
import { AppBaseUrl } from '@/services/urls';
import useAppStore from '@/store/app';
import useSubscriptionStore from '@/store/subscription';
import useUserStore from '@/store/user';
import { LanguagePath, TickRemoveTenantRequest } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';

@Component({
  emits: ['update:modelValue', 'close'],
  components: {
    TickDialogPanel,
    TickButton,
    TickCheckbox,
    TickCountdown,
    TickHeading,
    TickIcon,
  },
})
export default class TenantRemovePanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  LanguagePath = LanguagePath;

  finalAnswer = false;
  rethinkTime = 20000;
  rethinkTimerFromTicks: number | null = null;
  rethinkTimerToTicks: number | null = null;
  rethinkTimerId: ReturnType<typeof setTimeout> | null = null;
  busyRethinking = false;
  busyRequesting = false;
  requestApproved = false;

  get callerIsAdmin() {
    return useUserStore().isGlobalAdmin;
  }

  close() {
    this.$emit('close');
    this.stopRemoval();
  }

  unmounted() {
    this.stopRemoval();
  }

  toAppBase() {
    useAppStore().logOut();
    const redirectUrl = `http://app.${AppBaseUrl()}/`;
    window.open(redirectUrl, '_self');
  }

  stopRemoval() {
    if (this.rethinkTimerId) {
      debugAction(`[TENANT:CANCEL] Cancel the removal of this tenant`);
      clearTimeout(this.rethinkTimerId);
    }
    this.rethinkTimerId = null;
    this.busyRethinking = false;
    this.finalAnswer = false;
  }

  requestRemoval() {
    if (!this.callerIsAdmin) return;
    if (!this.finalAnswer) {
      notifyMessage(
        translate(LanguagePath.App_TenantRemovePanel_Remove_ConfirmationRequired_Title),
        translate(LanguagePath.App_TenantRemovePanel_Remove_ConfirmationRequired_Explanation)
      );
      return;
    }

    const start = new Date();
    const end = new Date();
    start.setMilliseconds(start.getMilliseconds() + this.rethinkTime);

    this.rethinkTimerToTicks = dateToTicks(start);
    this.rethinkTimerFromTicks = dateToTicks(end);

    this.busyRethinking = true;
    debugAction(`[TENANT:Remove] Start remove this tenant (Wait for rethinking time)`);

    this.rethinkTimerId = setTimeout(() => {
      if (!this.finalAnswer) return;

      this.busyRethinking = false;
      this.busyRequesting = true;

      const req: TickRemoveTenantRequest = {
        confirmRemovingTenant: this.finalAnswer,
      };

      debugAction(`[TENANT:Remove] Start requesting removal`);
      useSubscriptionStore().removeTenant(req).then((d) => {
        this.busyRequesting = false;
        if (d.tenantRemovalRequested) {
          this.requestApproved = true;
        }
      });
    }, this.rethinkTime);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  min-width: 600px;
  padding: 10px;
  display: grid;
  gap: 20px;

  .final-check {
    margin-top: 40px;
  }

  .removal-list {
    list-style: decimal;
    margin-left: 20px;
    margin-top: 20px;
  }
}

.explanation {
  font-style: italic;
  font-size: $text-size-regular;
}
</style>
