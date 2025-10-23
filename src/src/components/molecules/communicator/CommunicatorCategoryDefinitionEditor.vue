<template>
  <template v-if="loaded">
    <TickFocusScreen :noSidebar="true">
      <TickScreen :title="name">
        <template v-slot:subtitle>
          <span> {{ $translate(LanguagePath.App_CommunicatorCategoryDefinitionEditor_Locked) }}</span>
        </template>

        <template v-slot:actions>
          <TickButton @click="askNewName" v-if="!disabled" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_Rename) }}
          </TickButton>
          <TickButton @click="remove" v-if="!disabled" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
          <TickButton @click="save" v-if="!disabled" class="outline">{{ $translate(LanguagePath.App_Save) }}</TickButton>
        </template>
        <template v-slot:default>


          <TickEditorPanel :name="$translate(LanguagePath.App_CommunicatorCategoryDefinitionEditor_Form_Title)">
            <template v-slot:explainer>
              {{ $translate(LanguagePath.App_CommunicatorCategoryDefinitionEditor_Form_Explanation) }}

              <TickInput type="number" :max="100" :min="0" v-model="weight">{{ $translate(LanguagePath.App_MetaDataComponentEditor_Weight_Title) }}</TickInput>

            </template>
            <div class="form-wrapper">
              <FormEditor :locations="locations" @updateTiles="updateTiles" @addField="addField" v-if="form" :data="form" :disabled="disabled" />
            </div>
          </TickEditorPanel>

        </template>
      </TickScreen>

      <template #list>
        <TickSettingsMenu />
      </template>

    </TickFocusScreen>
  </template>
</template>

<script lang="ts">
import SectionWithSidebar from "@/components/atoms/SectionWithSidebar.vue";
import TickButton, { Appearance, Color } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import generateId from "@/helpers/guid";
import useManagingStore from "@/store/managingStore";
import {
  AuthorizationObjectType,
  FormFieldDefinition,
  FormFieldType,
  FormTileSettings,
  LanguagePath,
  StorageLocation,
  TickCommunicatorCategoryDefinition
} from "@/TickApi";
import { Component, Prop, Vue, Watch } from "vue-facing-decorator";
import TickEditorPanel from "../editor/TickEditorPanel.vue";
import TickScreen from "../editor/TickScreen.vue";

import TickFocusScreen from "@/components/atoms/TickFocusScreen.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickSettingsMenu from "@/components/TickSettingsMenu.vue";
import useUserStore from "@/store/user";
import FormEditor from "../form/editor/FormEditor.vue";

import TickSwitch from "@/components/atoms/TickSwitch.vue";
import { getCommunicatorReadStorageLocations, getCommunicatorWriteStorageLocations } from "@/helpers/enumsHelper";
import { askNewName, onConfirmation } from "@/helpers/questionHelper";
import { getDefaultExplanationSettings, getDefaultInputSettings, getDefaultSelectInputSettings, getDefaultSmartViewerSettings } from "@/helpers/taskHelper";
import { FormFieldLocations, openForFieldEditorPanelPanel } from "../form/editor/panel/FormFieldEditorPanel.vue";


@Component({
  emits: ["saved", "deleted"],
  components: {
    TickScreen,
    TickEditorPanel,
    TickButton,
    TickInput,
    TickTextarea,
    SectionWithSidebar,
    FormEditor,
    TickFocusScreen,
    TickSettingsMenu,
    TickSelector,
    TickSwitch,
  },
})
export default class CommunicatorCategoryDefinitionEditor extends Vue {
  Appearance = Appearance;
  Color = Color;
  LanguagePath = LanguagePath;

  @Prop() private activeId!: string;
  private category: TickCommunicatorCategoryDefinition = null;
  private loaded = false;

  private get weight() {
    return this.category.weight ?? 0;
  }
  private set weight(to: number) {
    this.category.weight = to;
  }

  private get name() {
    return this.category?.name;
  }

  private askNewName() {
    if (this.disabled) { return; }

    askNewName((to) => {
      if (to) {
        this.category.name = to;
      }
    }, this.category.name);
  }


  private addField(type: FormFieldType, tileId?: string) {
    const settingsDefault = this.getDefaultFieldSettings(type);
    var newField = {
      id: generateId(),
      type: type,
      settingsJson: JSON.stringify(settingsDefault),
    };

    if (tileId) {
      const tile = this.form.tiles.find(p => p.id == tileId);
      tile.fields.push(newField);
    }

    this.openFieldEditor(tileId, newField);
  }

  private getDefaultFieldSettings(type: FormFieldType) {
    switch (type) {
      case FormFieldType.Explanation:
        return getDefaultExplanationSettings();
      case FormFieldType.SmartViewer:
        return getDefaultSmartViewerSettings();
      case FormFieldType.Input:
        return getDefaultInputSettings();
      case FormFieldType.SelectInput:
        return getDefaultSelectInputSettings();
    }
  }

  private get disabled() {
    return (
      !this.category ||
      !useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration)
    );
  }


  private updateTiles(tiles: FormTileSettings[]) {
    this.form.tiles = tiles;
  }
  private get settings() {
    return this.category.settings;
  }
  private get form() {
    return this.settings.form || {};
  }

  @Watch("activeId")
  private async activate(id: string) {
    if (!id) {
      return;
    }
    this.loaded = false;
    useManagingStore()
      .getCommunicatorCategoryDefinition(id)
      .then((category) => {
        this.category = category;
        this.loaded = true;
      });
  }

  mounted() {
    this.activate(this.activeId);
  }

  private get locations(): FormFieldLocations {
    return {
      read: getCommunicatorReadStorageLocations(),
      write: getCommunicatorWriteStorageLocations(),
      create: StorageLocation.Contact,
    }
  }

  private openFieldEditor(tileId: string, field: FormFieldDefinition) {

    openForFieldEditorPanelPanel(this.locations, this.disabled, field, (to) => {
      const tile = this.form.tiles.find(p => p.id == tileId);
      const existingfield = tile.fields.find(p => p.id == field.id);
      if (!existingfield) { return; }
      existingfield.settingsJson = field.settingsJson;
      existingfield.type = field.type;
      this.updateTiles(this.form.tiles);
    },
      (to) => {
        const tile = this.form.tiles.find(p => p.id == tileId);
        tile.fields = tile.fields.filter(p => p.id != field.id);
        this.updateTiles(this.form.tiles);
      });
  }




  private remove() {
    onConfirmation(() => {
      useManagingStore()
        .deleteCommunicatorCategoryDefinition(this.category.id)
        .then(() => {
          this.$emit("deleted");
        });
    })
  }

  private save() {
    useManagingStore()
      .saveCommunicatorCategoryDefinition(this.category.id)
      .then(() => {
        this.$emit("saved");
      });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";



.sidebar-content {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;

  //padding: 20px 0 0 30px;
}

.form-wrapper {
  display: grid;
  gap: 10px;
}

.actions-wrapper {
  margin-top: 10px;

  display: flex;
  align-items: end;
  gap: 5px;
}

.flexrow {
  display: flex;
  gap: 10px;
}
</style>
