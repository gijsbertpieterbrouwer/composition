<template>
  <div class="block">
    <div class="title">
      <TickHeading :size="HeadingSize.large"> {{ this.title }} </TickHeading>
    </div>

    <div class="tempter">{{ this.description }}</div>

    <div class="actions">
      <TickButton @click="navToRegister('1')" class="upsell-button" :appearance="Appearance.secondary" :color="Color.base">Free trial</TickButton>
      <TickButton @click="navToRegister('2')" class="upsell-button" :appearance="Appearance.primary" :color="Color.base">View plans</TickButton>
    </div>

  </div>
</template>

<script lang="ts">
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickHeading, { Size as HeadingSize } from '@/components/atoms/TickHeading.vue';
import { getRandomInt } from '@/helpers/randomHelper';
import router, { ViewName } from '@/router';
import { Component, Vue } from 'vue-facing-decorator';


@Component({
  emits: [""],
  components: {
    TickButton, TickHeading
  },
})
export default class SalesRegisterBlock extends Vue {
  Appearance = Appearance
  Color = Color
  HeadingSize = HeadingSize

  private navToRegister(planIndex: string) {
    router.push({ name: ViewName.Register, params: { planId: `3f990cdc-dfd3-4524-8594-91513900000${planIndex}` } });
  }

  private get title() {
    var seed = getRandomInt(0, 4);

    switch (seed) {
      case 0: return "Register Tick";
      case 1: return "Subscribe";
      case 2: return "Start Tick today";
      case 3: return "Start Ticketing today";
      case 4: return "Get a smarter helpdesk";
      default: return "Get Tick"
    }
  }


  private get description() {
    var seed = Math.floor(Math.random() * 10); // 0-9

    switch (seed) {
      case 0: return "Tick can be of great service for your organization. Would you consider joining?";
      case 1: return "There is a trial to see what we offer and a pay-as-you-go plan to help without limits";
      case 2: return "Do you want to enjoy the full version of Tick without limits? Opt in for our pay-as-you-go plan and join the Tick community!";
      case 3: return "Can we ask you to consider joining our family";
      case 4: return "Enjoying the view of Tick? Start our pay-as-you-go plan and get the limitless package. You only pay for what you use.";
      case 5: return `Hi  we have a great offer for you! Can we suggest getting on board and start the paid plan?`;
      case 6: return `We would like to get you on our pay-as-you-go plan. Would you be interested?`;
      case 7: return `Hi, this is Tickly from Tick. Register today to start helping smarter.`;
      case 8: return `Hello, good morning, good afternoon and good night! We would like to suggest a special offer for you.. Our Pay-as-you-go plan! `;
      case 9: return `Hi, sorry to disturb your lovely day.. but may I suggest viewing our pay-as-you-go plan? You get to know Tick beyond every limit currently restricting your happiness.`;
      default: return `This is me! please consider using our pay-as-you-go plan!`;
    }
  }




}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.block {
  @include gradient-funky2-bg;
  width: 100%;
  min-height: 200px;
  border-radius: 16px;
  padding: 20px;
  display: grid;
  box-shadow: 0px 4px 8px 1px rgba(0, 0, 0, 0.1);
  text-align: left;

  .title {
    // font-size: 24px;
    // line-height: 32px;
    // font-weight: 600;
    color: $black;
  }

  .tempter {
    font-size: 14px;
    line-height: 15px;
    font-weight: 100;
    color: $black;
  }

  .actions {
    padding-top: 12px;
    display: flex;
    gap: 10px;

  }



}
</style>
