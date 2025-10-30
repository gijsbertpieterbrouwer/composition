<template>
  <div>
    <div>
      <FormFieldInput :disabled="disabled" v-if="field.type == TaskFormFieldType.Input || field.type == TaskFormFieldType.SelectInput" :field="field" />
      <FormFieldExplanation :disabled="disabled" v-if="field.type == TaskFormFieldType.Explanation" :field="field" />
      <FormFieldSmartViewer :disabled="disabled" v-if="field.type == TaskFormFieldType.SmartViewer" :field="field" />
    </div>

    <div v-if="hasValidationMessage" class="validation-wrapper">
      <TickIcon name="warning" /><span class="validationMessage">{{ getValidationMessage }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import {
  FormField,
  FormFieldType,
  FormValidationResponse,
} from "@/TickApi";
import { Component, Prop, Vue, Watch } from "vue-facing-decorator";
import FormFieldExplanation from "./FormFieldExplanation.vue";
import FormFieldInput from "./FormFieldInput.vue";
import FormFieldSmartViewer from "./FormFieldSmartViewer.vue";

@Component({
  name: "FormFieldComponent",
  emits: [],
  components: { FormFieldInput, FormFieldExplanation, TickIcon, FormFieldSmartViewer },
})
export default class FormFieldComponent extends Vue {
  TaskFormFieldType = FormFieldType;
  @Prop() private field!: FormField;
  @Prop() private validationResponse?: FormValidationResponse;
  @Prop() private disabled!: boolean;

  private uneditedValue: string = null;

  private get hasValidationMessage(): boolean {
    if (!this.validationResponse || this.validationResponse.isValid) {
      return false;
    }
    return (this.validationResponse.fieldValidationErrors || []).some(
      (p) => p.formFieldId == this.field.id
    );
  }

  private get getValidationMessage(): string {
    if (!this.validationResponse || this.validationResponse.isValid) {
      return "";
    }
    const m = (this.validationResponse.fieldValidationErrors || []).find(
      (p) => p.formFieldId == this.field.id
    );

    return m ? m.message || "" : "";
  }

  @Watch("field.value")
  private onFieldEdit(to: string, from: string) {
    if (this.uneditedValue == null) {
      this.uneditedValue = from;
    }

    this.field.valueEdited = to !== this.uneditedValue;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.validation-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: left;
  align-content: center;

  .validationMessage {
    color: $error;
  }
}
</style>
