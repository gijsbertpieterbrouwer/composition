<template>
  <SidebarPanel id="adapter-loglist" :name="$translate(LanguagePath.App_DataAdapter_AdapterLogsList_Title)">

    <table class="styledTable">
      <thead>
        <tr>
          <th>{{ $translate(LanguagePath.App_DataAdapter_AdapterLogsList_Date) }}</th>
          <th>{{ $translate(LanguagePath.App_DataAdapter_AdapterLogsList_Duration) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr @click="openLogDetails(item)" :class="{ 'warning': !item.success }" v-for="item in this.logSummaries" :key="item.id">
          <td class="">{{ this.getDate(item) }}</td>
          <td class="numeric">{{ this.getDuration(item) }}</td>
        </tr>
      </tbody>
    </table>



  </SidebarPanel>
</template>

<script lang="ts">

import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import AdapterLogDetailsPanel from '@/components/panels/AdapterLogDetailsPanel.vue';
import { displayDate, getTimespan } from '@/helpers/dateHelper';
import { mount, unmount } from '@/helpers/mountHelper';
import useDataAdaptersStore from '@/store/dataadapters';
import { LanguagePath, TickApiAdapterLogSummary } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';

export interface actionPatch {
  id: string;
  settingsJson: string;
}


@Component({
  emits: [],
  components: { TickInput, TickTextArea, TickSelector, TickButton, AdapterLogDetailsPanel, SidebarPanel },
})
export default class AdapterLogsList extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop() private adapterDefinitionId!: string;
  private activePanel = "";

  private get logSummaries() {
    return useDataAdaptersStore().adapterLogs(this.adapterDefinitionId);
  }

  mounted() {
    useDataAdaptersStore().getLogsForAdapter(this.adapterDefinitionId);
  }

  private getDate(item: TickApiAdapterLogSummary): string {
    return displayDate(item.creationDate);
  }

  private getDuration(item: TickApiAdapterLogSummary): string {
    const durationSpan = getTimespan(item.executionMs);

    return `${durationSpan.value} ${durationSpan.unit}`;
  }

  private openLogDetails(item: TickApiAdapterLogSummary) {
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

    this.activePanel = mount(AdapterLogDetailsPanel, {
      props: {
        logId: logId
      },
      events: {
        close: () => {
          this.closePanel();
        },
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

.wrapper {
  margin-top: 30px;
}


.component {
  margin-bottom: 10px;
  padding: 10px;

  .header {
    display: block;
    overflow: hidden;
    line-height: 32px;
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    letter-spacing: -0.02em;
    font-size: 16px;
    white-space: nowrap;

    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    margin-bottom: 5px;
    opacity: 0.7;

    .refresh-button {
      display: inline-flex;

    }

  }

  .content {
    display: flex;
    gap: 10px;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;

  }
}
</style>
