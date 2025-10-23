<template>
  <div class="action">
    <SidebarPanel id="message-question" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Choice_Title)">
      <TickTextarea v-model.lazy="question" class="question" :disabled="disabled" v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }"
        :placeholder="$translate(LanguagePath.App_FlowEditor_SideBar_Choice_MarkDown_Placeholder)" />
    </SidebarPanel>

    <SidebarPanel id="message-sender" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_Title)">
      <TickSwitch v-model="useCustomSender" :disabled="disabled">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_UseCustom_Title) }}</TickSwitch>
      <TickSelector v-if="useCustomSender" v-model="customSendByUserId" :options="userOptions" :disabled="disabled" />
      <span v-else>{{ $translate(LanguagePath.App_FlowEditor_SideBar_Message_Sender_NoCustom_Title) }}</span>
    </SidebarPanel>

    <SidebarPanel id="message-options" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Choice_Options_Title)">
      <template #header>
        <TickSelector v-model="optionsSource" :options="optionsSourceOptions" :disabled="disabled" />
      </template>
      <template #subheader>
        <template v-if="optionsSource == OptionsSourceEnum.Databag">
          {{ $translate(LanguagePath.App_FlowEditor_SideBar_Choice_Options_Databag_Explanation) }}
        </template>
      </template>

      <template v-if="optionsSource == OptionsSourceEnum.Options">
        <div class="choice-container">
          <TickListItem icon="" :name="route.text" v-for="route in this.routes" :key="route.id" ref="editRouteButtons" @select="editRoute('editRouteButtons', route)">
            <template #actions>
              <TickButton v-if="!disabled" @click.stop="removeRoute(route)" :appearance="Appearance.secondary" icon="delete" :color="Color.contrast" :size="Size.mini" />
            </template>
          </TickListItem>

          <EditorMessage v-if="!routes || !this.routes.length" :type="EditorMessageType.Warning" title="Add option" message="Please provide options" />

          <TickButton v-if="!disabled" class="addRouteButton" @click="addRoute('addRouteButton')" ref="addRouteButton" :appearance="Appearance.secondary" icon="plus" :size="Size.mini"
            :color="Color.contrast">
          </TickButton>
        </div>
      </template>

      <template v-if="optionsSource == OptionsSourceEnum.Databag">
        <div class="flex-grid">
          <!-- <TickInput v-model="optionsStorageLocationPath" placeholder="state location" :disabled="disabled" /> -->
          <DatabagItemSelector v-model="optionsStorageLocationPath" :locations="readLocations" :disabled="disabled" :defaultNewStorageLocation="StorageLocation.Flow">
            {{ $translate(LanguagePath.States_Variable) }}
          </DatabagItemSelector>

          <TickTextarea v-model="optionsMappingJMESPath" :disabled="disabled">{{ $translate(LanguagePath.App_FlowEditor_SideBar_Choice_DatabagMapping_Title) }}</TickTextarea>
        </div>
      </template>

    </SidebarPanel>


    <SidebarPanel id="message-capture" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Choice_Storage_Title)">
      <template #header>
        <TickSwitch v-model="saveAnswer" :disabled="disabled" />
      </template>

      <template v-if="saveAnswer">
        <DatabagItemSelector v-model="answerStoragePath" :locations="writeLocations" :disabled="disabled" :defaultNewStorageLocation="StorageLocation.Flow">{{
          $translate(LanguagePath.App_FlowEditor_SideBar_Choice_Storage_Textual_Title) }}
        </DatabagItemSelector>
        <DatabagItemSelector v-model="answerValueStoragePath" :locations="writeLocations" :disabled="disabled" :defaultNewStorageLocation="StorageLocation.Flow">{{
          $translate(LanguagePath.App_FlowEditor_SideBar_Choice_Storage_Value_Title) }}
        </DatabagItemSelector>
      </template>
    </SidebarPanel>


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
        <TickTextarea v-model="validEcho" :disabled="disabled" v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }"> {{
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
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickListItem from '@/components/atoms/TickListItem.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import StorageInput from "@/components/molecules/flow/sidebar/actions/molecules/StorageInput.vue";
import DatabagItemSelector from '@/components/molecules/Selectors/DatabagItemSelector.vue';
import TickIcon from "@/components/TickIcon.vue";
import { tokenize } from '@/directives';
import { getFlowReadStorageLocations, getFlowWriteStorageLocations, getOptionsSourceOptions, getStorageLocationOptions } from '@/helpers/enumsHelper';
import generateId from '@/helpers/guid';
import { jsonProxy } from "@/helpers/jsonProxy";
import { mount, unmount } from "@/helpers/mountHelper";
import getRefElement from '@/helpers/refHelpers';
import useUtilityDataStore from '@/store/utilitydata';
import { BotChoiceSettings, BotWaitingForResponseSettings, FlowDefinitionAction, FlowOptionsItemData, LanguagePath, OptionsSourceEnum, StorageLocation } from "@/TickApi";
import { ChoiceBotActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import ChoiceOptionEditorPanel from '../../panel/ChoiceOptionEditorPanel.vue';
import BotWaitingForAnswerEditor from './molecules/BotWaitingForAnswerEditor.vue';
@Component({
  directives: { tokenize },
  emits: ["remove", "update"],
  components: { EditorMessage, SidebarPanel, StorageInput, TickIcon, TickCheckbox, TickTextarea, TickButton, TickInput, ChoiceOptionEditorPanel, TickSelector, TickListItem, TickSwitch, BotWaitingForAnswerEditor, DatabagItemSelector },
})
export default class MessageChoiceAction extends Vue {
  OptionsSourceEnum = OptionsSourceEnum;
  Appearance = Appearance
  Color = Color
  Size = Size
  EditorMessageType = EditorMessageType
  StorageLocation = StorageLocation
  LanguagePath = LanguagePath
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: ChoiceBotActionSettings;
  @Prop() private disabled!: boolean;

  private activePanel = {
    group: "",
    panelId: "",
    optionId: "",
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



  private get data() {
    return jsonProxy<BotChoiceSettings>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private get saveAnswer() {
    return this.data.saveAnswer;
  }

  private set saveAnswer(to: boolean) {
    this.data.saveAnswer = to;
  }


  private get savableStorageLocations() {
    return getStorageLocationOptions(false, false);
  }

  // private get answerStorageDestination() {
  //   return this.data.answerStorageDestination;
  // }

  // private set answerStorageDestination(to: StorageLocation) {
  //   this.data.answerStorageDestination = to;
  // }

  private get answerStoragePath() {
    return this.data.answerStoragePath;
  }
  private set answerStoragePath(to: string) {
    this.data.answerStoragePath = to;
  }

  private get answerValueStoragePath() {
    return this.data.answerValueStoragePath;
  }
  private set answerValueStoragePath(to: string) {
    this.data.answerValueStoragePath = to;
  }

  private get useResponseEcho() {
    return this.data.useAnswerEcho || false;
  }
  private set useResponseEcho(to: boolean) {
    this.data.useAnswerEcho = to;
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


  private get optionsMappingJMESPath() {
    return this.data.optionsMappingJMESPath || "";
  }

  private set optionsMappingJMESPath(to: string) {
    this.data.optionsMappingJMESPath = to;
  }

  private get optionsStorageLocationPath() {
    return this.data.optionsStorageLocationPath || "";
  }

  private set optionsStorageLocationPath(to: string) {
    this.data.optionsStorageLocationPath = to;
  }

  private get question() {
    return this.data.message
  }
  private set question(to: string) {
    this.data.message = to;
  }

  private get optionsSource() {
    return this.data.optionsSource;
  }
  private set optionsSource(to: OptionsSourceEnum) {
    this.data.optionsSource = to;
  }

  private get optionsSourceOptions() {
    return getOptionsSourceOptions();
  }

  private get routes() {
    return this.data.options || [];
  }

  private removeRoute(route: FlowOptionsItemData) {
    const option = this.data.options.find(c => c.id === route.id);

    const index = this.data.options.indexOf(option);
    if (index > -1) { // only splice array when item is found
      this.data.options.splice(index, 1); // 2nd parameter means remove one item only
    }

    //fixme: proxy needs to see array changes
    this.data.options = this.data.options.slice();
  }

  private addRoute(fromRef: string) {
    const optionData = ""; //prompt("Please type a label for the option");
    const optionValue = "";// prompt("What should the value of this option be?");
    const newId = generateId();
    this.data.options.push({
      id: newId,
      data: optionValue,
      text: optionData,
      targetStepId: null,
    });

    //fixme: proxy needs to see array changes
    this.data.options = this.data.options.slice();

    this.togglePanelFor(fromRef, newId)
  }

  private editRoute(fromRef: string, route: FlowOptionsItemData) {
    this.togglePanelFor(fromRef, route.id);
  }


  private togglePanelFor(fromRef: string, optionId: string) {
    const isCurrentActivePanel = (this.activePanel.group === fromRef && this.activePanel.optionId === optionId);
    this.closeActivePanel();

    if (isCurrentActivePanel) {
      return;
    }

    const option = this.data.options.find(c => c.id === optionId);

    this.activePanel.group = fromRef;
    this.activePanel.optionId = optionId;
    this.activePanel.panelId = this.openPanel(fromRef, { item: option });
  }

  patchOption(route: FlowOptionsItemData) {
    const option = this.data.options.find(c => c.id === route.id);
    option.data = route.data;
    option.text = route.text;

    //fixme: proxy needs to see array changes
    this.data.options = this.data.options.slice();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openPanel(id: string, props?: Record<string, any>,) {
    const control = getRefElement(this, id);
    const rect = control.getBoundingClientRect();
    const paddingTop = window.getComputedStyle(control).getPropertyValue('padding-top');

    return mount(ChoiceOptionEditorPanel, {
      props: {
        ...props,
        position: {
          right: `${window.innerWidth - Math.ceil(rect.left)}px`,
          top: `${Math.floor(rect.top) + parseInt(paddingTop) - 4}px`,// 4px because it looks better
        }
      },
      events: {
        // close() { this.closeActivePanel(); },
        exit: (route: FlowOptionsItemData) => {
          this.patchOption(route);
          this.closeActivePanel();
        }
      }
    });
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

.addRouteButton {
  margin-top: 10px;
  width: 100%;
}

.choice-container {
  padding: 10px;
  background-color: var(--c-base-300);
  border-radius: 8px;

  display: grid;
  gap: 5px;
}
</style>
