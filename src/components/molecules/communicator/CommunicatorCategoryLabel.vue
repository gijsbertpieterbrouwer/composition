<template>
  <span v-if="exists" class="label color-bold-yellow" :title="name">
    <span class="title">{{ this.name }}</span>
  </span>
</template>

<script lang="ts">
import { TickCommunicatorCategoryDefinitionSummary } from "@/TickApi";
import { stringIsNullOrEmpty } from "@/helpers/stringHelper";
import useUtilityDataStore from "@/store/utilitydata";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: [],
  components: { CommunicatorCategoryLabel },
})
export default class CommunicatorCategoryLabel extends Vue {
  @Prop() private categoryId!: string;

  private category: TickCommunicatorCategoryDefinitionSummary;

  private get name(): string {
    return this.category?.name;
  }

  private get exists(): boolean {
    return !stringIsNullOrEmpty(this.category?.id);
  }

  beforeMount() {
    this.category = useUtilityDataStore().communicatorCategoryDefinition(this.categoryId) || null
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.label {
  @include neon-bg;
  @include font-inter;

  padding: 2px 16px;
  font-weight: 700;
  font-size: 10px;
  line-height: 12px;
  text-transform: capitalize;
  white-space: nowrap;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: $white;
  max-width: 200px;
  min-width: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: grid;
  gap: 5px;
  align-items: start;

  .title {}



}
</style>
