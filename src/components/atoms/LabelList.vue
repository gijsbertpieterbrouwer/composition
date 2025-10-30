<template>
  <div class="labels">
    <TickLabel :disableToggle="disableToggle" :disableCollapse="disableCollapse" v-for="label in this.visibleLabels" :key="label.id" :name="label.name" :color="label.color" :allowRemove="allowRemove"
      @remove="remove(label)" />
    <div class="empty-placeholder" v-if="!visibleLabels.length && this.emptyLabel">
      <TickIcon name="label" class="icon" />
      {{ this.emptyLabel }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import TickLabel from "@/components/atoms/TickLabel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { ColorsEnum } from "@/TickApi";

export interface Label {
  id: string;
  color: ColorsEnum;
  name: string;
}

@Component({
  components: { TickLabel, TickIcon },
  emits: ["remove"],
})
export default class LabelList extends Vue {
  @Prop({ required: true, default: [] }) private labels!: Label[];
  @Prop({ default: false }) private allowRemove: boolean;
  @Prop({ default: false }) private disableCollapse: boolean;
  @Prop({ default: false }) private disableToggle: boolean;
  @Prop({ default: "Labels" }) private emptyLabel: string;
  @Prop() private hideGrey: boolean;

  private remove(label: Label) {
    this.$emit("remove", label);
  }

  private get visibleLabels() {
    //if (!this.hideGrey) { return (this.labels.sort((a, b) => a.name.localeCompare(b.name))) }
    const labels = this.labels || [];

    const visibleLabels = this.hideGrey
      ? labels.filter(p => p.color != ColorsEnum.Grey)
      : labels;

    return visibleLabels.sort((a, b) => a.name.localeCompare(b.name))
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  outline: none;
}

.empty-placeholder {
  padding: 0 4px;
  @include font-inter;
  font-weight: 500;
  letter-spacing: 0.02em;
  font-size: 10px;
  line-height: 16px;
  text-transform: capitalize;
  white-space: nowrap;

  border-radius: 2px;
  transition: all 0.3s ease;
  color: var(--c-contrast);
  display: inline-flex;
  gap: 4px;
  align-items: center;
  background-color: var(--c-base-300);

  .icon {
    width: 10px;
    height: 10px;
  }
}
</style>
