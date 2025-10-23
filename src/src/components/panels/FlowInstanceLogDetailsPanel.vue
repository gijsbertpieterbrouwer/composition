<template>
  <TickDialogPanel class="panel" @close="close">
    <template #title> {{ $translate(LanguagePath.App_InstanceLogDetails_Title) }}</template>

    <template #actions>
      <TickButton :busy="busyGettingData" @click="refresh" :size="ButtonSize.mini" :appearance="ButtonAppearance.secondary" :color="ButtonColor.contrast">
        {{ $translate(LanguagePath.App_Refresh) }}</TickButton>

      <TickButton v-if="showTicketButton" @click="navigateToTicket" :size="ButtonSize.mini" :appearance="ButtonAppearance.secondary" :color="ButtonColor.contrast">
        {{ $translate(LanguagePath.App_TaskInstanceEditor_TicketButton_Title) }}</TickButton>
    </template>
    <div class="content">


      <TickEditorPanel :name="executionDate" maxheight="40vh">

        <table class="styledTable">
          <tbody>
            <tr @click="logSelect(item)" :class="{ 'warning': item.logType == FlowLogType.Warning }" v-for="(item, index) in this.logs" :key="index">

              <td class="">{{ this.getDate(item.creationDate) }}</td>
              <td class="">
                <TickTokenizedContentViewer :content="item.message" />

              </td>
            </tr>
          </tbody>
        </table>

      </TickEditorPanel>

    </div>
  </TickDialogPanel>
</template>

<script lang="ts">
import { FlowLogType, LanguagePath, LogData } from "@/TickApi";
import TickIcon from "@/components/TickIcon.vue";
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { focus } from "@/directives";
import { displayDate, displayDateWithFormat } from "@/helpers/dateHelper";
import { RouterToTicket } from "@/router";
import useFlowStore from "@/store/flows";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickJsonViewer from "../atoms/TickJsonViewer.vue";
import TickTokenizedContentViewer from "../atoms/TickTokenizedContentViewer.vue";
import TickEditorPanel from "../molecules/editor/TickEditorPanel.vue";

@Component({
  directives: { focus },
  emits: ["selectLog"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    TickEditorPanel,
    TickHeading,
    TickJsonViewer,
    TickTokenizedContentViewer
  },
})
export default class FlowInstanceLogDetailsPanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath
  FlowLogType = FlowLogType

  @Prop() private logId = "";

  private busyGettingData = true;

  private close() {
    this.$emit('close')
  }
  private get showTicketButton(): boolean {
    return this.log?.ticketId != null;
  }

  private navigateToTicket() {
    if (!this.log?.ticketId) { return; }
    RouterToTicket(this.log?.ticketId);
    this.close();
  }

  private logSelect(log: LogData) {
    this.$emit("selectLog", log);
  }

  private get log() {
    return useFlowStore().flowInstanceLogDetails(this.logId);
  }

  private getDate(date: string | Date): string {
    if (!date) { return "-"; }
    return displayDateWithFormat(date, 'HH:mm:ss');
  }


  mounted() {
    this.refresh();
  }

  private refresh() {
    this.busyGettingData = true;
    useFlowStore().getLogDetails(this.logId).then(() => {
      this.busyGettingData = false;
    }).catch(() => {
      this.busyGettingData = false;
    });
  }

  private get logs() {
    return this.log?.flowLog || [];
  }



  private get executionDate(): string {
    return displayDate(this.log?.creationDate);
  }

  // private get duration(): string {
  //   const durationSpan = getTimespan(this.log?.executionMs);

  //   return `${durationSpan.value} ${durationSpan.unit}`;
  // }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 800px;
}


.url {
  font-size: 0.8em;
  max-width: 80%;
}


.statusHeader {
  display: grid;
  gap: 5px;
  margin-bottom: 20px;

  .duration {
    opacity: 0.7
  }

  .date {
    font-size: 0.7em;
    padding-left: 2px;
  }

}



.indicator {
  display: inline-block;
  border-radius: 8px;
  padding: 5px;
  @include neon-bg;

  &.success {
    background-color: $success;

  }

  &.failure {
    background-color: $warning;
  }
}

.info {
  font-size: 0.7em;
}
</style>
