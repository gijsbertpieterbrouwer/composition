<template>
  <template v-if="hasActiveItem">
    <EventSubscriptionEditor :activeId="selectedItemId" @saved="onSaved" @deleted=this.onDeleted />
  </template>
  <template v-else>
    <TickScreen :title="$translate(LanguagePath.EventSubscriptions)">
      <template v-slot:actions>
        <TickButton @click="addEmpty" v-if="allowAdd" :busy="busyAdding">{{ $translate(LanguagePath.App_Add) }}</TickButton>
        <!-- <TickDropdown v-if="allowEdit" @select="createEmptyChannelAction" :options="channelTypeOptions" placeholder="Add channel"></TickDropdown> -->
      </template>

      <template v-slot:default>
        <div class="no-data" v-if="noData">
          {{ $translate(LanguagePath.App_EventSubscriptionEditor_Explanation) }}

        </div>



        <div class="list">
          <TickListItem :icon="'adapter'" :name="item.name" @select="selectItem(item)" v-for="item in this.eventSubscriptions" :key="item.id">
            <span class="active-indicator" :class="subClass(item)"> {{ this.getSubtitle(item) }}</span>
          </TickListItem>
        </div>

      </template>

    </TickScreen>

  </template>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-facing-decorator';

import TickButton from "@/components/atoms/TickButton.vue";
import { TickRouteParams } from '@/router';
import { ColorsEnum, AuthorizationObjectType, TickChannelSummary, TickEventSubscriptionSummary, SubscriptionCostItemType, LanguagePath } from '@/TickApi';
import EventSubscriptionEditor from '@/components/molecules/eventsubscriptions/EventSubscriptionEditor.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickIcon from '@/components/TickIcon.vue';
import useUserStore from '@/store/user';
import { getColorName } from '@/helpers/colorsHelper';
import useEventSubscriptionsStore from '@/store/eventSubscriptions';
import { ViewName } from '@/router';
@Component({
  directives: {},
  components: { TickButton, TickScreen, TickListItem, TickEditorPanel, TickDropdown, TickIcon, EventSubscriptionEditor },
})
export default class TickEventSubscriptions extends Vue {
  LanguagePath = LanguagePath
  private selectedItemId = "";
  private busyAdding = false;

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private selectItem(item: TickChannelSummary) {
    this.$router.push({ params: { ...this.$route.params, id: item.id } })
  }

  private onSaved() {
    // 
  }

  private onDeleted() {
    this.$router.push({ name: ViewName.EventSubscriptions })
  }
  private get noData(): boolean {
    return this.eventSubscriptions.length == 0;
  }
  private get eventSubscriptions() {
    return useEventSubscriptionsStore().all || [];
  }

  private get hasEventSubscriptions() {
    return this.eventSubscriptions.length;
  }


  private addEmpty() {
    this.createEmpty();
  }

  private async createEmpty() {
    this.busyAdding = true;
    const id = await useEventSubscriptionsStore().add();
    this.busyAdding = false;
    this.$router.push({ params: { ...this.$route.params, id } });
  }

  private subClass(subscription: TickEventSubscriptionSummary) {
    if (subscription.active) {
      return getColorName(ColorsEnum.Green);
    }
    return getColorName(ColorsEnum.Grey);
  }

  private getSubtitle(subscription: TickEventSubscriptionSummary) {
    if (subscription.active) {
      return "Active"
    }

    return "InActive";
  }

  private get allowAdd() {
    return useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration) && this.addAllowedInPlan;
  }

  private get addAllowedInPlan() {
    const currentNr = this.eventSubscriptions.length;
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.EventSubscription, currentNr)
  }

  mounted() {
    useEventSubscriptionsStore().use();

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.no-data {
  font-size: $text-size-regular;
  padding: 20px;
}

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
}


.active-indicator {
  display: inline-block;
  padding: 2px;
  background-color: $grey400;
  padding: 0 4px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  white-space: nowrap;
  border-radius: 2px;
  color: #fff;
  margin-right: 5px;
  margin-left: 5px;
  @include neon-bg;
}
</style>
