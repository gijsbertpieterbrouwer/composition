<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>{{ $translate(LanguagePath.App_CannedResponseCreatorPanel_Title) }}</template>

    <template #actions>
    </template>
    <div class="content">
      <CannedResponseEditor :activeId="selectedItemId" @saved="onSaved" @deleted="onDeleted" :actionsInFooter="true" :showScreenEstate="false" />
    </div>
  </TickDialogPanel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import TickButton, { Appearance as ButtonAppearance, Size as ButtonSize, Color as ButtonColor, } from "@/components/atoms/TickButton.vue";
import { focus } from "@/directives";
import TickEditorPanel from "../molecules/editor/TickEditorPanel.vue";
import CannedResponseEditor from '@/components/molecules/cannedResponse/CannedResponseEditor.vue';
import CommunicatorSelector from "../molecules/Selectors/CommunicatorSelector.vue";
import TickSelector from "../atoms/TickSelector.vue";
import TickTextarea from "../atoms/TickTextarea.vue";
import TickSwitch from "../atoms/TickSwitch.vue";
import { LanguagePath } from "@/TickApi";

@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    TickEditorPanel,
    CommunicatorSelector,
    TickSelector,
    TickTextarea,
    TickSwitch,
    CannedResponseEditor
  },
})
export default class CannedResponseCreatorPanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath;
  @Prop({ default: "" }) private selectedItemId!: string;

  private onSaved() {
    this.$emit("close", this.selectedItemId);
  }
  private onDeleted() {
    this.$emit("close", null);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 700px;
  display: grid;
  gap: 10px;


}

.flex-row {
  display: flex;
  gap: 10px;
}
</style>
