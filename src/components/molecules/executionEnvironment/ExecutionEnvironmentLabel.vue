<template>
  <button class="environment" @click="select">
    <label class="version " :class="{ isProductionEnvironment: this.isProductionEnvironment }">
      {{ this.environmentName }}
    </label>
  </button>
</template>

<script lang="ts">
import { ExecutionEnvironmentMetaDataItem, ObjectVersion } from '@/TickApi';
import useUtilityDataStore from "@/store/utilitydata";
import { Component, Prop, Vue } from 'vue-facing-decorator';

@Component({
  emits: [
    "select",
  ],
})
export default class ExecutionEnvironmentLabel extends Vue {
  @Prop() private environmentId!: string;
  //private executionEnvironment: ExecutionEnvironmentMetaDataItem;

  private get environmentName(): string {
    return this.executionEnvironment.name;
  }

  private get isProductionEnvironment(): boolean {
    return this.executionEnvironment.isProduction;
  }

  private get executionEnvironment(): ExecutionEnvironmentMetaDataItem {
    return useUtilityDataStore().executionEnvironment(this.environmentId) || {
      id: "",
      isProduction: false,
      name: "unknown"
    };
  }

  private select(item: ObjectVersion) {
    this.$emit('select', item.id);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.environment {
  margin-right: 4px;


  .version {
    padding: 0 4px;
    @include font-inter;
    font-weight: 700;
    font-size: 10px;
    line-height: 16px;
    white-space: nowrap;
    border-radius: 2px;
    transition: all 0.3s ease;
    color: $white;
    background-color: var(--c-pink-neon);

    &.isProductionEnvironment {
      color: var(--c-evening-dark);
      background-color: var(--c-yellow-neon);
    }

  }
}
</style>
