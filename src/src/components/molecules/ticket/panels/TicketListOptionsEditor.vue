<template>
  <TickSettingsPanel :panelOptions="panelOptions" @close="closePanel">
    <template #title>{{ $translate(LanguagePath.App_ViewOptions_Title) }}</template>

    <div class="content">
      <TickSwitch v-model="showExplicitTicketStatus" v-focus> {{ $translate(LanguagePath.Ticket_Status) }}</TickSwitch>
      <TickSwitch v-model="showChannel" v-focus>{{ $translate(LanguagePath.Channel) }}</TickSwitch>
      <TickSwitch v-model="showCommunicatorName">{{ $translate(LanguagePath.App_Name) }}</TickSwitch>
      <TickSwitch v-model="showLabels">{{ $translate(LanguagePath.Labels) }}</TickSwitch>
      <TickSwitch v-model="showAssignments">{{ $translate(LanguagePath.Assignments) }}</TickSwitch>
      <TickSwitch v-model="showSlaTimers">{{ $translate(LanguagePath.Sla_Timers) }}</TickSwitch>
      <TickSwitch v-model="showTypingIndicator">{{ $translate(LanguagePath.Typing_Indicator) }}</TickSwitch>
    </div>

    <!-- <template #footer>
      <div class="footer-actions">
        <TickButton @click="closePanel" :appearance="Appearance.transparent" :color="Color.contrast">cancel</TickButton>
      </div>
    </template> -->
  </TickSettingsPanel>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size, } from "@/components/atoms/TickButton.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import useTicketsStore, { TicketListOptions } from "@/store/tickets";
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
export default class TicketListOptionsEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  AssignmentFilterEnum = AssignmentFilterEnum
  LanguagePath = LanguagePath
  @Prop() private panelOptions!: TickPanelOptions;

  private get listOptions(): TicketListOptions {
    return useTicketsStore().listOptions;
  }
  private get showExplicitTicketStatus() {
    return this.listOptions.showExplicitTicketStatus;
  }
  private set showExplicitTicketStatus(to: boolean) {
    this.listOptions.showExplicitTicketStatus = to;
  }
  private get showCommunicatorName() {
    return this.listOptions.showCommunicatorName;
  }
  private set showCommunicatorName(to: boolean) {
    this.listOptions.showCommunicatorName = to;
  }
  private get showLabels() {
    return this.listOptions.showLabels;
  }
  private set showLabels(to: boolean) {
    this.listOptions.showLabels = to;
  }
  private get showChannel() {
    return this.listOptions.showChannel;
  }
  private set showChannel(to: boolean) {
    this.listOptions.showChannel = to;
  }
  private get showAssignments() {
    return this.listOptions.showAssignments;
  }
  private set showAssignments(to: boolean) {
    this.listOptions.showAssignments = to;
  }

  private get showSlaTimers() {
    return this.listOptions.showSlaTimers;
  }
  private set showSlaTimers(to: boolean) {
    this.listOptions.showSlaTimers = to;
  }
  private get showTypingIndicator() {
    return this.listOptions.showTypingIndicator;
  }
  private set showTypingIndicator(to: boolean) {
    this.listOptions.showTypingIndicator = to;
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
@/store/tickets