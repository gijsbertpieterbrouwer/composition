<template>
  <div class="item">
    <div class="title">{{ this.title }}</div>
    <div class="subtitle">{{ this.subtitle }}</div>
    <div class="description">{{ this.description }}</div>
  </div>
</template>


<script lang="ts">
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import { Component, Prop, Vue } from 'vue-facing-decorator';


@Component({ components: { TickScreen, TickEditorPanel } })
export default class WizardOptionItem extends Vue {
  @Prop() private title!: string;
  @Prop() private subtitle!: string;
  @Prop() private description!: string;


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.item {
  border-bottom: 1px solid $grey300;
  // background-color: #fff;
  padding: 12px 10px;
  display: grid;
  gap: 5px;

  .title {
    font-size: 20px;
    line-height: 20px;

    font-weight: 600;
  }

  .subtitle {
    font-size: $text-size-regular;
    line-height: 16px;
    color: var(--sub-text);

  }

  .description {
    font-size: $text-size-regular;
    line-height: 12px;
    color: var(--sub-text);
    font-style: italic;
    opacity: 0.7;
  }

}
</style>
