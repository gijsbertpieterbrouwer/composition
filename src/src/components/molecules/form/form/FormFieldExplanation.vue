<template>
  <div class="wrapper">
    <TickHeading v-if="name" :size="Size.large">{{ this.name }}</TickHeading>
    <div class="description" v-if="description"> {{ this.description }}</div>
  </div>
</template>

<script lang="ts">
import { FormField } from "@/TickApi";
import TickHeading, { Size } from '@/components/atoms/TickHeading.vue';
import { Component, Prop, Vue, } from 'vue-facing-decorator';

@Component({
  emits: [],
  components: { TickHeading }
})
export default class FormFieldExplanation extends Vue {

  Size = Size
  @Prop() private field!: FormField;

  private get name() {
    return this.field.name || "";
  }

  private get description() {
    return this.field.description || "";
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
}
</style>
