<template>
  <div>
    <SidebarPanel :name="$translate(LanguagePath.App_Editor_General)">
      <TickInput v-model="settings.name" :disabled="disabled">{{ $translate(LanguagePath.App_Name) }}</TickInput>
      <TickTextarea v-model="settings.description" :disabled="disabled">{{ $translate(LanguagePath.App_Description) }}</TickTextarea>
      <DatabagItemSelector :locations="readLocations" :defaultNewStorageLocation="defaultNewStorageLocation" :disabled="disabled" v-model="settings.dataStoragePath" :allowAsSubDialog="true" />
    </SidebarPanel>


  </div>
</template>

<script lang="ts">
import { FormFieldInputType, FormFieldSmartViewerSettings, LanguagePath, StorageLocation } from "@/TickApi";
import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import TickButton from '@/components/atoms/TickButton.vue';
import TickCheckbox from '@/components/atoms/TickCheckbox.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextarea from '@/components/atoms/TickTextarea.vue';
import DatabagItemSelector from '@/components/molecules/Selectors/DatabagItemSelector.vue';
import { getTaskFormInputTypeOptions } from '@/helpers/enumsHelper';
import { jsonProxy } from "@/helpers/jsonProxy";
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';

@Component({
  emits: ["delete"],
  components: { TickButton, TickInput, TickTextarea, TickSelector, TickCheckbox, TickSwitch, SidebarPanel, DatabagItemSelector }
})
export default class FormSmartViewerFieldSettingsEditor extends Vue {
  LanguagePath = LanguagePath
  TaskFormInputType = FormFieldInputType
  @Prop() private disabled = false;
  @Prop() private readLocations: StorageLocation[];
  @Prop() private writeLocations: StorageLocation[];
  @Prop() private defaultNewStorageLocation: StorageLocation;

  @VModel({ required: true }) private data: string;

  private get settings() {
    return jsonProxy<FormFieldSmartViewerSettings>(this.data || "{}", (json) => {
      this.data = json;
    });
  }

  private get inputTypeOptions() {
    return getTaskFormInputTypeOptions();
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
