
<template>
  <div class="blocks" ref="docu-holder">
    <DocuBlock class="block" v-for="item in this.blocks" :key="item.id" :data="item" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickButton from '@/components/atoms/TickButton.vue';
import DocuBlock from './DocuBlock.vue';
import { DocumentationGroup, TickDocuBlock } from '@/TickApi';
import useUserStore from '@/store/user';
import getRefElement from '@/helpers/refHelpers';
import { observeBreakpoints } from '@/helpers/elementObserver';



@Component({
  emits: ["resolve"],
  components: { TickButton, DocuBlock }
})
export default class DocuHolder extends Vue {
  @Prop() private group: Required<DocumentationGroup | DocumentationGroup[]>;



  private get blocks(): TickDocuBlock[] {
    const list = useUserStore().getDocuBlocks(this.group) || [];

    return list.sort(({ weight: a }, { weight: b }) => a - b);
  }

  mounted() {
    const el = getRefElement(this, "docu-holder");
    observeBreakpoints(el, {
      "multi-column": (rect) => rect.width > 480,
    });
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.blocks {
  display: grid;
  gap: 2vw;
  
  &.multi-column {
    // FIXME: this should ideally be a masonry layout: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Masonry_Layout
    grid-template-columns: 1fr 1fr;
  }
}
</style>
