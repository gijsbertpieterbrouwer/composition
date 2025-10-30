<template>
  <TickItemSummaryBlock :title="channel.name" :icon="'flow'">

    {{ $translate(LanguagePath.App_TestPanel_Channel_Explanation) }}
    <template #actions>
      <TickButton @click="startChannel">{{ $translate(LanguagePath.App_TestPanel_Channel_StartButton_Title) }}</TickButton>
    </template>

    <!-- <tick-chatwidget v-if="enablePreviewChatwidget" :cwtoken="channel.externalId" :chatwidgetid.prop="previewchatWidgetId" :viewstate="widgetViewState.messages" /> -->

  </TickItemSummaryBlock>
</template>

<script lang="ts">
import TickButton from "@/components/atoms/TickButton.vue";
import TickItemSummaryBlock from "@/components/atoms/TickItemSummaryBlock.vue";
import { focus } from "@/directives";
import { LanguagePath, TickChannelSummary } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import { widgetViewState } from "../../channel/ChatWidgetChannelEditor.vue";

@Component({
  directives: { focus },
  emits: ["startforchannel"],
  components: {
    TickButton,
    TickItemSummaryBlock
  },
})
export default class FlowTestPanelChannel extends Vue {
  widgetViewState = widgetViewState
  LanguagePath = LanguagePath
  @Prop() private channel!: TickChannelSummary;
  @Prop() private qualifiesText!: string;

  private startChannel() {
    this.$emit("startforchannel", this.channel);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
