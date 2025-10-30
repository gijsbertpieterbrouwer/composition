<template>
  <div class="adapter-editor">

    <template v-if="loaded && this.adapter && !this.adapter.deleted">
      <TickScreen :title="editorTitle">

        <template v-slot:actions>

          <TickAddCostItemButton @add="copyAdapter" :requiredAuth="AuthorizationObjectType.TechnicalConfiguration" :costItem="SubscriptionCostItemType.DataAdapter" :currentNr="this.currentNr"
            :title="LanguagePath.App_Copy" :appearance="Appearance.secondary" :color="Color.contrast" />

          <TickButton v-if="allowEdit" @click="remove" :disabled="!allowDelete" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
          <TickButton v-if="allowEdit" @click="save" :disabled="!readyForSave">{{ $translate(LanguagePath.App_Save) }}</TickButton>

        </template>

        <template v-slot:default>
          <div class="editable">
            <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)">

              <TickInput :disabled="disabled" v-model="adapter.name" placeholder="name">{{ $translate(LanguagePath.App_Name) }}</TickInput>
              <TickSelector :disabled="disabled" v-model="adapter.logSetting" :options="logOptions">{{ $translate(LanguagePath.App_DataAdapterEditor_Execution_LogMethod_Title) }}</TickSelector>
              <!-- <TickSelector v-model="adapter.trigger" :options="triggerOptions">Trigger</TickSelector> -->

            </TickEditorPanel>

            <TickEditorPanel :name="$translate(LanguagePath.App_DataAdapterEditor_Chart_Title)">
              <TickTimelineChart class="chart" :series="adapterChartDataList" :isLoading="adapterChartDataIsLoading" :options="statChartsOptions" />
            </TickEditorPanel>


            <TickEditorPanel :name="$translate(LanguagePath.App_DataAdapterEditor_Execution_Title)">


              <!--<div>
                                           <TickSelector v-model="getExecutionEnvironmentId" :options="executionEnvironmentOptions">Environment</TickSelector> 
                                        </div>-->

              <div class="method-row">
                <TickSelector :disabled="disabled" v-model="adapter.executionSettings.method" :options="methodOptions" />
                <TickTextArea class="full" :disabled="disabled" v-model="adapter.executionSettings.apiUrl" placeholder="https://www.yourdomain.com/api/controller/action"
                  v-tokenize="{ locations: this.apiStorageLocations }" />
              </div>

              <EditorMessage v-if="!isValidWebhookUrl" :type="EditorMessageType.Warning" title="Valid URL required" :message="'Please specify a valid url'" />
              <EditorMessage v-if="showDomainVerificationWarning" :type="EditorMessageType.Warning" title="Verify domain first" :message="'In order to use this domain name please verify it first'" />

              <TickSwitch :disabled="disabled" v-model="adapter.executionSettings.retryOnFailure">{{ $translate(LanguagePath.App_DataAdapterEditor_Execution_Retry_Title) }}
              </TickSwitch>
              <EditorMessage v-if="adapter.executionSettings.retryOnFailure" :type="EditorMessageType.Message" title="Retry"
                :message="'When the API call fails due things like a timeout or getting an error-response Tick will retry a few times.'" />


              <TickHeading :size="HeadingSize.small">{{ $translate(LanguagePath.App_DataAdapterEditor_Execution_Headers_Title) }}</TickHeading>
              <TickSwitch :disabled="disabled" v-model="useAuthHeader">{{ $translate(LanguagePath.App_DataAdapterEditor_Execution_Headers_Auth_Title) }}</TickSwitch>

              <table class="styledTable">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <AdapterHeaderEditor v-if="useAuthHeader" :disabled="disabled" :isAuthHeader="true" class="header-item" v-model="getAuthHeader" />
                  <template v-for="(header, index) in this.getExecutionHeaders" :key="header.id">
                    <AdapterHeaderEditor :disabled="disabled" v-model="getExecutionHeaders[index]" class="header-item" :isAuthHeader="false" :allowRemove="allowEditHeaders" @remove="removeHeader" />
                  </template>
                </tbody>
              </table>

              <div class="add-header-wrapper">
                <TickButton v-if="allowEdit" @click="addEmptyHeader" icon="plus" :appearance="Appearance.secondary" :size="Size.mini" :color="Color.contrast">Add header</TickButton>
              </div>

              <TickHeading :size="HeadingSize.small">{{ $translate(LanguagePath.App_DataAdapterEditor_Execution_Body_Title) }}</TickHeading>
              <TickTextArea minimumrows="6" :disabled="disabled" v-model="adapter.executionSettings.bodyTemplate" v-tokenize="{ locations: this.apiStorageLocations }" />
            </TickEditorPanel>

            <TickEditorPanel name="Sample data">
              <div v-if="!hasResponse" class="section">
                <div class="header">

                </div>
                <div class="content">
                  No sample data present, hit the "Try" button to get some.

                  <TickButton @click="tryAdapter" :busy="isExecutingTry">{{ $translate(LanguagePath.App_DataAdapterEditor_Execution_Try_Title) }}</TickButton>
                </div>
              </div>

              <div v-if="hasResponse" class="section">
                <div class="header">
                  <div class="indicator" :class="getResponseIndicator"></div>

                  ({{ this.responseExecutionMs }} ms)

                  <div>HTTPCode:{{ this.responseResponseCode }}</div>
                  <div>Message: {{ this.responseMessage }}</div>

                </div>
                <div class="content">
                  <TickJsonViewer :json="responseResponseDataJson" />

                  <div class="flex-row">
                    <TickButton @click="removeTryLog" icon="delete" :appearance="Appearance.secondary" :size="Size.mini" :color="Color.contrast" />
                    <TickButton @click="tryAdapter" :busy="isExecutingTry" :appearance="Appearance.secondary" :size="Size.mini" :color="Color.contrast">{{
                      $translate(LanguagePath.App_DataAdapterEditor_Execution_Try_Title) }}</TickButton>
                  </div>
                </div>

              </div>
            </TickEditorPanel>

            <TickEditorPanel :name="$translate(LanguagePath.App_DataAdapterEditor_Result_Action_Title)">
              <div v-for="(action, index) in this.actionSettings" :key="action.id">
                <ThenHr v-if="index > 0" />
                <div class="section">
                  <AdapterResultActionEditor @try="tryAdapter" :disabled="disabled" :action="action" :allowRemove="canRemoveResultAction" :sampleResponseData="responseResponseDataJson"
                    @patch="patchActionSettingsJson" @remove="removeAction" />
                </div>
              </div>

              <TickButton icon="plus" v-if="allowEdit" @click="addEmptyResultAction" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.small">{{ $translate(LanguagePath.App_Add)
              }}
              </TickButton>
            </TickEditorPanel>


          </div>
        </template>
      </TickScreen>
    </template>
    <template>
      loading...
    </template>

  </div>
</template>

<script lang="ts">

import ThenHr from "@/components/atoms/ThenHr.vue";
import TickAddCostItemButton from "@/components/atoms/TickAddCostItemButton.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickHeading, { Size as HeadingSize } from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickJsonViewer from '@/components/atoms/TickJsonViewer.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { showObjectRemovalProgressPanel } from '@/components/panels/ObjectRemovalProgressPanel.vue';
import { tokenize } from '@/directives';
import { addAndNavToNewDataAdapter } from "@/helpers/collectionObjectHelper";
import { apiLogEnumOptions, apiMethodEnumOptions, getApiReadStorageLocations } from '@/helpers/enumsHelper';
import generateId from '@/helpers/guid';
import { askNewName } from "@/helpers/questionHelper";
import { stringIsValidURL } from '@/helpers/stringHelper';
import { getAdapterStatistics } from '@/services/DataAdaptersService';
import useCollectionsStore from "@/store/collections";
import useDataAdaptersStore from '@/store/dataadapters';
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import { AdapterTrigger, ApiAdapterExecutionLog, AuthorizationObjectType, ChartSerieData, CollectionObjectTypeEnum, DatabagStorageSettings, ExtractionStrategyEnum, LanguagePath, RemovalStatus, ResultAction, ResultActionType, StorageLocation, SubscriptionCostItemType, TemplateHeaderItem, TickApiAdapterDefinition } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import TickChart from '../charting/TickChart.vue';
import TickTimelineChart, { ChartOptions } from '../charting/TickTimelineChart.vue';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import EditorMessage, { EditorMessageType } from '../EditorMessage.vue';
import AdapterHeaderEditor from './AdapterHeaderEditor.vue';
import AdapterResultActionEditor, { actionPatch } from './AdapterResultActionEditor.vue';

@Component({
  directives: { tokenize },
  emits: ["deleted", "saved"],
  components: {
    TickInput, TickTextArea, AdapterResultActionEditor, TickButton, TickCheckbox, ThenHr, AdapterHeaderEditor, TickScreen,
    TickEditorPanel, TickSelector, TickSwitch, EditorMessage, TickJsonViewer, TickChart, TickTimelineChart, TickHeading, TickAddCostItemButton
  },

})
export default class AdapterEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  HeadingSize = HeadingSize
  EditorMessageType = EditorMessageType
  LanguagePath = LanguagePath
  AuthorizationObjectType = AuthorizationObjectType
  SubscriptionCostItemType = SubscriptionCostItemType

  @Prop() private activeId!: string;
  private adapter: TickApiAdapterDefinition = null;
  private loaded = false;

  private adapterChartDataList: ChartSerieData[] = null;
  private adapterChartDataIsLoading = false;

  private get currentNr() {
    return this.allItems.length;
  }

  private get allItems() {
    return useCollectionsStore().getByType(CollectionObjectTypeEnum.DataAdapter);
  }

  private copyAdapter() {
    if (this.disabled) { return; }

    askNewName((to) => {
      if (to) {
        addAndNavToNewDataAdapter(null, to, this.activeId);
      }
    }, "");
  }

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useDataAdaptersStore().get(id).then(adapter => {
      this.adapter = adapter;
      this.loaded = true;
    })

  }

  private get apiStorageLocations(): StorageLocation[] {
    return getApiReadStorageLocations()
  }

  private get actionSettings() {
    return this.adapter?.resultActionsSettings?.actionsSettings || [];
  }

  mounted() {
    this.activate(this.activeId);

    getAdapterStatistics(useUserStore().activeWorkspaceId, this.activeId).then(
      (chartDatas) => {
        this.adapterChartDataIsLoading = true;

        this.adapterChartDataList = chartDatas;
        this.adapterChartDataIsLoading = false;
      }
    );
  }

  private get statChartsOptions(): ChartOptions {
    return {
      height: 100,
      showDetails: false,
      showStacked: true,
    }
  }

  private get showDomainVerificationWarning(): boolean {
    if (!this.isValidWebhookUrl) { return false; } // another warning is shown
    const isVerified = this.domainIsVerified;

    return !isVerified;
  }

  private get domainIsVerified() {
    return useUtilityDataStore().urlIsWithinVerifiedDomain(this.adapter.executionSettings.apiUrl);
  }

  private get isValidWebhookUrl(): boolean {

    return stringIsValidURL(this.adapter.executionSettings.apiUrl);
  }


  private get disabled() {
    return !this.allowEdit;
  }

  private get allowEdit() {

    return this.adapter
      && !this.adapter.deleted
      && useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration);
  }

  private get allowDelete() {
    return this.allowEdit;
  }



  private get editorTitle() {
    return this.adapter.name;
  }

  private get readyForSave() {
    return this.allowEdit && this.isValidWebhookUrl && this.domainIsVerified;
  }

  private get getAuthHeader() {
    return this.adapter.executionSettings.authHeader || {
      key: "",
      value: "",
      id: generateId()
    }
  }

  private set getAuthHeader(to: TemplateHeaderItem) {
    this.adapter.executionSettings.authHeader = to;
  }

  private get allowEditHeaders() {
    return this.allowEdit;
  }


  private removeHeader(header: TemplateHeaderItem) {
    const headerIndex = this.adapter.executionSettings.headers.findIndex(a => a.id == header.id);
    if (headerIndex != -1) {
      this.adapter.executionSettings.headers.splice(headerIndex, 1);
    }

  }

  private get canRemoveResultAction() {
    return this.allowEdit;
  }

  private removeAction(action: ResultAction) {
    // if (this.actionSettings.length <= 1) {
    //   notifyError("Cannot remove", "Cannot remove this action since an adapter needs at leas one result action");
    //   return;
    // }

    const actionIndex = this.adapter.resultActionsSettings.actionsSettings.findIndex(a => a.id == action.id);
    if (actionIndex != -1) {
      this.adapter.resultActionsSettings.actionsSettings.splice(actionIndex, 1);
    }

  }

  private patchActionSettingsJson(patch: actionPatch) {
    const action = this.adapter.resultActionsSettings.actionsSettings.find(a => a.id == patch.id);
    action.settingsJson = patch.settingsJson;

    this.adapter.resultActionsSettings.actionsSettings = this.adapter.resultActionsSettings.actionsSettings.slice();
  }



  private addEmptyHeader() {
    var newHeader: TemplateHeaderItem = {
      key: "",
      value: "",
      id: generateId(),
    }

    this.adapter.executionSettings.headers = this.adapter.executionSettings.headers || [];
    this.adapter.executionSettings.headers.push(newHeader);
  }


  private addEmptyResultAction() {

    const newActionSettings: DatabagStorageSettings = {
      name: "",
      extractionStrategy: ExtractionStrategyEnum.Unredacted,
      extractionStrategySettings: "",
      resultActionType: ResultActionType.StoreInDatabag,
      //storageLocation: StorageLocation.Flow,
      storagePath: "",
      //dataType: DataItemDataType.Object,
    };

    const newAction: ResultAction = {
      id: generateId(),
      resultActionType: ResultActionType.StoreInDatabag,
      settingsJson: JSON.stringify(newActionSettings),
    }

    this.adapter.resultActionsSettings.actionsSettings.push(newAction);
  }


  private get useAuthHeader() {
    return this.adapter.executionSettings.useAuthHeader ?? false;
  }

  private set useAuthHeader(to: boolean) {
    this.adapter.executionSettings.useAuthHeader = to;
  }

  private remove() {

    useDataAdaptersStore().delete(this.activeId).then(progress => {
      if (progress.removalStatus != RemovalStatus.Failed) {
        this.$emit("deleted");
      } else {
        showObjectRemovalProgressPanel(progress)
      }
    });


  }


  private save() {
    useDataAdaptersStore().save(this.activeId).then(() => {
      this.$emit("saved");
    });
  }

  private tryAdapter() {
    useDataAdaptersStore().executeTry(this.adapter);
  }

  private get isExecutingTry(): boolean {
    return useDataAdaptersStore().isBusyOnTry(this.adapter.id);
  }


  private removeTryLog() {

    useDataAdaptersStore().removeTryLog(this.adapter.id);
  }
  private get hasResponse() {
    const r = this.getResponse;
    return r != null;
  }

  private get getResponse(): ApiAdapterExecutionLog {
    const logs = useDataAdaptersStore().getTryLog(this.adapter.id);
    return logs ? logs : null;
  }

  private get getResponseIndicator() {
    const r = this.getResponse;
    if (!r) { return ""; }
    return r.success ? "success" : "failure";
  }

  private get responseExecutionMs() {
    const r = this.getResponse;
    if (!r) { return ""; }
    return r.executionMs;
  }
  private get responseMessage() {
    const r = this.getResponse;
    if (!r) { return ""; }
    return r.message;
  }

  private get responseSuccess() {
    const r = this.getResponse;
    if (!r) { return ""; }
    return r.success;
  }
  private get responseResponseCode() {
    const r = this.getResponse;
    if (!r) { return ""; }
    return r.responseCode ?? '';
  }

  private get responseResponseDataJson() {
    const r = this.getResponse;
    if (!r || !r.responseDataJson) { return ""; }

    const jsonObj = JSON.parse(r.responseDataJson);
    const str = JSON.stringify(jsonObj, null, 2); // spacing level = 2
    return str ?? '';
  }


  private get getExecutionEnvironmentId() {
    return this.adapter.executionEnvironmentId;
  }
  private set getExecutionEnvironmentId(to: string) {
    this.adapter.executionEnvironmentId = to;
  }

  private get executionEnvironmentOptions() {
    const environments = useUtilityDataStore().utilityData.executionEnvironments

    const options = environments.map((env) => ({
      text: env.name,
      value: env.id,
    }))
    return options;

  }


  private get getExecutionHeaders() {
    return this.adapter.executionSettings.headers || [];
  }

  private get triggerOptions() {
    const list = [
      {
        text: "Auto ",
        value: AdapterTrigger.Automatic,
      },
      {
        text: "Manual",
        value: AdapterTrigger.Manual,
      },
    ];

    return list;
  }

  private get methodOptions() {
    return apiMethodEnumOptions();
  }
  private get logOptions() {
    return apiLogEnumOptions();
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.method-row {
  display: flex;
  gap: 10px;
  background-color: var(--c-base-300);

  .full {
    flex-grow: 10;
  }

}

.adapter-editor {


  .editable {
    padding: 20px;
  }

  .footer {
    padding: 20px;
    background-color: #fff;
  }


  .divider {
    width: 600px;
    align-items: center;
    margin-bottom: 10px;
  }

  .section {
    .indicator {
      display: inline-block;
      width: 20px;
      border-radius: 20px;
      height: 20px;


      &.success {
        background-color: $success;
      }

      &.failure {
        background-color: $warning;
      }
    }

  }


  .headers-grid {
    display: grid;
    gap: 5px;

    .header-item {}

  }

  .add-header-wrapper {
    display: grid;
    align-items: center;
    justify-items: center;
  }

  .flex-row {
    display: flex;
    align-items: center;
    justify-items: center;
    gap: 10px;
  }


}
</style>
