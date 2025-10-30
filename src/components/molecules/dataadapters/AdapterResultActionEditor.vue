<template>
  <div class="action-editor">

    <div class="header">

      <TickInput :disabled="disabled" v-model="name" placeholder="action name" />
      <TickButton v-if="allowRemove" @click="remove" :appearance="Appearance.secondary" icon="delete" :size="Size.mini" :color="Color.contrast">{{ $translate(LanguagePath.App_Remove) }}
      </TickButton>
    </div>
    <div class="content">

      <TickSelector v-model="extractionStrategy" :options="extractionStrategyOptions">{{ $translate(LanguagePath.App_DataAdapterEditor_ResultAction_Strategy_Title) }}</TickSelector>

      <div class="explainer">{{ $translate(LanguagePath.App_DataAdapterEditor_ResultAction_Strategy_JmesPath_Explainer) }}</div>
      <TickInput v-if="showExtractionStrategySettings" :disabled="disabled" v-model="extractionStrategySettings" placeholder="JMESPath" />

      <div v-if="showExtractionStrategySettings">
        <div class="row" v-if="sampleResponseData">

          <TickJsonViewer :json="outputSample" :noCollapse="true" @selectPath="jsonViewerSelect" :rootPath="extractionStrategySettings" />
        </div>

        <EditorMessage v-else :type="EditorMessageType.Message" title="Try first" message="No data to parse, hit the 'try API call' button first">
          <TickButton @click="$emit('try')" :appearance="Appearance.secondary" :size="Size.mini" :color="Color.contrast">Try API call </TickButton>
        </EditorMessage>
      </div>

      <hr />
      <div>
        <DatabagItemSelector :disabled="disabled" v-model="storagePath" :placeholder="'Storage path'" :locations="availableStorageLocations" :defaultNewStorageLocation="StorageLocation.Flow">{{
          $translate(LanguagePath.App_DataAdapterEditor_ResultAction_StoreAt) }}</DatabagItemSelector>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickJsonViewer from '@/components/atoms/TickJsonViewer.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { tokenize } from '@/directives';
import { extractionStrategyOptions, getStorageLocationOptions } from '@/helpers/enumsHelper';
import { jsonProxy } from '@/helpers/jsonProxy';
import { DatabagStorageSettings, ExtractionStrategyEnum, LanguagePath, ResultAction, StorageLocation } from '@/TickApi';
import { search } from '@metrichor/jmespath';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import EditorMessage, { EditorMessageType } from '../EditorMessage.vue';
import DatabagItemSelector from '../Selectors/DatabagItemSelector.vue';

export interface actionPatch {
  id: string;
  settingsJson: string;
}

@Component({
  directives: { tokenize },
  emits: ["patch", "remove", "try"],
  components: { TickInput, TickTextArea, TickSelector, TickButton, TickJsonViewer, DatabagItemSelector, EditorMessage },
})
export default class AdapterResultActionEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  EditorMessageType = EditorMessageType
  StorageLocation = StorageLocation
  LanguagePath = LanguagePath
  @Prop() private action!: ResultAction;
  @Prop() private sampleResponseData!: string;
  @Prop() private allowRemove!: boolean;
  @Prop() private disabled!: boolean;

  private jsonViewerSelect(path: string) {

    if (!this.showExtractionStrategySettings) { return; }
    this.data.extractionStrategySettings = path || "";
  }

  private remove() {
    this.$emit("remove", this.action);
  }

  private get data() {
    return jsonProxy<DatabagStorageSettings>(this.action.settingsJson || "{}", (json) => {
      const patch: actionPatch = {
        id: this.action.id,
        settingsJson: json,
      }
      this.$emit("patch", patch)
    });
  }

  private get availableStorageLocations(): StorageLocation[] {
    return this.storageLocationOptions.map((d) => d.value);
  }
  private get storageLocationOptions() {
    return getStorageLocationOptions(false, false);
  }

  private get name() {
    return this.data.name;
  }
  private set name(to: string) {
    this.data.name = to;
  }

  private get extractionStrategy() {
    return this.data.extractionStrategy;
  }
  private set extractionStrategy(to: ExtractionStrategyEnum) {
    this.data.extractionStrategy = to;
  }

  private get showExtractionStrategySettings() {
    return this.data.extractionStrategy == ExtractionStrategyEnum.JMESPath;
  }

  private get extractionStrategySettings() {
    return this.data.extractionStrategySettings;
  }
  private set extractionStrategySettings(to: string) {
    this.data.extractionStrategySettings = to;
  }

  // private get selectedStorageOption() {
  //   return this.data.storageLocation;
  // }
  // private set selectedStorageOption(to: StorageLocation) {
  //   this.data.storageLocation = to;
  // }

  private get storageOptions() {
    return getStorageLocationOptions(false, false);
  }

  private get storagePath() {
    return this.data.storagePath;
  }
  private set storagePath(to: string) {
    this.data.storagePath = to;
  }

  private get outputSample() {
    try {
      if (this.data.extractionStrategy == ExtractionStrategyEnum.Unredacted || !this.data.extractionStrategySettings) {
        return this.sampleResponseData;
      } else {
        const jsonObj = JSON.parse(this.sampleResponseData);
        const transformedData = search(jsonObj, this.data.extractionStrategySettings);

        const str = JSON.stringify(transformedData, null, 2); // spacing level = 2
        return str ?? "";
      }
    }
    catch (err) {
      return err.message;
    }
  }

  private get extractionStrategyOptions() {
    return extractionStrategyOptions();
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.explainer {
  font-size: $text-size-regular;
  font-style: italic;
}

.row {
  display: grid;
  gap: 10px;
}


.action-editor {
  .header {
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
    padding: 8px 0 8px 12px;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .delete {
      position: relative;
      left: 85%
    }

  }

  .content {
    //background-color: #fff;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    padding: 8px;
    gap: 8px;

  }


}
</style>
