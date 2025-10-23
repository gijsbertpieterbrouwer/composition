<template>
  <div class="dashboard-wrapper" :class="{ 'firstTime': isFirstRendering }">
    <div class="tiles">
      <grid-layout :layout="tilesLayout" :autoSize="true" :responsive="false" :col-num="cols" :maxRows="20" :row-height="100" :is-draggable="!disabled" :is-resizable="!disabled" :is-mirrored="false"
        :prevent-collision="false" :vertical-compact="false" :margin="[10, 10]" :use-css-transforms="true" @layout-updated="layoutUpdatedEvent">

        <grid-item v-for="item in this.tiles" :x="item.x" :y="item.y" :w="item.width" :h="item.height" :minW="minW(item)" :minH="minH(item)" :i="item.id" :key="item.id" @resize="resizeEvent"
          @resized="resizedEvent" @moved="movedEvent" @move="moveEvent">

          <FormTile class="tile">
            <VueDraggable animation="150" easing="cubic-bezier(1, 0, 0, 1)" handle=".drag-field-handle" class="fields" group="fields" :sort="true" :list="item.fields" item-key="id" ghost-class="ghost"
              drag-class="drag">
              <template #item="{ element }">
                <div class="drag-field-handle">

                  <FormEditorFieldButton @click="openFieldEditor(item.id, element)" @updateSectionFields="updateSectionFields" :selectedFieldId="selectedFieldId" class="editable-field"
                    :class="{ 'selected': this.IsSelected(element) }" @addField="bubbleAddField" @selectField="selectField" :data="element" />
                </div>

              </template>
            </VueDraggable>
            <div class="outside-footer" v-if="!disabled">

              <TickButton :disabled="disabled" @click="removeTile(item)" :title="$translate(LanguagePath.App_Remove)" :icon="'delete'" :appearance="Appearance.primary" :color="Color.contrast"
                :round="true" />

              <TickButton :disabled="disabled" @click="showFlowStepContextMenu($event, item)" :title="$translate(LanguagePath.App_Add)" :icon="'plus'" :appearance="Appearance.primary"
                :color="Color.contrast" :round="true" />
            </div>
          </FormTile>
        </grid-item>
      </grid-layout>

      <FormTile class="tile add-tile" @click="addTile" v-if="!disabled">
        <TickButton :disabled="disabled" :title="$translate(LanguagePath.App_Add)" :icon="'plus'" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.XXL" :round="true" />
      </FormTile>

    </div>
  </div>

</template>

<script lang="ts">
import { FormDefinitionSettings, FormFieldDefinition, FormFieldType, FormTileSettings, LanguagePath } from "@/TickApi";
import { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickDropdown, { DropdownOption } from '@/components/atoms/TickDropdown.vue';
import { openContextDropdownPanel } from "@/components/panels/contextPanels/ContextDropdownPanel.vue";
import { getTaskFormFieldTypeOptions } from '@/helpers/enumsHelper';
import generateId from "@/helpers/guid";
import { askConfirmation, askNewName } from "@/helpers/questionHelper";
import { formLayoutItem, getDefaultExplanationSettings, getFormTilesLayout } from "@/helpers/taskHelper";
import { translate } from "@/plugins/translatePlugin";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { GridItem, GridLayout } from 'vue3-grid-layout-next';
import * as VueDraggable from "vuedraggable";
import FormTile from "../form/FormTile.vue";
import FormEditorFieldButton from './FormEditorFieldButton.vue';
import { FormFieldLocations, openForFieldEditorPanelPanel } from "./panel/FormFieldEditorPanel.vue";

interface FormTileSizeSelection {
  tileId: string,
  selected: boolean,
  width?: number,
  height?: number,
}

@Component({
  emits: ["selectField", "addField", "updateSectionFields", "updateTiles"],
  components: {
    FormEditorFieldButton, TickDropdown, VueDraggable, GridLayout,
    GridItem, FormTile
  }
})
export default class FormEditor extends Vue {
  LanguagePath = LanguagePath
  TaskFormFieldType = FormFieldType
  Appearance = Appearance
  Color = Color
  Size = Size

  @Prop() private data: FormDefinitionSettings = null;
  @Prop() private disabled: boolean = null;
  @Prop() private selectedFieldId: string = null;
  @Prop() private locations: FormFieldLocations = null;
  @Prop({ default: 10 }) private cols: number;
  @Prop({ default: 2 }) private minTileWidth: number;

  private isFirstRendering = true;
  private activeResizeTileId: string = null;

  mounted() {
    // wait a moment until rendering is done to remove the no-animation from the dashboard to prevent first-render animations
    setTimeout(() => {
      this.isFirstRendering = false;
    }, 100);
  }


  private addTile() {
    askNewName((to) => {
      // if (to) {
      let yUsed = 0;

      for (let index = 0; index < this.tiles.length; index++) {
        const tile = this.tiles[index];
        if (tile.y + tile.height > yUsed) {
          yUsed = tile.y + tile.height;
        }
      }

      const newField = {
        id: generateId(),
        type: FormFieldType.Explanation,
        settingsJson: JSON.stringify(getDefaultExplanationSettings(to)),
      }

      const fields = [];
      if (to) {
        fields.push(
          newField
        )
      }


      this.tiles.push({
        fields: fields,
        height: 2,
        width: 10,
        id: generateId(),
        x: 0,
        y: yUsed
      });
      this.updateTiles(this.tiles);
      //}
    }, "");



  }

  private openFieldEditor(tileId: string, field: FormFieldDefinition) {

    openForFieldEditorPanelPanel(this.locations, this.disabled, field, (to) => {
      const tile = this.tiles.find(p => p.id == tileId);
      const existingfield = tile.fields.find(p => p.id == field.id);
      if (!existingfield) { return; }
      existingfield.settingsJson = field.settingsJson;
      existingfield.type = field.type;
      this.updateTiles(this.tiles);
    },
      (to) => {
        const tile = this.tiles.find(p => p.id == tileId);
        tile.fields = tile.fields.filter(p => p.id != field.id);
        this.updateTiles(this.tiles);
      });
  }

  private minW(tile: FormTileSettings): number {
    return this.minTileWidth
    //const minSize = getMinimumTileSize(tile.type);
    //return minSize.w;
  }

  private minH(tile: FormTileSettings): number {
    return 1
    // const minSize = getMinimumTileSize(tile.type);
    // return minSize.h;
  }

  private get tilesLayout(): formLayoutItem[] {
    return getFormTilesLayout(this.data.tiles);
  }

  private get tiles(): FormTileSettings[] {
    return this.data?.tiles || [];
  }
  private set tiles(to: FormTileSettings[]) {
    this.data.tiles = to;
  }


  private layoutUpdatedEvent(newLayout: formLayoutItem[]) {
    let needsSave = false;
    for (let index = 0; index < newLayout.length; index++) {
      const layoutItem = newLayout[index];

      let tile = this.tiles.find(p => p.id == layoutItem.i);
      if (!tile) { continue; }

      if (tile.height != layoutItem.h) {
        tile.height = layoutItem.h;
        needsSave = true;
      }

      if (tile.width != layoutItem.w) {
        tile.width = layoutItem.w;
        needsSave = true;
      }
      if (tile.x != layoutItem.x) {
        tile.x = layoutItem.x;
        needsSave = true;
      }
      if (tile.y != layoutItem.y) {
        tile.y = layoutItem.y;
        needsSave = true;
      }
    }
    if (needsSave) {
      this.updateTiles(this.tiles);
    }
  }

  private updateTiles(newTiles: FormTileSettings[]) {
    this.$emit("updateTiles", newTiles);
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private resizeEvent(id: string, newH: number, newW: number, newHPx: number, newWPx: number) {
    let tile = this.tiles.find(p => p.id == id);
    if (!tile) { return; }

    tile.height = newH;
    tile.width = newW;

    // //const msg = "RESIZE i=" + id + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx;
    // //console.log(msg);

    // const e: DashboardTileSizeSelection = {
    //   selected: false,
    //   disabled: false,
    //   tileId: id,
    //   height: newH,
    //   width: newW,
    // }

    // // hide tile content while resizing
    // this.activeResizeTileId = id

    // this.onResizeTile(e, true);


  }
  private onResizeTile() {
    // if (this.disabled) { return; }

    // let tile = this.tiles.find(p => p.id == selection.tileId);
    // if (!tile) { return; }
    // // remove tile (fro trickery)

    // tile.height = selection.height;
    // tile.width = selection.width;

    // if (!ignoreSave) {
    //    this.updateTiles()
    // }


  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private resizedEvent(id: string, newX: number, newY: number, newHPx: number, newWPx: number) {

    this.activeResizeTileId = null;

    let tile = this.tiles.find(p => p.id == id);
    if (!tile) { return; }

    const e: FormTileSizeSelection = {
      selected: false,
      tileId: id,
      height: tile.height,
      width: tile.width,
    }

    this.updateTiles(this.tiles);
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private moveEvent(id: string, newX: number, newY: number) {

    //const msg = "MOVE i=" + id + ", X=" + newX + ", Y=" + newY;
    //console.log(msg);

  }

  private movedEvent(id: string, newX: number, newY: number) {
    // const msg = "MOVED i=" + id + ", X=" + newX + ", Y=" + newY;
    // console.log(msg);

    // let tile = this.tiles.find(p => p.id == id);
    // if (!tile) { return; }

    // tile.x = newX;
    // tile.y = newY;

    // this.saveDefinition(null);
  }


  //==============================================



  private updateSectionFields(fieldId: string, to: FormFieldDefinition[]) {
    this.$emit("updateSectionFields", fieldId, to);
  }


  private selectField(data: FormFieldDefinition) {
    this.$emit("selectField", data);
  }

  private IsSelected(data: FormFieldDefinition) {
    return data.id == this.selectedFieldId;
  }

  // private get fields() {
  //   return this.data.fields || [];
  // }

  private bubbleAddField(data: FormFieldType, fieldId: string) {
    this.$emit("addField", data, fieldId);
  }

  private selectAddField(type: FormFieldType) {
    this.$emit("addField", type, null);
  }

  private get addFieldOptions(): DropdownOption[] {
    return getTaskFormFieldTypeOptions();
  }


  private removeTile(tile: FormTileSettings) {
    if (this.disabled) { return; }

    askConfirmation((to: boolean) => {
      if (to) {
        this.updateTiles(this.tiles.filter(p => p.id != tile.id));
      }
    });
  }

  private showFlowStepContextMenu(e: MouseEvent, tile: FormTileSettings) {
    if (this.disabled) { return; }
    const options = this.addFieldOptions;

    for (let index = 0; index < options.length; index++) {
      const o = options[index];
      o.icon = o.icon || "plus";
      o.onSelect = () => {
        this.bubbleAddField(o.id as FormFieldType, tile.id);
      }
    }

    openContextDropdownPanel(e, options, translate(LanguagePath.App_Add));
    e.stopPropagation();
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



.add-tile {
  margin-left: 10px;

  height: 100px !important;
  width: 200px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;

}

.vue-resizable-handle {
  visibility: hidden;
  right: 0px !important;
  bottom: 0px !important;
  background: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNiA2IiB2ZXJzaW9uPSIxLjEiCgl4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIgoJeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Igo+Cgk8ZyBvcGFjaXR5PSIwLjMwMiI+CgkJPHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9ImN1cnJlbnRjb2xvciIvPgoJPC9nPgo8L3N2Zz4=") !important;
  background-repeat: no-repeat !important;
  background-position: right bottom;
}

.vue-grid-item:hover {
  .vue-resizable-handle {
    visibility: visible;

  }
}

.vue-grid-item.vue-grid-placeholder {
  background: var(--c-base-500) !important;
  border-radius: 10px;
}

.vue-draggable-dragging {
  opacity: 0.6 !important;
}
</style>

<style lang="scss" scoped>
@import "@/styles/theme";

.vue-grid-item .resizing {
  opacity: 0.9;
}

.dashboard-wrapper {
  min-width: 400px;
}

.header {
  margin-bottom: 20px;
}

.tiles {


  .tile {
    border-radius: 12px;
    font-size: $text-size-regular;
    line-height: 16px;
    color: var(--c-contrast);
    background-color: var(--c-base-100);
    height: 100%;
    overflow: auto;
    padding: 10px;

    &:hover {
      .outside-footer {
        visibility: visible;
      }
    }



    &.ghost {
      opacity: 0.5;
      border: 1px solid var(--c-base-400);
    }

    &.drag {
      opacity: 0.8;
    }


    &.drag-handle {
      cursor: move;
    }

    &.plus {
      margin-top: 10px;

      &:hover {
        .plus-icon {
          opacity: 0.7;
        }
      }

      display: grid;

      align-items: center;
      justify-items: center;

      .plus-icon {
        width: 100%;
        height: 100%;
        opacity: 0.1;
      }

    }


  }
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;

  .editable-field {
    padding: 0px 10px;
    border-radius: 8px;
    //background-color: var(--c-base-200);


    &.drag-handle {
      cursor: move;
    }

    &.ghost {
      background-color: $brand;
      color: #fff;
    }

    &.drag {
      // max-width: 200px;
      opacity: 1;
      border-radius: 8px;
      background-color: var(--c-contrast);
      color: var(--c-base);
    }
  }
}



.outside-footer {
  visibility: hidden;
  position: absolute;
  bottom: -10px;
  // left: calc(50% - 70px);
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: center;


  .opener {


    &.open {
      transform: rotate(-180deg);
      transition: transform 150ms ease;
    }

    &.closed {
      transform: rotate(-360deg);
      transition: transform 150ms ease;
    }
  }
}
</style>
