<template>
  <header class="tick-header">

    <div class="header-main-holder">
      <TickHeading size="large" class="title" v-if="title" @click="$emit('clickTitle')">
        {{ this.title }}
        <BusyIndicator :loading="loading" />
      </TickHeading>
      <div>
        <span class="subtitle">
          <slot name="subtitle" />
        </span>
      </div>
    </div>
    <div class="header-actions-holder">
      <div class="actions">
        <slot name="actions" v-if="!loading" />
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import BusyIndicator from "./BusyIndicator.vue";
@Component({
  emits: ["clickTitle"],
  components: { TickIcon, TickHeading, BusyIndicator },
})
export default class TickHeader extends Vue {
  @Prop({ default: "" }) private title!: string;
  // @Prop({ default: "" }) private subTitle!: string;
  @Prop({ default: false }) private loading: boolean;

  // private get getSubTitle() {
  //   return this.subTitle || " ";
  // }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.tick-header {
  height: auto;
  position: sticky;
  top: 0;
  display: grid;
  align-items: center;

  grid-template-columns: auto auto;
  grid-template-areas: " main actions ";
  z-index: 1000000;
  background-color: var(--c-base);


  .header-main-holder {
    grid-area: main;
    padding: 20px 20px;

    .title {
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      max-width: 80%;
      text-overflow: ellipsis;
      word-break: break-all;
      word-wrap: break-word;
      text-transform: capitalize;
    }

    .subtitle {
      display: inline-flex;
      gap: 10px;
      overflow: hidden;
      line-height: 20px;
      font-family: "Poppins", sans-serif;
      font-style: normal;
      letter-spacing: -0.02em;
      font-size: $text-size-regular;
      white-space: nowrap;
    }
  }

  .header-actions-holder {
    grid-area: actions;
    justify-self: end;
    padding-right: 10px;

    .actions {
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: end;
    }
  }
}
</style>
