<template>
  <SidebarPanel id="flow-instance-logs" :name="$translate(LanguagePath.App_FlowEditor_InstanceLogs_Title)">

    <template #header>
      <TickButton class="refresh-button" :appearance="Appearance.transparent" :color="Color.base" :size="Size.mini" icon="refresh" @click="refresh" title="Refresh" :round="true" />
    </template>

    <div class="search-wrapper">
      <TickInput class="input" v-model="filterQuery" :placeholder="$translate(LanguagePath.App_FlowEditor_InstanceLogs_Search_Title)" />
      <TickButton class="refresh-button" :appearance="Appearance.transparent" :color="Color.base" :size="Size.mini" icon="search" @click="refreshQuery" :round="true" />
    </div>
    <table class="styledTable">
      <thead>
        <tr>
          <th>{{ $translate(LanguagePath.App_DataAdapter_AdapterLogsList_Date) }}</th>
          <th>{{ $translate(LanguagePath.App_DataAdapter_AdapterLogsList_Duration) }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr @click="viewLogTravelData(item)" :class="{ 'warning': !item.finished, 'selected': this.selectedLogId == item.id }" v-for="item in this.logSummaries" :key="item.id">
          <td class="">{{ this.getDate(item) }}</td>
          <td class="numeric">{{ this.getDuration(item) }}</td>
          <td>
            <TickButton @click.stop="openLogDetails(item)" icon="eye" :round="true" :appearance="Appearance.transparent" :color="Color.contrast" :size="Size.mini" />
          </td>
        </tr>
      </tbody>
    </table>

  </SidebarPanel>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import { LanguagePath, LogData, TickFlowInstanceLogSummary } from '@/TickApi';
import { displayDate, getTimespan } from '@/helpers/dateHelper';
import FlowInstanceLogDetailsPanel from '@/components/panels/FlowInstanceLogDetailsPanel.vue';
import { mount, unmount } from '@/helpers/mountHelper';
import useFlowStore from '@/store/flows';
import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import { stringIsNullOrEmpty } from '@/helpers/stringHelper';
import { getFlowInstanceSearchLogs } from '@/services/FlowsService';
import useUserStore from '@/store/user';

export interface actionPatch {
  id: string;
  settingsJson: string;
}


@Component({
  emits: ["logSelect", "logShowTravel"],
  components: { TickInput, TickTextArea, TickSelector, TickButton, FlowInstanceLogDetailsPanel, SidebarPanel },
})
export default class FlowInstanceLogsList extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop() private selectedLogId: string;
  @Prop() private flowDefinitionId!: string;
  @Prop() private flowDefinitionVersionId!: string;

  private activePanel = "";
  private filterQuery = "";
  private querySearchResults: TickFlowInstanceLogSummary[] = [];

  private viewLogTravelData(log: TickFlowInstanceLogSummary) {
    this.$emit("logShowTravel", log)
  }

  private get searchOnQuery(): boolean {
    return !stringIsNullOrEmpty(this.filterQuery);
  }

  private get logSummaries() {
    return this.searchOnQuery
      ? this.querySearchResults
      : useFlowStore().flowInstanceLogs(this.flowDefinitionId, this.flowDefinitionVersionId);
  }

  private refreshQuery() {
    if (stringIsNullOrEmpty(this.filterQuery)) { return; }
    getFlowInstanceSearchLogs({
      workspaceId: useUserStore().activeWorkspaceId,
      query: this.filterQuery
    }).then((results) => {
      this.querySearchResults = results || [];
    })
  }

  private refresh() {
    useFlowStore().getLogsForFlow(this.flowDefinitionId, this.flowDefinitionVersionId);
  }

  mounted() {
    this.refresh();
  }

  private getDate(item: TickFlowInstanceLogSummary): string {
    return displayDate(item.creationDate);
  }

  private getDuration(item: TickFlowInstanceLogSummary): string {
    const durationSpan = getTimespan(item.executionMs);

    return `${durationSpan.value} ${durationSpan.unit}`;
  }

  private openLogDetails(item: TickFlowInstanceLogSummary) {
    this.togglePanel(item.id);
  }

  private togglePanel(logId: string) {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel(logId);
    }
  }

  private openPanel(logId: string) {
    if (this.activePanel) {
      return;
    }

    this.activePanel = mount(FlowInstanceLogDetailsPanel, {
      props: {
        logId: logId
      },
      events: {
        close: () => {
          this.closePanel();
        },
        selectLog: (log: LogData) => {
          this.$emit("logSelect", log);
          this.closePanel();
        }
      },
    });
  }

  private closePanel() {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.search-wrapper {
  display: flex;
  gap: 10px;
  justify-content: space-between;

  .input {
    flex-grow: 1;
  }

}

.selected {
  box-shadow: -8px 0px 0px 0px $brand;
}
</style>
