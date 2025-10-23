<template>
  <div class="holder" :class="{ 'fullWidth': this.fullWidth }">
    <TickChart class="chart" :chart="data" />
  </div>
</template>

<script lang="ts">
import { ChartingSizeEnum, IChartData } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickChart from '../../charting/TickChart.vue';

@Component({
  name: "GenericMetaDataComponentChart",
  emits: [],
  components: { TickChart },
})
export default class GenericMetaDataComponentChart extends Vue {
  @Prop() private data!: IChartData;
  @Prop() private label!: string;

  private get fullWidth() {
    return this.data.chartingSize == ChartingSizeEnum.Normal;
  }

}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.holder {
  display: grid;
  width: 100%;
  justify-content: center;
  align-content: center;

  &.fullWidth {
    width: 100%;
  }


}
</style>
