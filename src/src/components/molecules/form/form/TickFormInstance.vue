<template>
  <div class="dashboard-wrapper" :class="{ 'firstTime': isFirstRendering }">
    <div class="tiles">
      <grid-layout :layout="tilesLayout" :autoSize="true" :responsive="false" :col-num="10" :maxRows="20" :row-height="100" :is-draggable="false" :is-resizable="false" :is-mirrored="false"
        :prevent-collision="false" :vertical-compact="false" :margin="[10, 10]" :use-css-transforms="true">

        <grid-item v-for="tile in this.tiles" :x="tile.x" :y="tile.y" :w="tile.width" :h="tile.height" :i="tile.id" :key="tile.id">
          <FormTile class="tile">
            <FormFieldComponent class="field" v-for="field in tile.fields" :key="field.id" :field="field" :validationResponse="validationResponse" :disabled="disabled" />
          </FormTile>
        </grid-item>
      </grid-layout>
    </div>
  </div>
</template>

<script lang="ts">
import { formLayoutItem, getFormTilesLayout } from '@/helpers/taskHelper';
import { FormData, FormValidationResponse } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { GridItem, GridLayout } from 'vue3-grid-layout-next';
import FormTile from "../form/FormTile.vue";
import FormFieldComponent from './FormFieldComponent.vue';

@Component({
  emits: [],
  components: {
    FormFieldComponent, GridLayout,
    GridItem, FormTile
  }
})
export default class TickFormInstance extends Vue {
  @Prop() private form!: FormData;
  @Prop() private validationResponse?: FormValidationResponse;
  @Prop() private disabled!: boolean;

  private isFirstRendering = true;

  private get tilesLayout(): formLayoutItem[] {
    return getFormTilesLayout(this.tiles);
  }

  private get tiles() {
    return this.form.tiles || [];
  }

  mounted() {
    // wait a moment until rendering is done to remove the no-animation from the dashboard to prevent first-render animations
    setTimeout(() => {
      this.isFirstRendering = false;
    }, 100);
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.dashboard-wrapper.firstTime {
  .vue-grid-layout {
    transition: none;
  }

  .vue-grid-item {
    transition: none;
  }
}

.dashboard-wrapper {
  min-width: 370px;
}

.tiles {
  .tile {
    border-radius: 12px;
    font-size: $text-size-regular;
    line-height: 16px;
    color: var(--c-contrast);
    background-color: var(--c-base-200);
    height: 100%;
    overflow: auto;
    padding: 10px;

    .fields {
      display: flex;
      flex-direction: column;
      gap: 10px;
      height: 100%;

      .editable-field {
        padding: 0px 10px;
        border-radius: 8px;
      }
    }
  }
}
</style>
