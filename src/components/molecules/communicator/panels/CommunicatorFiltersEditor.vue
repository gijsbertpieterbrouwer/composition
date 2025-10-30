<template>
  <TickSettingsPanel :panelOptions="panelOptions" @close="closePanel">
    <template #title>{{ $translate(LanguagePath.Filters) }}</template>

    <div class="content">
      <CommunicatorCategoriesSelector v-model="chosenCategories" :allowAsSubDialog="true" :closeAfterSelect="false" />
      <!-- <TickSelector v-focus :sort="false" v-model="filterAssignedTo" :options="filterAssignmentOptions" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini"
        :placeholder="filterPlaceholder">{{ $translate(LanguagePath.Assignments) }}</TickSelector>

      <UsersAndTeamsSelector :allowAsSubDialog="true" v-if="filterAssignedTo == AssignmentFilterEnum.Custom" v-model="customAssignmentFilter" :overlapAfter="5" /> -->
      <!-- <TickSelector :sort="false" v-model="filterStatus" :options="taskStatusOptions">{{ $translate(LanguagePath.Task_Status) }}</TickSelector> -->
      <TickInput type="date" :min="minimalDateForFromFilter" :max="maxDateForFromFilter" v-model="filterCreatedFromDate">{{
        $translate(LanguagePath.App_TicketList_FilterEditor_StartedAfter) }}
      </TickInput>
    </div>

    <template #footer>
      <div class="footer-actions">
        <TickButton @click="closePanel" :appearance="Appearance.transparent" :color="Color.contrast">{{ $translate(LanguagePath.Cancel) }}</TickButton>
        <TickButton @click="removeFilters" :appearance="Appearance.transparent" :color="Color.contrast">{{ $translate(LanguagePath.App_TicketList_FilterEditor_Clear) }}</TickButton>
        <TickButton @click="confirmFilters" :appearance="Appearance.primary" :color="Color.primary">{{ $translate(LanguagePath.App_TicketList_FilterEditor_Use) }}</TickButton>
      </div>
    </template>
  </TickSettingsPanel>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size, } from "@/components/atoms/TickButton.vue";
import TickDropdown from "@/components/atoms/TickDropdown.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import { CommunicatorFilterOptions, LanguagePath } from "@/TickApi";
import { unref } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";

import TickSelector from "@/components/atoms/TickSelector.vue";
import { dateCalculateFromNow, inputValueToServerDate, serverDateToInputValue } from "@/helpers/dateHelper";
import CommunicatorCategoriesSelector from "../../Selectors/CommunicatorCategoriesSelector.vue";
import UsersAndTeamsSelector from "../../Selectors/UsersAndTeamsSelector.vue";


@Component({
  directives: { focus },
  emits: ["select", "close", "removeFilters"],
  components: {
    TickSettingsPanel,
    TickInput,
    TickIcon,
    TickButton,
    TickDropdown,
    TickSelector,
    UsersAndTeamsSelector,
    CommunicatorCategoriesSelector
  },
})
export default class CommunicatorFiltersEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private data!: CommunicatorFilterOptions;

  private editingModel: CommunicatorFilterOptions = {};

  mounted() {
    this.editingModel = JSON.parse(JSON.stringify(unref(this.data || {}))) || {};
  }

  private get minimalDateForFromFilter() {
    return serverDateToInputValue(dateCalculateFromNow(0, 0, -3));
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


  // private get customAssignmentFilter(): UsersAndTeamsSelection {
  //   return {
  //     userIds: this.editingModel?.customAssignedToUserIds || [],
  //     teamIds: this.editingModel?.customAssignedToTeamIds || [],
  //   }
  // }

  // private set customAssignmentFilter(to: UsersAndTeamsSelection) {

  //   this.editingModel.customAssignedToUserIds = to.userIds;
  //   this.editingModel.customAssignedToTeamIds = to.teamIds;

  // }

  // private get filterStatus() {
  //   return this.editingModel?.status || TaskFilterTaskStatusEnum.All;
  // }

  // private set filterStatus(to: TaskFilterTaskStatusEnum) {
  //   this.editingModel.status = to;
  // }


  private removeFilters() {
    this.$emit('removeFilters');
  }
  private confirmFilters() {
    this.$emit('select', this.editingModel);
  }

  private closePanel() {
    this.$emit('close');
  }

  private get chosenCategories() {
    return this.editingModel?.categoryIds || [];
  }

  private set chosenCategories(to: string[]) {
    this.editingModel.categoryIds = to;
  }

  // private get filterPlaceholder() {
  //   switch (this.editingModel?.assignedTo) {
  //     case AssignmentFilterEnum.Me: return "For me";
  //     case AssignmentFilterEnum.Unassigned: return "Unassigned";
  //     default: return "-";
  //   }
  // }

  // private get filterAssignmentOptions() {
  //   const list: Option[] = [
  //     {
  //       value: AssignmentFilterEnum.All,
  //       text: 'No filter'
  //     },
  //     {
  //       value: AssignmentFilterEnum.Me,
  //       text: 'For me'
  //     },
  //     {
  //       value: AssignmentFilterEnum.Unassigned,
  //       text: 'Not assigned'
  //     },
  //     {
  //       value: AssignmentFilterEnum.Custom,
  //       text: 'Custom'
  //     }
  //   ]

  //   return list;
  // }


  // private get taskStatusOptions(): Option[] {
  //   return getTaskStatusOptions();
  // }
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
