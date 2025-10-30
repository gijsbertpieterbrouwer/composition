<template>
  <button class="label-display" @click="$emit('toggle', this.label.id)" :class="{ selected: this.selected }">
    <div class="color-indicator" :class="color">
      <TickIcon name="check" class="check" v-if="selected" />
    </div>
    <div class="title">{{ this.label.name }}</div>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import { TickLabelDefinition } from "@/TickApi";
import { getColorName } from "@/helpers/colorsHelper";

import TickIcon from "@/components/TickIcon.vue";

@Component({
  emits: ["toggle"],
  components: {
    TickIcon,
  },
})
export default class TickLabelDisplay extends Vue {
  @Prop() private selected!: boolean;
  @Prop() private label!: TickLabelDefinition;

  private get color() {
    return getColorName(this.label.color);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.label-display {
  display: flex;
  padding: 4px;
  gap: 8px;
  align-items: center;
  width: 100%;
  transition: background-color 200ms ease;
  margin-left: -4px;
  border-radius: 4px;

  &:hover {
    color: var(--c-contrast);
    background-color: var(--c-base-300);
  }
}

.title {
  font-size: $text-size-regular;
  font-weight: 500;
}

.color-indicator {
  border-radius: 2px;
  height: 20px;
  min-width: 8px;
  margin-right: 12px;
  background-color: var(--c-base-300);

  display: grid;
  place-items: center;

  @include neon-bg;
}

.check {
  width: 16px;
  height: 16px;
}

.selected .color-indicator {
  width: 20px;
  margin-right: 0;
}
</style>
