<template>
  <MetaDataComponentWrapper :data="data">

    <template v-if="componentData">
      <!-- {{ this.componentData }} -->
      <GenericMetaDataComponentDataItem v-for="(value, popertyName) in this.componentData" :key="popertyName" :data="value" :label="popertyName" :depth="0" :collapseDepth="maxDepthBeforeCollapse" />

      <!-- <template v-for="(value, popertyName) in this.componentData" :key="popertyName">
        {{ popertyName }} :{{ value }} <br /><br />
      </template> -->

    </template>
  </MetaDataComponentWrapper>
</template>

<script lang="ts">

import BusyIndicator from '@/components/atoms/BusyIndicator.vue';
import { MetaDataComponentUpdate, } from '@/TickApi';
import { Component, Prop, Vue, } from 'vue-facing-decorator';
import GenericMetaDataComponentDataItem from './GenericMetaDataComponentDataItem.vue';
import MetaDataComponentWrapper from './MetaDataComponentWrapper.vue';
import { asJsonObject } from '@/helpers/jsonHelper';

@Component({
  name: "GenericMetaDataComponent",
  emits: [],
  components: { GenericMetaDataComponent, GenericMetaDataComponentDataItem, BusyIndicator, MetaDataComponentWrapper },
})
export default class GenericMetaDataComponent extends Vue {
  @Prop() private data!: MetaDataComponentUpdate;

  private get maxDepthBeforeCollapse() {
    return 3;
  }

  private get componentData(): object {
    return asJsonObject(this.data.componentData);
  }
}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
