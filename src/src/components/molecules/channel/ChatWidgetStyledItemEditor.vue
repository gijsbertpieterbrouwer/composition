<template>

  <TickButton ref="buttonRef" @click.stop="togglePanel" :appearance="preview ? Appearance.transparent : Appearance.primary" :color="Color.secondary" :size="Size.regular">
    <div class="preview" :style="previewStyling">
      {{ this.title }}<br />
      <slot />
    </div>
  </TickButton>

</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import FlowsPanel from "@/components/panels/FlowsPanel.vue";
import { generateBorderRadius } from "@/helpers/chatWidgetPreviewMessagesHelper";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { ChatWidgetStylingSettingsData, } from "@/TickApi";
import { Component, Prop, VModel, Vue } from "vue-facing-decorator";
import ChatWidgetStylePanel from "./ChatWidgetComponents/ChatWidgetStylePanel.vue";

@Component({
  emits: ["update:modelValue"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, ChatWidgetStylePanel, TickHeading, TickSelector, FlowsPanel },
})
export default class ChatWidgetStyledItemEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size

  private activePanel: string = null;

  @VModel({ required: true }) private data!: ChatWidgetStylingSettingsData;
  @Prop() private disabled!: boolean;
  @Prop() private title!: string;
  @Prop({ default: true }) private preview!: boolean;
  @Prop() private maxBorderRadiusFactor!: number;

  private mounted() {
    if (!this.data) {
      const newData: ChatWidgetStylingSettingsData = {

      }
      this.$emit("update:modelValue", newData);
    }


  }


  private get previewStyling() {
    if (!this.preview) { return null; }

    const borderWidth = this.data.showBorder ? 1 : 0;
    const borderColor = this.data.borderColor || "#efefef";
    const backgroundColor = this.data.showBackground ? this.data.backgroundColor : "";

    return {
      'background-color': backgroundColor,
      'color': this.data.foregroundColor,
      'border': `solid ${borderWidth}px ${borderColor}`,
      'border-radius': generateBorderRadius(this.data),
    }
  }


  private togglePanel() {

    if (this.activePanel) {
      this.closePanel();
    } else {

      this.openPanel();
    }
  }

  private openPanel() {
    if (this.disabled) { return; }
    if (this.activePanel) { return; }

    const buttonRef = "buttonRef";

    const panelOptions: TickPanelOptions = {
      title: "ChatWidgetStylePanel",
      from: getRefElementDOMRect(this, buttonRef)
    }

    this.activePanel = mount(ChatWidgetStylePanel, {
      props: {
        panelOptions: panelOptions,
        modelValue: this.data,
        maxBorderRadiusFactor: this.maxBorderRadiusFactor,
        //modelValue: computed(() => (this as any)[dataKey]),
        title: this.title,
      },
      events: {
        close: () => {
          this.closePanel();
        },
        "update:modelValue": (to: ChatWidgetStylingSettingsData) => {
          //(this as any)[dataKey] = to;
          this.$emit("update:modelValue", to);

          // const modelStyling = { ...model };

          // modelStyling.backgroundColor = to.backgroundColor;
          // modelStyling.foregroundColor = to.foregroundColor;
          // modelStyling.borderRadius = to.borderRadius;
          // modelStyling.borderColor = to.borderColor;
          // model = to; // modelStyling;

          // this.generalStyling = modelStyling;
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


.preview {
  padding: 15px 10px;
  //min-width: 200px;
  width: 100%;
}
</style>
