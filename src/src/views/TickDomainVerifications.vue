<template>
  <TickScreen :title="$translate(LanguagePath.DomainVerifications)">
    <template v-slot:actions></template>

    <template v-slot:default>
      <InternetDomainCreator v-if="allowAdd" />
      <InternetDomainEditor :domain="item" v-for="item in domains" :key="item.id" @deleted="onDeleted(item)" />
    </template>
  </TickScreen>
</template>

<script lang="ts">
import TickButton from "@/components/atoms/TickButton.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import InternetDomainCreator from '@/components/molecules/internetdomain/InternetDomainCreator.vue';
import InternetDomainEditor from '@/components/molecules/internetdomain/InternetDomainEditor.vue';
import TickIcon from '@/components/TickIcon.vue';
import useInternetDomainsStore from '@/store/internetDomains';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, LanguagePath, SubscriptionCostItemType, TickInternetDomain } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';

@Component({
  directives: {},
  components: { TickButton, TickScreen, TickListItem, TickEditorPanel, TickDropdown, TickIcon, InternetDomainEditor, InternetDomainCreator },
})
export default class TickDomainVerifications extends Vue {
  LanguagePath = LanguagePath
  private busyAdding = false;

  private selectItem(item: TickInternetDomain) {
    this.$router.push({ params: { ...this.$route.params, id: item.id } })
  }

  private get allowAdd() {
    return useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration) && this.addAllowedInPlan;
  }

  private get addAllowedInPlan() {
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.InternetDomain, this.domains.length)
  }

  private onSaved() {
    // 
  }

  private onDeleted(item: TickInternetDomain) {
    useInternetDomainsStore().domains = useInternetDomainsStore().domains.filter(p => p.id != item.id);
  }


  private get allowEdit() {
    return true;
    // return useUserStore().allowedEdit(TeamUserAuthorizationType.InternetDomainsWrite);
  }

  private get domains() {
    return useInternetDomainsStore().domains || [];
  }

  mounted() {
    useInternetDomainsStore().use();

    // if (this.$route.params.id) {
    // this.selectedItemId = this.$route.params.id.toString();
    // }
  }

  //@Watch("$route.params")
  // private paramsChanged(to: TickRouteParams) {
  //this.selectedItemId = to.id || null;
  // }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
