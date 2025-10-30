<template>
  <div class="block">
    <div class="title"> {{ this.title }} </div>
    <div class="tempter" v-html="description"></div>
    <div class="actions">
      <TickButton :disabled="!isAdmin" @click="navToSubscription" class="upsell-button" :appearance="Appearance.secondary" :color="Color.base">{{ this.buttonText }}</TickButton>
    </div>
  </div>
</template>

<script lang="ts">
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickHeading from '@/components/atoms/TickHeading.vue';
import { translate } from '@/plugins/translatePlugin';
import router, { ViewName } from '@/router';
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import { LanguagePath, SubscriptionCostItemType } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';


@Component({
  emits: ["close"],
  components: {
    TickButton, TickHeading
  },
})
export default class SalesUpSellViaFeatureBlock extends Vue {
  Appearance = Appearance
  Color = Color

  @Prop() private type!: SubscriptionCostItemType;


  private get title() {
    return translate(LanguagePath.App_SalesUpsellFeatureBlock_Title);//: "Scale up your plan to use this feature"
  }

  private navToSubscription() {
    this.$emit("close")
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
    return this.isAdmin
      ? translate(LanguagePath.App_SalesUpsellFeatureBlock_IsAdmin_Explanation)
      : translate(LanguagePath.App_SalesUpsellFeatureBlock_ViewPlansButton);
  }



  private get buttonText() {
    return translate(LanguagePath.App_SalesUpsellFeatureBlock_ViewPlansButton);
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

  }

}
</style>
