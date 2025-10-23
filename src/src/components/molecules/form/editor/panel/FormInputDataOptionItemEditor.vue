<template>
  <tr>
    <td>
      <TickInput v-model="item.text" />
    </td>
    <td>
      <TickInput v-model="item.data" />
    </td>
    <td>
      <TickButton @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular" />
    </td>
  </tr>
</template>

<script lang="ts">
import { Component, VModel, Vue } from 'vue-facing-decorator';


import { LanguagePath, OptionsItemData } from "@/TickApi";
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickPanel from '@/components/atoms/TickPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';

@Component({
  emits: ["remove"],
  components: { TickPanel, TickInput, TickScreen, TickButton },
})
export default class FormInputDataOptionItemEditor extends Vue {
  LanguagePath = LanguagePath
  Appearance = Appearance
  Color = Color
  Size = Size

  @VModel() private item!: OptionsItemData;

  private remove() {
    this.$emit("remove");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
