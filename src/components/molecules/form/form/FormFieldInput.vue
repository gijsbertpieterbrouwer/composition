<template>
  <TickInput :disabled="disabled" v-if="renderAsInput" :type="inputType" v-model="field.value" :placeholder="fieldPlaceholder">{{ fieldName }}</TickInput>
  <TickTextarea :minimumrows="textArea_Minimumrows" :disabled="disabled" v-if="renderAsTextArea" v-model="field.value" :placeholder="fieldPlaceholder">{{ fieldName }}</TickTextarea>
  <TickCheckbox :disabled="disabled" v-if="renderAsCheckBox" v-model="field.value">{{ fieldName }}</TickCheckbox>
  <TickSelector :disabled="disabled" v-if="renderAsDropdown" v-model="field.value" :options="selectOptions">{{ fieldName }}</TickSelector>
</template>

<script lang="ts">
import { FormField, FormFieldInputType } from "@/TickApi";
import TickCheckbox from '@/components/atoms/TickCheckbox.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickSelector, { Option } from '@/components/atoms/TickSelector.vue';
import TickTextarea from '@/components/atoms/TickTextarea.vue';
import { Component, Prop, Vue } from 'vue-facing-decorator';

@Component({
  emits: [],
  components: { TickInput, TickTextarea, TickCheckbox, TickSelector }
})
export default class FormFieldInput extends Vue {
  TaskFormInputType = FormFieldInputType;
  @Prop() private field!: FormField;
  @Prop() private disabled: boolean;

  private get fieldRequiredSign() {
    return this.field.required ? "*" : "";
  }

  private get fieldName() {
    return this.field.name
      ? `${this.field.name}${this.fieldRequiredSign}`
      : "";
  }

  private get fieldPlaceholder() {
    return this.field.name ? `${this.field.description}`
      : `${this.field.description}${this.fieldRequiredSign}`;
  }

  private get renderAsDropdown() {
    return this.field.inputType == FormFieldInputType.Select;
  }

  private get textArea_Minimumrows() {
    return this.field.textArea_Minimumrows
  }

  private get selectOptions() {
    let options: Option[] = (this.field.options || []).map(function (o) {
      return {
        text: o.text,
        value: o.data,
      }
    })

    return options;
  }

  private get renderAsCheckBox() {
    return this.field.inputType == FormFieldInputType.Checkbox;
  }
  private get renderAsTextArea() {
    return this.field.inputType == FormFieldInputType.MultiLine;
  }

  private get renderAsInput() {
    return this.field.inputType == FormFieldInputType.SingleLine
      || this.field.inputType == FormFieldInputType.Date
      || this.field.inputType == FormFieldInputType.Numeric;

  }

  private get inputType() {
    switch (this.field.inputType) {
      case FormFieldInputType.SingleLine: return "text";
      case FormFieldInputType.Date: return "date";
      case FormFieldInputType.Numeric: return "number";
    }

    return "";
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
