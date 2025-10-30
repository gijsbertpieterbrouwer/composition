<template>
  <FormInputFieldSettingsEditor v-if="modelType == TaskFormFieldType.Input" v-model="model.settingsJson" :disabled="disabled" :readLocations="readLocations" :writeLocations="writeLocations"
    :defaultNewStorageLocation="defaultNewStorageLocation" />
  <FormSelectInputFieldSettingsEditor v-else-if="modelType == TaskFormFieldType.SelectInput" v-model="model.settingsJson" :disabled="disabled" :readLocations="readLocations"
    :writeLocations="writeLocations" :defaultNewStorageLocation="defaultNewStorageLocation" />
  <FormExplanationFieldSettingsEditor v-else-if="modelType == TaskFormFieldType.Explanation" v-model="model.settingsJson" :disabled="disabled" />

  <FormSmartViewerFieldSettingsEditor v-else-if="modelType == TaskFormFieldType.SmartViewer" v-model="model.settingsJson" :disabled="disabled" :readLocations="readLocations"
    :writeLocations="writeLocations" />

</template>

<script lang="ts">
import { FormFieldDefinition, FormFieldType, StorageLocation } from "@/TickApi";
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import FormInputFieldSettingsEditor from '@/components/molecules/form/editor/FormInputFieldSettingsEditor.vue';
import FormSelectInputFieldSettingsEditor from "@/components/molecules/form/editor/FormSelectInputFieldSettingsEditor.vue";
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';
import FormExplanationFieldSettingsEditor from './FormExplanationFieldSettingsEditor.vue';
import FormSmartViewerFieldSettingsEditor from "./FormSmartViewerFieldSettingsEditor.vue";


@Component({
  emits: ["patch", "delete"],
  components: { TickButton, FormInputFieldSettingsEditor, FormSelectInputFieldSettingsEditor, FormExplanationFieldSettingsEditor, FormSmartViewerFieldSettingsEditor }
})
export default class FormFieldEditor extends Vue {
  TaskFormFieldType = FormFieldType;
  Appearance = Appearance
  Color = Color
  Size = Size

  @VModel({ required: true }) private model!: FormFieldDefinition;
  @Prop() private disabled = false;
  @Prop() private readLocations: StorageLocation[];
  @Prop() private writeLocations: StorageLocation[];
  @Prop() private defaultNewStorageLocation: StorageLocation;

  private get modelType() {
    return this.model.type;
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
