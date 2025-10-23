<template>

  <div>

    <TickEditorPanel v-if="viewerType == TickComponentPresentationTypeEnum.CommunicatorHistory" :name="$translate(LanguagePath.App_MetaDataComponentEditor_Source_Title)">
      {{ $translate(LanguagePath.App_MetaDataComponentEditor_Source_IsTick_Title) }}
    </TickEditorPanel>

    <TickEditorPanel v-if="viewerType == TickComponentPresentationTypeEnum.CommunicatorInfo" :name="$translate(LanguagePath.App_Editor_General)">
      <div class="form-wrapper">
        <FormEditor :locations="communicatorInfoLocations" @updateTiles="updateTiles" :minTileWidth="5" @addField="addField" v-if="form && !disabled" :data="form" :disabled="disabled" />
      </div>
    </TickEditorPanel>
  </div>


</template>

<script lang="ts">

import LabelList from '@/components/atoms/LabelList.vue';
import TickButton from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { inputValueToServerDate } from '@/helpers/dateHelper';
import { getFormFieldSampleData } from '@/helpers/formHelper';
import generateId from '@/helpers/guid';
import { debug } from '@/log';


import { clone } from '@/helpers/cloneHelper';
import { jsonProxy } from '@/helpers/jsonProxy';
import { getDefaultExplanationSettings, getDefaultInputSettings, getDefaultSelectInputSettings, getDefaultSmartViewerSettings } from '@/helpers/taskHelper';
import {
  ColorsEnum,
  ComponentDataSourceTypeEnum,
  ExtractionStrategyEnum,
  FormDefinitionSettings,
  FormField,
  FormFieldDefinition,
  FormFieldType,
  FormTileSettings,
  LanguagePath,
  MetaDataComponentCommunicatorHistoryData,
  MetaDataComponentCommunicatorInfoData,
  MetaDataComponentTickSourceCommunicatorInfoSettings,
  MetaDataComponentTickSourceSettings,
  MetaDataComponentTickSourceViewerSettings, MetaDataComponentUpdate, StorageLocation, TickComponentPresentationTypeEnum,
  WorkingFormTileSettings
} from '@/TickApi';
import { Component, Prop, VModel, Vue, Watch } from 'vue-facing-decorator';
import TickEditorPanel from '../../editor/TickEditorPanel.vue';
import FormEditor from '../../form/editor/FormEditor.vue';
import { FormFieldLocations, openForFieldEditorPanelPanel } from '../../form/editor/panel/FormFieldEditorPanel.vue';

@Component({
  emits: ["sampledatachange"],
  components: {
    TickInput, TickTextArea, TickButton, TickCheckbox, LabelList, TickSwitch,
    TickDropdown, TickSelector, TickEditorPanel, FormEditor
  },
})
export default class MetaDataComponentTickSourceEditor extends Vue {
  ExtractionStrategyEnum = ExtractionStrategyEnum;
  LanguagePath = LanguagePath
  TickComponentPresentationTypeEnum = TickComponentPresentationTypeEnum

  @VModel({ required: true }) private settings!: MetaDataComponentTickSourceSettings;
  @Prop() private editallowed!: boolean;
  @Prop() private componentName!: string;
  @Prop() private useBottomSlot: boolean;

  private get disabled() {
    return !this.editallowed;
  }

  private get settingsPresentForSample() {
    //const c = this.settings;
    return true;
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
  private openFieldEditor(tileId: string, field: FormFieldDefinition) {

    openForFieldEditorPanelPanel(this.communicatorInfoLocations, this.disabled, field, (to) => {
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
  private get viewerType() {
    return this.settings.viewerSettings.type;
  }
  private get communicatorInfoLocations(): FormFieldLocations {
    return {
      read: [StorageLocation.Contact],
      write: [StorageLocation.Contact],
      create: StorageLocation.Contact,
    }
  }

  private updateTiles(tiles: FormTileSettings[]) {

    const copy = clone<FormDefinitionSettings>(this.form)
    copy.tiles = tiles;

    this.form = copy;
  }

  private get form() {
    return this.settingsAsCommunicatorInfo.form || {};
  }

  private set form(to) {
    this.settingsAsCommunicatorInfo.form = to;
  }

  private get updateSampleData() {

    switch (this.settings.viewerSettings.type) {
      case TickComponentPresentationTypeEnum.CommunicatorHistory: return this.communicatorHistorySampleData
      case TickComponentPresentationTypeEnum.CommunicatorInfo: return this.communicatorInfoSampleData;
    }
    return null;
  }

  private get settingsAsCommunicatorInfo(): MetaDataComponentTickSourceCommunicatorInfoSettings {
    return jsonProxy<MetaDataComponentTickSourceCommunicatorInfoSettings>(this.settings.settingsJson || "{}", (json) => {
      console.log(json);
      this.settings.settingsJson = json;
    });
  }


  private get communicatorInfoSampleData() {

    const formSettings = JSON.parse(this.settings.settingsJson || "{}") as MetaDataComponentTickSourceCommunicatorInfoSettings
    const sampleTiles: WorkingFormTileSettings[] = []

    for (let index = 0; index < formSettings.form.tiles.length; index++) {
      const tile = formSettings.form.tiles[index];
      const sampleTileFields: FormField[] = []

      for (let fieldIndex = 0; fieldIndex < tile.fields.length; fieldIndex++) {
        const field = tile.fields[fieldIndex];
        sampleTileFields.push(getFormFieldSampleData(field));
      }

      sampleTiles.push({
        id: tile.id,
        height: tile.height,
        width: tile.width,
        x: tile.x,
        y: tile.y,
        fields: sampleTileFields,
      })
    }

    const c: MetaDataComponentCommunicatorInfoData = {
      communicatorSummary: {
        color: ColorsEnum.BoldYellow,
        id: generateId(),
        name: "Contact",
        avatarFileId: null,
      },
      form: {
        tiles: sampleTiles,
      }
    }
    return c;
  }


  private get communicatorHistorySampleData() {

    const c: MetaDataComponentCommunicatorHistoryData = {
      items: [{
        ticketId: "",
        title: "Ticket title",
        creationDate: inputValueToServerDate("2023-01-01"),
      },
      {
        ticketId: "",
        title: "Ticket title",
        creationDate: inputValueToServerDate("2023-01-01"),
      },
      {
        ticketId: "",
        title: "Ticket title",
        creationDate: inputValueToServerDate("2023-01-01"),
      },
      {
        ticketId: "",
        title: "Ticket title",
        creationDate: inputValueToServerDate("2023-01-01"),
      }]
    }
    return c;
  }



  private get outputSampleComponentData(): MetaDataComponentUpdate {
    if (!this.settingsPresentForSample) { return null; }

    var viewerSettings: MetaDataComponentTickSourceViewerSettings = {
      type: this.settings.type,// TickComponentPresentationTypeEnum.CommunicatorHistory,
    }
    const sample: MetaDataComponentUpdate = {
      useBottomSlot: this.useBottomSlot,
      dataRetrievalSuccess: true,
      isFinalDataRetrievalAttempt: true,
      ticketId: generateId(),
      ticketMetaDataComponentId: generateId(),
      componentName: this.componentName,
      ready: true,
      debugMessages: [],
      componentData: JSON.stringify(this.updateSampleData),
      sourceType: ComponentDataSourceTypeEnum.Tick,
      viewerSettingsJson: JSON.stringify(viewerSettings),
      lastUpdateDate: null,
      lastUpdateDateTicks: null,
    }

    return sample;
  }


  mounted() {
    this.$emit("sampledatachange", this.outputSampleComponentData);
  }

  @Watch("outputSampleComponentData")
  private sampledataChange() {
    debug("[METADATA-COMPONENT:Change of sample data]");
    this.$emit("sampledatachange", this.outputSampleComponentData);
  }

}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.explainer {
  font-size: $text-size-regular;
  font-style: italic;

  &.success {
    color: $success;
  }
}

.tranformer {
  display: flex;

}

.inputSampledata,
.outputSampledata {
  width: 40%;
  // background-color: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 8px;

  .header {
    font-size: 20px;
    font-weight: 400;
  }

  .jsonViewer {
    font-size: $text-size-regular;
  }

}

.startcontainer {
  margin-bottom: 10px;
}

.conditionButtons {
  display: flex;
  gap: 10px;

  .conditionButton {
    display: inline-block;

  }
}

.conditionSummary {
  font-weight: 600;

}

.conditionSummary,
.startSummary,
.skipSummary {
  font-style: italic;
  font-size: $text-size-regular;
}
</style>
