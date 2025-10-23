<template>
  <div class="wrapper">
    <TickHeading v-if="name" :size="Size.large">{{ this.name }}</TickHeading>
    <div class="description" v-if="description"> {{ this.description }}</div>
    <div class="smart-wrapper">

      <GenericMetaDataComponentDataItem v-for="(value, popertyName) in this.componentData" :key="popertyName" :data="value" :label="popertyName" :depth="0" :collapseDepth="maxDepthBeforeCollapse" />

    </div>
  </div>
</template>

<script lang="ts">
import { FormField } from "@/TickApi";
import TickHeading, { Size } from '@/components/atoms/TickHeading.vue';
import { asJsonObject } from "@/helpers/jsonHelper";
import { Component, Prop, Vue, } from 'vue-facing-decorator';
import GenericMetaDataComponentDataItem from "../../metadatacomponent/components/GenericMetaDataComponentDataItem.vue";

@Component({
  emits: [],
  components: { TickHeading, GenericMetaDataComponentDataItem }
})
export default class FormFieldSmartViewer extends Vue {

  Size = Size
  @Prop() private field!: FormField;

  private get name() {
    return this.field.name || "";
  }

  private get description() {
    return this.field.description || "";
  }

  private get value() {
    return this.field.value;
  }

  private get maxDepthBeforeCollapse() {
    return 3;
  }

  private get componentData(): object {
    return asJsonObject(this.value);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  display: grid;
  gap: 10px;

  .description {
    font-size: 12px;
    font-style: italic;
  }

  .smart-wrapper {
    display: flex;
    gap: 10px;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 10px;

  }
}
</style>
