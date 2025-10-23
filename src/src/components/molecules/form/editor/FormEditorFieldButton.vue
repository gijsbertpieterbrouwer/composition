<template>
  <button class="drag-field-handle field-button" @click="selectThisField">
    <div class="overlay drag-field-handle"></div>
    <TaskFormInput :disabled="true" v-if="data.type == TaskFormFieldType.Input || this.data.type == TaskFormFieldType.SelectInput" :field="fieldSampleData" />
    <TaskFormExplanation v-if="data.type == TaskFormFieldType.Explanation" :field="fieldSampleData" />
    <FormFieldSmartViewer v-if="data.type == TaskFormFieldType.SmartViewer" :field="fieldSampleData" />
  </button>
</template>

<script lang="ts">
import { FormField, FormFieldDefinition, FormFieldType } from "@/TickApi";
import TickIcon from '@/components/TickIcon.vue';
import TickButton from '@/components/atoms/TickButton.vue';
import TickCheckbox from '@/components/atoms/TickCheckbox.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickTextarea from '@/components/atoms/TickTextarea.vue';
import { getFormFieldSampleData } from "@/helpers/formHelper";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TaskFormExplanation from '../form/FormFieldExplanation.vue';
import TaskFormInput from '../form/FormFieldInput.vue';
import FormFieldSmartViewer from "../form/FormFieldSmartViewer.vue";
//import TaskFormSectionEditor from './TaskFormSectionEditor.vue';

@Component({
  emits: ["selectField", "addField", "updateSectionFields"],
  components: { TickButton, TickInput, TickTextarea, TickSelector, TickCheckbox, TaskFormInput, TaskFormExplanation, TickIcon, FormFieldSmartViewer }
})
export default class FormEditorFieldButton extends Vue {
  TaskFormFieldType = FormFieldType;
  @Prop() private data: FormFieldDefinition = null;
  @Prop() private disabled: boolean = null;


  private selectThisField() {
    this.selectField(this.data);
  }

  private updateSectionFields(fieldId: string, to: FormFieldDefinition[]) {
    this.$emit("updateSectionFields", fieldId, to);
  }

  private selectField(data: FormFieldDefinition) {
    this.$emit("selectField", data);
  }

  private bubbleAddField(data: FormFieldDefinition, fieldId: string) {
    this.$emit("addField", data, fieldId);
  }

  private get fieldSampleData(): FormField {
    return getFormFieldSampleData(this.data);

    // switch (this.data.type) {
    //   case FormFieldType.Input:
    //     return this.inputfieldSampleData;
    //   case FormFieldType.SelectInput:
    //     return this.selectInputfieldSampleData;
    //   case FormFieldType.Explanation:
    //     return this.explanationfieldSampleData;
    //   case FormFieldType.SmartViewer:
    //     return this.smartViewerfieldSampleData;
    //   default:
    //     return {};
    // }
  }

  // private get smartViewerfieldSampleData(): FormField {
  //   const settings = this.settingsAsSmartViewer;

  //   var d: FormField = {
  //     id: this.data.id,
  //     description: settings.description,
  //     name: settings.name,
  //     value: JSON.stringify({
  //       presenting: settings.dataStoragePath,
  //       sampleData: {
  //         image: `${FilesBaseUrl()}/demo/genericAdapterPicture.png`,
  //         link: "https://www.tick.cloud",
  //         items: [
  //           { name: 'Order A', price: 100 },
  //           { name: 'Order B', price: 50 },
  //           { name: 'Order B', price: 50 },
  //         ]
  //       }
  //     }),
  //   }

  //   return d;
  // }
  // private get explanationfieldSampleData(): FormField {
  //   const settings = this.settingsAsExplanation;

  //   var d: FormField = {
  //     id: this.data.id,
  //     description: settings.description,
  //     name: settings.name,
  //   }

  //   return d;
  // }

  // private get selectInputfieldSampleData(): FormField {
  //   const settings = this.settingsAsSelectInput;
  //   let options: (OptionsItemData)[] = [];

  //   if (settings.optionsSource == OptionsSourceEnum.Options) {

  //     options = settings.options.map((o) => {
  //       return {
  //         id: o.id,
  //         data: o.data,
  //         text: o.text,
  //       }
  //     })

  //   } else {
  //     options.push({ data: "sample_1", id: "1", text: "Sample 1 from state" });
  //     options.push({ data: "sample_2", id: "2", text: "Sample  2 from state" });
  //   }

  //   const sampleValue = options.length ? options[0].data : "";

  //   var d: FormField = {
  //     id: this.data.id,
  //     description: settings.description,
  //     name: settings.name,
  //     inputType: settings.type,
  //     value: sampleValue,
  //     options: options,
  //     required: settings.required,
  //     valueEdited: false,
  //     type: FormFieldType.Input,
  //   }

  //   return d;
  // }

  // private get inputfieldSampleData(): FormField {
  //   const settings = this.settingsAsInput;

  //   var d: FormField = {
  //     id: this.data.id,
  //     description: settings.description,
  //     name: settings.name,
  //     inputType: settings.type,
  //     value: "",
  //     required: settings.required,
  //     valueEdited: false,
  //     type: FormFieldType.Input,
  //     textArea_Minimumrows: settings.textArea_Minimumrows,
  //   }

  //   return d;
  // }

  // private get settingsAsSelectInput() {
  //   return this.settingsAs<FormFieldSelectInputSettings>();
  // }
  // private get settingsAsInput() {
  //   return this.settingsAs<FormFieldInputSettings>();
  // }

  // private get settingsAsExplanation() {
  //   return this.settingsAs<FormFieldExplanationSettings>();
  // }
  // private get settingsAsSmartViewer() {
  //   return this.settingsAs<FormFieldSmartViewerSettings>();
  // }
  // private settingsAs<T>() {
  //   return jsonProxy<T>(this.data.settingsJson || "{}", (json) => {
  //     this.data.settingsJson = json;
  //   });
  // }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.move-icon {
  position: relative;
}

.field-button {
  width: 100%;
  //padding: 5px 5px;
  position: relative;

}

.overlay {
  position: absolute;
  height: 100%;
  width: 100%;
  background: rgba(177, 166, 166, 0);
}
</style>
