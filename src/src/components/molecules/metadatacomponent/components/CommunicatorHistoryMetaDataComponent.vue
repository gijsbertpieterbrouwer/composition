<template>
  <MetaDataComponentWrapper :data="data">
    <div class="list">
      <template v-for="item in this.listItems" :key="item.id">
        <TickListItem @click="select(item)" class="list-item" :name="item.title">
          <div class="history-description"><span class="subtitle">{{ this.getSubTitle(item) }}</span> <span class="divider">&#9679;</span>
            <TicketStatusLabel :status="item.status" />
          </div>
        </TickListItem>
      </template>
    </div>
  </MetaDataComponentWrapper>
</template>

<script lang="ts">
import { displayDate } from '@/helpers/dateHelper';
import { RouterToTicket } from '@/router';
import { CommunicatorHistoryDataItem, MetaDataComponentCommunicatorHistoryData, MetaDataComponentUpdate } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import MetaDataComponentWrapper from './MetaDataComponentWrapper.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import TicketStatusLabel from '../../ticket/TicketStatusLabel.vue';

export interface IMetaDataComponentListItem {
  id: string;
  title: string;
  subtitle: string;
}

@Component({
  emits: [],
  components: { MetaDataComponentWrapper, TickListItem, TicketStatusLabel },
})
export default class CommunicatorHistoryMetaDataComponent extends Vue {
  @Prop() private data!: MetaDataComponentUpdate;

  private select(item: CommunicatorHistoryDataItem) {
    RouterToTicket(item.ticketId);
  }

  private get history(): MetaDataComponentCommunicatorHistoryData {
    return JSON.parse(this.data.componentData);
  }


  private getSubTitle(item: CommunicatorHistoryDataItem) {
    return displayDate(item.creationDate, true);
  }

  private get listItems() {
    return this.history.items || [];
  }

}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.list {
  width: 100%;

  .list-item {
    margin-bottom: 5px;
    width: 100%;

    .history-description {
      display: flex;
      gap: 5px;
    }

    .divider {
      color: var(--c-base-200);
    }

    .call-to-action {
      @include neon-bg;
      @include font-inter;

      padding: 0 4px;
      font-weight: 700;
      font-size: 10px;
      line-height: 16px;
      text-transform: capitalize;
      white-space: nowrap;

      border-radius: 2px;
      transition: all 0.3s ease;
      color: $white;
      display: inline-block;
      max-width: 200px;
      min-width: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

    }
  }
}
</style>
