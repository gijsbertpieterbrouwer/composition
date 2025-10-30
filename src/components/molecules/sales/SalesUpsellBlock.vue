<template>
  <div class="block">
    <div class="title"> {{ this.title }} </div>

    <div class="tempter">{{ this.description }}</div>

    <div class="actions">

      <TickButton :disabled="!isAdmin" @click="navToSubscription" class="upsell-button" :appearance="Appearance.secondary" :color="Color.base">{{ this.buttonText }}</TickButton>
      <div class="button-disclaimer">{{ this.buttonDisclaimer }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickHeading from '@/components/atoms/TickHeading.vue';
import { getRandomInt } from '@/helpers/randomHelper';
import router, { ViewName } from '@/router';
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import { Component, Vue } from 'vue-facing-decorator';


@Component({
  emits: [""],
  components: {
    TickButton, TickHeading
  },
})
export default class SalesUpsellBlock extends Vue {
  Appearance = Appearance
  Color = Color

  private get title() {
    var seed = getRandomInt(0, 9);

    switch (seed) {
      case 0: return "We love to see you using Tick";
      case 1: return "Hello you";
      case 2: return "Make Tick smile";
      case 3: return "Tick Trial";
      case 4: return "Just a suggestion";
      case 5: return "Something of my chest";
      case 6: return "Tick tack toe";
      case 7: return "Loving Tick so far?";
      case 8: return "Welcome";
      case 9: return "Subscribe to a paid Tick plan and get even more!";
      default: return "Happy with what you see?"
    }

  }

  private navToSubscription() {
    router.push({ name: ViewName.Subscription, params: { workspaceName: useUserStore().activeWorkspace.urlName } });
  }

  private get isAdmin() {
    return useUserStore().isGlobalAdmin;
  }

  private get username() {
    const user = useUtilityDataStore().user(useUserStore().userId)
    return user ? (user.name || "?") : "?";
  }

  private get description() {
    var seed = Math.floor(Math.random() * 10); // 0-9

    switch (seed) {
      case 0: return "Tick can be of great service for your organization. Would you consider opting in to a paid plan? ";
      case 1: return "We love to see you, your current plan is free but also limited. With a paid plan there are no restrictions on user seats, flow actions or whatsoever. You only pay for what you use.";
      case 2: return "Do you want to enjoy the full version of Tick without limits? Opt in for our pay-as-you-go plan and join the Tick community!";
      case 3: return "You are using Tick and hopefully enjoying it. Can we ask you to consider using our pay-as-you-go plan? ";
      case 4: return "Enjoying the view of Tick? Start our pay-as-you-go plan and get the limitless package. You only pay for what you use.";
      case 5: return `Hi ${this.username}, we have a great offer for you! Hopefully you are as enthusiastic of Tick as we are! Can we suggest getting on board and start our paid plan?`;
      case 6: return `Thank you for using Tick, we would like to get you on our pay-as-you-go plan. Would you be interested?`;
      case 7: return `Hi ${this.username}, this is Tickly from Tick. I hope you are enjoying yourself with our great service. Now that you know me a bit better, would you like to get on our pay-as-you-go plan?`;
      case 8: return `Hello, good morning, good afternoon and good night! We would like to suggest a special offer for you.. Our Pay-as-you-go plan! `;
      case 9: return `Hi ${this.username}, sorry to disturb your lovely day.. but may I suggest viewing our pay-as-you-go plan? You get to know Tick beyond every limit currently restricting your happiness.`;
      default: return `This is me! Hopefully you are seeing to your liking using Tick. If so.. please consider using our pay-as-you-go plan!`;
    }
  }

  private get buttonDisclaimer() {
    return this.isAdmin
      ? "Billed and paid automatically at the end of each month"
      : "Ask your admin to start the paid plan"
  }




  private get buttonText() {
    var seed = Math.floor(Math.random() * 10); // 0-9

    switch (seed) {
      case 0: return "Yes! Im in";
      case 1: return "View the plans";
      case 2: return "Subscribe to paid plan";
      case 3: return "View plans";
      case 4: return "View information";
      case 5: return "Start the 'Sign me up' tour";
      case 6: return "Contribute";
      case 7: return "Join the Tick community";
      case 8: return "Start payment plan";
      case 9: return "View payment plans";
      default: return "View plans"
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.block {
  @include gradient-funky-bg;
  width: 100%;
  min-height: 200px;
  border-radius: 16px;
  padding: 20px;
  display: grid;

  .title {
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
    color: $black;
  }

  .tempter {
    font-size: $text-size-regular;
    line-height: 15px;
    font-weight: 100;
    color: $black;
  }

  .actions {
    padding-top: 12px;


    .upsell-button {
      padding-top: 12px;
    }

    .button-disclaimer {
      color: $black;
      font-size: 10px;
      padding-top: 5px;

    }
  }

}
</style>
