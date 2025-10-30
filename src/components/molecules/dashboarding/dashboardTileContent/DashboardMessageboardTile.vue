<template>
  <div class="wrapper" :class="[this.colorName]">
    <div class="content">
      <TickHeading class="header" :size="Size.small" v-if="title">{{ this.title }}</TickHeading>

      <div class="message">
        <div class="html" v-html="messageHtml"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Appearance, Size as ButtonSize, Color } from '@/components/atoms/TickButton.vue';
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickHeading, { Size } from "@/components/atoms/TickHeading.vue";
import TickChart from "@/components/molecules/charting/TickChart.vue";
import { getColorName } from '@/helpers/colorsHelper';
import { ColorsEnum, DashboardTileMessageboardResponse, DashboardTileSettings, MessageboardTileSettings } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickPieChart from '../../charting/TickPieChart.vue';

@Component({
  emits: ["resolve"],
  components: { TickChart, TickPieChart, TickHeading, TickDropdown }
})
export default class DashboardMessageboardTile extends Vue {
  Color = Color
  Size = Size
  ButtonSize = ButtonSize
  Appearance = Appearance
  @Prop() private dashboardId: Required<string>;
  @Prop() private definitionData: Required<DashboardTileSettings>;
  @Prop() private contentData: Required<DashboardTileMessageboardResponse>;

  private headerHeight = 40;
  private contentPadding = 20;

  private get colorName() {
    return this.color ? getColorName(this.color) : null;
  }

  private get color(): ColorsEnum {
    return this.messageboardSettings?.color;
  }

  private get messageHtml() {
    return this.contentData?.messageAsHtml;
  }

  private get loading(): boolean {
    return this.tileData == null;
  }

  // private get showPieDetails(): boolean {
  //   const isPortrait = this.definitionData?.height > this.definitionData?.width;
  //   const isHighEnoughForDetails = this.definitionData?.height > 3;

  //   const showDetails = (!this.definitionData.height || (this.definitionData.height > 2 && (isPortrait || isHighEnoughForDetails)))
  //     && (!this.definitionData.width || this.definitionData.width > 2);

  //   return showDetails
  // }


  private get title() {
    return `${this.messageboardSettings.title}`;
  }



  private get messageboardSettings(): MessageboardTileSettings {
    const json = (this.definitionData ? this.definitionData.tileSettingsJson : "{}");
    const jsonObj = JSON.parse(json);
    return jsonObj;
  }


  private get tileData(): DashboardTileMessageboardResponse {
    return this.contentData;
  }



}
</script>
<style lang="scss">
.html {
  h1 {
    font-size: 20px;
    font-weight: 600;
  }

  h2 {
    font-size: 30px;
    font-weight: 600;
  }

  h3 {
    font-size: 40px;
    font-weight: 600;
  }

  ul {
    list-style: inside;
    padding-left: 30px;
  }

}
</style>
<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  @include neon-bg;

  padding: 12px 0px;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  height: 100%;
  grid-template-areas: "content";
  justify-content: left;
  align-items: center;
  border-radius: 12px;
  overflow: hidden;

  .content {
    grid-area: content;
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
    height: 100%;
    grid-template-areas: "header"
      "chart";
    justify-content: center;
    overflow-x: hidden;
    overflow-y: auto;

    .header {
      grid-area: header;
      opacity: 0.7;
      //display: grid;
      justify-content: left;
      padding-left: 10px;
      height: 25px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: calc(100% - 30px);
    }

    .message {
      padding: 10px;
    }


  }


  .menu {
    display: inline-block;
  }




}
</style>
