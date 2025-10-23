<template>

  <div class="wrapper">

    <TickInput v-model="find" :disabled="disabled" placeholder="find" />
    <TickInput v-model="replace" :disabled="disabled" placeholder="replace with" />
    <TickButton :disabled="disabled" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.small" @click="remove" />
  </div>

</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import { tokenize } from '@/directives';
import { AssigneeTypeEnum, LanguagePath, NormalizationRule, StorageLocation } from '@/TickApi';
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';
@Component({
  directives: { tokenize },
  emits: ["update:modelValue", "change", "remove"],
  components: { TickInput, TickButton },
})
export default class NormalizationRuleEditor extends Vue {
  AssigneeTypeEnum = AssigneeTypeEnum
  Appearance = Appearance
  Color = Color
  Size = Size
  StorageLocation = StorageLocation
  LanguagePath = LanguagePath
  @VModel() private value!: NormalizationRule;
  @Prop() private disabled!: boolean;




  private remove() {
    this.$emit("remove");
  }

  private update() {
    this.$emit("update:modelValue", this.value);
    this.$emit("change", this.value);
  }

  private get find() {
    return this.value.find;
  }
  private set find(v: string) {
    this.value.find = v;
    this.update();
  }

  private get replace() {
    return this.value.replace;
  }
  private set replace(v: string) {
    this.value.replace = v;
    this.update();
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  display: flex;
  gap: 5px;



}
</style>
