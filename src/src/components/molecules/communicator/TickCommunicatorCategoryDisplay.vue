<template>
  <button class="label-display" @click="$emit('toggle', this.id)" :class="{ selected: this.selected }">
    <div class="color-indicator" :class="color">
      <TickIcon name="check" class="check" v-if="selected" />
    </div>
    <div class="title">
      {{ this.name }}
    </div>

  </button>
</template>

<script lang="ts">
import { ColorsEnum, TickCommunicatorCategoryDefinitionSummary } from "@/TickApi";
import TickIcon from "@/components/TickIcon.vue";
import { getColorName } from "@/helpers/colorsHelper";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: ["toggle"],
  components: {
    TickIcon
  },
})
export default class TickCommunicatorCategoryDisplay extends Vue {
  @Prop() private selected!: boolean;
  @Prop() private category!: TickCommunicatorCategoryDefinitionSummary;

  private get id() {
    return this.category?.id;
  }

  private get name() {
    return this.category?.name;
  }

  private get color() {
    return getColorName(ColorsEnum.BoldYellow);
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
  // display: flex;
  // gap: 5px;
  // flex-wrap: wrap;
  // align-items: center;

  // .icon {
  //   width: 15px;
  //   height: 15px;
  // }
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
