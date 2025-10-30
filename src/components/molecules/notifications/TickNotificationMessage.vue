<template>
  <button :class="colorName" @click="click" class="notification-message">{{ this.item.message }}</button>
</template>

<script lang="ts">
import { ColorsEnum } from '@/TickApi';
import { getColorName } from '@/helpers/colorsHelper';
import { getNotificationTypeColor } from '@/helpers/enumsHelper';
import { TickNotification } from '@/store/app';
import { Component, Prop, Vue } from 'vue-facing-decorator';


@Component({
  components: {},
  emits: ["close"],
})
export default class TickNotificationMessage extends Vue {
  @Prop() private item!: TickNotification;

  private click() {
    this.$emit("close");

  }

  private get colorName() {
    return getColorName(this.color);
  }

  private get color(): ColorsEnum {
    return getNotificationTypeColor(this.item.type);
  }


}
</script>
<style lang="scss" scoped>
@import "@/styles/theme";

.notification-message {
  color: #fff;
  font-size: 0.9em;
  z-index: 99999999;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  min-width: 240px;
  //border: solid 1px $grey400;
  background-color: var(--c-base);
  height: 20px;
  padding: 14px 10px;
  @include neon-bg;

  &:not(:last-child) {
    border-bottom: solid 1px var(--c-base-400);
  }

  &:last-child {
    border-radius: 0px 0px 8px 8px;
  }

}
</style>