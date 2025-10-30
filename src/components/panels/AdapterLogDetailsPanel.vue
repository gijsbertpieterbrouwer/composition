<template>
  <TickDialogPanel class="panel text-selectable" @close="$emit('close')">
    <template #title> {{ $translate(LanguagePath.App_AdapterLogDetailsPanel_Title) }}</template>

    <div class="content">
      <div class="statusHeader">
        <div>
          <span class="indicator" :class="indicatorClass"> {{ $translate(LanguagePath.App_AdapterLogDetailsPanel_HttpStatus_Title) }} {{ this.statusCode }}</span> <span class="duration">
            {{ duration }}</span>
        </div>
        <div>
          <span class="date">{{ this.executionDate }}</span>
        </div>
      </div>

      <TickEditorPanel :name="'Request (' + this.method + ')'" maxheight="40vh">
        <span class="url"> {{ this.apiUrl }}</span>
        <br />
        <TickHeading size="small">{{ $translate(LanguagePath.App_AdapterLogDetailsPanel_RequestHeaders_Title) }}</TickHeading>
        <table class="styledTable" v-if="requestHeaders.length">
          <thead>
            <tr>
              <th>{{ $translate(LanguagePath.App_AdapterLogDetailsPanel_RequestHeaders_Key_Title) }}</th>
              <th>{{ $translate(LanguagePath.App_AdapterLogDetailsPanel_RequestHeaders_Value_Title) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in this.requestHeaders" :key="index">
              <td>{{ item.key }}</td>
              <td>{{ item.value }}</td>
            </tr>
          </tbody>
        </table>
        <span class="info" v-else>{{ $translate(LanguagePath.App_AdapterLogDetailsPanel_NoRequestHeaders_Title) }}</span>

        <TickHeading size="small">{{ $translate(LanguagePath.App_AdapterLogDetailsPanel_RequestBody_Title) }}</TickHeading>

        <TickJsonViewer :json="requestBodyJson" v-if="requestBodyJson" />
        <span class="info" v-else>{{ $translate(LanguagePath.App_AdapterLogDetailsPanel_NoRequestBody_Title) }}</span>
      </TickEditorPanel>


      <TickEditorPanel :name="$translate(LanguagePath.App_AdapterLogDetailsPanel_Response_Title, { path: 'message', value: this.responseMessage })" maxheight="40vh">
        <TickJsonViewer :json="responseData" />

      </TickEditorPanel>

    </div>
  </TickDialogPanel>
</template>

<script lang="ts">
import { ColorsEnum, LanguagePath, TickHttpRequestMessage } from "@/TickApi";
import TickIcon from "@/components/TickIcon.vue";
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { focus } from "@/directives";
import { getColorName } from "@/helpers/colorsHelper";
import { displayDate, getTimespan } from "@/helpers/dateHelper";
import { jsonProxy } from "@/helpers/jsonProxy";
import useDataAdaptersStore from "@/store/dataadapters";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickJsonViewer from "../atoms/TickJsonViewer.vue";
import TickEditorPanel from "../molecules/editor/TickEditorPanel.vue";

@Component({
  directives: { focus },
  emits: ["update:modelValue", "close"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    TickEditorPanel,
    TickHeading,
    TickJsonViewer
  },
})
export default class AdapterLogDetailsPanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath
  @Prop() private logId = "";

  private get log() {
    return useDataAdaptersStore().adapterLogDetails(this.logId);
  }

  private get indicatorClass() {

    return getColorName(this.statusIsSuccess ? ColorsEnum.Green : ColorsEnum.Red);


  }

  mounted() {
    useDataAdaptersStore().getLogDetails(this.logId);
  }


  private get statusCode() {
    return this.log?.responseCode ?? "";
  }

  private get executionDate(): string {
    return displayDate(this.log?.creationDate);
  }

  private get duration(): string {
    const durationSpan = getTimespan(this.log?.executionMs);

    return `${durationSpan.value} ${durationSpan.unit}`;
  }

  private get responseMessage() {
    return this.log?.message;
  }

  private get responseData(): string {
    return this.log?.responseDataJson;
  }

  private get requestBodyJson(): string {
    return this.requestData.body;
  }

  private get requestData(): TickHttpRequestMessage {
    return jsonProxy<TickHttpRequestMessage>(
      this.log?.requestDataJson || "{}",
      () => {
        // no edits
      }
    );
  }

  private get apiUrl() {
    return this.requestData?.url
  }

  private get requestBody() {
    return this.requestData?.body || "";
  }

  private get requestHeaders() {
    return this.requestData?.headers || [];
  }

  private get statusIsSuccess() {
    return this.log?.success || false;
  }

  private get method() {
    return this.requestData?.method || "";
  }
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
