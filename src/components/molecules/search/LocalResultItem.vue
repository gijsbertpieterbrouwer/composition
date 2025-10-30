<template>
  <GenericResultWithListItem v-if="hasResults">
    <template v-slot:header>
      <TickIcon :name="icon" /> {{ this.name }}
    </template>

    <div class="list">
      <template v-for="(item, index) in this.list" :key="index">
        <TickListItem @click="selectItem(item)" :name="item.text" :icon="item.icon">
          {{ item.description }}
        </TickListItem>
      </template>
    </div>

  </GenericResultWithListItem>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import { focus } from "@/directives";
import GenericResultWithListItem from "./GenericResultWithListItem.vue";
import TickIcon from "@/components/TickIcon.vue";
import { SearchResultItem } from "@/TickApi";
import TickListItem from "@/components/atoms/TickListItem.vue";
import useUserStore from "@/store/user";
import { LocalSearchResultItem, LocalSearchResultItemListItem } from "@/helpers/omniSearchHelper";



@Component({
  directives: { focus },
  emits: ["select",],
  components: {
    GenericResultWithListItem,
    TickIcon,
    TickListItem
  },
})
export default class LocalResultItem extends Vue {
  @Prop() private data!: SearchResultItem;

  private get hasResults(): boolean {
    return this.item?.items?.length > 0;
  }

  private get item(): LocalSearchResultItem {
    return JSON.parse(this?.data?.dataJson || "{}");
  }

  private get name() {
    return this.item.text;
  }

  private get icon() {
    return this.item.icon;
  }

  private get list() {
    return this.item?.items || [];
  }

  private get workspaceName() {
    const ws = useUserStore().activeWorkspace;
    return ws ? ws.urlName : "";
  }

  private selectItem(item: LocalSearchResultItemListItem) {
    this.$emit("select", item);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  //background-color: var(--c-base-200);
  border-radius: 8px;
}
</style>
