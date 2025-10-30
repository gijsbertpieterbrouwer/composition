<template>
  <template v-if="hasAny">
    <ul class="list">
      <template v-for="item in this.list" :key="item.id">

        <NotificationMentionListItem v-if="item.type == NotificationTypeEnum.Mention" :notification="item" @resolve="resolveItem(item)" />
      </template>
    </ul>
  </template>

  <template v-else>
    <div class="no-data">
      <HappyIndicator :text="$translate(LanguagePath.App_NotificationsList_NoData_Title)" />
    </div>
  </template>
</template>

<script lang="ts">
import HappyIndicator from '@/components/atoms/HappyIndicator.vue';
import TickIcon from "@/components/TickIcon.vue";
import useUserStore from '@/store/user';
import { LanguagePath, NotificationTypeEnum, TickNotification } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';
import NotificationMentionListItem from './NotificationContent/NotificationMentionListItem.vue';

@Component({
  emits: ["select"],
  components: { NotificationMentionListItem, TickIcon, HappyIndicator }
})
export default class NotificationsList extends Vue {
  NotificationTypeEnum = NotificationTypeEnum;
  LanguagePath = LanguagePath
  mounted() {
    useUserStore().useNotifications();
  }

  private get hasAny() {
    return this.list.length;
  }

  private get summaries(): TickNotification[] {
    return useUserStore().notifications || [];
  }

  private get list(): TickNotification[] {
    return this.summaries;
  }

  private resolveItem(item: TickNotification) {
    return useUserStore().resolveNotification(item);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.no-data {
  padding: 20px;
  display: flex;
  align-content: center;
  align-items: center;

  opacity: 0.6;
}

.list {
  display: grid;
  padding: 10px;
  gap: 10px;
}
</style>
