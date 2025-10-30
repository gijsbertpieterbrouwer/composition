<template>
  <div class="action">



    <SidebarPanel id="message-question" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Question_Title)">
      <TickTextarea v-model="message" class="message" :disabled="disabled" v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }"
        placeholder="Type a question to send" />
    </SidebarPanel>


    <SidebarPanel id="message-sender" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_Title)">
      <TickSwitch v-model="useCustomSender" :disabled="disabled">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_UseCustom_Title) }}</TickSwitch>
      <TickSelector v-if="useCustomSender" v-model="customSendByUserId" :options="userOptions" :disabled="disabled" />
      <span v-else>{{ $translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_NoCustom_Title) }}</span>
    </SidebarPanel>

    <SidebarPanel id="message-validation" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Question_Validation_Title)">
      <TickSelector v-model="validationType" :options="validationOptions" :disabled="disabled" />
      <template v-if="validationType === ValidationTypeEnum.Custom">
        <TickInput v-model.lazy="answerExtractionRegEx" placeholder="Regular expression" :disabled="disabled">
          {{ $translate(LanguagePath.App_FlowEditor_SideBar_Question_Validation_RegexExtraction_Title) }}</TickInput>
        <TickInput v-model.lazy="validationRegEx" placeholder="Regular expression" :disabled="disabled">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Question_Validation_RegexValidation_Title) }}
        </TickInput>
      </template>


      {{ $translate(LanguagePath.App_FlowEditor_SideBar_Question_Validation_NormalizationRules_Title) }}
      <template v-for="(rule, index) in normalizationRules" :key="index">
        <NormalizationRuleEditor v-model="normalizationRules[index]" @change="updateNormalizationRule" @remove="removeNormalizationRule(index)" />
      </template>


      <TickButton @click="addNormalizationRule" icon="plus" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_Add) }} </TickButton>


    </SidebarPanel>

    <SidebarPanel id="message-capture" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Question_Storage_Title)">
      <template #header>
        <TickSwitch class="save-checkbox" v-model="saveAnswer" :disabled="disabled" />
      </template>

      <template v-if="saveAnswer">
        <div class="flex-row">
          <DatabagItemSelector v-model="answerStoragePath" :locations="writeLocations" :disabled="disabled" :defaultNewStorageLocation="StorageLocation.Flow">
            {{ $translate(LanguagePath.App_FlowEditor_SideBar_Question_Storage_Title) }}
          </DatabagItemSelector>
        </div>
      </template>
    </SidebarPanel>

    <SidebarPanel id="flow-general" :name="$translate(LanguagePath.App_FlowEditor_SideBar_ConditionalNavigate_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_ConditionalNavigate_Explanation) }}
      </template>
      <div class="container">
        <TickListItem icon="navigate" :name="route.name" v-for="route in this.routes" :key="route.id" ref="editRouteButtons" @select="editCondition('editRouteButtons', route)">
          <template #actions>
            <TickButton icon="delete" v-if="!disabled" @click.stop="removeRoute(route)" class="delete small" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini" />
          </template>
        </TickListItem>
      </div>
      <TickButton v-if="!disabled" @click="addRoute" :appearance="Appearance.secondary" :color="Color.contrast" icon="plus">{{ $translate(LanguagePath.App_Add) }}</TickButton>
    </SidebarPanel>

    <!-- <div>
      <TickSelector v-model="answerStorageDestination" :options="storageLocationOptions" :disabled="disabled">Store to state</TickSelector>
      <TickInput v-model.lazy="answerStoragePath" placeholder="storage path" :disabled="disabled" />
    </div> -->

    <!-- <div>
      <TickTextarea v-model="validEcho" placeholder="echo on invalid response (optional)" :disabled="disabled">Valid echo</TickTextarea>
      <TickTextarea v-model="invalidEcho" placeholder="echo on valid response" :disabled="disabled">Invalid echo</TickTextarea>
    </div> -->


    <SidebarPanel id="message-await" :name="$translate(LanguagePath.App_FlowEditor_SideBar_AwaitAttempt_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_AwaitAttempt_Explanation) }}
      </template>

      <BotWaitingForAnswerEditor v-model="awaitSettings" :disabled="disabled" />
    </SidebarPanel>

    <SidebarPanel id="message-response" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Response_Echo_Title)">
      <template #header>
        <TickSwitch v-model="useResponseEcho" :disabled="disabled" />
      </template>
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_Response_Echo_Explanation) }}
      </template>
      <template v-if="useResponseEcho">
        <TickTextarea v-model="validEcho" :disabled="disabled" v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }">{{
          $translate(LanguagePath.App_FlowEditor_SideBar_Response_Echo_Valid_Title) }}
        </TickTextarea>
        <TickTextarea v-model="invalidEcho" :disabled="disabled" v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }">{{
          $translate(LanguagePath.App_FlowEditor_SideBar_Response_Echo_InValid_Title) }}</TickTextarea>
      </template>
    </SidebarPanel>

  </div>
</template>

<script lang="ts">
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from '@/components/atoms/TickInput.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import StorageInput from "@/components/molecules/flow/sidebar/actions/molecules/StorageInput.vue";
import DatabagItemSelector from '@/components/molecules/Selectors/DatabagItemSelector.vue';
import TickIcon from "@/components/TickIcon.vue";
import { tokenize } from '@/directives';
import { getEmptyConditiongroup } from '@/helpers/conditionHelper';
import { getFlowReadStorageLocations, getFlowWriteStorageLocations, getStorageLocationOptions, getTextualQuestionValidationTypeOptions } from '@/helpers/enumsHelper';
import generateId from '@/helpers/guid';
import { jsonProxy } from "@/helpers/jsonProxy";
import { mount, unmount } from '@/helpers/mountHelper';
import { askNewName } from '@/helpers/questionHelper';
import { translate } from '@/plugins/translatePlugin';
import useUtilityDataStore from '@/store/utilitydata';
import { BotTextualQuestionActionData, BotWaitingForResponseSettings, ConditionGroup, FlowConditionData, FlowDefinitionAction, LanguagePath, NormalizationRule, StorageLocation, ValidationTypeEnum } from "@/TickApi";
import { BotActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ConditionEditorPanel from '../../panel/ConditionEditorPanel.vue';
import TickCondition from '../../panel/TickCondition.vue';
import TickConditionElement from '../../panel/TickConditionElement.vue';
import TickConditionGroupEditor from '../../panel/TickConditionGroupEditor.vue';
import BotWaitingForAnswerEditor from './molecules/BotWaitingForAnswerEditor.vue';
import NormalizationRuleEditor from "./molecules/NormalizationRuleEditor.vue";
@Component({
  directives: { tokenize },
  emits: ["remove", "update"],
  components: {
    TickSwitch, SidebarPanel, StorageInput, TickIcon, TickCheckbox, TickTextarea,
    TickInput, TickSelector, BotWaitingForAnswerEditor, DatabagItemSelector, TickListItem, TickButton,
    NormalizationRuleEditor
  },
})
export default class MessageQuestionAction extends Vue {
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: BotActionSettings;
  @Prop() private disabled!: boolean;
  StorageLocation = StorageLocation
  ValidationTypeEnum = ValidationTypeEnum;
  LanguagePath = LanguagePath
  Appearance = Appearance
  Color = Color
  Size = Size

  private activePanel = {
    group: "",
    optionId: "",
    panelId: "",
  };

  private get data() {
    return jsonProxy<BotTextualQuestionActionData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private forceUpdate() {
    console.log("force update");
    this.settings.actionDataJson = JSON.stringify(this.data);
  }

  private get readLocations() {
    return getFlowReadStorageLocations();
  }

  private get writeLocations() {
    return getFlowWriteStorageLocations();
  }

  private set useCustomSender(to: boolean) {
    this.data.useCustomSender = to
  }
  private get useCustomSender(): boolean {
    return this.data.useCustomSender;
  }

  private set customSendByUserId(to: string) {
    this.data.customSendByUserId = to
  }
  private get customSendByUserId(): string {
    return this.data.customSendByUserId;
  }

  private get userOptions() {
    const labels = useUtilityDataStore().utilityData.users.filter(p => !p.deleted);
    let options = labels.map((item) => ({
      text: item.name,
      value: item.id,
    }))
    return options;
  }


  private get awaitSettings() {
    return this.data.awaitResponseSettings;
  }

  private set awaitSettings(to: BotWaitingForResponseSettings) {
    this.data.awaitResponseSettings = to;
  }

  private get message() {
    return this.data.message || "";
  }

  private set message(to) {
    this.data.message = to;
  }

  private get validEcho() {
    return this.data.validEcho;
  }
  private set validEcho(to: string) {
    this.data.validEcho = to;
  }

  private get invalidEcho() {
    return this.data.invalidEcho;
  }
  private set invalidEcho(to: string) {
    this.data.invalidEcho = to;
  }

  private get normalizationRules() {
    return this.data.normalizationRules || [];
  }

  private set normalizationRules(to) {
    this.data.normalizationRules = to;
  }

  private addNormalizationRule() {
    const newRule: NormalizationRule = { find: "", replace: "" }
    if (!this.data.normalizationRules) {
      this.data.normalizationRules = [newRule];
    } else {
      this.data.normalizationRules.push(newRule);
    }
    //fixme: proxy needs to see array changes
    this.data.normalizationRules = this.data.normalizationRules.slice();
  }

  private updateNormalizationRule(rule: NormalizationRule) {
    // eslint-disable-next-line no-debugger
    debugger;
    const index = this.data.normalizationRules.findIndex(
      (p) => p.id === rule.id
    );

    this.data.normalizationRules[index] = rule;
    //fixme: proxy needs to see array changes
    this.data.normalizationRules = this.data.normalizationRules.slice();
    //this.forceUpdate();
  }

  private removeNormalizationRule(index: number) {
    if (!this.data.normalizationRules) {
      return;
    }
    this.data.normalizationRules.splice(index, 1);

    //fixme: proxy needs to see array changes
    this.data.normalizationRules = this.data.normalizationRules.slice();
  }


  private get validationOptions() {
    return getTextualQuestionValidationTypeOptions()
  }


  private get storageLocationOptions() {
    return getStorageLocationOptions(false, false);
  }

  private get answerExtractionRegEx() {
    return this.data.answerExtractionRegEx;
  }

  private set answerExtractionRegEx(to: string) {
    this.data.answerExtractionRegEx = to;
  }

  private get useResponseEcho() {
    return this.data.useAnswerEcho || false;
  }
  private set useResponseEcho(to: boolean) {
    this.data.useAnswerEcho = to;
  }


  private get saveAnswer() {
    return this.data.saveAnswer;
  }

  private set saveAnswer(to: boolean) {
    this.data.saveAnswer = to;
  }

  private get answerStoragePath() {
    return this.data.answerStoragePath;
  }

  private set answerStoragePath(to: string) {
    this.data.answerStoragePath = to;
  }

  private get validationRegEx() {
    return this.data.validationRegEx;
  }

  private set validationRegEx(to: string) {
    this.data.validationRegEx = to;
  }

  private get validationType() {
    const data = this.data;
    if (typeof data.validationType !== "number") {
      return ValidationTypeEnum.Text;
    }
    return data.validationType;
  }

  private set validationType(to: ValidationTypeEnum) {
    this.data.validationType = to;
  }



  private get routes() {
    return this.data.navigateConditions || [];
  }

  private editCondition(fromRef: string, route: FlowConditionData) {
    this.toggleConditionPanelFor(fromRef, route.id, route.condition);
  }

  private removeRoute(route: FlowConditionData) {
    const index = this.data.navigateConditions.findIndex(
      (p) => p.id === route.id
    );
    if (index > -1) {
      this.data.navigateConditions.splice(index, 1);
      //fixme: proxy needs to see array changes
      this.data.navigateConditions = this.data.navigateConditions.slice();
    }
  }

  private addRoute() {
    askNewName((name) => {
      const newCondition = {
        condition: getEmptyConditiongroup(name),
        index: (this.data.navigateConditions || []).length,
        targetStepId: null,
        id: generateId(),
        name: name,
      };

      if (this.data.navigateConditions && this.data.navigateConditions.length) {
        this.data.navigateConditions.push(newCondition);
        //fixme: proxy needs to see array changes
        this.data.navigateConditions = this.data.navigateConditions.slice();
      } else {
        this.data.navigateConditions = [newCondition];
      }

      this.editCondition('editRouteButtons', newCondition)

    }, "");


  }

  beforeUnmount() {
    this.closeActivePanel();
  }

  private patchConditionGroup(routeId: string, condition: ConditionGroup) {
    const route = this.data.navigateConditions.find((p) => p.id == routeId);
    route.condition = JSON.parse(JSON.stringify(condition));

    route.name = condition.name;

    this.data.navigateConditions = this.data.navigateConditions.slice();
  }

  private toggleConditionPanelFor(
    fromRef: string,
    routeId: string,
    condition: ConditionGroup
  ) {
    const isCurrentActivePanel =
      this.activePanel.group === fromRef &&
      this.activePanel.optionId === condition.id;
    this.closeActivePanel();

    if (isCurrentActivePanel) {
      return;
    }

    this.activePanel.group = fromRef;
    this.activePanel.optionId = routeId;
    this.activePanel.panelId = this.openPanel(fromRef, {
      condition: condition,
      disableGroups: true,
      disableInputSource: true,
      disabledInputSourceText: translate(LanguagePath.App_FlowEditor_SideBar_Question_Routes_UseAnswer),
      disabled: this.disabled,
    });
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
            this.patchConditionGroup(this.activePanel.optionId, conditionGroup);
            this.closeActivePanel();
          },
        },
        loadComponents: [TickConditionElement, TickCondition, TickConditionGroupEditor]
      },

    );
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

.flex-row {
  display: flex;
  gap: 5px;
}

.flex-grid {
  display: grid;
  gap: 2px;
}
</style>
