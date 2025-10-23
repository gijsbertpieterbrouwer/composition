<template>
  <div class="block">
    <div class="header">
      <TickHeading>{{ this.title }}</TickHeading>
      <TickIcon class="icon" :name="icon" />
    </div>

    <div class="description">
      <slot />
    </div>

    <div class="actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickIcon from '@/components/TickIcon.vue';
import TickHeading, { Size } from '@/components/atoms/TickHeading.vue';
import TickButton, { Appearance, Color } from './TickButton.vue';

@Component({
  emits: ["action"],
  components: { TickIcon, TickHeading, TickButton }
})
export default class TickItemSummaryBlock extends Vue {
  Size = Size
  Appearance = Appearance
  Color = Color
  @Prop({ default: '' }) private title!: string;
  @Prop({ default: '' }) private icon!: string;
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.block {
  border-radius: 8px;
  max-width: 300px;
  min-height: 100px;
  padding: 20px;
  background-color: var(--c-base-100);
  color: var(--c-contrast);
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  border: solid 1px var(--c-base-300);
  gap: 10px;

  .header {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    flex-wrap: wrap;
    height: 40px;

    .icon {
      max-width: 30px;
      max-height: 30px;
    }

  }

  .description {
    font-size: 14px;
    font-weight: 200;

    .disclaimer {
      font-style: italic;
      font-size: $text-size-regular;
      margin-top: 20px;
      font-weight: 100;
    }
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
  }
}
</style>
