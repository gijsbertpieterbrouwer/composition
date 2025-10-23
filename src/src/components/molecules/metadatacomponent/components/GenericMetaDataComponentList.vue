<template>
  <div class="list" :class="{ 'horizontal': useHorizontalFlex }">
    <template v-for="(item, popertyName) in this.data" :key="popertyName">

      <GenericMetaDataComponentList v-if="isArray(item)" :data="item" :label="popertyName" class="list-item" :depth="nextDepth" :collapseDepth="collapseDepth" />
      <GenericMetaDataComponentDataItem v-else class="list-item" :data="item" label="" :depth="nextDepth" :collapseDepth="collapseDepth" />
    </template>
  </div>
</template>

<script lang="ts">
import { stringIsValidURL } from '@/helpers/stringHelper';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import GenericMetaDataComponentDataItem from './GenericMetaDataComponentDataItem.vue';

@Component({
  name: "GenericMetaDataComponentList",
  emits: [],
  components: { GenericMetaDataComponentDataItem, },
})
export default class GenericMetaDataComponentList extends Vue {
  @Prop() private data!: [];
  @Prop() private label!: string;
  @Prop() private depth!: number;
  @Prop() private collapseDepth!: number;

  private get useHorizontalFlex() {
    return this.allUrls;
  }

  private get allUrls() {

    for (let index = 0; index < this.data.length; index++) {
      const d = this.data[index];
      if (!stringIsValidURL(d)) {
        //console.log("not url", d)
        return false;
      }
    }

    return true;
  }

  private get nextDepth(): number {
    return (this.depth || 0) + 1;
  }

  // private shouldRenderProp(prop: any) {
  //   //var type = typeof (prop);
  //   if (this.isArray(prop)) { return true; }
  //   return true;
  // }

  private isArray(prop: unknown) {
    if (Array.isArray(prop)) { return true; }
    return false;
  }

}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;


  &.horizontal {
    display: flex;
    flex-direction: row;
    gap: 5px;

    .list-item {
      width: auto;
      min-width: 1px;

    }
  }
}

.list-item {
  // background-color: hsla(c("contrast-hsl"), 0.08);
  // border-radius: 8px;

}
</style>
