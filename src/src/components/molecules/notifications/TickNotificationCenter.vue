<template>
  <div class="notification-center">
    <TickNotificationMessage class="notification" :class="notificationAnimation(item)" @close="closeMessage(item)" :item="item" v-for="item in this.notifications" :key="item.id" />
  </div>
</template>

<script lang="ts">
import useAppStore, { notificationStatus, TickNotification } from '@/store/app';
import { Component, Vue } from 'vue-facing-decorator';
import TickNotificationMessage from './TickNotificationMessage.vue';


@Component({
  components: { TickNotificationMessage },
  emits: [],
})
export default class TickNotificationCenter extends Vue {


  private get notifications() {
    return useAppStore().notifications;
  }

  private closeMessage(item: TickNotification) {
    useAppStore().closeNotification(item.id)
  }

  private notificationAnimation(item: TickNotification): string {
    if (item.status == notificationStatus.show) {
      return "show"
    }
    if (item.status == notificationStatus.finish) {
      return "finish"
    }
    return "nothing";
  }


}
</script>
<style lang="scss">
@import "@/styles/theme";

@keyframes fadein {
  from {
    // top: 0;
    opacity: 0;
  }

  to {
    //  bottom: 30px;
    opacity: 1;
  }
}

@keyframes fadeout {
  from {
    //bottom: 30px;
    opacity: 1;
  }

  to {
    //bottom: 0;
    opacity: 0;
  }
}

.notification-center {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  z-index: 9999999999;
  height: auto !important;
  //box-shadow: 0px 4px 8px 1px rgba(0, 0, 0, 0.16);
  border-radius: 0px 0px 8px 8px;

  .notification {
    &.show {
      animation: fadein 0.5s;
    }

    &.finish {
      animation: fadeout 0.5s;
    }

  }


}
</style>