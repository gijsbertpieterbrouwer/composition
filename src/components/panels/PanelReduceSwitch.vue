<template>
  <button v-show="show" @click.self="toggleReducing" class="moreitems-message">{{ this.text }}</button>
</template>

<script lang="ts">
import { translate } from "@/plugins/translatePlugin";
import { LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: ["toggle"],
  components: {

  },
})
export default class PanelReduceSwitch extends Vue {
  @Prop() private nrHidden: number;
  @Prop() private totalCount: number;
  @Prop() private reduce: boolean;
  @Prop() private maxNrOfItems: number;

  private toggleReducing() {
    this.$emit("toggle");
  }

  private get text() {
    return this.reduce
      ? translate(LanguagePath.App_ReduceSwitch_On_Title, [{ path: 'nr', value: this.nrHidden.toString() }])
      : translate(LanguagePath.App_ReduceSwitch_Off_Title);
  }

  private get needsSwitch() {
    return this.totalCount > this.maxNrOfItems;
  }

  private get show(): boolean {
    return this.needsSwitch && (!this.reduce || this.nrHidden > 0);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.moreitems-message {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  font-style: italic;
}
</style>
