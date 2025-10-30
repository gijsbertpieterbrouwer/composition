<template>
  <div class="editor">
    <template v-if="loaded">
      <TickScreen icon="sla" :title="name">
        <template v-slot:actions>
          <TickButton @click="remove" v-if="deleteallowed" :busy="busyDeleting" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
          <TickButton @click="save" v-if="editallowed" :disabled="!readyForSave" :busy="busySaving">{{ $translate(LanguagePath.App_Save) }}</TickButton>
        </template>

        <template v-slot:default>
          <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)">
            <EditorMessage v-if="!settingsPresentForActivation" :type="EditorMessageType.Message" title="Configure first" message="Configure the sla first and then choose to activate it." />

            <TickInput v-model="sla.name">{{ $translate(LanguagePath.App_Name) }}</TickInput>
            <TickCheckbox v-model="active" :disabled="!settingsPresentForActivation">{{ $translate(LanguagePath.App_SLAEditor_Active_Title) }}</TickCheckbox>
            <div class="explainer success" v-if="settingsPresentForActivation && !this.active">
              {{ $translate(LanguagePath.App_SLAEditor_Ready_For_Active_Title) }}
            </div>
            <div class="explainer " :class="{ 'success': this.isRunning, 'warning': !this.isRunning }" v-if="settingsPresentForActivation && this.active">
              <template v-if="isRunning">{{ $translate(LanguagePath.App_SLAEditor_Active_IsActive) }}</template>
              <template v-else>
                <EditorMessage :type="EditorMessageType.Warning" title="NOT running" message=" The SLA is not running because it needs more configuration" />
              </template>
            </div>

            <div class="flex-row">
              <TickInput type="date" v-model="startDate">{{ $translate(LanguagePath.App_SLAEditor_Active_From_Title) }}</TickInput>
              <TickInput type="date" v-model="endDate">{{ $translate(LanguagePath.App_SLAEditor_Active_To_Title) }}</TickInput>
            </div>
          </TickEditorPanel>

          <TickEditorPanel :name="$translate(LanguagePath.App_SLAEditor_StartCriteria_Title)">
            <template v-slot:explainer>

              {{ $translate(LanguagePath.App_SLAEditor_StartCriteria_Explanation) }}
            </template>

            <div class="container">
              <div>
                <TickHeading size="small">{{ $translate(LanguagePath.App_SLAEditor_For_Channels_Title) }}</TickHeading>
                <CommunicationChannelsSelector v-model="startOnCommunicationChannelIds" />
              </div>

              <div class="startcontainer">
                <TickHeading size="small">{{ $translate(LanguagePath.App_SLAEditor_TriggerRequirements_Title) }}</TickHeading>
                <div class="conditionButtons">
                  <LabelsSelector :disabled="disabled" v-model="startlabelIds" />
                  <TickButton @click="setStartCondition('setStartCondition')" ref="setStartCondition" v-if="editallowed" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini">
                    {{ $translate(LanguagePath.App_SLAEditor_TriggerRequirements_conditions_Title) }}
                  </TickButton>
                </div>
              </div>

              <div>
                <TickHeading size="small"> {{ $translate(LanguagePath.App_SLAEditor_Skip_requirements_Title) }}</TickHeading>
                <div class="conditionButtons">
                  <LabelsSelector :disabled="disabled" v-model="skiplabelIds" />
                  <TickButton @click="setSkipCondition('setSkipCondition')" ref="setSkipCondition" v-if="editallowed" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini"> {{
                    $translate(LanguagePath.App_SLAEditor_TriggerRequirements_conditions_Title) }}</TickButton>
                </div>
              </div>
            </div>
          </TickEditorPanel>

          <SlaDefinitionResponseTimeEditor v-if="sla.slaType == SlaType.ResponseTime" v-model="sla.slaSettingsJson" :disabled="!editallowed" />
          <SlaDefinitionMessageCountEditor v-if="sla.slaType == SlaType.OutboundMessageCount" v-model="sla.slaSettingsJson" :disabled="!editallowed" />

          <TickEditorPanel :name="$translate(LanguagePath.App_SLAEditor_FailureSettings_Title)">
            <TickCheckbox v-model="showResultInTick">{{ $translate(LanguagePath.App_SLAEditor_FailureSettings_Timeline_Title) }}</TickCheckbox>
            <br /><br />
            <TickHeading :size="HeadingSize.small">{{ $translate(LanguagePath.App_Notifications) }}</TickHeading>
            <table class="styledTable">

              <tbody>
                <template v-for="(notificationItem, index) in this.notificationRules" :key="notificationItem">
                  <SlaDefinitionNotificationSettingEditor :disabled="!editallowed" v-model="notificationRules[index]" @remove="removeNotificationRule(index)" />
                </template>
              </tbody>
            </table>


            <template v-if="!hasNotificationSettings">
              <div class="explainer"> {{ $translate(LanguagePath.App_SLAEditor_FailureSettings_NoData) }}</div>

            </template>
            <TickButton v-if="allowAddNotificationSetting" @click="createEmptyNotificationSetting" :icon="'plus'" :appearance="Appearance.secondary" :color="Color.contrast">
              {{ $translate(LanguagePath.App_Add) }}
            </TickButton>

          </TickEditorPanel>

          <TickEditorPanel :name="$translate(LanguagePath.App_SLAEditor_FailureChart_Title)">
            <TickChart class="chart" :chart="slaChartData" :isLoading="slaChartDataIsLoading" />
          </TickEditorPanel>


        </template>
      </TickScreen>
    </template>
    <template v-else> loading... </template>
  </div>
</template>

<script lang="ts">
import LabelList from "@/components/atoms/LabelList.vue";
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from "@/components/atoms/TickDropdown.vue";
import TickHeading, { Size as HeadingSize } from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickConditionGroupEditor from "@/components/molecules/flow/panel/TickConditionGroupEditor.vue";
import { getEmptyConditiongroup } from "@/helpers/conditionHelper";
import {
  ensureIsDate,
  inputValueToServerDate,
  serverDateToInputValue
} from "@/helpers/dateHelper";
import { jsonProxy } from "@/helpers/jsonProxy";
import { mount, unmount } from "@/helpers/mountHelper";
import useManagingStore from "@/store/managingStore";
import useUserStore from "@/store/user";
import {
  AuthorizationObjectType,
  ConditionGroup,
  IChartData,
  LanguagePath,
  SlaNotificationTypeEnum,
  SlaType,
  TickSlaDefinitionData,
} from "@/TickApi";
import { Component, Prop, Vue, Watch } from "vue-facing-decorator";
import ChannelLabel from "../channel/ChannelLabel.vue";
import TickEditorPanel from "../editor/TickEditorPanel.vue";
import TickScreen from "../editor/TickScreen.vue";
import ConditionEditorPanel from "../flow/panel/ConditionEditorPanel.vue";

import TickSwitch from "@/components/atoms/TickSwitch.vue";
import TickChartBase from "@/components/molecules/charting/TickChartBase.vue";
import EditorMessage, { EditorMessageType } from "@/components/molecules/EditorMessage.vue";
import LabelsSelector from '@/components/molecules/Selectors/LabelsSelector.vue';
import { getSlaNotificationTypeEnumOptions } from "@/helpers/enumsHelper";
import { onConfirmation } from "@/helpers/questionHelper";
import { getSlaStatistics } from "@/services/SlaService";
import TickChart from "../charting/TickChart.vue";
import TickCondition from "../flow/panel/TickCondition.vue";
import TickConditionElement from "../flow/panel/TickConditionElement.vue";
import CommunicationChannelsSelector from "../Selectors/CommunicationChannelsSelector.vue";
import SlaDefinitionMessageCountEditor from "./SlaDefinitionMessageCountEditor.vue";
import SlaDefinitionNotificationSettingEditor from "./SlaDefinitionNotificationSettingEditor.vue";
import SlaDefinitionResponseTimeEditor from "./SlaDefinitionResponseTimeEditor.vue";

// interface Stat {
//   name: string;
//   tooltipName: any;
//   min: number;
//   max: number;
//   avg: number;
// }

@Component({
  emits: ["deleted", "saved", "sampledatachange"],
  components: {
    TickInput,
    TickTextArea,
    TickButton,
    TickCheckbox,
    ThenHr,
    TickScreen,
    TickEditorPanel,

    LabelList,
    ConditionEditorPanel,
    TickConditionGroupEditor,
    TickDropdown,
    TickSelector,
    TickHeading,
    ChannelLabel,
    TickChartBase,
    LabelsSelector,
    TickChart,
    SlaDefinitionResponseTimeEditor,
    SlaDefinitionMessageCountEditor,
    CommunicationChannelsSelector,
    SlaDefinitionNotificationSettingEditor,
    TickSwitch,
    EditorMessage
  },
})
export default class SlaDefinitionEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  HeadingSize = HeadingSize
  EditorMessageType = EditorMessageType
  LanguagePath = LanguagePath

  @Prop() private activeId!: string;
  private sla: TickSlaDefinitionData = null;
  SlaType = SlaType;

  private loaded = false;
  private busySaving = false;
  private busyDeleting = false;

  private slaChartData: IChartData = null;
  private slaChartDataIsLoading = true;

  private get notificationTypeOptions() {
    return getSlaNotificationTypeEnumOptions();
  }

  private get notificationTypesNotInUse() {
    return this.notificationTypeOptions.filter(p => !this.notificationRules.some(r => r.type == p.value)) || [];
  }

  private get allowAddNotificationSetting(): boolean {

    //const typesNotInUse = this.notificationTypeOptions.filter(p => !this.notificationRules.some(r => r.type == p.value)) || [];
    //const typesToAddAvailable = typesNotInUse.length > 0;

    return this.editallowed; //&& typesToAddAvailable;
  }

  private get disabled() {
    return !this.editallowed;
  }

  private get hasNotificationSettings(): boolean {
    return this.notificationRules.length > 0;
  }

  private get notificationRules() {
    return this.sla.notificationSettings?.items || [];
  }

  private removeNotificationRule(index: number) {
    this.sla.notificationSettings.items.splice(index, 1);
  }

  private createEmptyNotificationSetting() {
    const notUsed = this.notificationTypesNotInUse;

    this.sla.notificationSettings.items.push({
      teamIds: [],
      type: notUsed.length ? notUsed[0].value : SlaNotificationTypeEnum.Notification,
      userIds: [useUserStore().userId],
    })
  }


  private get settingsPresentForActivation() {
    const c = this.sla;
    if (
      !c.startOnCommunicationChannelIds ||
      !c.startOnCommunicationChannelIds.length
    ) {
      return false;
    }

    return true;
  }

  private activePanel = {
    group: "",
    panelId: "",
    optionId: "",
  };

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useManagingStore()
      .getSlaDefinition(id)
      .then((sla) => {
        this.sla = sla;
        this.loaded = true;
      });
  }

  mounted() {
    this.activate(this.activeId);

    this.slaChartDataIsLoading = true;
    getSlaStatistics(useUserStore().activeWorkspaceId, this.activeId).then(
      (chartData) => {
        this.slaChartData = chartData;
        this.slaChartDataIsLoading = false;
      }
    );
  }

  private get startlabelIds() {
    return this.sla.startOnLabels || [];
  }

  private set startlabelIds(to: string[]) {
    this.sla.startOnLabels = to;
    this.sla.skipOnLabels = this.sla.skipOnLabels.filter(p => !to.some(t => t == p));
  }

  private get skiplabelIds() {
    return this.sla.skipOnLabels || [];
  }

  private set skiplabelIds(to: string[]) {
    this.sla.skipOnLabels = to;
    this.sla.startOnLabels = this.sla.startOnLabels.filter(p => !to.some(t => t == p));
  }

  private get startDate() {
    return serverDateToInputValue(this.sla.startDate);
  }

  private set startDate(to: string) {
    this.sla.startDate = inputValueToServerDate(to);
  }

  private get endDate() {
    return serverDateToInputValue(this.sla.endDate);
  }

  private set endDate(to: string) {
    this.sla.endDate = inputValueToServerDate(to);
  }

  private get showResultInTick() {
    return this.sla.showInTick;
  }
  private set showResultInTick(to: boolean) {
    this.sla.showInTick = to;
  }


  private get active() {
    return this.sla.active;
  }
  private set active(to: boolean) {
    this.sla.active = to;
  }

  private get isRunning(): boolean {
    if (!this.active) { return false; }
    const from = this.startDate ? ensureIsDate(this.startDate) : null;
    const to = this.endDate ? ensureIsDate(this.endDate) : null;
    var now = new Date();

    if (from) {
      if (from > now) { return false; }
    }


    if (to) {
      if (to < now) { return false; }
    }
    return true;
  }

  // private get channelsOptions() {
  //   const all = useUtilityDataStore().utilityData.communicationChannels;

  //   const used = this.startOnCommunicationChannelIds || [];
  //   const filtered = all.filter((p) => !used.some((s) => s == p.id));

  //   let options = filtered.map((item) => ({
  //     text: item.name,
  //     id: item.id,
  //   }));
  //   return options;
  // }

  // private removeChannel(channelId: string) {
  //   const index = this.sla.startOnCommunicationChannelIds.findIndex(
  //     (p) => p == channelId
  //   );
  //   if (index > -1) {
  //     this.sla.startOnCommunicationChannelIds.splice(index, 1);

  //     //fixme: proxy needs to see array changes
  //     this.sla.startOnCommunicationChannelIds =
  //       this.sla.startOnCommunicationChannelIds.slice();
  //   }
  // }


  // private addStartOnCommunicationChannelId(to: string) {
  //   if (!this.sla.startOnCommunicationChannelIds) {
  //     this.sla.startOnCommunicationChannelIds = [];
  //   }
  //   this.sla.startOnCommunicationChannelIds.push(to);
  // }

  private get startOnCommunicationChannelIds() {
    return this.sla?.startOnCommunicationChannelIds || [];
  }

  private set startOnCommunicationChannelIds(to: string[]) {
    this.sla.startOnCommunicationChannelIds = to;
  }

  private get deleteallowed() {
    const allow = this.editallowed;
    return allow;
  }

  private get editallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration);
  }

  private get name() {
    return this.sla.name;
  }

  private get editorSubTitle() {
    return "edit mode";
  }

  private get readyForSave() {
    return true;
  }

  private save() {
    this.busySaving = true;

    useManagingStore()
      .saveSlaDefinition(this.sla.id)
      .then(() => {
        this.busySaving = false;
        this.$emit("saved");
      });
  }

  private remove() {
    onConfirmation(() => {

      this.busyDeleting = true;
      useManagingStore()
        .deleteSlaDefinition(this.sla.id)
        .then(
          () => {
            this.busyDeleting = false;
            this.$emit("deleted");
          },
          () => {
            this.busyDeleting = false;
          }
        );
    })


  }

  private closeActivePanel() {
    if (this.activePanel.panelId) {
      unmount(this.activePanel.panelId);
    }

    this.activePanel.group = "";
    this.activePanel.panelId = "";
    this.activePanel.optionId = "";
  }

  private ensureIsCondition(condition?: ConditionGroup) {
    if (!condition) {
      condition = getEmptyConditiongroup();
    }
    return condition;
  }

  private get getStartConditionSummary() {
    return this.startCondition.name || "condition";
  }

  private get getSkipConditionSummary() {
    return this.startCondition.name || "condition";
  }

  private get startCondition() {
    return jsonProxy<ConditionGroup>(
      this.sla.startConditionsJson || "{}",
      (json) => {
        this.sla.startConditionsJson = json;
      }
    );
  }

  private get skipCondition() {
    return jsonProxy<ConditionGroup>(
      this.sla.skipConditionsJson || "{}",
      (json) => {
        this.sla.skipConditionsJson = json;
      }
    );
  }

  private setStartCondition(fromRef: string) {
    this.ensureIsCondition(this.startCondition);

    this.toggleConditionPanelFor(fromRef, this.startCondition);
  }

  private setSkipCondition(fromRef: string) {
    this.ensureIsCondition(this.skipCondition);
    this.toggleConditionPanelFor(fromRef, this.skipCondition);
  }

  private toggleConditionPanelFor(fromRef: string, condition: ConditionGroup) {
    const isCurrentActivePanel =
      this.activePanel.group === fromRef &&
      this.activePanel.optionId === condition.id;
    this.closeActivePanel();

    if (isCurrentActivePanel) {
      return;
    }

    this.activePanel.group = fromRef;
    this.activePanel.optionId = condition.id;
    this.activePanel.panelId = this.openPanel(fromRef, {
      condition: condition,
    });
  }

  private patchConditionGroup(condition: ConditionGroup) {
    if (this.startCondition.id == condition.id) {
      this.sla.startConditionsJson = JSON.stringify(condition);
    }
    if (this.skipCondition.id == condition.id) {
      this.sla.skipConditionsJson = JSON.stringify(condition);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openPanel(id: string, props?: Record<string, any>) {

    return mount(
      ConditionEditorPanel,
      {
        props: {
          ...props,
        },
        events: {
          cancel: () => {
            this.closeActivePanel();
          },
          exit: (conditionGroup: ConditionGroup) => {
            this.patchConditionGroup(conditionGroup);
            this.closeActivePanel();
          },
        },
        loadComponents: [TickConditionElement, TickCondition, TickConditionGroupEditor]
      },
    );
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

  &.warning {
    color: $error;
  }
}

.container {
  display: grid;
  gap: 30px;
}

.channel-labels {
  margin-top: 5px;

  .channel-label {
    margin-right: 5px;
  }
}

.conditionButtons {
  display: flex;
  gap: 10px;

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

.flex-row {
  display: flex;
  gap: 5px;

  align-content: center;
  align-self: center;
  align-items: center;

  .periodNumber {
    width: 60px;
  }
}
</style>
