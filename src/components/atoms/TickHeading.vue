<template>
  <component class="title" :is="headingLevel">
    <slot />
  </component>
</template>

<script lang="ts">

export enum Size {
  large = "large",
  medium = "medium",
  small = "small",
  xsmall = "xsmall",
  xxsmall = "xxsmall",
}

export default {
  props: ["size"],
  computed: {
    headingLevel() {
      switch (this.size) {
        case Size.large:
          return "h1";
        case Size.medium:
          return "h2";
        case Size.small:
          return "h3";
        case Size.xsmall:
          return "h4";
        case Size.xxsmall:
          return "h5";
      }
      return "h1";
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.title {

  padding: 0;
  margin: 0;
  cursor: default;

  justify-items: center;


  &:first-letter {
    text-transform: capitalize
  }
}

h1 {
  @include font-outfit;
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
}

h2 {
  @include font-outfit;
  font-size: 20px;
  line-height: 24px;
  font-weight: 200;
}

h3 {
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
}

h4 {
  @include font-inter;
  font-size: 14px;
  line-height: 24px;
  font-weight: 500;
}

h4 {
  @include font-inter;
  font-size: 10px;
  line-height: 14px;
  font-weight: 300;
}
</style>
