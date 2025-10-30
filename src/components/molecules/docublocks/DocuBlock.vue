<template>
  <div class="block" :class="{ 'highlight': this.highlight }" v-if="!showRemoved">
    <div class="header">
      {{ this.title }}
      <TickButton class="remove" @click="removeBlock" :appearance="Appearance.transparent" :color="Color.contrast" :round="true">&#128473;</TickButton>
    </div>
    <div class="content" v-html="content" v-if="!showRemoved"></div>
    <div class="actions" v-if="!showRemoved">
      <TickButton v-if="hasUrl" @click="openUrl" :appearance="Appearance.secondary" :color="Color.contrast">{{ this.buttonText }} &rarr; </TickButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import { TickDocuBlock, LanguagePath } from '@/TickApi';
import useViewstateStore, { InterfaceStateType } from '@/store/viewstate';
import { openUrl } from '@/services/urls';
import { translate } from '@/plugins/translatePlugin';

@Component({
  emits: ["resolve"],
  components: { TickButton }
})
export default class DocuBlock extends Vue {
  Appearance = Appearance;
  Color = Color;
  @Prop() private data: Required<TickDocuBlock>;

  private removeBlock() {
    useViewstateStore().toggle(InterfaceStateType.ShowDocuBlockCollapsed, this.data.id);
  }

  private get showRemoved() {
    return useViewstateStore().has(InterfaceStateType.ShowDocuBlockCollapsed, this.data.id);
  }

  private get highlight() {
    return this.data.highlight;
  }

  private get title() {
    return this.data.title;
  }
  private get content() {
    return this.data.description;
  }

  private get hasUrl() {
    return this.data.url;
  }

  private get buttonText() {
    return this.data.buttonText || translate(LanguagePath.DocuBlocks_ReadMore);
  }

  private openUrl() {
    openUrl(this.data.url);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.block {
  border-radius: 12px;
  padding: 12px;
  font-size: $text-size-regular;
  line-height: 16px;

  display: grid;
  gap: 4px;

  &.highlight {
    background-color: var(--c-secondary);
    color: var(--c-evening-dark);
  }

  .remove {
    visibility: hidden;

    &:hover {
      filter: brightness(112%);
    }

  }

  &:hover {
    .remove {
      visibility: visible;
    }
  }


}

.header {
  line-height: 20px;
  font-size: 16px;
  font-weight: 600;

  display: flex;
  gap: 5px;
  justify-content: space-between;
  align-content: flex-start;

  .remove {}


}

.actions {
  padding-top: 12px;
}
</style>
