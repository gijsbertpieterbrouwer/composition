<template>
  <div class="cw-summarized-item">
    <div class="cw-summarized-item-name">{{ this.name }}</div>
    <div class="cw-summarized-item-summary" v-if="hasSummaryHtml" v-html="summaryHtml"></div>
    <button disabled class="summaryOptionButton" @click="select"> {{ this.buttonText }}</button>
  </div>
</template>

<script lang="ts">

import { jsonProxy } from "@/helpers/jsonProxy";

import { ReplyOptionsData, SummarizedItemOptionData } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: [],
  components: {},
})
export default class SummarizedItemOption extends Vue {
  @Prop() private data!: ReplyOptionsData;

  private get optionsData(): SummarizedItemOptionData {
    return jsonProxy<SummarizedItemOptionData>(this.data.data || "{}", () => {
      //do nothing
    });
  }

  private get buttonText() {

    return this.optionsData.buttonText || "";
  }

  private get name() {
    return this.optionsData.name || "";
  }

  private get hasSummaryHtml() {
    return this.summaryHtml && this.summaryHtml.length;
  }

  private get summaryHtml() {
    return this.optionsData.summaryHtml || "";
  }


  private select() {
    //useAppStore().replyOptionCallback(this.optionsData.value)

  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.cw-summarized-item {
  .cw-summarized-item-name {
    font-size: 1.2em;
    font-weight: 600;

  }

  .cw-summarized-item-summary {
    font-style: italic;
    opacity: 0.8;
  }


}

.summaryOptionButton {
  cursor: pointer;
  border-radius: 6px;
  display: flex;


  line-height: 24px;
  padding: 4px 16px;
  background-color: $brand;
  color: $white;
  transition: background-color 120ms ease;
  align-items: center;


}
</style>