<template>
  <TimelineItem icon="ticket" :iconPaddingPx="12" :important="item.important">
    <div class="message">
      <div class="color-indicator" :class="[this.colorName]"></div>
      <div class="image-holder" v-if="hasImagePreview">
        <img :src="previewImageUrl" />
      </div>

      <div class="message-header">
        <span class="subdued date" :title="tooltipDate">{{ this.displayDate }}</span>
      </div>
      <div class="content">
        {{ this.text }}
        <div class="buttons">
          <GenericMetaDataComponentButtonDataItem :label="button.text" :data="button.url" v-for="(button, index) in this.buttons" :key="index" />
        </div>
      </div>

    </div>


  </TimelineItem>
</template>

<script lang="ts">
import { displayDate, displayDistanceToNowDate } from "@/helpers/dateHelper";
import { BasicTicketEvent, ColorsEnum, TimelineDataItem, TimelineTicketEvent } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TaskDetails from "../../task/TaskDetails.vue";
import TimelineItem from "@/components/molecules/ticket/Timeline/TimelineItem.vue";
import { getColorName } from "@/helpers/colorsHelper";
import { isImageFormat } from "@/helpers/fileHelper";
import GenericMetaDataComponentButtonDataItem from "../../metadatacomponent/components/GenericMetaDataComponentButtonDataItem.vue";


@Component({
  components: {
    TaskDetails,
    TimelineItem,
    GenericMetaDataComponentButtonDataItem
  },
})
export default class TicketTimelineEvent extends Vue {

  @Prop() private item: Required<TimelineDataItem>;

  private get data(): TimelineTicketEvent {
    return this.item.data;
  }

  private get customData(): BasicTicketEvent {
    return JSON.parse(this.data.dataJson);
  }

  private get text() {
    return this.customData.text;
  }

  private get dataJson() {
    return this.data.dataJson;
  }

  private get colorName() {
    if (this.customData?.color == ColorsEnum.Grey) { return null; }
    return getColorName(this.customData.color);
  }

  private get displayDate() {
    return displayDistanceToNowDate(this.item.timelineDate);
  }

  private get tooltipDate() {
    return displayDate(this.item.timelineDate);
  }


  private get hasImagePreview() {
    return this.customData?.imageUrl?.length > 0 && isImageFormat(this.customData?.imageUrl);
  }

  private get previewImageUrl() {
    return this.customData?.imageUrl;
  }


  private get buttons() {
    return this.customData?.buttons || [];
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.message {
  overflow: hidden;
  @include font-inter;
  border-radius: 8px;
  background-color: var(--c-base-100);
  outline-width: 2px;
  outline-style: solid;
  outline-color: transparent;
  //border: 1px solid var(--c-contrast);
  //padding: 12px;
  //padding-bottom: 4px;
  font-size: $text-size-regular;
  line-height: 16px;
  transform: translateX(-12px);
  min-width: 400px;

  //display: flex;
  // flex-direction: column;
  //gap: 8px;


  display: grid;
  grid-template-columns: auto auto 1fr;
  grid-template-areas: "color image header"
    "color image content";

  .date {
    padding-left: 8px;
  }
}

.color-indicator {
  @include neon-bg;
  grid-area: color;
  width: 10px;
  height: 100%;
}

.image-holder {
  grid-area: image;
  display: grid;
  //align-items: center;
  justify-content: center;
  padding: 12px;

  img {
    width: 80px;
    height: 80p;
  }

}

.content {
  grid-area: content;
  padding: 12px;


  .buttons {
    display: flex;
    justify-content: right;
    gap: 5px;
  }

}

.message-header {
  padding: 12px;
  padding-top: 0px;
  grid-area: header;
  display: flex;
  gap: 8px;
  line-height: 20px;
  justify-content: right;
}
</style>
