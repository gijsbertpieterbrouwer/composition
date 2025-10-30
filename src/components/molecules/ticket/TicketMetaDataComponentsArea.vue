<template>
  <div v-if="hasActive" class="metadata-components">
    <div class="top">
      <component :is="getComponent(component)" :data="component" v-for="component in this.topSortedComponents" :key="component.ticketMetaDataComponentId" />
    </div>
    <div class="spacer"></div>
    <div class="bottom">
      <component :is="getComponent(component)" :data="component" v-for="component in this.bottomSortedComponents" :key="component.ticketMetaDataComponentId" />
    </div>
  </div>
</template>

<script lang="ts">
import { MetaDataComponentUpdate } from '@/TickApi';
import { getMetaDataComponent } from '@/helpers/enumsHelper';
import useTicketsStore from "@/store/tickets";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import CommunicatorHistoryMetaDataComponent from '../metadatacomponent/components/CommunicatorHistoryMetaDataComponent.vue';
import CommunicatorInfoMetaDataComponent from '../metadatacomponent/components/CommunicatorInfoMetaDataComponent.vue';
import DebugMetaDataComponent from '../metadatacomponent/components/DebugMetaDataComponent.vue';
import GenericMetaDataComponent from '../metadatacomponent/components/GenericMetaDataComponent.vue';
import ListMetaDataComponent from '../metadatacomponent/components/ListMetaDataComponent.vue';

@Component({
  emits: [],
  components: { DebugMetaDataComponent, ListMetaDataComponent, GenericMetaDataComponent, CommunicatorHistoryMetaDataComponent, CommunicatorInfoMetaDataComponent }
})
export default class TicketMetaDataComponentsArea extends Vue {
  @Prop() private activeId!: string;

  private get hasActive() {
    return this.activeId != null;
  }

  private get topSortedComponents() {
    return this.components
      .filter(p => !p.useBottomSlot)
      .sort(({ weight: a }, { weight: b }) => a - b);
  }

  private get bottomSortedComponents() {
    return this.components
      .filter(p => p.useBottomSlot)
      .sort(({ weight: a }, { weight: b }) => a - b);
  }


  private get components() {
    if (!this.hasActive) { return []; }
    const activequest = useTicketsStore().ticket(this.activeId);
    if (!activequest || !activequest.metaDataComponents || !activequest.metaDataComponents.length) { return []; }

    return activequest.metaDataComponents
      .filter(p => p != null);
  }


  private getComponent(component: MetaDataComponentUpdate) {
    return getMetaDataComponent(component.sourceType, component.viewerSettingsJson);
  }
}
</script>


<style lang="scss" scoped>
@import "@/styles/theme";

.metadata-components {
  padding-top: 20px;
  display: flex;

  flex-direction: column;
  min-height: 100%;


  .spacer {
    margin-top: auto;
    margin-bottom: auto;
  }

}
</style>
