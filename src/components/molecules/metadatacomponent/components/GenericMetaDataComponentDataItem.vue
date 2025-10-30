<template>
  <template v-if="shouldRender">
    <div class="item  text-selectable" :class="{ list: this.isArray, object: this.isObject, fullWidth: this.hasFullWidth }">

      <!-- <template v-if="collapsed">
        <div class="label" v-if="hasLabel">{{ this.normalizedLabel }} {{ this.normalizedCollapsedLabelSuffix }} </div>
        COLLAPSED
      </template> -->
      <template v-if="isChart">
        <div class="label" v-if="hasLabel">{{ this.normalizedLabel }} </div>
        <div class="chart-content">
          <GenericMetaDataComponentChart :data="data" :label="label" />
        </div>
      </template>

      <template v-else-if="isArray">
        <div class="collapsable-label" v-if="hasLabel" @click="toggleCollapse"><span class="label">{{ this.normalizedLabel }}</span> <span v-if="collapsed">{{ this.normalizedArraySuffix
        }}</span></div>

        <div class="list" v-if="!collapsed">
          <GenericMetaDataComponentList :data="data" :label="label" :depth="nextDepth" :collapseDepth="collapseDepth" />
        </div>


      </template>

      <template v-else-if="isDate">
        <div class="label" v-if="hasLabel">{{ this.normalizedLabel }} </div>
        <div class="data date">
          {{ this.dataAsDate }}
        </div>
      </template>

      <template v-else-if="isObject">
        <div class="label" v-if="hasLabel">{{ this.normalizedLabel }} </div>
        <div class="object-content">
          <template v-for="(value, propertyName) in this.data" :key="propertyName">
            <GenericMetaDataComponentDataItem :data="value" :label="propertyName" :depth="nextDepth" :collapseDepth="collapseDepth" />
          </template>
        </div>
      </template>
      <template v-else-if="getIsPreviewable">
        <div class="label" v-if="hasLabel">{{ this.normalizedLabel }} </div>
        <div class="data">
          <TickFilePreview :url="data" />
        </div>
      </template>


      <template v-else>

        <template v-if="isUrl">
          <GenericMetaDataComponentButtonDataItem :data="data" :label="normalizedLabel" />
        </template>
        <template v-else>
          <div class="label" v-if="hasLabel">{{ this.normalizedLabel }} </div>
          <div class="data">
            {{ this.data }}
          </div>
        </template>



      </template>
    </div>
  </template>
</template>

<script lang="ts">

import TickFilePreview from '@/components/atoms/TickFilePreview.vue';
import { displayDate, isValidDate } from '@/helpers/dateHelper';
import { pathHasPreviewer } from '@/helpers/fileHelper';
import { stringIsNullOrEmpty, stringIsValidURL } from '@/helpers/stringHelper';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import GenericMetaDataComponentButtonDataItem from './GenericMetaDataComponentButtonDataItem.vue';
import GenericMetaDataComponentChart from './GenericMetaDataComponentChart.vue';
import GenericMetaDataComponentList from './GenericMetaDataComponentList.vue';
@Component({
  name: "GenericMetaDataComponentDataItem",
  emits: [],
  components: { GenericMetaDataComponentList, GenericMetaDataComponentButtonDataItem, GenericMetaDataComponentChart, TickFilePreview },
})
export default class GenericMetaDataComponentDataItem extends Vue {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Prop() private data!: any;
  @Prop() private label!: string;
  @Prop() private depth!: number;
  @Prop() private collapseDepth!: number;

  private noLabelKey = 'no_label';
  private collapsed = false;

  private toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  private mounted() {
    if (this.depth > this.collapseDepth) {
      this.collapsed = true;
    }
  }


  private get nextDepth(): number {
    return (this.depth || 0) + 1;
  }


  private get isChart() {
    if (!this.hasData) { return false; }
    if (this.data?.chartingType !== undefined) {
      return true;
    }
    return false;
  }

  private get getIsPreviewable() {
    return this.isUrl && pathHasPreviewer(this.data);
  }

  private get isUrl() {
    if (!this.hasData) { return false; }
    return stringIsValidURL(this.data);
  }

  // private getIsValidUrl(itemData: unknown) {
  //   var a = document.createElement('a');
  //   a.href = itemData as string;
  //   return (a.host && a.host != window.location.host);
  // }

  private get hasLabel(): boolean {
    const l = this.normalizedLabel;
    if (stringIsNullOrEmpty(l) || l.toLowerCase().startsWith(this.noLabelKey)) { return false; }
    return true;
  }

  private get normalizedArraySuffix(): string {
    if (this.isArray) {
      return `(${this.data.length})`;
    }
    return "";
  }

  private get normalizedLabel() {
    const label = this.label;
    const splitted = label.toString()
      .trim()
      .split(/(?=[A-Z])/)
      .map(element => element.trim().toLowerCase());

    return splitted.join(" ");
  }

  private get isArray() {
    if (this.hasData && Array.isArray(this.data)) { return true; }
    return false;
  }

  private get isObject() {
    if (!this.hasData) { return false; }
    return (typeof this.data == "object") && !this.isArray && !this.isChart;
  }

  private get isBool() {
    return this.hasData && (typeof this.data == "boolean");
  }

  private get hasData(): boolean {
    if (this.data == null || this.data == undefined) { return false; }

    // if (typeof (this.data) == 'string') {
    //   return !stringIsNullOrEmpty(this.data);
    // }

    return true;
  }

  private get hasFullWidth() {
    if (this.getIsPreviewable) { return true; }
    if (!this.shouldRender || !this.hasData) { return false; }

    if (this.isChart) { return true; }

    return (typeof this.data == "string")
      && !this.isDate
      && !this.isUrl
      && this.data.length > 14;
  }

  private get isDate() {
    return isValidDate(this.data);
  }

  private get dataAsDate() {
    return displayDate(this.data as string, true);
  }

  private get shouldRender() {
    if (typeof this.label != "string") { return true; }
    if (this.label && this.label.toLowerCase() == "id") { return false; }
    return true;
  }


}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";



.item {

  max-width: 45%;
  min-width: 25%;
  overflow: hidden;
  //max-width: 45%;
  //Do not hide content = > chart tooltips are displayed inside and need space to hover around

  // overflow-x: hidden;
  // overflow-y: hidden;
  text-overflow: ellipsis;

  &.fullWidth {
    width: 100%;
    max-width: 400px;
  }

  &.list {
    min-width: 100%;
    //max-width: max-content;
  }

  &.list-item {
    min-width: 100%;
    //max-width: max-content;
  }

  &.object {
    padding: 8px;
    min-width: 100%;
    //max-width: max-content;
  }


  .label {
    font-size: 14px;
    font-weight: 200;
    opacity: 0.7;

    &:first-letter {
      text-transform: uppercase;
    }
  }

  .object-content {
    display: flex;
    gap: 10px;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .chart-content {
    display: flex;
    gap: 10px;
    flex-direction: column;
    flex-wrap: wrap;
  }

  .data {
    font-size: 14px;
    font-weight: 500;
  }

}
</style>
