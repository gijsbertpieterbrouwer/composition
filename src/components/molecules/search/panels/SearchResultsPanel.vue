<template>
  <TickDialogPanel :header="true" @close="$emit('close')" :transparentBackdrop="true">
    <template #title>{{ $translate(LanguagePath.App_SearchResultsPanel_Title) }}</template>

    <div class="content">
      <div class="omni-searchbox">
        <TickInput v-focus type="text" :maxlength="50" :placeholder="$translate(LanguagePath.App_Search)" v-model="inputQuery" :title="$translate(LanguagePath.App_Search_Placeholder)" />
      </div>
      <div class="info">

        <template v-if="busySearching">
          <BusyIndicator :loading="busySearching" />{{ $translate(LanguagePath.App_Searching) }}
        </template>
        <template v-else-if="lastSearchQuery">
          {{ this.resultsFoundText }}
        </template>
      </div>






      <div class="list server">
        <div class="item" v-for="item in this.serverReducedFilteredItems" :key="item.id">

          <!-- @click="selectItem(item)" -->

          <template v-if="item.type == SearchResultTypeEnum.Ticket">
            <TicketResultItem @select="selectTicket" :data="item" />
          </template>
          <template v-else-if="item.type == SearchResultTypeEnum.CommunicatorTickets">
            <CommunicatorResultItem @selectTicket="selectTicket" :data="item" />
          </template>
          <template v-else-if="item.type == SearchResultTypeEnum.KnowledgebaseArticles">
            <KnowledgebaseResultItem @selectArticle="selectArticle" :data="item" />
          </template>
          <template v-else-if="item.type == SearchResultTypeEnum.Custom">
            <LocalResultItem @select="selectCustomItem" :data="item" />
          </template>
          <template v-else>
            <span class="name">{{ item.name }}</span>
          </template>
        </div>

        <PanelReduceSwitch :reduce="reduceServerResults" @toggle=this.toggleReduceServerItems :nrHidden="nrOfHiddenServerItems" :totalCount="filteredServerItems.length" :maxNrOfItems="maxNrOfItems" />
      </div>

      <div class="list local">
        <div class="item" v-for="item in this.localReducedFilteredItems" :key="item.id">

          <!-- @click="selectItem(item)" -->

          <template v-if="item.type == SearchResultTypeEnum.Ticket">
            <TicketResultItem @select="selectTicket" :data="item" />
          </template>
          <template v-else-if="item.type == SearchResultTypeEnum.CommunicatorTickets">
            <CommunicatorResultItem @selectTicket="selectTicket" :data="item" />
          </template>
          <template v-else-if="item.type == SearchResultTypeEnum.KnowledgebaseArticles">
            <KnowledgebaseResultItem @selectArticle="selectArticle" :data="item" />
          </template>
          <template v-else-if="item.type == SearchResultTypeEnum.Custom">
            <LocalResultItem @select="selectCustomItem" :data="item" />
          </template>
          <template v-else>
            <span class="name">{{ item.name }}</span>
          </template>
        </div>

        <PanelReduceSwitch :reduce="reduceLocalResults" @toggle=this.toggleReduceLocalItems :nrHidden="nrOfHiddenLocalItems" :totalCount="filteredLocalItems.length" :maxNrOfItems="maxNrOfItems" />
      </div>

    </div>

  </TickDialogPanel>
</template>

<script lang="ts">
import TicketListItem from "@/components/molecules/ticket/TicketListItem.vue";
import PanelReduceSwitch from "@/components/panels/PanelReduceSwitch.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { Component, Vue } from "vue-facing-decorator";

import BusyIndicator from "@/components/atoms/BusyIndicator.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TicketResultItem from "@/components/molecules/search/TicketResultItem.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { LocalSearchResultItemListItem, omniSearch } from "@/helpers/omniSearchHelper";
import { translate } from '@/plugins/translatePlugin';
import { RouterToKnowledgeBaseArticle, RouterToTicket, RouterToView } from "@/router";
import { LanguagePath, SearchKnowledgeBaseArticleItem, SearchResponse, SearchResultTypeEnum, TicketSummary } from "@/TickApi";
import CommunicatorResultItem from "../CommunicatorResultItem.vue";
import GenericResultWithListItem from "../GenericResultWithListItem.vue";
import KnowledgebaseResultItem from "../KnowledgebaseResultItem.vue";
import LocalResultItem from "../LocalResultItem.vue";

export function removeSearchPanel() {
  unmount("searchPanel");
}

export function openSearchPanel() {

  mount(SearchResultsPanel, {
    props: {

    },
    events: {
      close: () => {
        removeSearchPanel();
      },
      // select: (d: DropdownOption) => {
      //   return d;
      // }
    },
  }, "searchPanel");
}


@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    BusyIndicator,
    TickSettingsPanel,
    PanelReduceSwitch,
    TicketListItem,
    TicketResultItem,
    GenericResultWithListItem,
    KnowledgebaseResultItem,
    TickDialogPanel,
    CommunicatorResultItem,
    LocalResultItem,
    TickInput
  },
})
export default class SearchResultsPanel extends Vue {
  SearchResultTypeEnum = SearchResultTypeEnum
  LanguagePath = LanguagePath
  //@Prop() private panelOptions!: TickPanelOptions;

  private localSearchResult: SearchResponse = {
    items: [],
  };
  private serverSearchResult: SearchResponse = {
    items: [],
  };

  private query = "";
  private lastSearchQuery = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queryTimer: any = null;
  private busySearching = false;
  private typingDelay = 500;
  private minTypingChars = 3;

  private filterText = "";
  private maxNrOfItems = 5;
  private reduceServerResults = true;
  private reduceLocalResults = true;
  private searched = false;


  private get resultsFoundText(): string {

    return translate(LanguagePath.App_Search_ResultsFor, [
      {
        path: 'nr',
        value: (this.localSearchResult?.resultsCount + this.serverSearchResult?.resultsCount).toString()
      }, {
        path: 'query',
        value: this.lastSearchQuery
      },
    ]);
  }

  private get combinedNrOfResults(): number {
    return (this.localSearchResult?.items?.length || 0) + (this.serverSearchResult?.items?.length || 0);
  }

  private get nothingFound(): boolean {
    return this.searched && !this.busySearching && !this.combinedNrOfResults;
  }


  private executeSearch(searchQuery: string) {
    this.busySearching = true;
    omniSearch(searchQuery).then((results) => {
      this.lastSearchQuery = searchQuery;
      this.localSearchResult = results.localItems;
      this.serverSearchResult = results.serverItems;
      // const searchResults: SearchResponse = {
      //   items: [],
      // }

      // if (results.serverItems) {
      //   searchResults.items = searchResults.items.concat(results?.serverItems?.items || []);
      // }

      // if (results.localItems) {
      //   searchResults.items = searchResults.items.concat(results?.localItems?.items || []);
      // }

      // this.searchResult = searchResults
    });
    this.busySearching = false;
    this.searched = true;
  }

  private get inputQuery() {
    return this.query;
  }

  private set inputQuery(to: string) {
    this.query = to;
    this.delayedSearch(to);
  }


  private delayedSearch(searchQuery: string) {
    if (this.queryTimer) {
      clearTimeout(this.queryTimer);
    }

    if (searchQuery.length < this.minTypingChars) {
      return;
    }

    this.queryTimer = setTimeout(() => {
      this.executeSearch(searchQuery);
    }, this.typingDelay);
  }


  private toggleReduceServerItems() {
    this.reduceServerResults = !this.reduceServerResults;
  }
  private get nrOfHiddenServerItems() {
    return this.filteredServerItems.length - this.serverReducedFilteredItems.length;
  }

  private get serverReducedFilteredItems() {
    if (!this.reduceServerResults) { return this.filteredServerItems; }
    const items = this.filteredServerItems;
    return items.slice(0, this.maxNrOfItems);
  }

  private get filteredServerItems() {
    return this.serverSearchResult?.items || [];
  }


  private toggleReduceLocalItems() {
    this.reduceLocalResults = !this.reduceLocalResults;
  }
  private get nrOfHiddenLocalItems() {
    return this.filteredLocalItems.length - this.localReducedFilteredItems.length;
  }

  private get localReducedFilteredItems() {
    if (!this.reduceLocalResults) { return this.filteredLocalItems; }
    const items = this.filteredLocalItems;
    return items.slice(0, this.maxNrOfItems);
  }

  private get filteredLocalItems() {
    return this.localSearchResult?.items || [];
  }


  private selectCustomItem(item: LocalSearchResultItemListItem) {
    //const ws = useUserStore().activeWorkspace.urlName;
    RouterToView(item.to, item.id);
    //this.$router.push({ name: item.to, params: { id: item.id, workspaceName: ws } });
    this.$emit("close");
  }

  private selectArticle(item: SearchKnowledgeBaseArticleItem) {
    RouterToKnowledgeBaseArticle(item.id);
    this.$emit("close");
  }

  private selectTicket(to: TicketSummary) {
    RouterToTicket(to.id)
    this.$emit("close");
  }


  private keyup(e: KeyboardEvent) {
    switch (e.key) {
      case "Enter":
        if (this.filteredServerItems.length === 1) {
          // this.selectQuery(this.filteredItems[0]);
        }
        break;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 800px;
  padding-right: 20px;
  //background-color: var(--c-base-500);
  display: grid;
  gap: 10px;

  grid-template-columns: 50% 50%;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "query query"
    "info info"
    "output-server output-local";

  .omni-searchbox {
    grid-area: query;

  }

  .info {
    height: 20px;
    grid-area: info;

    display: flex;
    gap: 10px;
    font-style: italic;
    font-size: 0.8em;
    align-content: baseline;

  }

  .list {
    &.server {
      grid-area: output-server;
    }

    &.local {
      grid-area: output-local;
    }


  }


}

.list {
  //min-height: 400px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 5px;
  //justify-content: left;
  align-items: start;

  .item {
    font-size: 14px;
    display: grid;
    align-items: center;
    line-height: 16px;
    padding: 4px 12px;
    gap: 8px;
    width: calc(100% + 8px);
    transition: background-color 200ms ease;
    margin: 0 -4px;
    //background-color: var(--c-base-200);

    list-style-type: none;


    .name {
      display: block;
      flex-grow: 1;
    }

    // &:hover {
    //   background-color: var(--c-base-300);
    // }

  }

}

// .content {
//   width: 800px;
//   display: flex;
//   flex-direction: column;
//   gap: 8px;

//   .no-results {
//     text-align: center;
//     font-style: italic;
//     font-size: 0.8em;
//   }




// }</style>
