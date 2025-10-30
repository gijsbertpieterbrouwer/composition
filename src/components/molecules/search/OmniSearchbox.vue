<template>
  <div class="omni-searchbox">
    <input @focus="focus" @click="openPanel" ref="queryBox" class="query" type="text" :placeholder="$translate(LanguagePath.App_Search)" :title="$translate(LanguagePath.App_Search_Placeholder)" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';

// import { mount, unmount } from "@/helpers/mountHelper";
// import { getRefElementDOMRect } from "@/helpers/refHelpers";
// import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import { openSearchPanel } from "@/components/molecules/search/panels/SearchResultsPanel.vue";
// import { searchAll } from '@/services/searchService';
// import useUserStore from '@/store/user';
import { LanguagePath } from '@/TickApi';
// import { RouterToKnowledgeBaseArticle, ViewName, RouterToTicket } from '@/router';
// import useUtilityDataStore from '@/store/utilitydata';
// import { translate } from '@/plugins/translatePlugin';
// import { LocalSearchResultItemListItem, LocalSearchResultItem } from '@/helpers/omniSearchHelper';


@Component({
  emits: ["update:modelValue"],
  components: {

  },
})
export default class OmniSearchbox extends Vue {
  LanguagePath = LanguagePath

  private openPanel() {
    openSearchPanel();
  }

  created() {
    window.addEventListener('keypress', this.keyListener);
  }

  beforeUnmount() {
    document.removeEventListener("keypress", this.keyListener);
  }

  private keyListener(e: KeyboardEvent) {

    if (e.ctrlKey && e.code === 'KeyQ') {
      // Prevent the Save dialog to open
      e.preventDefault();
      // Place your code here
      this.openPanel();
      return false;
    }
  }

  private focus() {
    const searchBox = this.$refs.queryBox as HTMLInputElement;
    if (searchBox) {
      this.openPanel();
    }
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.omni-searchbox {
  display: grid;
  justify-items: center;


  .query {
    width: 90%;
    cursor: text;
    padding: 8px;
    border-radius: 4px;
    height: 32px;
    transition: background-color 200ms ease;
    display: flex;
    align-items: center;
    background-color: var(--c-base-200);
    font-size: 10px;


    &:hover:not([disabled]) {
      background-color: var(--c-base);
    }
  }


}
</style>
