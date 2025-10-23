<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>{{ this.panelTitle }}</template>

    <div class="content">
      <div class="explanation"> {{ this.explanationText }}
        <div class="info"> {{ $translate(LanguagePath.App_TestPanel_Explanation) }} </div>
      </div>

      <div class="testable-channels">
        <FlowTestPanelChannel @startforchannel="startForChannel" :qualifiesText="qualifiesText" :channel="channel" v-for="channel in this.testchannels" :key="channel.id" />

        <TickItemSummaryBlock :title="'Clipboard'" :icon="'flow'">
          {{ $translate(LanguagePath.App_TestPanel_Copy_Explanation, [{ path: 'code', value: this.qualifiesText }]) }}

          <template #actions>
            <TickButton @click="copyQualifierTextTOClipboard" :appearance="ButtonAppearance.primary" :color="ButtonColor.secondary">{{ $translate(LanguagePath.App_Copy) }}</TickButton>
          </template>

        </TickItemSummaryBlock>
      </div>


    </div>

    <!-- <div class="footer">
      <TickButton @click="copyQualifierTextTOClipboard">Copy {{ this.qualifiesText }} to clipboard</TickButton>
    </div> -->

  </TickDialogPanel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import TickButton, { Appearance as ButtonAppearance, Size as ButtonSize, Color as ButtonColor, } from "@/components/atoms/TickButton.vue";
import { focus } from "@/directives";

import { CommunicationType, MetaDataItem, TickChannelSummary, TickFlowDefinition, LanguagePath } from "@/TickApi";
import EditorMessage, { EditorMessageType } from "../../EditorMessage.vue";
import { copyToClipboard } from "@/helpers/stringHelper";
import useChannelsStore from "@/store/channels";
import FlowTestPanelChannel from "./FlowTestPanelChannel.vue";
import TickItemSummaryBlock from "@/components/atoms/TickItemSummaryBlock.vue";
import { translate } from "@/plugins/translatePlugin";


@Component({
  directives: { focus },
  emits: ["close", "startforchannel"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    EditorMessage,
    FlowTestPanelChannel,
    TickItemSummaryBlock
  },
})
export default class FlowTestPanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  EditorMessageType = EditorMessageType
  LanguagePath = LanguagePath
  @Prop() private data!: TickFlowDefinition;

  private startForChannel(channel: TickChannelSummary) {
    this.copyQualifierTextTOClipboard();
    this.$emit("startforchannel", channel);
  }

  private get testchannels() {
    return this.channels.filter(p => p.communicationType == CommunicationType.ChatWidget);
  }


  private get channels() {
    return useChannelsStore().summaries.sort((a, b) => a.name.localeCompare(b.name)) || [];
  }

  private get flow() {
    return this.data;
  }

  private get qualifiesText() {
    return this.flow?.developmentData?.qualifierText || '';
  }

  private copyQualifierTextTOClipboard() {
    copyToClipboard(this.qualifiesText);
  }

  private get explanationText() {
    return translate(LanguagePath.App_TestPanel_Example, [{ path: 'code', value: this.qualifiesText }]);
  }

  private get flowName() {
    return this.flow?.name || "";
  }

  private get panelTitle() {
    return translate(LanguagePath.App_TestPanel_Title, [{ path: 'name', value: this.flowName }]);
  }

  private onCreated(data: MetaDataItem) {
    this.$emit("close", data);
  }

  private close() {
    this.$emit("close");
  }

  private mounted() {
    useChannelsStore().use();
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 700px;
  display: grid;
  gap: 20px;

  .explanation {
    // @include font-outfit;
    display: grid;
    gap: 5px;

    .info {
      font-size: 0.8em;
      opacity: 0.7;

    }
  }

  .testable-channels {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }


  .footer {
    border-top: solid 1px var(--c-base-200);
    margin-top: 15px;
    padding-top: 20px;
  }
}
</style>
