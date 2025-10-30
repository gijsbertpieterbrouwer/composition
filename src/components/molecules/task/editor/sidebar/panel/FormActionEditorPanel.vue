<template>
  <TickDialogPanel class="panel" @close="close">
    <template #title>{{ $translate(LanguagePath.App_Edit) }}</template>
    <template #actions>
      <TickButton @click="remove" icon="delete" v-if="!disabled" :appearance="Appearance.secondary" :size="Size.mini" :color="Color.contrast">{{ $translate(LanguagePath.App_Remove) }}</TickButton>
    </template>

    <div class="content">
      <TaskActionEditor v-if="editableData" @delete="remove" v-model="editableData" :disabled="disabled" />
    </div>

    <template #footer>
      <TickButton @click="save" v-if="!disabled" :appearance="Appearance.primary" :size="Size.regular">{{ $translate(LanguagePath.App_Use) }}</TickButton>
    </template>
  </TickDialogPanel>
</template>

<script lang="ts">
import { LanguagePath, TaskDefinitionAction } from "@/TickApi";
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickDialogPanel from '@/components/panels/TickDialogPanel.vue';
import { mount, unmount } from '@/helpers/mountHelper';
import { askConfirmation } from "@/helpers/questionHelper";
import { translate } from "@/plugins/translatePlugin";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TaskActionEditor from "../TaskActionEditor.vue";

const panelId = "FormActionEditorPanel";

export function removeFormActionEditorPanelPanel() {
  unmount(panelId);
}

export function openForFormActionEditorPanelPanel(disabled: boolean, action: TaskDefinitionAction, patch: (to: TaskDefinitionAction) => void, remove: (to: TaskDefinitionAction) => void) {
  mount(FormActionEditorPanel, {
    props: {
      disabled: disabled,
      data: action,
    },
    events: {
      close: () => {
        removeFormActionEditorPanelPanel();
      },
      patch: (to: TaskDefinitionAction) => {
        if (patch) {
          patch(to)
        }
      },
      remove: (to: TaskDefinitionAction) => {
        if (remove) {
          remove(to)
        }
        removeFormActionEditorPanelPanel();
      },
    },
  }, panelId);
}



@Component({
  emits: ["patch", "close", "remove"],
  components: { TickDialogPanel, TickButton, TaskActionEditor },
})
export default class FormActionEditorPanel extends Vue {
  LanguagePath = LanguagePath
  Appearance = Appearance
  Color = Color
  Size = Size
  @Prop() private data!: TaskDefinitionAction;
  @Prop() private disabled: boolean;

  private editableData: TaskDefinitionAction = null;

  mounted() {
    this.editableData = this.data;
  }

  private set field(to: TaskDefinitionAction) {
    this.$emit("patch", this.editableData);
  }

  beforeUnmount() {
    this.$emit("patch", this.editableData);
  }

  private save() {
    this.$emit("patch", this.editableData);
    this.close();
  }
  private remove() {

    askConfirmation((to: boolean) => {
      if (to) {
        this.$emit("remove", this.editableData);
      }
    }, translate(LanguagePath.App_TaskDefinitionEditor_Action_Remove_Confirm));


  }

  private close() {
    this.$emit('close');
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
