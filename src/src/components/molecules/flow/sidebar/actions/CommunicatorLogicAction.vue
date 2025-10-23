<template>
  <div class="action">
    <SidebarPanel id="communicator-editname" :name="$translate(LanguagePath.App_Editor_General)">
      <template #header>
        <TickSwitch v-model="useEditName" />
      </template>
      <TickInput v-model="name" :disabled="disabled || !useEditName" :maxLength="50" v-tokenize="{ locations: readLocations, defaultNewStorageLocation: StorageLocation.Contact }">{{
        $translate(LanguagePath.App_Name) }}</TickInput>
    </SidebarPanel>

    <SidebarPanel id="communicator-categories" :name="$translate(LanguagePath.CommunicatorCategories)">
      <template #header>
        <TickSwitch v-model="useEditCategories" />
      </template>

      <TickSwitch :disabled="disabled || !useEditCategories" v-model="resetCategoriesFirst">{{ $translate(LanguagePath.App_FlowEditor_Communicator_Categories_ResetFirst_Title) }}</TickSwitch>

      <CommunicatorCategoriesSelector v-if="!resetCategoriesFirst" :disabled="disabled || !useEditCategories" v-model="removeCategoryIds"> {{
        $translate(LanguagePath.App_FlowEditor_Communicator_Categories_Remove_Title) }}
      </CommunicatorCategoriesSelector>


      <CommunicatorCategoriesSelector :disabled="disabled || !useEditCategories" v-model="addCategoryIds">{{ $translate(LanguagePath.App_FlowEditor_Communicator_Categories_Add_Title) }}
      </CommunicatorCategoriesSelector>


    </SidebarPanel>


    <SidebarPanel id="communicator-avatar" :name="$translate(LanguagePath.App_AvatarSelector_Title)">
      <template #header>
        <TickSwitch v-model="useEditAvatar" />
      </template>

      <AvatarSelector :disabled="disabled || !useEditAvatar" @select="setAvatarSelection" :fileId="avatarFileId" :name="avatarName" :color="color" :sizePx="100" :type="null" />
    </SidebarPanel>


    <SidebarPanel id="communicator-spammer" :name="$translate(LanguagePath.App_FlowEditor_Communicator_Spam_Title)">
      <template #header>
        <TickSwitch v-model="useEditSpammer" />
      </template>
      <TickSelector :disabled="disabled || !useEditSpammer" v-model="markAsSpammer" :options="setSpamOptions" />
    </SidebarPanel>


  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';

import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import StorageInput from "@/components/molecules/flow/sidebar/actions/molecules/StorageInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import { CommunicatorLogicSettings, FlowActionCommunicatorSettings, FlowDefinitionAction, LabelActionType, LanguagePath, StorageLocation } from "@/TickApi";

import LabelList from "@/components/atoms/LabelList.vue";
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import AvatarSelector from '@/components/molecules/Selectors/AvatarSelector.vue';
import CommunicatorCategoriesSelector from '@/components/molecules/Selectors/CommunicatorCategoriesSelector.vue';
import { AvatarSelection } from '@/components/panels/AvatarSelectorPanel.vue';
import { tokenize } from '@/directives';
import { clone } from '@/helpers/cloneHelper';
import { getFlowReadStorageLocations } from '@/helpers/enumsHelper';
import { translate } from '@/plugins/translatePlugin';
@Component({
  directives: { tokenize },
  emits: [],
  components: { SidebarPanel, StorageInput, TickIcon, TickCheckbox, TickTextarea, LabelList, TickDropdown, TickInput, TickButton, TickSwitch, TickSelector, AvatarSelector, CommunicatorCategoriesSelector },
})
export default class CommunicatorLogicAction extends Vue {
  LabelActionType = LabelActionType;
  StorageLocation = StorageLocation;
  LanguagePath = LanguagePath
  Appearance = Appearance
  Color = Color
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: FlowActionCommunicatorSettings;
  @Prop() private disabled!: boolean;

  private get readLocations() {
    return getFlowReadStorageLocations();
  }

  private get data() {
    return jsonProxy<CommunicatorLogicSettings>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private set data(to: CommunicatorLogicSettings) {
    this.settings.actionDataJson = JSON.stringify(to);
  }


  private get avatarName() {
    return translate(LanguagePath.App_Name);
  }

  private get setSpamOptions() {
    const list = [
      {
        text: translate(LanguagePath.App_CommunicatorPanel_UnMarkAsSpammer_Title),
        value: false,
      },
      {
        text: translate(LanguagePath.App_CommunicatorPanel_MarkAsSpammer_Title),
        value: true,
      },
    ];

    return list;

  }
  private get resetCategoriesFirst() {
    return this.data.resetCategoriesFirst;
  }

  private set resetCategoriesFirst(to) {
    this.data.resetCategoriesFirst = to;
  }
  private get removeCategoryIds() {
    return this.data.removeCategoryIds;
  }

  private set removeCategoryIds(to) {
    this.data.removeCategoryIds = to;
  }

  private get addCategoryIds() {
    return this.data.addCategoryIds;
  }

  private set addCategoryIds(to) {
    this.data.addCategoryIds = to;
  }

  private setAvatarSelection(to: AvatarSelection) {

    var dataCopy = clone<CommunicatorLogicSettings>(this.data);
    dataCopy.avatarFileId = to.fileId;
    dataCopy.color = to.color;

    this.data = dataCopy;

  }

  private get avatarFileId() {
    return this.data.avatarFileId;
  }
  private get color() {
    return this.data.color;
  }


  private get useEditSpammer() {
    return this.data.useSetSpammer || false;
  }

  private set useEditSpammer(to) {
    this.data.useSetSpammer = to;
  }

  private get markAsSpammer() {
    return this.data.markAsSpammer || false;
  }

  private set markAsSpammer(to) {
    this.data.markAsSpammer = to;
  }

  private get useEditAvatar() {
    return this.data.useEditAvatarAndColor;
  }

  private set useEditAvatar(to) {
    this.data.useEditAvatarAndColor = to;
  }
  private get useEditCategories() {
    return this.data.useSetCategory;
  }

  private set useEditCategories(to) {
    this.data.useSetCategory = to;
  }

  private get useEditName() {
    return this.data.useEditName;
  }

  private set useEditName(to) {
    this.data.useEditName = to;
  }


  private get name() {
    return this.data.name || "";
  }

  private set name(to) {
    this.data.name = to;
  }




}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
