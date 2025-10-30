<template>

  <div class="metadata-components" v-if="componentReadyForRender">
    <div class="top">
      <component v-if="!useBottomSlot" :is="getComponent" :data="componentSampleData" :disabled="true" />
    </div>
    <div class="spacer"></div>
    <div class="bottom">
      <component v-if="useBottomSlot" :is="getComponent" :data="componentSampleData" :disabled="true" />
    </div>
  </div>


</template>

<script lang="ts">

import { getMetaDataComponent } from '@/helpers/enumsHelper';
import useManagingStore from '@/store/managingStore';
import { MetaDataComponentUpdate } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import CommunicatorHistoryMetaDataComponent from './components/CommunicatorHistoryMetaDataComponent.vue';
import CommunicatorInfoMetaDataComponent from './components/CommunicatorInfoMetaDataComponent.vue';
import DebugMetaDataComponent from './components/DebugMetaDataComponent.vue';
import GenericMetaDataComponent from './components/GenericMetaDataComponent.vue';
import ListMetaDataComponent from './components/ListMetaDataComponent.vue';


@Component({
  emits: [""],
  components: {
    DebugMetaDataComponent, ListMetaDataComponent, TickScreen, TickEditorPanel, GenericMetaDataComponent,
    CommunicatorHistoryMetaDataComponent, CommunicatorInfoMetaDataComponent
  },
})
export default class MetaDataComponentEditorSidebar extends Vue {

  private get useBottomSlot(): boolean {
    return this.componentSampleData.useBottomSlot || false;
  }

  private get componentSampleData(): MetaDataComponentUpdate {
    return useManagingStore().metaDataComponentEditorSampleData;
  }

  private get componentReadyForRender() {
    return this.componentSampleData != null;
  }

  private get getComponent() {
    if (!this.componentSampleData) { return ""; }
    return getMetaDataComponent(this.componentSampleData.sourceType, this.componentSampleData.viewerSettingsJson);
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
