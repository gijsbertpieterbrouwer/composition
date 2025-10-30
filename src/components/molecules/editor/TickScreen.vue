<template>
  <div class="screen">
    <TickHeader class="header" :title="normalizedTitle" @clickTitle="$emit('clickTitle')" :loading="loading" :subTitle="subTitle" v-if="showScreenEstate == true">
      <template v-slot:subtitle>
        <slot name="subtitle" />
      </template>
      <template v-slot:actions v-if="!actionsInFooter">

        <slot name="actions" />
      </template>
    </TickHeader>

    <div class="screen-main" :class="{ disablePadding: this.disablePadding }">
      <slot />
    </div>

    <div class="footer" v-if="actionsInFooter">
      <div class="actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import TickHeader from "@/components/atoms/TickHeader.vue";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: ["clickTitle"],
  components: { TickIcon, TickButton, TickHeader },
})
export default class TickScreen extends Vue {
  @Prop({ default: false }) private loading: boolean;
  @Prop({ default: "" }) private title!: string;
  @Prop({ default: "" }) private subTitle!: string;


  @Prop({ default: true }) private showScreenEstate!: boolean;
  @Prop({ default: false }) private actionsInFooter!: boolean;
  @Prop({ default: false }) private disablePadding!: boolean;

  private get normalizedTitle() {
    return this.title;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.screen {
  .screen-main {
    height: 100%;

    &:not(.disablePadding) {
      padding: 10px;
    }
  }

  .header {
    position: sticky;
    top: 0px;
    widows: 100%;
  }

  .footer {
    height: 64px;
    position: sticky;
    bottom: 0;
    display: block;
    width: 100%;
    align-items: center;

    justify-self: end;
    padding-right: 10px;

    .actions {
      display: flex;
      justify-content: flex-end;
      height: 100%;
      align-items: center;
      gap: 10px;
    }
  }
}
</style>
