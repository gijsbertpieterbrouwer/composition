<template>
  <div class="tile-viewer ">
    <slot />
  </div>

</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';

@Component({
  emits: [],
  components: {}
})
export default class FormTile extends Vue {
  // @Prop() private field!: TaskFormField;
  // @Prop() private validationResponse?: TaskFormValidationResponse;


  // private get fields() {
  //   return this.field.fields || [];
  // }

  // private get name() {
  //   return this.field.name || "";
  // }

  // private get description() {
  //   return this.field.description || "";
  // }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.tile-viewer {
  border-radius: 12px;


}
</style>
