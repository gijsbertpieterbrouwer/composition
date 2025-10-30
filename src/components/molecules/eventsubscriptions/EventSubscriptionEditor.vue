<template>
  <div>

    <template v-if="loaded && this.data">

      <TickScreen :title="name">
        <template v-slot:actions>
          <TickButton v-if="allowEdit" @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
          <TickButton v-if="allowEdit" @click="save" :disabled="!readyForSave">{{ $translate(LanguagePath.App_Save) }}</TickButton>
        </template>

        <template v-slot:default>
          <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)">
            <TickInput :disabled="disabled" v-model="name" placeholder="name">{{ $translate(LanguagePath.App_Name) }}</TickInput>
            <TickSelector :disabled="disabled" v-model="objectType" :options="eventTypeOptions">{{ $translate(LanguagePath.App_EventSubscriptionEditor_Trigger_Title) }}</TickSelector>
            <TickCheckbox :disabled="disabled" v-model="active">{{ $translate(LanguagePath.App_EventSubscriptionEditor_Active_Title) }}</TickCheckbox>

          </TickEditorPanel>
          <TickEditorPanel :name="$translate(LanguagePath.App_EventSubscriptionEditor_Stats_Title)">
            <TickTimelineChart class="chart" :series="adapterChartDatas" :isLoading="adapterChartDataIsLoading" :options="statChartsOptions" />
          </TickEditorPanel>

          <TickEditorPanel :name="$translate(LanguagePath.App_EventSubscriptionEditor_Execution_Title)">
            <div class="execution section">
              <div class="content">

                <div class="method-row">
                  <TickTextArea class="full" :wrap="'hard'" :cols="20" minimumrows="3" :disabled="disabled" v-model="apiUrl" placeholder="https://www.yourdomain.com/api/controller/action" />
                </div>
                <EditorMessage v-if="!isValidWebhookUrl" :type="EditorMessageType.Warning" title="Valid URL required" :message="'Please sepcify a valid url'" />
                <EditorMessage v-if="showDomainVerificationWarning" :type="EditorMessageType.Warning" title="Verify domain first"
                  :message="'In order to use this domain name please verify it first'" />
                <div>
                  Headers
                  <div class="auth-header">
                    <TickSwitch :disabled="disabled" v-model="useAuthHeader">Use authentication header</TickSwitch>
                    <div v-if="useAuthHeader">
                      <AdapterHeaderEditor :disabled="disabled" isAuthHeader="true" class="header-item" v-model="getAuthHeader" />
                    </div>
                  </div>

                  <div class="headers-grid">
                    <template v-for="(header, index) in this.getExecutionHeaders" :key="header.id">
                      <AdapterHeaderEditor :disabled="disabled" v-model="getExecutionHeaders[index]" class="header-item" :isAuthHeader="false" :allowRemove="allowEdit" @remove="removeHeader" />
                    </template>
                  </div>
                  <div class="add-header-wrapper">
                    <TickButton v-if="allowEdit" class="outline" @click="addEmptyHeader" :appearance="Appearance.secondary">Add header</TickButton>
                  </div>

                </div>

                <div>
                  <TickSwitch :disabled="disabled" v-model="retryOnFailure">{{ $translate(LanguagePath.App_EventSubscriptionEditor_Execution_Retry_Title) }}</TickSwitch>
                </div>
              </div>

            </div>
          </TickEditorPanel>




        </template>
      </TickScreen>
    </template>
    <template v-else>
      loading...
    </template>

  </div>
</template>

<script lang="ts">

import LabelList from '@/components/atoms/LabelList.vue';
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import { AuthorizationObjectType, ChartSerieData, EventObjectType, EventType, LanguagePath, TemplateHeaderItem, TickEventSubscription } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import TickTimelineChart, { ChartOptions } from '../charting/TickTimelineChart.vue';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
//import AdapterHeaderEditor from './AdapterHeaderEditor.vue';
import { getEventObjectTypeOptions } from '@/helpers/enumsHelper';
import generateId from '@/helpers/guid';
import { stringIsValidURL } from '@/helpers/stringHelper';
import useEventSubscriptionsStore from '@/store/eventSubscriptions';
import AdapterHeaderEditor from '../dataadapters/AdapterHeaderEditor.vue';

import TickSelector from '@/components/atoms/TickSelector.vue';
import { getAdapterStatistics } from '@/services/DataAdaptersService';
import EditorMessage, { EditorMessageType } from '../EditorMessage.vue';

@Component({
  emits: ["deleted", "saved"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, TickScreen, TickEditorPanel, TickDropdown, LabelList, TickSwitch, AdapterHeaderEditor, TickSelector, EditorMessage, TickTimelineChart },
})
export default class EventSubscriptionEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  EditorMessageType = EditorMessageType
  LanguagePath = LanguagePath;

  @Prop() private activeId!: string;
  private data: TickEventSubscription = null;
  private loaded = false;

  private adapterChartDatas: ChartSerieData[] = null;
  private adapterChartDataIsLoading = false;

  private get statChartsOptions(): ChartOptions {
    return {
      height: 100,
      showDetails: false,
      showStacked: true,
    }
  }

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useEventSubscriptionsStore().get(id).then(data => {
      this.data = data;
      this.loaded = true;

      this.loadAdapterStats(data.usedAdapterId);
    })
  }

  private loadAdapterStats(adapterId: string) {
    getAdapterStatistics(useUserStore().activeWorkspaceId, adapterId).then(
      (chartDatas) => {
        this.adapterChartDataIsLoading = true;

        this.adapterChartDatas = chartDatas;
        this.adapterChartDataIsLoading = false;
      }
    );
  }

  mounted() {
    this.activate(this.activeId);

  }

  private get active() {
    return this.data.active;
  }
  private set active(to: boolean) {
    this.data.active = to;
  }

  private get showDomainVerificationWarning(): boolean {
    if (!this.isValidWebhookUrl) { return false; } // another warning is shown
    const isVerified = this.domainIsVerified

    return !isVerified;
  }

  private get domainIsVerified() {
    return useUtilityDataStore().urlIsWithinVerifiedDomain(this.apiUrl);
  }

  private get isValidWebhookUrl(): boolean {
    return stringIsValidURL(this.apiUrl);
  }

  private get disabled() {
    return !this.allowEdit;
  }
  private get allowEdit() {
    return useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration)
  }



  private get name() {
    return this.data.name;
  }

  private set name(to: string) {
    this.data.name = to;
  }



  private get apiUrl() {
    return this.data.apiUrl || "";
  }

  private set apiUrl(to: string) {
    this.data.apiUrl = to;
  }


  private get eventTypeOptions() {
    return getEventObjectTypeOptions();
  }
  private get objectType() {
    return this.data.objectType;
  }

  private set objectType(to: EventObjectType) {
    this.data.objectType = to;
  }

  private get eventType() {
    return this.data.eventType;
  }

  private set eventType(to: EventType) {
    this.data.eventType = to;
  }

  private get objectId() {
    return this.data.objectId;
  }

  private set objectId(to: string) {
    this.data.objectId = to;
  }


  private get useAuthHeader() {
    return this.data.useAuthHeader;
  }

  private set useAuthHeader(to: boolean) {
    this.data.useAuthHeader = to;
  }
  private get retryOnFailure() {
    return this.data.retryOnFailure;
  }

  private set retryOnFailure(to: boolean) {
    this.data.retryOnFailure = to;
  }
  private get getAuthHeader() {
    return this.data.authHeader || {
      key: "",
      value: "",
      id: generateId()
    }
  }

  private set getAuthHeader(to: TemplateHeaderItem) {
    this.data.authHeader = to;
  }


  private get getExecutionHeaders() {
    return this.data.headers || [];
  }



  private addEmptyHeader() {
    var newHeader: TemplateHeaderItem = {
      key: "",
      value: "",
      id: generateId(),
    }

    this.data.headers = this.data.headers || [];
    this.data.headers.push(newHeader);
  }


  private removeHeader(header: TemplateHeaderItem) {
    const headerIndex = this.data.headers.findIndex(a => a.id == header.id);
    if (headerIndex != -1) {
      this.data.headers.splice(headerIndex, 1);
    }

  }


  private get readyForSave() {
    return this.allowEdit && this.isValidWebhookUrl && this.domainIsVerified;
  }

  private save() {
    useEventSubscriptionsStore().save(this.data.id);
    this.$emit("saved");
  }
  private remove() {
    useEventSubscriptionsStore().delete(this.data.id);
    this.$emit("deleted");
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
</style>
