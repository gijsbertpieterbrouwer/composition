<template>
  <TickDialogPanel :position="position" class="panel" @close="$emit('close')">
    <div class="content">
      <AdapterEditor :activeId="adapterId" />
    </div>
  </TickDialogPanel>
</template>

<script lang="ts">
import { Position } from "@/components/atoms/TickPanel.vue";
import TickDialogPanel from '@/components/panels/TickDialogPanel.vue';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import AdapterEditor from '../../dataadapters/AdapterEditor.vue';


@Component({
  emits: ["patch", "close"],
  components: { TickDialogPanel, AdapterEditor },
})
export default class AdapterEditorPanel extends Vue {
  @Prop() private adapterId!: string;
  @Prop() private position!: Position;

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: clamp(400px, 50vw, 2000px);
}
</style>
