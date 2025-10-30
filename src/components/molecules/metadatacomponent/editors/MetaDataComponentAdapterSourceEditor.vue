<template>
  <TickEditorPanel :name="$translate(LanguagePath.App_MetaDataComponentEditor_AdapterSource_StorageLocation_Title)">
    <TickSelector :disabled="disabled" v-model="settings.presentationType" :options="presentationOptions">Presentation</TickSelector>
    <div>
      <TickSelector :disabled="disabled" v-model="dataAdapterId" :options="adapterOptions">Adapter</TickSelector>
    </div>
  </TickEditorPanel>

  <TickEditorPanel :name="$translate(LanguagePath.App_MetaDataComponentEditor_AdapterSource_Mapping_Title)">
    <div v-if="selectedAdapter && this.viewAdapterDetailsAllowed && !this.selectedAdapterHasSingleResultAction">
      <TickDropdown :disabled="disabled" @select="prefillFromResultAction" :options="resultActionOptions"
        :placeholder="$translate(LanguagePath.App_MetaDataComponentEditor_AdapterSource_Mapping_Prefill_Title)"></TickDropdown>
    </div>

    <!-- <div>
      <TickSelector :disabled="disabled" v-model="settings.dataStorageLocation" :options="storageOptions">Input storage location</TickSelector>

    </div> -->
    <DatabagItemSelector :disabled="disabled" v-model="settings.dataStoragePath" :placeholder="$translate(LanguagePath.App_MetaDataComponentEditor_AdapterSource_Mapping_FromStorageLocation)"
      :locations="availableStorageLocations" />

    <div>
      <TickSelector :disabled="disabled" v-model="settings.extractionStrategy" :options="extractionStrategyOptions">
        {{ $translate(LanguagePath.App_MetaDataComponentEditor_AdapterSource_ExtractionStrategy_Title) }}</TickSelector>
    </div>
    <div v-if="settings.extractionStrategy != ExtractionStrategyEnum.Unredacted">
      <TickInput :disabled="disabled" v-model="settings.extractionStrategySettings" :placeholder="$translate(LanguagePath.App_MetaDataComponentEditor_AdapterSource_ExtractionStrategy_Placeholder)">
        {{ $translate(LanguagePath.App_MetaDataComponentEditor_AdapterSource_ExtractionStrategy_Title) }}</TickInput>
    </div>

    <div class="tranformer" v-if="selectedAdapter && this.selectedAdapterResultAction">
      <div class="inputSampledata">
        <div class="header">{{ $translate(LanguagePath.App_MetaDataComponentEditor_AdapterSource_SampleData_Title) }}</div>
        <div>
          <pre class="jsonViewer">{{ this.inputSampleData }}</pre>
        </div>
      </div>
      <div class="outputSampledata">
        <div class="header">{{ $translate(LanguagePath.App_MetaDataComponentEditor_AdapterSource_SampleData_Transformed_Title) }}</div>
        <div>
          <pre class="jsonViewer">{{ this.outputSampleData }}</pre>
          {{ this.sampleDataError }}
        </div>
      </div>
    </div>
  </TickEditorPanel>
</template>

<script lang="ts">
import TickButton from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import {
  AuthorizationObjectType,
  ComponentDataSourceTypeEnum,
  DatabagStorageSettings,
  ExtractionStrategyEnum,
  LanguagePath,
  MetaDataComponentAdapterSourceSettings,
  MetaDataComponentAdapterSourceViewerSettings,
  MetaDataComponentUpdate,
  StorageLocation,
  SubscriptionCostItemType,
  TickApiAdapterDefinition,
} from "@/TickApi";
import { Component, Prop, VModel, Vue, Watch } from "vue-facing-decorator";

import LabelList from "@/components/atoms/LabelList.vue";
import TickDropdown from "@/components/atoms/TickDropdown.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import {
  extractionStrategyOptions,
  getComponentPresentationTypeEnumOptions,
  getStorageLocationOptions,
} from "@/helpers/enumsHelper";
import generateId from "@/helpers/guid";
import { debug } from "@/log";
import useDataAdaptersStore from "@/store/dataadapters";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { search } from "@metrichor/jmespath";
import TickEditorPanel from "../../editor/TickEditorPanel.vue";
import DatabagItemSelector from "../../Selectors/DatabagItemSelector.vue";

@Component({
  emits: ["sampledatachange"],
  components: {
    TickInput,
    TickTextArea,
    TickButton,
    TickCheckbox,
    LabelList,
    TickSwitch,
    TickDropdown,
    TickSelector,
    TickEditorPanel,
    DatabagItemSelector
  },
})
export default class MetaDataComponentAdapterSourceEditor extends Vue {
  ExtractionStrategyEnum = ExtractionStrategyEnum;
  LanguagePath = LanguagePath
  @VModel({ required: true })
  private settings!: MetaDataComponentAdapterSourceSettings;
  @Prop() private editallowed!: boolean;
  @Prop() private componentName!: string;
  @Prop() private useBottomSlot: boolean;

  private get disabled() {
    return !this.editallowed;
  }
  private selectedAdapterId: string = null;
  private selectedAdapter: TickApiAdapterDefinition = null;
  private selectedAdapterResultAction: DatabagStorageSettings = null;
  private selectedAdapterHasSingleResultAction = false;
  private sampleDataError = "";

  private get availableStorageLocations(): StorageLocation[] {
    return this.storageLocationOptions.map((d) => d.value);
  }
  private get storageLocationOptions() {
    return getStorageLocationOptions(true, false);
  }

  private get presentationOptions() {
    return getComponentPresentationTypeEnumOptions();
  }
  private get extractionStrategyOptions() {
    return extractionStrategyOptions();
  }

  private get viewAdapterDetailsAllowed() {
    return useUserStore().allowedView(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.DataAdapter);
  }

  private get settingsPresentForSample() {
    const c = this.settings;
    if (!c.dataAdapterId) {
      return false;
    }

    if (!c.dataStoragePath) {
      return false;
    }

    return true;
  }

  private get dataAdapterId() {
    return this.settings.dataAdapterId;
  }

  private set dataAdapterId(to: string) {
    this.settings.dataAdapterId = to;
    this.selectedAdapterId = to;

    this.getAdapterDetails(to);
  }

  // @Watch("selectedAdapterId")
  private getAdapterDetails(to: string): void {

    if (!this.viewAdapterDetailsAllowed) {
      return null;
    }
    if (!this.settings.dataAdapterId) {
      return null;
    }

    debug("[Metadata-Component:SET]:Change adapter");

    useDataAdaptersStore()
      .get(to)
      .then((adapter) => {
        this.selectedAdapter = adapter;
        this.selectedAdapterHasSingleResultAction =
          adapter.resultActionsSettings.actionsSettings != null &&
          adapter.resultActionsSettings.actionsSettings.length == 1;

        if (this.selectedAdapterHasSingleResultAction) {
          const resultActionId =
            adapter.resultActionsSettings.actionsSettings[0].id;
          this.internalPrefillFromResultAction(resultActionId);
        }
      });
  }

  private prefillFromResultAction(to: string) {
    this.internalPrefillFromResultAction(to);
  }

  private internalPrefillFromResultAction(to: string) {
    const action =
      this.selectedAdapter.resultActionsSettings.actionsSettings.find(
        (p) => p.id == to
      );
    const actionSettings = JSON.parse(
      action.settingsJson
    ) as DatabagStorageSettings;

    this.selectedAdapterResultAction = actionSettings;

    // this.settings.dataStorageLocation = actionSettings.storageLocation;
    this.settings.dataStoragePath = actionSettings.storagePath;
  }

  private get adapterOptions() {
    const adapters = useUtilityDataStore().utilityData.adapterDefinitions;
    let options = adapters.map((adapter) => ({
      text: adapter.name,
      value: adapter.id,
    }));
    return options;
  }

  private get resultActionOptions() {
    if (this.selectedAdapter == null) {
      return [];
    }

    let options =
      this.selectedAdapter.resultActionsSettings.actionsSettings.map(
        (adapter, index) => ({
          text: `action (${index + 1})`,
          value: adapter.id,
        })
      );

    return options;
  }

  private get storageOptions() {
    return getStorageLocationOptions(false, false);
  }

  private get inputSampleData() {
    if (!this.selectedAdapter || !this.selectedAdapter.sampleData) {
      return "";
    }
    if (!this.selectedAdapterResultAction) {
      return "";
    }

    const sampleData = this.selectedAdapter.sampleData;
    let output = "";

    // transform according to result action first
    if (
      this.selectedAdapterResultAction.extractionStrategy ==
      ExtractionStrategyEnum.Unredacted ||
      !this.selectedAdapterResultAction.extractionStrategySettings
    ) {
      output = sampleData; // non-transformed data
    } else {
      const jsonObj = JSON.parse(sampleData);
      const transformedData = search(
        jsonObj,
        this.selectedAdapterResultAction.extractionStrategySettings
      );

      const transformedJson = JSON.stringify(transformedData, null, 2); // spacing level = 2
      output = transformedJson ?? "";
    }

    const outputJsonObj = JSON.parse(output);
    const json = JSON.stringify(outputJsonObj, null, 2);
    return json;
  }

  private get outputSampleData() {
    this.sampleDataError = "";
    //if (!this.selectedAdapter) { return "When selecting a data adapter, sample data will be available to work with." }
    if (!this.inputSampleData) {
      return "{}";
    }
    try {
      if (
        this.settings.extractionStrategy == ExtractionStrategyEnum.Unredacted ||
        !this.settings.extractionStrategySettings
      ) {
        return this.inputSampleData; // non-transformed data
      } else {
        const jsonObj = JSON.parse(this.inputSampleData);
        const transformedData = search(
          jsonObj,
          this.settings.extractionStrategySettings
        );

        const str = JSON.stringify(transformedData, null, 2); // spacing level = 2

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const output = this.outputSampleComponentData; // trigger getting data;
        return str ?? "";
      }
    } catch (err) {
      this.sampleDataError = err.message;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const output = this.outputSampleComponentData; // trigger getting data;
      return "";
    }
  }

  private get outputSampleComponentData(): MetaDataComponentUpdate {
    if (!this.settingsPresentForSample) {
      return null;
    }

    const data = this.outputSampleData;

    var viewerSettings: MetaDataComponentAdapterSourceViewerSettings = {
      presentationType: this.settings.presentationType,
    };

    const sample: MetaDataComponentUpdate = {
      useBottomSlot: this.useBottomSlot,
      dataRetrievalSuccess: true,
      isFinalDataRetrievalAttempt: true,
      ticketId: generateId(),
      ticketMetaDataComponentId: generateId(),
      componentName: this.componentName,
      ready: true,
      debugMessages: [],
      componentData: data || "{}",
      sourceType: ComponentDataSourceTypeEnum.DataAdapter,
      viewerSettingsJson: JSON.stringify(viewerSettings),
      lastUpdateDate: null,
      lastUpdateDateTicks: null,
    };

    return sample;
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
