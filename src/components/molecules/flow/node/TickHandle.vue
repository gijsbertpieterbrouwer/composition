<template>
  <div class="handle-container">
    <Handle class="handle" :class="{ isFailureHandle, isConnected, isStartHandle }" :id="id" type="source" position="right" />
    <span v-if="!isConnected" :class="{ 'optional': this.isOptional }">
      <TickIcon class="no-connection" name="warning-flowstepconnection" />
    </span>
  </div>
</template>

<script lang="ts">
import { Handle } from '@vue-flow/core'
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickIcon from "@/components/TickIcon.vue";
@Component(
  {
    components: { Handle, TickIcon },
  })
export default class TickHandle extends Vue {
  @Prop({ default: "" }) private id!: string;
  @Prop({ default: false }) private isConnected!: boolean;
  @Prop({ default: false }) private optional!: boolean;
  @Prop({ default: false }) private flowStart!: boolean;
  @Prop({ default: false }) private isFailureHandle!: boolean;
  @Prop({ default: false }) private isStartHandle!: boolean;

  private get isOptional() {
    return this.optional || false;
  }

  private get() {
    return this.flowStart || false;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.handle-container {
  display: block;
  width: 12px;

  .no-connection {
    position: absolute;
    right: -18px;
    top: -5px;
  }

  .optional {
    opacity: 0.3;
  }

  .handle {
    width: 12px;
    height: 12px;

    border: 3px solid var(--c-primary);
    border-radius: 100%;
    background-color: var(--c-base-200);

    &.isFailureHandle {
      border-color: $error !important;
    }

    &.isStartHandle {
      border-color: var(--c-primary) !important;
      background: #000 !important;
    }
  }




  .handle:not(.isConnected) {}

  .handle.isConnected {
    // background: none;
    border: 1px solid var(--c-contrast);
  }

  // .handle.isFailureHandle.isConnected {
  //   background: none;
  // }


  .isConnected {}


}
</style>
