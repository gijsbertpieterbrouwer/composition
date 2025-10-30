<template>
  <div class="tick-options-list">
    <div class="title" v-if="title">
      {{ this.title }}
    </div>
    <ul class="options-list">
      <li class="option" v-for="option in this.options" :key="option.id" :class="{ selected: this.selected === option.id }">
        <label>
          <input type="radio" :value="option.id" v-model="selected" :name="groupName" />
          <slot :option="option" :selected="selected === option.id" />
        </label>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import generateId from "@/helpers/guid";
import { Component, Prop, Vue, VModel } from "vue-facing-decorator";

export interface Option {
  id: string;
}

@Component({
  emits: ["update:modelValue"],
})
export default class TickOptionsList extends Vue {
  @Prop() private options!: (typeof Option)[];
  @Prop() private title: string;

  @VModel() private selected!: string;

  private get groupName() {
    return generateId();
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.title {
  padding: 24px 0 4px 8px;

  @include font-outfit;
  font-size: $text-size-regular;
  font-weight: 700;
  line-height: 20px;
  text-transform: uppercase;

  color: c("secondary");
}

.option {
  border-radius: 8px;
  transition: all 200ms ease;
  opacity: 0.88;

  &:not(.selected):hover {
    opacity: 1;
    transform: translateX(4px);
  }

  &.selected {
    opacity: 1;
    background-color: c("base-300");
  }
}

input {
  visibility: hidden;
}

label {
  display: flex;
  gap: 16px;

  line-height: 36px;
  font-size: $text-size-regular;
  font-weight: 500;

  color: c("contrast");
}
</style>
