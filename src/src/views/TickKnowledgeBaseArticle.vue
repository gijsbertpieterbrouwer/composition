<template>
  <template v-if="hasActiveItem">
    <KnowledgeBaseArticleEditor :activeId="selectedItemId" @saved="onSaved" @deleted="onDeleted" />
  </template>
  <template v-else>
    loading...
  </template>
</template>



<script lang="ts">
import { Component, Vue, Watch } from 'vue-facing-decorator';

import { focus } from "@/directives";
import TickButton from "@/components/atoms/TickButton.vue";
import TickIcon from "@/components/TickIcon.vue";
import { AuthorizationObjectType, TickKnowledgeBaseSummary } from '@/TickApi';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import useManagingStore from '@/store/managingStore';
import TickListItem from '@/components/atoms/TickListItem.vue';
import useUserStore from '@/store/user';
import KnowledgeBaseArticleEditor from '@/components/molecules/knowledgebase/KnowledgeBaseArticleEditor.vue';

@Component({
  directives: { focus },
  components: { TickButton, TickIcon, TickScreen, TickEditorPanel, TickListItem, KnowledgeBaseArticleEditor },
})
export default class TickKnowledgeBaseArticle extends Vue {
  private selectedItemId = "";

  private busyAdding = false;

  private get createallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration)
  }

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get items() {
    return useManagingStore().knowledgebaseSummaries || {}
  }


  private addEmpty() {

    useManagingStore().addKnowledgeBase().then((newItem: TickKnowledgeBaseSummary) => {
      this.selectItem(newItem);
    })
  }

  mounted() {
    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }
  private onDeleted() {
    this.$router.push({ name: 'KnowledgeBases' });
  }
  private onSaved() {
    // this.$router.push({ name: 'CannedResponses' });
  }
  private selectItem(item: TickKnowledgeBaseSummary) {
    this.$router.push({ params: { ...this.$route.params, id: item.id } });
  }

  @Watch("$route.params")
  private paramsChanged(to: TickKnowledgeBaseSummary) {
    this.selectedItemId = to.id || null;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
}
</style>
