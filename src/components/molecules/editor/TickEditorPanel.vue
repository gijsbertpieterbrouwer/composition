<template>
  <div class="editor-panel" :class="{ 'no-border': this.noBorder }">
    <div class="title"><span class="text-selectable">{{ this.name }}</span>
      <slot name="actions" />
    </div>
    <div class="explainer">
      <slot name="explainer" />
    </div>
    <div class="content" :style="styling">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import { Component, Prop, Vue } from 'vue-facing-decorator';

@Component(
  {
    components: { TickIcon, TickButton },
  })
export default class TickEditorPanel extends Vue {
  @Prop({ default: "" }) private name!: string;
  @Prop({ default: null }) private maxheight!: string;
  @Prop({ default: false }) private noBorder: boolean;

  private get styling() {
    return {
      'max-height': `${this.maxheight}px`,
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.editor-panel {
  padding: 20px;
  margin-bottom: 20px;
  border: solid 1px var(--c-editor-border);
  height: auto;
  overflow-x: hidden;
  border-radius: 16px;

  &.no-border {
    border: none;
  }

  .title {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding-right: 10px;
    overflow: hidden;
    line-height: 32px;
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    letter-spacing: -0.02em;
    font-size: 20px;
    white-space: nowrap;
    justify-content: space-between;
  }

  .explainer {
    font-style: italic;
    font-size: 0.8rem;
    margin-bottom: 10px;
  }

  .content {
    display: grid;
    gap: 10px;
    overflow-y: auto;

  }
}
</style>
