<template>
  <TickInput v-model.lazy="internalValue" :maxlength="50" :disabled="disabled" :invalidMessage="invalidMessage" placeholder="+31 123456789">{{ $translate(LanguagePath.App_PhoneNumber) }}</TickInput>
</template>

<script lang="ts">
import { askPrompt } from "@/helpers/questionHelper";
import { stringIsNullOrEmpty, stringIsValidPhoneNumber } from "@/helpers/stringHelper";
import { translate } from "@/plugins/translatePlugin";
import { validatePhoneNumber } from "@/services/UtilityService";
import { LanguagePath, ValidatePhoneNumberRequest, ValidationCodeTypeEnum } from "@/TickApi";
import { Component, Prop, VModel, Vue, Watch } from "vue-facing-decorator";
import TickInput from "./TickInput.vue";

@Component({
  emits: ["update:modelValue"],
  components: [TickInput]
})
export default class TickPhoneNumberInput extends Vue {
  LanguagePath = LanguagePath
  @VModel({ required: true }) private value!: string;
  @Prop({ default: false }) private disabled: boolean;
  @Prop({ required: true }) private objectId: string;
  @Prop({ required: true }) private validationType: ValidationCodeTypeEnum;

  private editablePhoneNumber = "";

  private get internalValue() {
    return this.editablePhoneNumber;
  }

  private set internalValue(to: string) {

    if (to == this.editablePhoneNumber) { return; }

    this.editablePhoneNumber = to;

    this.onChange();

  }

  private get model() {
    return this.value;
  }

  private set model(to: string) {
    this.internalValue = to;
    this.$emit("update:modelValue", to);
  }

  private get isValidE164Format() {
    return stringIsValidPhoneNumber(this.editablePhoneNumber);
  }

  private get invalidMessage(): string {
    if (!this.editablePhoneNumber) { return ""; }
    return this.isValidE164Format ? "" : "Please provide an international phone number like +31 123456789";
  }



  private confirmPhoneNumber(newPhoneNumber: string) {
    const req: ValidatePhoneNumberRequest = {
      type: this.validationType,
      phoneNumber: newPhoneNumber,
      objectId: this.objectId
    }

    validatePhoneNumber(req).then((d) => {

      if (d.success) {
        askPrompt((code) => {
          req.code = code.trim();
          validatePhoneNumber(req).then((result) => {
            if (result.success) {

              this.editablePhoneNumber = req.phoneNumber;
              this.$emit("update:modelValue", req.phoneNumber);

            }
          });

        }, d.message, "", 50);
      }
    });
  }

  private onChange() {

    if (stringIsNullOrEmpty(this.editablePhoneNumber)) {
      this.$emit("update:modelValue", this.editablePhoneNumber);
      return;
    }


    askPrompt((to) => {

      if (stringIsValidPhoneNumber(to)) {
        this.confirmPhoneNumber(to);
      } else {
        //try again?
      }

    }, translate(LanguagePath.App_PhoneNumber_Confirm_Explanation), this.editablePhoneNumber.trim(), 50, translate(LanguagePath.App_PhoneNumber), translate(LanguagePath.App_PhoneNumber_Confirm_Title));
  }

  mounted() {
    this.onModelChange(this.model);
  }

  @Watch("model")
  private async onModelChange(to: string) {
    this.editablePhoneNumber = this.model;
    this.internalValue = this.model;

  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
