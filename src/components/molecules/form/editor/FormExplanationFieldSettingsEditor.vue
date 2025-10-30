<template>
  <SidebarPanel :name="$translate(LanguagePath.App_Editor_General)">
    <TickInput v-model="settings.name" :disabled="disabled">{{ $translate(LanguagePath.App_Name) }}</TickInput>
    <TickTextarea v-model="settings.description" :disabled="disabled">{{ $translate(LanguagePath.App_Description) }}</TickTextarea>
  </SidebarPanel>
</template>

<script lang="ts">
import { FormFieldExplanationSettings, LanguagePath } from "@/TickApi";
import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import TickButton from '@/components/atoms/TickButton.vue';
import TickCheckbox from '@/components/atoms/TickCheckbox.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickTextarea from '@/components/atoms/TickTextarea.vue';
import { jsonProxy } from '@/helpers/jsonProxy';
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';


@Component({
  emits: ["delete"],
  components: { TickButton, TickInput, TickTextarea, TickSelector, TickCheckbox, SidebarPanel }
})
export default class FormExplanationFieldSettingsEditor extends Vue {
  LanguagePath = LanguagePath
  @Prop() private disabled = false;
  @VModel({ required: true }) private data: string;

  private get settings() {
    return jsonProxy<FormFieldExplanationSettings>(this.data || "{}", (json) => {
      this.data = json;
    });
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
