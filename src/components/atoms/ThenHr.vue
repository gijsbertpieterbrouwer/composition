<template>
  <hr class="then-hr" :class="{ 'is-last': this.isLast }" />
</template>


<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";


@Component
export default class ThenHr extends Vue {
  @Prop() private isLast!: boolean;

}
</script>


<style lang="scss" scoped>
@import "@/styles/theme";

.then-hr {
  border: none;
  margin: 16px 0 12px 0;
  padding: 0;
  height: 1px;
  background-color: var(--c-base-300);
  position: relative;
  overflow: visible;

  &::before {
    content: "THEN";
    position: absolute;
    left: 0;
    top: -4.5px;
    background-color: var(--c-base-400);
    color: var(--c-contrast);
    font-weight: 600;
    letter-spacing: 0.04em;
    border-radius: 4px;
    padding: 0 3px 0 2px;
    font-size: 8px;
    line-height: 10px;
  }

  &.is-last {
    &::before {
      content: "FINALLY";
      background-color: var(--c-base-400);
    }
  }


}
</style>
