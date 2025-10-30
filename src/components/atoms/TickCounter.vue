<template>
  <div class="wrapper" :class="[this.colorName]">

    <div class="content">

      <div class="content-wrapper" :class="sizeClass" :title="tooltip">
        <!-- <TickHeading class="value">{{ this.value }}</TickHeading> -->
        <span class="value">{{ this.value }}</span>
        <span class="unit" v-if="showUnit">{{ this.displayUnit }}</span>
      </div>
    </div>

    <TickHeading class="footer" :size="footerSize" :title="titleTooltip">{{ this.title }}</TickHeading>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickHeading, { Size } from "@/components/atoms/TickHeading.vue";
import { ColorsEnum } from '@/TickApi';
import { getColorName } from '@/helpers/colorsHelper';

export enum CounterSize {
  Small = 1,
  Regular = 2,
  Large = 3,
  XL = 4,
}

@Component({
  emits: ["resolve"],
  components: { TickHeading }
})
export default class TickCounter extends Vue {
  Size = Size
  @Prop() private value: "";
  @Prop() private unit: "";
  @Prop() private title: "";
  @Prop() private titleTooltip: "";
  @Prop() private color: ColorsEnum; // ticks

  @Prop({ default: CounterSize.Regular }) private size: CounterSize;


  private get colorName() {
    return this.color ? getColorName(this.color) : null;
  }

  private get tooltip() {
    return `${this.value} ${this.displayUnit}`;
  }
  private get showUnit() {
    return this.size > CounterSize.Small;
  }

  private get displayUnit() {
    return this.unit || "";
  }

  private get sizeClass() {
    return 'size-' + this.size;
    // switch (this.size) {
    //   case Size.small: return {'size': 'small'};
    //   case Size.xsmall: return {'size': 'xsmall'};
    //   default: return {'size': 'xsmall'};
    // }
  }

  private get footerSize() {
    switch (this.size) {
      case CounterSize.Small: return Size.small;
      case CounterSize.Regular: return Size.small;
      case CounterSize.Large: return Size.medium;
      case CounterSize.XL: return Size.large;
      default: return Size.small;
    }
    // return this.size || Size.small;
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  padding: 12px;
  @include neon-bg;
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-columns: 1fr;
  height: 100%;
  grid-template-areas: "content"
    "footer";


  .content {
    grid-area: content;
    display: grid;
    justify-content: center;
    align-content: center;
    justify-items: center;
    font-weight: 600;

    .content-wrapper {
      display: flex;
      gap: 5px;
      justify-items: center;
      align-items: center;
      flex-wrap: wrap;
      //justify-content: center;

      .value {
        display: inline-block;
        @include font-outfit;
        height: auto;
      }

      .unit {
        opacity: 0.7;
        display: inline-block;
      }


      &.size-4 {
        .value {
          font-size: 15em;
          height: 130px;
        }

        .unit {
          font-size: 15em;
          height: 130px;
        }

        gap: 20px;
      }

      &.size-3 {
        .value {
          font-size: 7em;
        }

        .unit {
          font-size: 7em;
        }
      }

      &.size-2 {
        .value {
          font-size: 5em;
        }

        .unit {
          font-size: 5em;
        }
      }

      &.size-1 {
        .value {
          font-size: 3em;
        }

        .unit {
          font-size: 3em;
        }
      }


    }


  }

  .footer {
    grid-area: footer;
    //display: grid;
    justify-content: center;
    opacity: 0.7;
    text-align: center;


    height: auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;

  }


}
</style>
