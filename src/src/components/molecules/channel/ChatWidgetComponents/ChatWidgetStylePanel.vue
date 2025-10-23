<template>
  <TickSettingsPanel :panelOptions="panelOptions" class="assignments-panel" @close="$emit('close')">
    <template #title>{{ this.titleText }}</template>

    <div class="content">
      <div class="left">
        <EditorMessage v-if="showContrastWarning" :type="EditorMessageType.Warning" title="Contrast warning" message="There seems to be a lack of contrast." />

        <SidebarPanel name="Colors" id="styling_colors">
          <TickSwitch v-model="showBgColor">{{ $translate(LanguagePath.App_ChatWidgetStylePanel_UseBackgroundColor) }}</TickSwitch>
          <TickInput v-if="showBackground" class="color" type="color" v-model="bgColor">{{ $translate(LanguagePath.App_ChatWidgetStylePanel_BackgroundColor) }}</TickInput>
          <TickInput class="color" type="color" v-model="fgColor">{{ $translate(LanguagePath.App_ChatWidgetStylePanel_ForeGroundColor) }}</TickInput>
          <TickInput type="range" :min="0" :max="20" v-model="dropShadow" :hideInput="true">{{ $translate(LanguagePath.App_ChatWidgetStylePanel_ShadowSize) }}</TickInput>
        </SidebarPanel>

        <SidebarPanel name="Font" id="font">
          <TickSelector :options="fontOptions" v-model="font">{{ $translate(LanguagePath.App_ChatWidgetStylePanel_FontFamily) }}</TickSelector>
          <TickSelector :options="fontSizeOptions" v-model="fontSize">{{ $translate(LanguagePath.App_ChatWidgetStylePanel_FontSize) }}</TickSelector>
        </SidebarPanel>

      </div>
      <div class="right">

        <SidebarPanel name="Border" id="styling_border_radius">
          <TickSwitch v-model="borderRadius_Linked">{{ $translate(LanguagePath.App_ChatWidgetStylePanel_LinkRoundness) }}</TickSwitch>
          <template v-if="showLinked">
            <TickInput type="range" :min="0" :max="100" v-model="borderRadius" :hideInput="true" />
          </template>
          <template v-else>

            <div class="flex-row">
              <TickInput type="number" title="Left top" :min="0" :max="100" v-model="borderRadius_LT" />
              <TickInput type="number" title="Right top" :min="0" :max="100" v-model="borderRadius_RT" />
              <TickInput type="number" title="Right bottom" :min="0" :max="100" v-model="borderRadius_RB" />
              <TickInput type="number" title="Left bottom" :min="0" :max="100" v-model="borderRadius_LB" />
            </div>
          </template>

          <TickSwitch v-model="showBorder">{{ $translate(LanguagePath.App_ChatWidgetStylePanel_ShowBorder) }}</TickSwitch>
          <TickInput class="color" type="color" v-model="borderColor">{{ $translate(LanguagePath.App_ChatWidgetStylePanel_BorderColor) }}</TickInput>
        </SidebarPanel>

        <SidebarPanel name="Padding" id="styling_padding">
          <template #header>
            <TickSwitch v-model="useCustomPadding" />
          </template>

          <div class="flex-row">
            <TickInput type="number" title="Left top" :min="0" :max="100" v-model="padding_LT" />
            <TickInput type="number" title="Right top" :min="0" :max="100" v-model="padding_RT" />
            <TickInput type="number" title="Right bottom" :min="0" :max="100" v-model="padding_RB" />
            <TickInput type="number" title="Left bottom" :min="0" :max="100" v-model="padding_LB" />
          </div>

        </SidebarPanel>
      </div>
    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import { ChatWidgetStylingSettingsData, LanguagePath, } from "@/TickApi";
import TickIcon from "@/components/TickIcon.vue";
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { getChatwidgetFontOptions, getChatwidgetFontSizeOptions } from "@/helpers/chatWidgetPreviewMessagesHelper";
import { colorContrastRatio } from "@/helpers/colorsHelper";
import { translate } from "@/plugins/translatePlugin";
import { Component, Prop, VModel, Vue } from "vue-facing-decorator";
import EditorMessage, { EditorMessageType } from "../../EditorMessage.vue";

@Component({
  emits: ["update:modelValue", "close"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, TickSettingsPanel, TickIcon, TickSwitch, SidebarPanel, EditorMessage, TickSelector },
})
export default class ChatWidgetStylePanel extends Vue {
  EditorMessageType = EditorMessageType
  LanguagePath = LanguagePath
  @VModel({ required: true }) private data!: ChatWidgetStylingSettingsData;
  @Prop() private title: string;
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop({ default: 1 }) private maxBorderRadiusFactor!: number;

  private contrastRatio = 0;
  private showLinked = false;
  private showBackground = false;
  private showStylingBorder = false;

  private get fontOptions() {
    return getChatwidgetFontOptions();
  }
  private get fontSizeOptions() {
    return getChatwidgetFontSizeOptions();
  }

  private get titleText() {
    return this.title || translate(LanguagePath.App_ChatWidgetStylePanel_Title);
  }

  mounted() {
    this.calculateColorContrast();
    this.showLinked = this.data.borderRadius_Linked;
    this.showBackground = this.data.showBackground;
    this.showStylingBorder = this.data.showBorder;
  }

  private get font() {
    return this.data.fontFamily;
  }

  private set font(to: string) {
    this.data.fontFamily = to;
    this.updateModel();
  }

  private get fontSize() {
    return this.data.fontSize;
  }

  private set fontSize(to: number) {
    this.data.fontSize = to;
    this.updateModel();
  }

  private get showContrastWarning() {

    if (!this.data.showBackground) { return false; }
    const ratio = this.contrastRatio;
    return ratio < 4;
  }

  private calculateColorContrast() {
    const bg = this.data.backgroundColor;
    const fg = this.data.foregroundColor;

    this.contrastRatio = colorContrastRatio(bg, fg);
  }

  private get showBgColor() {
    return this.data.showBackground;
  }

  private set showBgColor(to: boolean) {
    this.data.showBackground = to;
    this.showBackground = to;
    this.calculateColorContrast();
    this.updateModel();
  }

  private get bgColor() {
    return this.data.backgroundColor;
  }

  private set bgColor(to: string) {
    this.data.backgroundColor = to;
    this.calculateColorContrast();
    this.updateModel();

  }

  private get fgColor() {
    return this.data.foregroundColor;
  }

  private set fgColor(to: string) {
    this.data.foregroundColor = to;
    this.calculateColorContrast();
    this.updateModel();
  }

  private get dropShadow() {
    return this.data.dropShadow;
  }

  private set dropShadow(to: number) {
    this.data.dropShadow = to;
    this.updateModel();
  }

  private get borderRadius_LT() {
    return this.data.borderRadius_LeftTop;
  }

  private set borderRadius_LT(to: number) {
    this.data.borderRadius_LeftTop = to;
    this.updateModel();
  }

  private get borderRadius_RT() {
    return this.data.borderRadius_RightTop;
  }

  private set borderRadius_RT(to: number) {
    this.data.borderRadius_RightTop = to;
    this.updateModel();
  }


  private get borderRadius_RB() {
    return this.data.borderRadius_RightBottom;
  }

  private set borderRadius_RB(to: number) {
    this.data.borderRadius_RightBottom = to;
    this.updateModel();
  }

  private get borderRadius_LB() {
    return this.data.borderRadius_LeftBottom;
  }

  private set borderRadius_LB(to: number) {
    this.data.borderRadius_LeftBottom = to;
    this.updateModel();
  }

  private get borderRadius_Linked() {
    return this.data.borderRadius_Linked || false;
  }

  private set borderRadius_Linked(to: boolean) {
    this.data.borderRadius_Linked = to;
    this.showLinked = to;
    this.updateModel();
  }

  private get borderRadius() {
    return this.data.borderRadius;
  }

  private set borderRadius(to: number) {

    this.data.borderRadius = this.normalizeBorderRadius(to);
    this.updateModel();
  }

  private normalizeBorderRadius(to: number) {
    const factor = this.maxBorderRadiusFactor ?? 1;
    return to * factor;


  }

  private get showBorder() {
    return this.data.showBorder;
  }

  private set showBorder(to: boolean) {
    this.data.showBorder = to;
    this.showStylingBorder = to;
    this.updateModel();
  }

  private get borderColor() {
    return this.data.borderColor;
  }

  private set borderColor(to: string) {
    this.data.borderColor = to;
    this.updateModel();
  }


  private get useCustomPadding() {
    return this.data.useCustomPadding;
  }

  private set useCustomPadding(to: boolean) {
    this.data.useCustomPadding = to;
    this.updateModel();
  }

  private get padding_LT() {
    return this.data.padding_LeftTop;
  }

  private set padding_LT(to: number) {
    this.data.padding_LeftTop = to;
    this.updateModel();
  }

  private get padding_RT() {
    return this.data.padding_RightTop;
  }

  private set padding_RT(to: number) {
    this.data.padding_RightTop = to;
    this.updateModel();
  }


  private get padding_RB() {
    return this.data.padding_RightBottom;
  }

  private set padding_RB(to: number) {
    this.data.padding_RightBottom = to;
    this.updateModel();
  }

  private get padding_LB() {
    return this.data.padding_LeftBottom;
  }

  private set padding_LB(to: number) {
    this.data.padding_LeftBottom = to;
    this.updateModel();
  }

  private updateModel() {
    this.$emit("update:modelValue", this.data);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";



.title {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  letter-spacing: 0.04em;
}

.content {
  min-width: 800px;
  min-height: 600px;
  display: flex;
  gap: 20px;

  .right {
    padding-left: 20px;
  }

  .left {
    padding-right: 40px;
    border-right: solid 1px var(--c-base-200);
  }

  // display: flex;
  // flex-direction: column;
  // gap: 8px;

  //   .color {
  //   display: inline-block;
  // }
}

.flex-row {
  display: flex;
  gap: 5px;
}
</style>
