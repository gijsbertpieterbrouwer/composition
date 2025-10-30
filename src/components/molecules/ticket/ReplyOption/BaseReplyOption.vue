<template>
  <component :is="getComponent" :data="data" />
</template>

<script lang="ts">
import { ReplyOptionsData, ReplyOptionType } from "@/TickApi";
import { Component, Prop } from "vue-facing-decorator";
import { Vue } from "vue-facing-decorator";
import ChoiceOption from "./ChoiceOption.vue";
import SummarizedItemOption from "./SummarizedItemOption.vue";


@Component({
  emits: [],
  components: { ChoiceOption, SummarizedItemOption },
})
export default class BaseReplyOption extends Vue {
  @Prop() private data!: ReplyOptionsData;

  private get getComponent(): string {
    switch (this.data.type) {
      case ReplyOptionType.ChoiceOption: return "ChoiceOption";
      case ReplyOptionType.SummarizedItemOption: return "SummarizedItemOption";
      default: return "div";
    }

  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>