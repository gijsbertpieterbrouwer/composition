<template>
  <div>
    <TickButton @click="toggleOpen" ref="toggleButton" v-closable="close" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular">
      {{ $translate(LanguagePath.App_FlowEditor_Test) }}
    </TickButton>
    <tick-chatwidget v-if="enablePreviewChatwidgetExternalId" :cwtoken.prop="enablePreviewChatwidgetExternalId" :viewstate="widgetViewState.messages" />
  </div>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickIcon from "@/components/TickIcon.vue";
import { closable } from "@/directives";
import { getChatWidgetDummyWidgetId } from "@/helpers/chatWidgetPreviewMessagesHelper";
import { mount, unmount } from "@/helpers/mountHelper";
import { ChatWidgetURL, popupCenter } from "@/services/urls";
import { LanguagePath, TickChannelSummary, TickFlowDefinition } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import { widgetViewState } from "../../channel/ChatWidgetChannelEditor.vue";
import FlowTestPanel from "./FlowTestPanel.vue";

@Component({
  components: { TickButton, TickIcon, TickHeading },
  emits: ["filtersUpdated"],
  directives: { closable },
})
export default class FlowTestButton extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  widgetViewState = widgetViewState
  LanguagePath = LanguagePath
  @Prop() private flow!: TickFlowDefinition;

  private showOpen = false;
  private activePanel = "";
  private enablePreviewChatwidgetExternalId = "";

  private close() {
    this.showOpen = false;
  }

  private get previewchatWidgetId() {
    return getChatWidgetDummyWidgetId();
  }

  private toggleOpen() {
    this.showOpen = !this.showOpen;
    this.togglePanel();
  }



  private togglePanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }
  private openChatWidget(externalId: string, message: string) {
    const url = `${ChatWidgetURL()}?cwtoken=${externalId}&forceRefresh=true&message=${message}`;
    popupCenter(url, "Preview", 600, 800);
  }

  private openPanel() {
    if (this.activePanel) { return; }

    this.activePanel = mount(FlowTestPanel, {
      props: {
        data: this.flow,
      },
      events: {
        close: () => {
          this.closePanel();
        },
        startforchannel: (channel: TickChannelSummary) => {
          if (!channel) { this.enablePreviewChatwidgetExternalId = null }

          this.openChatWidget(channel.externalId, this.qualifiesText);
          this.closePanel();
          // if (channel.communicationType == CommunicationType.ChatWidget) {
          //   this.enablePreviewChatwidgetExternalId = this.enablePreviewChatwidgetExternalId == channel.externalId
          //     ? null
          //     : channel.externalId;
          // }

          // if (this.enablePreviewChatwidgetExternalId) {

          //   this.closePanel();
          // }

        }
      },
    });
  }

  private get qualifiesText() {
    return this.flow?.developmentData?.qualifierText || '';
  }
  private closePanel() {
    if (!this.activePanel) { return; }

    unmount(this.activePanel);
    this.activePanel = "";
  }


}
</script>
<style lang="scss" scoped>
@import "@/styles/theme";



.buttons-wrapper {
  display: flex;
  justify-content: space-between;
  width: 100%;

}
</style>
