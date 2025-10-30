<template>
  <MetaDataComponentWrapper :data="data">
    <!-- <pre class="json">  {{ this.componentData }}</pre> -->
    <TickJsonViewer :json="componentData" />
  </MetaDataComponentWrapper>
</template>

<script lang="ts">

import TickJsonViewer from '@/components/atoms/TickJsonViewer.vue';
import { MetaDataComponentUpdate } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import MetaDataComponentWrapper from './MetaDataComponentWrapper.vue';


@Component({
  emits: ["deleted", "saved"],
  components: { MetaDataComponentWrapper, TickJsonViewer },
})
export default class DebugMetaDataComponent extends Vue {
  @Prop() private data!: MetaDataComponentUpdate;

  private get componentData() {
    if (!this.data) { return ""; }
    try {
      const jsonObj = JSON.parse(this.data.componentData);
      const json = JSON.stringify(jsonObj, null, 2);
      return json;
    }

    catch (err) {
      return err.message;
    }
  }

}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
