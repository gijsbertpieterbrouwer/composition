<template>
  <div class="indicator">
    <template v-if="connected">
      <span class="message">{{ $translate(LanguagePath.APP_RTCIndicator_InSync) }}</span>
    </template>
    <template v-else>
      <TickIcon name="warning" class="icon" /><span class="message">
        {{ $translate(LanguagePath.APP_RTCIndicator_NotInSync) }}
      </span>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import TickIcon from "@/components/TickIcon.vue";
import useAppStore from "@/store/app";
import { LanguagePath } from "@/TickApi";


@Component({ components: { TickIcon } })
export default class TickRtcIndicator extends Vue {
  LanguagePath = LanguagePath
  private get connected() {
    return useAppStore().rtcConnected;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.indicator {
  position: absolute;
  bottom: 5px;

  display: flex;
  align-content: center;
  justify-content: center;
  width: 100%;

  .message {
    font-size: 10px;
    align-self: center;
    color: var(--c-contrast);
    opacity: 0.7
  }

  .icon {
    align-self: center;
    margin-right: 5px;
  }

}
</style>
