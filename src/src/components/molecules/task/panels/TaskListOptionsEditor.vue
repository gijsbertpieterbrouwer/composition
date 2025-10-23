<template>
  <TickSettingsPanel :panelOptions="panelOptions" @close="closePanel">
    <template #title>{{ $translate(LanguagePath.App_ViewOptions_Title) }}</template>

    <div class="content">
      <TickSwitch v-model="showNote" v-focus>{{ $translate(LanguagePath.TaskNote) }}</TickSwitch>
      <TickSwitch v-model="showAssignments">{{ $translate(LanguagePath.Assignments) }}</TickSwitch>
      <TickSwitch v-model="showOverdueDate">{{ $translate(LanguagePath.TaskList_ViewOptions_OverdueDuate) }}</TickSwitch>
    </div>

  </TickSettingsPanel>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size, } from "@/components/atoms/TickButton.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import useTasksStore, { TaskListOptions } from "@/store/tasks";
import { AssignmentFilterEnum, LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickSettingsPanel,
    TickButton,
    TickSwitch
  },
})
export default class TaskListOptionsEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  AssignmentFilterEnum = AssignmentFilterEnum
  LanguagePath = LanguagePath
  @Prop() private panelOptions!: TickPanelOptions;

  private get listOptions(): TaskListOptions {
    return useTasksStore().listOptions;
  }
  private get showNote() {
    return this.listOptions.showNote;
  }
  private set showNote(to: boolean) {
    this.listOptions.showNote = to;
  }
  private get showAssignments() {
    return this.listOptions.showAssignments;
  }
  private set showAssignments(to: boolean) {
    this.listOptions.showAssignments = to;
  }
  private get showOverdueDate() {
    return this.listOptions.showOverdueDate;
  }
  private set showOverdueDate(to: boolean) {
    this.listOptions.showOverdueDate = to;
  }


  private closePanel() {
    this.$emit('close');
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.content {
  min-width: 250px;
  display: grid;
  gap: 5px;

}

.footer-actions {
  display: flex;
  justify-content: left;

  :last-child {
    margin-left: auto;
  }
}
</style>
