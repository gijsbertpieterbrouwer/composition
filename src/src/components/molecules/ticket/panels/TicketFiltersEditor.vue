<template>
  <TickSettingsPanel :panelOptions="panelOptions" @close="closePanel">
    <template #title>{{ $translate(LanguagePath.Filters) }}</template>

    <div class="content">

      <TickSelector v-focus :sort="false" v-model="filterAssignedTo" :options="filterAssignmentOptions" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini"
        :placeholder="filterPlaceholder">{{ $translate(LanguagePath.Assignments) }}</TickSelector>

      <UsersAndTeamsSelector :allowAsSubDialog="true" v-if="filterAssignedTo == AssignmentFilterEnum.Custom" v-model="customAssignmentFilter" :overlapAfter="5" />

      <div class="selector-wrapper"> <label>{{ $translate(LanguagePath.Channels) }}
          <CommunicationChannelsSelector :allowAsSubDialog="true" class="selector-item" v-model="filterChannelIds" />
        </label>
      </div>

      <div class="selector-wrapper"> <label>{{ $translate(LanguagePath.Labels) }}
          <LabelsSelector class="selector-item" :allowAsSubDialog="true" v-model="filterLabelIds" :hideGrey="false" :emptyLabel="$translate(LanguagePath.Labels)" />
        </label>
      </div>

      <TickSelector :sort="false" v-model="filterTicketStatus" :options="ticketStatusOptions">{{ $translate(LanguagePath.Ticket_Status) }}</TickSelector>
      <TickInput type="date" :min="minimalDateForFromFilter" :max=this.maxDateForFromFilter v-model="filterCreatedFromDate">{{
        $translate(LanguagePath.App_TicketList_FilterEditor_StartedAfter) }}
      </TickInput>
    </div>

    <template #footer>
      <div class="footer-actions">


        <TickButton @click="closePanel" :appearance="Appearance.transparent" :color="Color.contrast">{{ $translate(LanguagePath.Cancel) }}</TickButton>
        <TickButton @click="removeFilters" :appearance="Appearance.transparent" :color="Color.contrast">{{ $translate(LanguagePath.App_Clear) }}</TickButton>
        <TickButton @click="confirmFilters" :appearance="Appearance.primary" :color="Color.primary">{{ $translate(LanguagePath.App_Use) }}</TickButton>
      </div>
    </template>
  </TickSettingsPanel>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size, } from "@/components/atoms/TickButton.vue";
import TickDropdown from "@/components/atoms/TickDropdown.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSelector, { Option } from "@/components/atoms/TickSelector.vue";
import LabelsSelector from '@/components/molecules/Selectors/LabelsSelector.vue';
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import { dateCalculateFromNow, inputValueToServerDate, serverDateToInputValue } from "@/helpers/dateHelper";
import { getFilterAssignmentOptions, getTicketStatusOptions } from "@/helpers/enumsHelper";
import { AssignmentFilterEnum, LanguagePath, TicketFilterOptions, TicketFilterTicketStatusEnum } from "@/TickApi";
import { unref } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import CommunicationChannelsSelector from "../../Selectors/CommunicationChannelsSelector.vue";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "../../Selectors/UsersAndTeamsSelector.vue";

@Component({
  directives: { focus },
  emits: ["select", "close", "removeFilters"],
  components: {
    TickSettingsPanel,
    TickInput,
    TickIcon,
    TickButton,
    TickDropdown,
    LabelsSelector,
    TickSelector,
    UsersAndTeamsSelector,
    CommunicationChannelsSelector
  },
})
export default class QuestFiltersEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  AssignmentFilterEnum = AssignmentFilterEnum
  LanguagePath = LanguagePath
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private data!: TicketFilterOptions; // only read once during mounting

  private editingModel: TicketFilterOptions = {};

  mounted() {
    this.editingModel = JSON.parse(JSON.stringify(unref(this.data || {}))) || {};
  }


  private get filterChannelIds() {
    return this.editingModel.filterCommunicationChannelIds || [];
  }

  private set filterChannelIds(to: string[]) {
    this.editingModel.filterCommunicationChannelIds = to;
  }

  private get minimalDateForFromFilter() {
    return serverDateToInputValue(dateCalculateFromNow(0, 0, -1));
  }

  private get maxDateForFromFilter() {
    return serverDateToInputValue(dateCalculateFromNow(0, 0, 0));
  }

  private get filterCreatedFromDate() {
    return serverDateToInputValue(this.editingModel?.filterCreationFromDate);
  }

  private set filterCreatedFromDate(to: string) {
    this.editingModel.filterCreationFromDate = inputValueToServerDate(to);
  }


  private get customAssignmentFilter(): UsersAndTeamsSelection {
    return {
      userIds: this.editingModel?.customAssignedToUserIds || [],
      teamIds: this.editingModel?.customAssignedToTeamIds || [],
    }
  }

  private set customAssignmentFilter(to: UsersAndTeamsSelection) {

    this.editingModel.customAssignedToUserIds = to.userIds;
    this.editingModel.customAssignedToTeamIds = to.teamIds;

  }

  private get filterTicketStatus() {
    return this.editingModel?.status || TicketFilterTicketStatusEnum.All;
  }

  private set filterTicketStatus(to: TicketFilterTicketStatusEnum) {
    this.editingModel.status = to;
  }

  private get filterLabelIds() {
    return this.editingModel?.labelDefinitionIds || [];
  }

  private set filterLabelIds(to: string[]) {
    this.editingModel.labelDefinitionIds = to;
  }

  private removeFilters() {
    this.$emit('removeFilters');
  }
  private confirmFilters() {
    this.$emit('select', this.editingModel);
  }

  private closePanel() {
    this.$emit('close');
  }

  private get filterAssignedTo() {
    return this.editingModel?.assignedTo || AssignmentFilterEnum.All;
  }

  private set filterAssignedTo(to: AssignmentFilterEnum) {
    this.editingModel.assignedTo = to;
  }

  private get filterPlaceholder() {
    return this.filterAssignmentOptions.find(p => p.value == this.editingModel?.assignedTo)?.text;
  }

  private get filterAssignmentOptions() {
    return getFilterAssignmentOptions();
  }


  private get ticketStatusOptions(): Option[] {
    return getTicketStatusOptions();
  }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

label {
  line-height: 20px;
  font-size: $text-size-regular;
  padding: 2px 0;
  color: $grey700;
  margin-bottom: 5px;
  width: 100%;
}

.content {
  width: 500px;

  display: grid;
  gap: 5px;

  .selector-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-content: baseline;
    align-self: baseline;
    align-items: baseline;
    width: 500px;

    .selector-item {
      background-color: var(--c-base-300);
      min-height: 32px;
    }
  }

}

.footer-actions {
  display: flex;
  justify-content: left;

  :last-child {
    margin-left: auto;
  }
}
</style>
