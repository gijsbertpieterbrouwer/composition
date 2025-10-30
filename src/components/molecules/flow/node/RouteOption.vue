<template>
  <div class="route " :class="{ 'highlight': this.highlight }">

    <div class="title action-handle " :class="{ 'color-yellow': this.highlight }">
      <TickIcon v-if="icon" :name="icon" /> <span v-else class="circle"></span>

      {{ this.title }}
    </div>
    <TickHandle class="routeHandle" :id="routeHandleId" :isConnected="isConnected" :optional="optional" :isFailureHandle="isFailureHandle" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickIcon from "@/components/TickIcon.vue";
import TickHandle from './TickHandle.vue';

@Component({
  emits: [],
  components: { TickHandle, TickIcon },
})
export default class RouteOption extends Vue {
  @Prop({ default: "" }) private title!: string;
  @Prop({ default: "" }) private isConnected!: boolean;
  @Prop({ default: "" }) private icon!: string;
  @Prop({ default: "" }) private routeHandleId!: string;
  @Prop({ default: "" }) private isFailureHandle: boolean;
  @Prop({ default: "" }) private optional: boolean;
  @Prop({ default: "" }) private highlight: boolean;



  private get iconName(): string {
    return this.icon || 'circle';
  }
}




</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.circle {
  display: inline-block;
  height: 5px;
  width: 5px;
  border-radius: 100px;
  background-color: var(--c-contrast);
  margin-left: 4px;
  margin-right: 7px;
}

.route {

  // display: flex;
  // gap: 5px;
  // flex-direction: column;
  cursor: move;


  .title {
    @include neon-bg;
    @include font-inter;


    margin-top: auto;
    border-radius: 4px;
    padding: 5px 10px;
    justify-content: start;
    display: flex;
    gap: 10px;
    flex-wrap: nowrap;
    align-items: center;
    height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.highlight {

    .title {

      //background-color: $brand2;
    }
  }


  .routeHandle {
    position: relative;
    left: calc(100% + 32px);
    right: -5px;
    bottom: 20px;
    cursor: pointer;
  }

}
</style>
