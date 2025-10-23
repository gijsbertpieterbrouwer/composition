<template>
  <TickDialogPanel class="panel" @close="cancel">
    <template #title>
      {{ $translate(LanguagePath.App_FlowEditor_ConditionEditorPanel_Title) }}
    </template>

    <template #default>
      <div class="content">
        <TickInput v-model="name" :disabled="disabled">Name</TickInput>

        <TickConditionGroupEditor class="root-group" v-if="unsavedCondition" :isFirst="true" :condition="unsavedCondition" @patch="conditionUpdated" @remove="deleteCondition" :disabled="disabled"
          :disableGroups="disableGroups" :disableInputSource="disableInputSource" :disabledInputSourceText="disabledInputSourceText" />

        <div class="actions-wrapper">
          <TickButton @click="cancel" :color="Color.contrast" :appearance="Appearance.secondary"> {{ $translate(LanguagePath.App_Cancel) }}</TickButton>
          <TickButton v-if="!disabled" @click="save">{{ $translate(LanguagePath.App_Use) }}</TickButton>
        </div>
      </div>
    </template>
  </TickDialogPanel>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickDialogPanel from '@/components/panels/TickDialogPanel.vue';
import { mount, unmount } from '@/helpers/mountHelper';
import { ConditionGroup, ICondition, LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickScreen from '../../editor/TickScreen.vue';
import TickConditionGroupEditor from './TickConditionGroupEditor.vue';



const conditionEditorPanelId = "conditionEditorPanel";

export function removeConditionEditorPanel() {
  unmount(conditionEditorPanelId);
}

export function openConditionEditorPanel(disabled: boolean, disableGroups: boolean, disableInputSource: boolean, disabledInputSourceText: string, condition: ConditionGroup, onExit: (updated: ConditionGroup) => void, onCancel?: () => void, onPatch?: (updated: ConditionGroup) => void) {
  mount(ConditionEditorPanel, {
    props: {
      disabled: disabled,
      condition: condition,
      disableGroups: disableGroups,
      disableInputSource: disableInputSource,
      disabledInputSourceText: disabledInputSourceText,
    },
    events: {
      exit: (to: ConditionGroup) => {
        onExit(to);
        removeConditionEditorPanel();
      },
      patch: (to: ConditionGroup) => {
        if (onPatch) {
          onPatch(to);
        }
      },
      cancel: () => {
        if (onCancel) {
          onCancel();
        }
      },

    },
  }, conditionEditorPanelId);
}


@Component({
  emits: ["patch", "exit", "cancel"],
  components: { TickDialogPanel, TickScreen, TickConditionGroupEditor, TickButton, TickInput },
})
export default class ConditionEditorPanel extends Vue {
  Color = Color
  Size = Size
  Appearance = Appearance
  LanguagePath = LanguagePath
  @Prop() private condition!: ConditionGroup;
  @Prop() private disabled!: boolean;
  @Prop() private disableGroups!: boolean;
  @Prop() private disableInputSource!: boolean;
  @Prop() private disabledInputSourceText!: string;

  private unsavedCondition: ConditionGroup = null;

  private get name() {
    return this.unsavedCondition ? (this.unsavedCondition.name || "") : "";
  }

  private set name(to: string) {
    this.unsavedCondition.name = to;
  }

  mounted() {
    const unsaved = JSON.parse(JSON.stringify(this.condition));
    this.unsavedCondition = unsaved;
  }

  private conditionUpdated() {
    this.$emit("patch", this.unsavedCondition);
  }

  private deleteCondition(condition: ICondition) {
    const index = this.unsavedCondition.conditions.findIndex(a => a.id == condition.id);
    if (index != -1) {
      this.unsavedCondition.conditions.splice(index, 1);
    }
    this.conditionUpdated();
  }

  beforeUnmount() {
    this.conditionUpdated();
  }

  private patchCondition(condition: ConditionGroup, targetCondition: ConditionGroup) {
    condition.conditions = targetCondition.conditions;
    condition.logicalOperator = targetCondition.logicalOperator;
    condition.conditions = targetCondition.conditions.slice();
  }

  private save() {
    this.patchCondition(this.condition, this.unsavedCondition);
    this.$emit("exit", this.unsavedCondition);
  }

  private cancel() {
    this.$emit("cancel");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.content {
  min-width: 800px;
  display: grid;
  gap: 15px;

}

.root-group {
  // padding-top: 20px;
}

.actions-wrapper {
  display: flex;
  gap: 10px;
  align-items: end;
  justify-content: space-between;
}
</style>
