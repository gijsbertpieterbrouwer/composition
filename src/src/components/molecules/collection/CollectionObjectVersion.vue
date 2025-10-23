<template>
  <button class="collection-object-version" @click.stop="select">
    <ExecutionEnvironmentLabel v-if="showEnvironment" :environmentId="item.executionEnvironmentId" />
    <div v-else>{{ $translate(LanguagePath.App_ExecutionEnvironment_Production) }}</div>
  </button>
</template>

<script lang="ts">
import { LanguagePath, ObjectVersion } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';

import ExecutionEnvironmentLabel from '../executionEnvironment/ExecutionEnvironmentLabel.vue';

@Component({
  emits: [
    "select",
  ],
  components: { ExecutionEnvironmentLabel }
})
export default class CollectionObjectVersion extends Vue {
  LanguagePath = LanguagePath
  @Prop() private item!: ObjectVersion;
  @Prop() private showEnvironment: boolean;

  private select() {
    this.$emit('select', this.item.id);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.collection-object-version {
  margin-right: 4px;
}

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
  background-color: #5a5a5a;



  &.isProductionEnvironment {
    background-color: $palette-red;
  }

}
</style>
