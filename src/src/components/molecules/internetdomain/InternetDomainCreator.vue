<template>
  <TickEditorPanel :name="$translate(LanguagePath.App_DomainVerificationsEditor_Title)">
    <template v-slot:explainer>
      {{ $translate(LanguagePath.App_DomainVerificationsEditor_Explanation) }}
    </template>

    <div class="inputs">
      <TickInput v-model="domainName" :disabled="disabled" :placeholder="'yourdomain.com'" />
      <!-- <TickButton icon="plus" :appearance="Appearance.primary" @click="startAdd" :busy="busyAdding">{{ $translate(LanguagePath.App_DomainVerificationsEditor_Button_Title) }}</TickButton> -->

      <TickAddCostItemButton @add="startAdd" icon="plus" :busy="busyAdding" :requiredAuth="AuthorizationObjectType.TechnicalConfiguration" :costItem="SubscriptionCostItemType.InternetDomain"
        :currentNr="this.currentNr" :title="LanguagePath.App_DomainVerificationsEditor_Button_Title" />
    </div>
  </TickEditorPanel>
</template>

<script lang="ts">
import LabelList from '@/components/atoms/LabelList.vue';
import TickAddCostItemButton from '@/components/atoms/TickAddCostItemButton.vue';
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { stringIsValidDomainName } from '@/helpers/stringHelper';
import { notifyError } from "@/notify";
import useInternetDomainsStore from '@/store/internetDomains';
import { AuthorizationObjectType, LanguagePath, SubscriptionCostItemType } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';

@Component({
  emits: ["deleted", "saved"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, TickScreen, TickEditorPanel, TickDropdown, LabelList, TickAddCostItemButton },
})
export default class InternetDomainCreator extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  AuthorizationObjectType = AuthorizationObjectType;
  SubscriptionCostItemType = SubscriptionCostItemType

  private domainName = "";
  private busyAdding = false;

  private get currentNr(): number {
    return this.domains.length;
  }
  private get domains() {
    return useInternetDomainsStore().domains || [];
  }
  private startAdd() {
    if (!stringIsValidDomainName(this.domainName)) {
      notifyError("Invalid domain name", "please provide a valid domain name.")

      return;
    }

    this.busyAdding = true;
    useInternetDomainsStore().createDomain(this.domainName).then(() => {
      this.busyAdding = false;
      this.domainName = "";
    }).catch(() => {
      // notifyError("Failed", "Could it be the domain name already exists?");
    });
  }


  private get disabled() {
    return !this.allowEdit;
  }
  private get allowEdit() {
    return true;
  }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.inputs {
  display: flex;
  gap: 10px;
}
</style>
