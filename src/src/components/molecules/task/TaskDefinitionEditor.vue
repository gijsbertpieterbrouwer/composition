<template>
  <template v-if="loaded">
    <TickFocusScreen :noSidebar="true">
      <TickScreen :title="task.name">
        <template v-slot:actions>

          <TickButton @click="askNewName" v-if="!disabled" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_Rename) }}
          </TickButton>

          <TickButton @click="remove" v-if="!disabled" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
          <TickButton @click="save" v-if="!disabled" class="outline">{{ $translate(LanguagePath.App_Save) }}</TickButton>
        </template>
        <template v-slot:default>

          <TickEditorPanel :name="$translate(LanguagePath.App_TaskDefinitionEditor_Outcomes_Title)">
            <template v-slot:explainer>
              {{ $translate(LanguagePath.App_TaskDefinitionEditor_Outcomes_Explanation) }}
            </template>
            <div class="actions-wrapper">
              <TickButton @click="addEmptyAction" icon="plus" :appearance="Appearance.secondary" :color="Color.contrast" v-if="!disabled" />
              <TickButton @click="selectAction(action)" class="action" :appearance="Appearance.primary" :color="getActionColor(action)" v-for="action in this.actions" :key="action.id"
                :class="getActionClass(action)">{{ action.name }}</TickButton>

            </div>
          </TickEditorPanel>

          <TickEditorPanel :name="$translate(LanguagePath.App_TaskDefinitionEditor_TaskForm_Title)">
            <template v-slot:explainer>
              {{ $translate(LanguagePath.App_TaskDefinitionEditor_Form_Explanation) }}

            </template>
            <div class="form-wrapper">
              <FormEditor :locations="locations" @updateTiles="updateTiles" @addField="addField" v-if="form && !disabled" :data="form" :disabled="disabled" />
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
  TaskAction,
  TaskDefinitionAction,
  TaskInstanceStatus,
  TickTaskDefinition
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
import { askNewName, onConfirmation } from "@/helpers/questionHelper";
import { getDefaultExplanationSettings, getDefaultInputSettings, getDefaultSelectInputSettings } from "@/helpers/taskHelper";
import { translate } from "@/plugins/translatePlugin";
import { FormFieldLocations, openForFieldEditorPanelPanel } from "../form/editor/panel/FormFieldEditorPanel.vue";

import { getTaskReadStorageLocations, getTaskWriteStorageLocations } from "@/helpers/enumsHelper";
import { openForFormActionEditorPanelPanel } from "./editor/sidebar/panel/FormActionEditorPanel.vue";

export enum SelectionItemType {
  NoSelection = "nothing",
  Action = "action",
  FormField = "FormField",
}

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
export default class TaskDefinitionEditor extends Vue {
  Appearance = Appearance;
  Color = Color;
  SelectionItemType = SelectionItemType;
  LanguagePath = LanguagePath;

  @Prop() private activeId!: string;
  private task: TickTaskDefinition = null;
  private loaded = false;

  // private selectionType: SelectionItemType = SelectionItemType.NoSelection;
  // private selectionId: string = null;

  private askNewName() {
    if (this.disabled) { return; }

    askNewName((to) => {
      if (to) {
        this.task.name = to;
      }
    }, this.task.name);
  }

  private getActionColor(action?: TaskAction) {
    return (action.targetStatus == TaskInstanceStatus.Failed) ? Color.failure : Color.contrast;
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
      // const section = this.getFormFieldById(fieldId);
      // const settings = this.fieldSettingsAsSection(section);
      // settings.fields.push(newField);

      //FixMe => proxy thing
      //settings. = settings.fields.slice(0);
    }

    this.openFieldEditor(tileId, newField);
  }

  private getDefaultFieldSettings(type: FormFieldType) {
    switch (type) {
      case FormFieldType.Explanation:
        return getDefaultExplanationSettings();
      case FormFieldType.Input:
        return getDefaultInputSettings();
      case FormFieldType.SelectInput:
        return getDefaultSelectInputSettings();
    }
  }



  private get disabled() {
    return (
      !this.task ||
      !useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration)
    );
  }


  private updateTiles(tiles: FormTileSettings[]) {
    this.form.tiles = tiles;
  }


  private deleteAction(id: string) {
    if (!confirm(translate(LanguagePath.App_TaskDefinitionEditor_Action_Remove_Confirm))) { return; }

    const actionIndex = this.actions.findIndex((p) => p.id == id);
    if (actionIndex > -1) {
      this.actions.splice(actionIndex, 1);
    }
  }

  private get settings() {
    return this.task.settings;
  }

  private get actions() {
    return this.settings.actions || [];
  }
  private set actions(to) {
    this.settings.actions = to;
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
      .getTaskDefinition(id)
      .then((task) => {
        this.task = task;
        this.loaded = true;
      });
  }

  mounted() {
    this.activate(this.activeId);
  }

  // private selectItem(
  //   type: SelectionItemType,
  //   id: string,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   data: TaskDefinitionAction | TaskFormFieldDefinition
  // ) {
  //   this.selectionType = type;
  //   this.selectionId = id;
  //   //this.selectionData = data;

  // }

  // private selectField(field: TaskFormFieldDefinition) {
  //   this.selectItem(SelectionItemType.FormField, field.id, field);
  // }
  private get locations(): FormFieldLocations {
    return {
      read: getTaskReadStorageLocations(true),
      write: getTaskWriteStorageLocations(),
      create: StorageLocation.TaskInstance,
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

  private selectAction(action: TaskDefinitionAction) {
    //this.selectItem(SelectionItemType.Action, action.id, action);

    openForFormActionEditorPanelPanel(this.disabled, action, (to) => {
      //c
    },
      (to) => {

        this.actions = this.actions.filter(p => p.id != action.id);
      });
  }

  private getActionClass(action?: TaskAction) {
    return action.targetStatus == TaskInstanceStatus.Failed ? "delete" : "";
  }

  private addEmptyAction() {
    const newAction = {
      id: generateId(),
      name: translate(LanguagePath.App_TaskDefinitionEditor_Action_NewTitle),
      targetStatus: TaskInstanceStatus.Finished,
    };
    this.actions.push(newAction);

    //this.selectItem(SelectionItemType.Action, newAction.id, newAction);
    this.selectAction(newAction);


  }

  private remove() {
    onConfirmation(() => {
      useManagingStore()
        .deleteTaskDefinition(this.task.id)
        .then(() => {
          this.$emit("deleted");
        });
    })
  }

  private save() {
    useManagingStore()
      .saveTaskDefinition(this.task.id)
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
