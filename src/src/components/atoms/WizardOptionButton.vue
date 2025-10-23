<template>
  <button type="button" class="plan" :class="{ 'selected': this.selected }" @click="select">
    <TickIndicator v-if="indicator" class="indicator" :indicator="indicator" />
    <div class="title">
      <div class="content">
        <TickIcon v-if="this.icon" :name="this.icon" />
        {{ this.name }}
      </div>
      <!-- <div class="selection"></div> -->
    </div>
    <div class="description">
      <slot />
    </div>
  </button>
</template>


<script lang="ts">
import TickButton from '@/components/atoms/TickButton.vue';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickIndicator, { TickIndicatorData } from './TickIndicator.vue';



@Component({
  emits: ["select"],
  components: { TickButton, TickIndicator }
})
export default class WizardOptionButton extends Vue {
  @Prop() private selected: boolean;
  @Prop() private name: string;
  @Prop() private disabled: boolean;
  @Prop() private indicator: TickIndicatorData;
  @Prop() private icon: string;

  private select() {
    this.$emit("select");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.plan {
  .indicator {
    right: 10px;
    top: -12px;
    left: auto;
    height: 25px;
  }

  position: relative;
  border-radius: 8px;
  max-width: 250px;
  min-height: 100px;
  padding: 10px;
  background-color: $grey200;
  color: $black;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  border: solid 1px $white;
  gap: 5px;


  &.selected {
    border-color: $brand;
    background-color: $dark-bg;
    color: $white;
    border-color: $brand;
    // @include gradient-funky-bg;
    background-size: 300%;
    box-shadow: 0 0 10px 3px #fff,
      /* inner white */
      0 0 5px 3px $brand;

    /* outer cyan */
    // .title {
    //   // .selection {
    //   //   background-color: $brand;
    //   // }

    // }
  }

  .selection {
    width: 20px;
    height: 20px;
    border-radius: 999px;
    border: solid 1px $brand;

  }

  &.inactive {
    filter: blur(2px);
  }


  .title {
    font-size: 1.5rem;
    padding: 5px;
    font-weight: 600;
    align-content: start;
    display: flex;
    gap: 5px;

    .content {
      flex-grow: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-items: center;
      align-items: center;
    }

  }

  .description {
    padding: 5px;
    opacity: 0.7;
    align-content: start;
    flex-grow: 1;
    font-size: 0.7em;
  }
}
</style>
