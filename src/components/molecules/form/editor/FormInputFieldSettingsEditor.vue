<template>
  <div>
    <SidebarPanel :name="$translate(LanguagePath.App_Editor_General)">
      <template #header>
        <TickSelector v-model="settings.type" :options="inputTypeOptions" :disabled="disabled" />
      </template>
      <TickInput v-model="settings.name" :disabled="disabled">{{ $translate(LanguagePath.App_Name) }}</TickInput>
      <TickTextarea v-model="settings.description" :disabled="disabled">{{ $translate(LanguagePath.App_Description) }}</TickTextarea>
      <TickCheckbox v-model="settings.required" :disabled="disabled">{{ $translate(LanguagePath.App_Required) }}</TickCheckbox>

      <TickInput v-if="settings.type == TaskFormInputType.MultiLine" type="range" :hideInput="true" :min="0" :max="20" v-model="settings.textArea_Minimumrows" :disabled="disabled">{{
        $translate(LanguagePath.App_TaskDefinitionEditor_Panel_TextArea_MinRows_Title) }}</TickInput>


    </SidebarPanel>
    <SidebarPanel :name="$translate(LanguagePath.App_TaskDefinitionEditor_Panel_Capture_Title)">
      <template #header>
        <TickSwitch v-model="settings.storeToState" :disabled="disabled" />
      </template>

      <DatabagItemSelector v-if="settings.storeToState" :locations="writeLocations" :defaultNewStorageLocation="defaultNewStorageLocation" :disabled="disabled" v-model="settings.answerStoragePath"
        :allowAsSubDialog="true" />

    </SidebarPanel>
    <SidebarPanel :name="$translate(LanguagePath.App_TaskDefinitionEditor_Validation_Title)" v-if="renderValidationSettings">
      <TickSelector v-model="settings.validationType" :options="getValidationTypeOptions" :disabled="disabled">{{
        $translate(LanguagePath.App_TaskDefinitionEditor_Panel_Capture_Validation_Type)
      }} </TickSelector>
      <TickInput v-if="renderCustomValidation" v-model="settings.validationRegEx" placeholder="" :disabled="disabled">{{
        $translate(LanguagePath.App_TaskDefinitionEditor_Panel_Capture_Validation_Type_Custom) }}</TickInput>
      <TickInput v-model="settings.invalidEcho" placeholder="" :disabled="disabled">{{ $translate(LanguagePath.App_TaskDefinitionEditor_Panel_Capture_Validation_Message) }}</TickInput>
    </SidebarPanel>
  </div>
</template>

<script lang="ts">
import { FormFieldInputSettings, FormFieldInputType, LanguagePath, StorageLocation, ValidationTypeEnum } from "@/TickApi";
import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import TickButton from '@/components/atoms/TickButton.vue';
import TickCheckbox from '@/components/atoms/TickCheckbox.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextarea from '@/components/atoms/TickTextarea.vue';
import DatabagItemSelector from '@/components/molecules/Selectors/DatabagItemSelector.vue';
import { getStorageLocationOptions, getTaskFormInputTypeOptions, getTextualQuestionValidationTypeOptions } from '@/helpers/enumsHelper';
import { jsonProxy } from "@/helpers/jsonProxy";
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';

@Component({
  emits: ["delete"],
  components: { TickButton, TickInput, TickTextarea, TickSelector, TickCheckbox, TickSwitch, SidebarPanel, DatabagItemSelector }
})
export default class FormInputFieldSettingsEditor extends Vue {
  LanguagePath = LanguagePath
  TaskFormInputType = FormFieldInputType
  @Prop() private disabled = false;
  @Prop() private readLocations: StorageLocation[];
  @Prop() private writeLocations: StorageLocation[];
  @Prop() private defaultNewStorageLocation: StorageLocation;

  @VModel({ required: true }) private data: string;

  private get settings() {
    return jsonProxy<FormFieldInputSettings>(this.data || "{}", (json) => {
      this.data = json;
    });
  }

  // private get availableStorageLocations(): StorageLocation[] {
  //   return this.storageLocationOptions.map((d) => d.value);
  // }

  private get inputTypeOptions() {
    return getTaskFormInputTypeOptions();
  }
  private get storageLocationOptions() {
    return getStorageLocationOptions(false, false);
  }
  private get getValidationTypeOptions() {
    return getTextualQuestionValidationTypeOptions();
  }

  private get renderValidationSettings() {
    return this.settings.type == FormFieldInputType.SingleLine;
  }

  private get renderCustomValidation() {
    return this.settings.validationType == ValidationTypeEnum.Custom;
  }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
