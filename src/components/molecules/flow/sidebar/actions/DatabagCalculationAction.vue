<template>
  <div class="action">
    <SidebarPanel id="Calculation-general" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Calculate_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_Calculate_Explanation) }}
      </template>

      <DatabagItemSelector v-model="input1Path" :locations="availableReadStorageLocations" :disabled="disabled" :allowCustomValue="true" :defaultNewStorageLocation="StorageLocation.Flow" />
      <TickSelector v-model="operator" :options="operatorOptions" :disabled="disabled" />
      <DatabagItemSelector v-model="input2Path" :locations="availableReadStorageLocations" :disabled="disabled" :allowCustomValue="true" :defaultNewStorageLocation="StorageLocation.Flow" />
    </SidebarPanel>

    <SidebarPanel id="Calculation-limis" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Calculate_Limits_Title)">
      <template #header>
        <TickSwitch v-model="useOutputLimits" :disabled="disabled" />
      </template>

      <template v-if="useOutputLimits">
        <DatabagItemSelector v-model="minStoragePath" :locations="availableReadStorageLocations" :disabled="disabled" :allowCustomValue="true">Min</DatabagItemSelector>
        <DatabagItemSelector v-model="maxStoragePath" :locations="availableReadStorageLocations" :disabled="disabled" :allowCustomValue="true">Max</DatabagItemSelector>
      </template>
    </SidebarPanel>

    <SidebarPanel id="Calculation-store" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Calculate_Storage_Title)">
      <template #header>

      </template>
      <DatabagItemSelector v-model="storagePath" :locations="availableWriteStorageLocations" :disabled="disabled" :defaultNewStorageLocation="StorageLocation.Flow" />
    </SidebarPanel>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { FlowDefinitionAction, DatabagCalculateOperator, FlowActionDatabagSettings, DatabagCalculateSettingsData, StorageLocation, LanguagePath } from "@/TickApi";
import { jsonProxy } from "@/helpers/jsonProxy";
import TickSelector from '@/components/atoms/TickSelector.vue';
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import { getDatabagCalculateOperatorOptions, getFlowReadStorageLocations, getFlowWriteStorageLocations, getStorageLocationOptions } from '@/helpers/enumsHelper';
import DatabagItemSelector from '@/components/molecules/Selectors/DatabagItemSelector.vue';

@Component({
  emits: ["remove", "update"],
  components: { SidebarPanel, TickSelector, TickSwitch, DatabagItemSelector },
})
export default class DatabagCalculationAction extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  StorageLocation = StorageLocation
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: FlowActionDatabagSettings;
  @Prop() private disabled!: boolean;


  private get data() {
    return jsonProxy<DatabagCalculateSettingsData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }
  private get dataForCalculation(): DatabagCalculateSettingsData {
    return this.data as never;
  }

  private get availableWriteStorageLocations(): StorageLocation[] {
    return getFlowWriteStorageLocations();
  }

  private get availableReadStorageLocations(): StorageLocation[] {
    return getFlowReadStorageLocations();
  }


  //LIMITS
  private get useOutputLimits() {
    return this.data.useLimitOutput
  }

  private set useOutputLimits(to: boolean) {
    this.data.useLimitOutput = to;
  }

  private get minStoragePath() {
    return this.data.minimalOutputReferenceInputPath;
  }
  private set minStoragePath(to: string) {
    this.data.minimalOutputReferenceInputPath = to;
  }

  private get maxStoragePath() {
    return this.data.maximallOutputReferenceInputPath;
  }
  private set maxStoragePath(to: string) {
    this.data.maximallOutputReferenceInputPath = to;
  }


  private get operator() {
    return this.data.operator;
  }

  private set operator(to: DatabagCalculateOperator) {
    this.data.operator = to;
  }

  private get inputLocationOptions() {
    return getStorageLocationOptions(true, false);
  }

  private get storageLocationOptions() {
    return getStorageLocationOptions(false, false);
  }

  private get operatorOptions() {
    return getDatabagCalculateOperatorOptions();
  }

  private get input1Path() {
    return this.data.referenceInput1;
  }
  private set input1Path(to: string) {
    this.data.referenceInput1 = to;
  }

  private get input2Path() {
    return this.data.referenceInput2;
  }
  private set input2Path(to: string) {
    this.data.referenceInput2 = to;
  }


  private get storagePath() {
    return this.data.storeStoragePath;
  }
  private set storagePath(to: string) {
    this.data.storeStoragePath = to;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
