<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>{{ this.panelTitle }}</template>

    <div class="content">
      <EditorMessage :type="EditorMessageType.Message" :title="'Could not delete'" message="There are some dependencies which need to be removed before you can delete this." />

      <div class="summary">{{ this.summary }}</div>
      <table class="styledTable">
        <tbody>
          <TickObjectDependencyMessage :data="dependencyMessage" v-for="dependencyMessage in this.listToShow" :key="dependencyMessage.id" />
        </tbody>
      </table>

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
import { ObjectRemovalProgress, LanguagePath } from "@/TickApi";
import { mount, unmount } from "@/helpers/mountHelper";
import TickObjectDependencyMessage from "../atoms/TickObjectDependencyMessage.vue";
import EditorMessage, { EditorMessageType } from "../molecules/EditorMessage.vue";
import { translate } from '@/plugins/translatePlugin';

export function removeObjectRemovalProgressPanel() {
  unmount("objectRemovalPanelId");
}

export function showObjectRemovalProgressPanel(data: ObjectRemovalProgress) {

  mount(ObjectRemovalProgressPanel, {
    props: {
      data: data,
    },
    events: {
      close: () => {
        removeObjectRemovalProgressPanel();
      },
    },
  }, "objectRemovalPanelId");
}

@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    TickEditorPanel,
    TickObjectDependencyMessage,
    EditorMessage
  },
})
export default class ObjectRemovalProgressPanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  EditorMessageType = EditorMessageType

  @Prop() private data!: ObjectRemovalProgress;


  private get panelTitle() {
    return  translate(LanguagePath.App_ObjectRemovePanel_Title);
  }

  private close() {
    this.$emit("close");
  }

  private get listToShow() {
    return this.data.messages || [];
  }

  private get summary() {
    const count = this.data.messages.length;
    return count > 1 
    ? translate(LanguagePath.App_ObjectRemovePanel_MultipleDependencyWarnings_Title, {path:'nr', value: count.toString()})//`${count} dependencies to be addressed.`  
    : translate(LanguagePath.App_ObjectRemovePanel_SingleDependencyWarnings_Title);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 800px;
  display: grid;
  gap: 10px;

  .summary {}

}
</style>
