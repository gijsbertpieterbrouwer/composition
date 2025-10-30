<template>
  <div class="status-container">
    <div class="icon">
      <TickIcon :name="icon" />
    </div>
    <div class="text">{{ this.text }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickIcon from "@/components/TickIcon.vue";
import { getRandomInt } from '@/helpers/randomHelper';

@Component({
  emits: [],
  components: { TickIcon }
})
export default class HappyIndicator extends Vue {
  @Prop() private text: string;

  //https://www.svgrepo.com/vectors/celebrate/

  private get icon() {
    var seed = getRandomInt(0, 9);// Math.floor(Math.random() * 10); // 0-9

    switch (seed) {
      case 0: return "confetti";
      case 1: return "drink";
      case 2: return "balloons";
      case 3: return "cupcake";
      case 4: return "karaoke";
      case 5: return "gift";
      case 6: return "candy";
      case 7: return "spark";
      case 8: return "confetti";
      case 9: return "confetti";
      default: return "spark"
    }
  }

}


</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.status-container {
  display: grid;
  justify-content: center;

  padding: $text-size-regular;
  font-size: $text-size-regular;
  line-height: 16px;

  gap: 20px;


  .icon {
    text-align: center;


    svg {
      width: 30%;
      height: auto;

    }


  }

  .text {
    text-align: center;
  }

}
</style>
