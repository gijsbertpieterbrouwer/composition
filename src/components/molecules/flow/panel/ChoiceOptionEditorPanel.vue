<template>
  <TickPanel :position="position" class="panel">
    <TickScreen title="Option" actionsInFooter="true">
      <template v-slot:actions>
        <TickButton @click="save">{{ $translate(LanguagePath.App_Use) }}</TickButton>
      </template>

      <template v-slot:default>
        <div class="inputs">
          <TickInput v-model="item.text" :placeholder="$translate(LanguagePath.App_FlowEditor_ChoiceOptionEditor_Text_Placeholder)">
            {{ $translate(LanguagePath.App_FlowEditor_ChoiceOptionEditor_Text_Title) }}</TickInput>
          <TickInput v-model="item.data" :placeholder="$translate(LanguagePath.App_FlowEditor_ChoiceOptionEditor_Data_Placeholder)"> {{
            $translate(LanguagePath.App_FlowEditor_ChoiceOptionEditor_Data_Title) }}</TickInput>
        </div>
      </template>
    </TickScreen>
  </TickPanel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';


import { FlowOptionsItemData, LanguagePath } from "@/TickApi";
import TickPanel, { Position } from "@/components/atoms/TickPanel.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickScreen from '../../editor/TickScreen.vue';
import TickButton from '@/components/atoms/TickButton.vue';
@Component({
  emits: ["patch", "exit"],
  components: { TickPanel, TickInput, TickScreen, TickButton },
})
export default class ChoiceOptionEditorPanel extends Vue {
  LanguagePath = LanguagePath
  @Prop() private item!: FlowOptionsItemData;
  @Prop() private position!: Position;
  beforeUnmount() {
    this.$emit("patch", this.item);
  }

  private save() {
    this.$emit("exit", this.item);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.panel {
  min-width: 300px;

  .title {
    font-weight: 600;
    line-height: 20px;
  }

  .inputs {
    display: grid;
    gap: 5px;
  }

}
</style>
