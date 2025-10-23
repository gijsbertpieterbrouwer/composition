<template>
  <div>
    <SidebarPanel :name="$translate(LanguagePath.App_Editor_General)">
      <TickInput v-model="settings.name" :disabled="disabled">{{ $translate(LanguagePath.App_Name) }}</TickInput>
      <TickTextarea v-model="settings.description" :disabled="disabled">{{ $translate(LanguagePath.App_Description) }}</TickTextarea>
      <TickCheckbox v-model="settings.required" :disabled="disabled">{{ $translate(LanguagePath.App_Required) }}</TickCheckbox>
    </SidebarPanel>

    <SidebarPanel :name="$translate(LanguagePath.App_TaskDefinitionEditor_Panel_Select_Listoptions_Title)">
      <template #header>
        <TickSelector v-model="settings.optionsSource" :options="optionsSourceOptions" :disabled="disabled" />
      </template>
      <template v-if="settings.optionsSource == OptionsSourceEnum.Options">
        <div class="choice-container">
          <table class="styledTable">
            <thead>
              <tr>
                <th>{{ $translate(LanguagePath.App_TaskDefinitionEditor_DataOptionPanel_Text) }}</th>
                <th>{{ $translate(LanguagePath.App_TaskDefinitionEditor_DataOptionPanel_Value) }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(route, index) in routes" :key="route.id">
                <FormInputDataOptionItemEditor @remove="removeRoute(routes[index])" v-model="routes[index]" />
              </template>
            </tbody>
          </table>

          <EditorMessage v-if="!routes || !this.routes.length" :type="EditorMessageType.Warning" title="Add option" message="Please provide options" />

          <TickButton v-if="!disabled" class="addRouteButton" @click="addRoute('addRouteButton')" ref="addRouteButton" :appearance="Appearance.secondary" icon="plus" :size="Size.mini"
            :color="Color.contrast">
          </TickButton>

        </div>

      </template>

      <template v-if="settings.optionsSource == OptionsSourceEnum.Databag">
        <DatabagItemSelector v-model="settings.optionsStorageLocationPath" :locations="readLocations" :defaultNewStorageLocation="defaultNewStorageLocation" :disabled="disabled"
          :allowAsSubDialog="true" />
        <TickTextarea v-model="settings.optionsMappingJMESPath" placeholder="mapping (optional)" :disabled="disabled" />
      </template>
    </SidebarPanel>
    <SidebarPanel :name="$translate(LanguagePath.App_TaskDefinitionEditor_Panel_Capture_Title)">
      <template #header>
        <TickSwitch v-model="settings.storeToState" :disabled="disabled" />
      </template>

      <DatabagItemSelector v-if="settings.storeToState" :disabled="disabled" v-model="settings.answerStoragePath" :defaultNewStorageLocation="defaultNewStorageLocation" :locations="writeLocations"
        :allowAsSubDialog="true" />

    </SidebarPanel>
  </div>
</template>

<script lang="ts">
import { FormFieldSelectInputSettings, LanguagePath, OptionsItemData, OptionsSourceEnum, StorageLocation } from "@/TickApi";
import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickCheckbox from '@/components/atoms/TickCheckbox.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextarea from '@/components/atoms/TickTextarea.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import DatabagItemSelector from '@/components/molecules/Selectors/DatabagItemSelector.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import FormInputDataOptionItemEditor from "@/components/molecules/form/editor/panel/FormInputDataOptionItemEditor.vue";
import { getOptionsSourceOptions, getStorageLocationOptions, getTaskFormInputTypeOptions } from '@/helpers/enumsHelper';
import generateId from '@/helpers/guid';
import { jsonProxy } from "@/helpers/jsonProxy";
import { unmount } from '@/helpers/mountHelper';
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';

@Component({
  emits: ["delete"],
  components: { TickButton, TickInput, TickTextarea, TickSelector, TickCheckbox, TickScreen, TickListItem, TickSwitch, SidebarPanel, DatabagItemSelector, EditorMessage, FormInputDataOptionItemEditor }
})
export default class FormSelectInputFieldSettingsEditor extends Vue {
  OptionsSourceEnum = OptionsSourceEnum;
  Appearance = Appearance
  Color = Color
  Size = Size
  EditorMessageType = EditorMessageType
  LanguagePath = LanguagePath

  @Prop() private disabled = false;
  @Prop() private readLocations: StorageLocation[];
  @Prop() private writeLocations: StorageLocation[];
  @Prop() private defaultNewStorageLocation: StorageLocation;
  @VModel({ required: true }) private data: string;


  private get settings() {
    return jsonProxy<FormFieldSelectInputSettings>(this.data || "{}", (json) => {
      this.data = json;
    });
  }


  // private get readLocations() {
  //   return getTaskReadStorageLocations(true);
  // }
  private get availableStorageLocations(): StorageLocation[] {
    return this.storageLocationOptions.map((d) => d.value);
  }
  private activePanel = {
    group: "",
    panelId: "",
    optionId: "",
  }


  private get inputTypeOptions() {
    return getTaskFormInputTypeOptions();
  }
  private get storageLocationOptions() {
    return getStorageLocationOptions(false, false);
  }


  private get optionsSourceOptions() {
    return getOptionsSourceOptions();
  }


  private get routes() {
    return this.settings.options || [];
  }

  private routesUpdated() {
    //fixme: proxy needs to see array changes
    this.settings.options = this.settings.options.slice();
  }

  private removeRoute(route: OptionsItemData) {
    const option = this.settings.options.find(c => c.id === route.id);

    const index = this.settings.options.indexOf(option);
    if (index > -1) { // only splice array when item is found
      this.settings.options.splice(index, 1); // 2nd parameter means remove one item only
    }

    this.routesUpdated();
  }

  private addRoute(fromRef: string) {
    const optionData = ""; //prompt("Please type a label for the option");
    const optionValue = "";// prompt("What should the value of this option be?");
    const newId = generateId();
    this.settings.options.push({
      id: newId,
      data: optionValue,
      text: optionData,
    });

    this.routesUpdated();
  }


  patchOption(route: OptionsItemData) {
    const option = this.settings.options.find(c => c.id === route.id);
    option.data = route.data;
    option.text = route.text;

    this.routesUpdated();
  }

  beforeUnmount() {
    this.closeActivePanel();
  }

  private closeActivePanel() {
    if (this.activePanel.panelId) {
      unmount(this.activePanel.panelId);
    }

    this.activePanel.group = "";
    this.activePanel.panelId = "";
    this.activePanel.optionId = "";
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.choice-container {
  padding: 10px;
  background-color: var(--c-base-300);
  border-radius: 8px;

  display: grid;
  gap: 5px;
}
</style>
