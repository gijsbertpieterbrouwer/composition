<template>
  <TickEditorPanel :name="domainName">
    <template v-slot:actions>
      <TickButton v-if="allowEdit" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.small" @click="deleteDomain" icon="delete" />
    </template>
    <template v-slot:explainer>
      <span class="active-indicator" :class="subClass"> {{ this.getSubtitle }}</span>
      <span v-if="!isVerified" class="info">{{ $translate(LanguagePath.App_InternetDomainEditor_LastCheck, { path: 'date', value: this.lastCheckFormattedDate }) }} </span>
      <span v-else class="info">{{ $translate(LanguagePath.App_InternetDomainEditor_VerifiedDate, { path: 'date', value: this.verifiedFormattedDate }) }}</span>
    </template>

    <template v-if="allowVerification">
      <TickHeading :size="HeadingSize.small">{{ $translate(LanguagePath.App_InternetDomainEditor_EmailVerification_Title) }}</TickHeading>
      <div> {{ }} </div>
      <div class="verification-area">
        <TickInput class="validation-key" v-model="publicValidationKey" :disabled="disabled" :placeholder="'Paste the email validation code here'" />
        <TickButton :appearance="Appearance.secondary" @click="startVerify" :busy="busyValidating">{{ $translate(LanguagePath.App_InternetDomainEditor_EmailVerification_Button_Title) }}
        </TickButton>
      </div>

      <TickHeading :size="HeadingSize.small" v-if="hasDNSValidationSettings"> {{ $translate(LanguagePath.App_InternetDomainEditor_DNSVerification_Title) }}</TickHeading>
      <div class="dns-verify" v-if="hasDNSValidationSettings">
        {{ $translate(LanguagePath.App_InternetDomainEditor_DNSVerification_Explanation, { path: 'code', value: this.DNSValidationKey }) }}
      </div>


    </template>


  </TickEditorPanel>
</template>

<script lang="ts">
import { ColorsEnum, TickInternetDomain, TenantInternetDomainStatusEnum, LanguagePath } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickInput from "@/components/atoms/TickInput.vue";
import TickHeading, { Size as HeadingSize } from "@/components/atoms/TickHeading.vue";

import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickScreen from '../editor/TickScreen.vue';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import { getColorName } from '@/helpers/colorsHelper';
import useInternetDomainsStore from '@/store/internetDomains';
import { displayDate } from "@/helpers/dateHelper";
import { translate } from '@/plugins/translatePlugin';
import { onConfirmation } from '../../../helpers/questionHelper';
@Component({
  emits: ["deleted", "saved"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, TickScreen, TickEditorPanel, TickDropdown, TickHeading },
})
export default class InternetDomainEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  HeadingSize = HeadingSize

  @Prop() private domain!: TickInternetDomain;

  private publicValidationKey = "";
  private busyValidating = false;

  private deleteDomain() {
    onConfirmation(() => {

      useInternetDomainsStore().deleteDomain(this.domain.id).then(() => {
        this.$emit("deleted");
      });
    });

  }

  private startVerify() {
    if (!this.publicValidationKey) { return; }

    this.busyValidating = true;
    useInternetDomainsStore().validateDomainByPublicValidationKey(this.domain.id, this.publicValidationKey).then(() => {
      this.busyValidating = false;
    });
  }

  private get emailaddress() {
    return `(sent to ${this.domain.emailReceipient})` || '';
  }

  private get domainName() {
    return this.domain.domainName
  }

  private get disabled() {
    return !this.allowEdit;
  }
  private get allowEdit() {
    return true;//useUserStore().allowed(TeamUserAuthorizationType.InternetDomainsWrite)
  }

  private get allowVerification() {
    return this.domain.status == TenantInternetDomainStatusEnum.Validating;
  }
  private get isVerified() {
    return this.domain.status == TenantInternetDomainStatusEnum.Verified;
  }

  private get hasDNSValidationSettings() {
    return this.domain.publicVerificationCode && this.domain.publicVerificationCode.length;
  }

  private get DNSValidationKey(): string {
    return this.domain.publicVerificationCode;
  }
  private get verifiedFormattedDate() {
    return displayDate(this.domain.verifiedDate);
  }

  private get lastCheckFormattedDate() {
    return displayDate(this.domain.lastCheckDate);
  }

  private get subClass() {
    if (this.domain.status == TenantInternetDomainStatusEnum.Verified) {
      return getColorName(ColorsEnum.Lime);
    }

    if (this.domain.status == TenantInternetDomainStatusEnum.Rejected) {
      return getColorName(ColorsEnum.Red);
    }
    return getColorName(ColorsEnum.Grey);
  }

  private get getSubtitle() {

    if (this.domain.status == TenantInternetDomainStatusEnum.Verified) {
      return translate(LanguagePath.App_InternetDomainEditor_Verified);
    }

    if (this.domain.status == TenantInternetDomainStatusEnum.Rejected) {
      return translate(LanguagePath.App_InternetDomainEditor_Verified);
    }

    return translate(LanguagePath.App_InternetDomainEditor_Waiting);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.dns-verify {
  font-size: 0.8em;
  padding: 10px;
}


.verification-area {

  display: flex;
  gap: 10px;

  .validation-key {
    display: inline-block;
    min-width: 300px;
  }

}


.active-indicator {
  font-style: normal;
  display: inline-block;
  padding: 2px;
  background-color: $grey400;
  padding: 0 4px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  white-space: nowrap;
  border-radius: 2px;

  margin-right: 5px;
  margin-left: 5px;
  @include neon-bg;
}


.info {
  font-size: 0.7em;
}
</style>
