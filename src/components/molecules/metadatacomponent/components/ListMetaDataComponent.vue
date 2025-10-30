<template>
  <MetaDataComponentWrapper :data="data">
    <div class="list">
      <div class="list-item" v-for="item in this.listItems" :key="item.id">

        <div class="title">{{ this.getTitle(item) }}</div>
        <div class="subtitle">{{ this.getSubTitle(item) }}</div>
      </div>
    </div>
  </MetaDataComponentWrapper>
</template>

<script lang="ts">


import { MetaDataComponentUpdate, } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import MetaDataComponentWrapper from './MetaDataComponentWrapper.vue';

export interface IMetaDataComponentListItem {
  id: string;
  title: string;
  subtitle: string;
}

@Component({
  emits: ["deleted", "saved"],
  components: { MetaDataComponentWrapper },
})
export default class ListMetaDataComponent extends Vue {
  @Prop() private data!: MetaDataComponentUpdate;

  private getTitle(item: IMetaDataComponentListItem) {
    return item.title || "-"
  }
  private getSubTitle(item: IMetaDataComponentListItem) {
    return item.subtitle || ""
  }

  private get listItems() {
    return this.componentData;
  }

  private get componentData(): IMetaDataComponentListItem[] {
    if (!this.data) { return []; }
    try {
      const jsonObj = JSON.parse(this.data.componentData) as IMetaDataComponentListItem[];
      return jsonObj;
    }
    catch (err) {
      return err.message;
    }
  }

}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.list {


  .list-item {
    border-radius: 4px;
    border: 1px solid #DBDAD5;
    margin-bottom: 5px;
    //background-color: #fff;
    padding: 5px;



    .title {
      font-weight: 500;
      font-size: 14px;

    }

    .subtitle {
      font-size: $text-size-regular;
    }

  }
}
</style>
