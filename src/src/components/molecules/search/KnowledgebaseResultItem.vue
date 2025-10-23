<template>
  <div>
    <div class="knowledgebase-wrapper">
      {{ this.knowledgeBaseName }}
    </div>


    <div class="list">
      <TickListItem icon="knowledgebase" :name="item.name" @select="selectArticle(item)" v-for="item in this.articles" :key="item.id">
        <p v-html="item.summaryHtml"></p>
      </TickListItem>
    </div>


  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import PanelReduceSwitch from "@/components/panels/PanelReduceSwitch.vue";
import { SearchKnowledgeBase, SearchKnowledgeBaseArticleItem, SearchResultItem, LanguagePath } from "@/TickApi";
import CommunicatorIcon from "@/components/atoms/CommunicatorIcon.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import { translate } from '@/plugins/translatePlugin';

@Component({
  directives: { focus },
  emits: ["close", "selectQuery"],
  components: {
    TickSettingsPanel,
    PanelReduceSwitch,
    TickListItem,
    CommunicatorIcon,
  },
})
export default class KnowledgebaseResultItem extends Vue {
  @Prop() private data!: SearchResultItem;

  private get item(): SearchKnowledgeBase {
    return JSON.parse(this?.data?.dataJson || "{}");
  }


  private get knowledgeBaseName() {
    return this?.item?.name || translate(LanguagePath.KnowledgeBase);
  }

  private get articles(): SearchKnowledgeBaseArticleItem[] {
    return this.item.articles || [];
  }

  private selectArticle(item: SearchKnowledgeBaseArticleItem) {
    this.$emit("selectArticle", item);
  }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.communicator-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.list {
  display: grid;
  gap: 5px;


}
</style>
