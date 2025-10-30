<template>
  <div class="editor">

    <template v-if="loaded">

      <TickScreen :title="name">
        <template v-slot:actions>
          <TickButton @click="remove" v-if="deleteallowed" :busy="busyDeleting" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
          <TickButton @click="save" v-if="editallowed" :disabled="!readyForSave" :busy="busySaving">{{ $translate(LanguagePath.App_Save) }}</TickButton>
        </template>

        <template v-slot:default>
          <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)">
            <TickInput :disabled="disabled" v-model="component.name">{{ $translate(LanguagePath.App_Name) }}</TickInput>

            <TickInput type="number" :min="0" :max="100" :disabled="disabled" v-model="component.weight">{{ $translate(LanguagePath.App_MetaDataComponentEditor_Weight_Title) }} </TickInput>
            <TickSwitch v-model="component.useBottomSlot" :disabled="!settingsPresentForActivation">{{ $translate(LanguagePath.App_MetaDataComponentEditor_UseBottomSlot_Title) }}</TickSwitch>

            <TickSwitch v-model="active" :disabled="!settingsPresentForActivation">{{ $translate(LanguagePath.App_MetaDataComponentEditor_Active_Title) }}</TickSwitch>
            <div class="explainer" v-if="!settingsPresentForActivation">{{ $translate(LanguagePath.App_MetaDataComponentEditor_ConfigureBeforeActivate_Explanation) }}</div>
            <div class="explainer success" v-if="settingsPresentForActivation && !this.active">{{ $translate(LanguagePath.App_MetaDataComponentEditor_ReadyForActivate_Explanation) }}</div>
            <div class="explainer success" v-if="settingsPresentForActivation && this.active">{{ $translate(LanguagePath.App_MetaDataComponentEditor_Activated_Explanation) }}</div>
          </TickEditorPanel>

          <TickEditorPanel :name="$translate(LanguagePath.App_MetaDataComponentEditor_StartCriteria_Title)">
            <template v-slot:explainer>
              {{ $translate(LanguagePath.App_MetaDataComponentEditor_StartCriteria_Explanation) }}
            </template>

            <div class="container">
              <div class="startcontainer">
                <TickHeading size="small">{{ $translate(LanguagePath.App_MetaDataComponentEditor_StartCriteria_Start_Title) }}</TickHeading>
                <div class="conditionButtons">
                  <LabelsSelector :disabled="disabled" v-model="startlabelIds" />
                  <TickButton class="conditionButton outline" @click="setStartCondition('setStartCondition')" ref="setStartCondition" v-if="editallowed">
                    {{ $translate(LanguagePath.App_MetaDataComponentEditor_StartCriteria_Start_Title) }}
                  </TickButton>
                </div>
              </div>


              <div>
                <TickHeading size="small">{{ $translate(LanguagePath.App_MetaDataComponentEditor_StartCriteria_Skip_Title) }}</TickHeading>
                <div class="conditionButtons">
                  <LabelsSelector :disabled="disabled" v-model="skiplabelIds" />
                  <TickButton class="conditionButton outline" @click="setSkipCondition('setSkipCondition')" ref="setSkipCondition" v-if="editallowed">
                    {{ $translate(LanguagePath.App_MetaDataComponentEditor_StartCriteria_Conditions_Title) }}</TickButton>
                </div>
              </div>
            </div>
          </TickEditorPanel>

          <MetaDataComponentAdapterSourceEditor @sampledatachange="sampledatachange" v-model="settingsAsAdapter" :editallowed="editallowed" :componentName="name"
            :useBottomSlot="component.useBottomSlot" v-if="source == ComponentDataSourceTypeEnum.DataAdapter" />
          <MetaDataComponentTickSourceEditor @sampledatachange="sampledatachange" v-model="settingsAsTick" :editallowed="editallowed" :componentName="name" :useBottomSlot="component.useBottomSlot"
            v-if="source == ComponentDataSourceTypeEnum.Tick" />

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
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickConditionGroupEditor from '@/components/molecules/flow/panel/TickConditionGroupEditor.vue';
import LabelsSelector from '@/components/molecules/Selectors/LabelsSelector.vue';
import { getEmptyConditiongroup } from '@/helpers/conditionHelper';
import { jsonProxy } from '@/helpers/jsonProxy';
import { mount, unmount } from '@/helpers/mountHelper';
import { onConfirmation } from '@/helpers/questionHelper';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, ComponentDataSourceTypeEnum, ConditionGroup, LanguagePath, MetaDataComponentAdapterSourceSettings, MetaDataComponentTickSourceSettings, MetaDataComponentUpdate, SubscriptionCostItemType, TickMetaDataComponent } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import ConditionEditorPanel from '../flow/panel/ConditionEditorPanel.vue';
import TickCondition from '../flow/panel/TickCondition.vue';
import TickConditionElement from '../flow/panel/TickConditionElement.vue';
import MetaDataComponentAdapterSourceEditor from './editors/MetaDataComponentAdapterSourceEditor.vue';
import MetaDataComponentTickSourceEditor from './editors/MetaDataComponentTickSourceEditor.vue';

@Component({
  emits: ["deleted", "saved"],
  components: {
    TickInput, TickTextArea, TickButton, TickCheckbox, ThenHr, TickScreen, TickEditorPanel, LabelList, TickSwitch,
    ConditionEditorPanel, TickConditionGroupEditor, TickDropdown, TickSelector, TickHeading, MetaDataComponentAdapterSourceEditor,
    MetaDataComponentTickSourceEditor, LabelsSelector
  },
})
export default class MetaDataComponentEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath

  ComponentDataSourceTypeEnum = ComponentDataSourceTypeEnum;
  @Prop() private activeId!: string;
  private component: TickMetaDataComponent = null;
  private loaded = false;
  private busySaving = false;
  private busyDeleting = false;
  private sampleDataError = "";


  private get disabled() {
    return !this.editallowed;
  }

  private activePanel = {
    group: "",
    panelId: "",
    optionId: "",
  }

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useManagingStore().getMetaDataComponent(id).then(component => {
      this.component = component;
      this.loaded = true;
    })
  }

  private get source() {
    return this.component.sourceType;
  }


  private get settingsAsAdapter() {
    return jsonProxy<MetaDataComponentAdapterSourceSettings>(this.component.settingsJson || "{}", (json) => {
      this.component.settingsJson = json;
    });
  }

  private get settingsAsTick() {
    return jsonProxy<MetaDataComponentTickSourceSettings>(this.component.settingsJson || "{}", (json) => {
      this.component.settingsJson = json;
    });
  }

  mounted() {
    this.activate(this.activeId);
  }

  private get startlabelIds() {
    return this.component.startOnLabels;
  }

  private set startlabelIds(to: string[]) {
    this.component.startOnLabels = to;
    this.component.skipOnLabels = this.component.skipOnLabels.filter(p => !to.some(t => t == p));
  }

  private get skiplabelIds() {
    return this.component.skipOnLabels;
  }

  private set skiplabelIds(to: string[]) {
    this.component.skipOnLabels = to;
    this.component.startOnLabels = this.component.startOnLabels.filter(p => !to.some(t => t == p));
  }

  private get settingsPresentForActivation() {
    if (!this.editallowed) { return false; }

    switch (this.source) {
      case ComponentDataSourceTypeEnum.DataAdapter:
        return this.settingsPresentForAdapter;
    }

    return true;
  }

  private get settingsPresentForAdapter() {
    const c = this.settingsAsAdapter;
    if (!c.dataAdapterId) { return false; }

    if (!c.dataStoragePath) {
      return false;
    }

    return true;
  }

  private get active() {
    return this.component.active;
  }
  private set active(to: boolean) {
    this.component.active = to;
  }

  private get deleteallowed() {
    const allow = this.editallowed;
    return allow;
  }

  private get editallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration)
  }

  private get viewAdapterDetailsAllowed() {
    return useUserStore().allowedView(AuthorizationObjectType.TechnicalConfiguration, SubscriptionCostItemType.DataAdapter)
  }

  private get name() {
    return this.component.name;
  }

  private get editorSubTitle() {
    return "edit mode";
  }

  private get readyForSave() {
    return true;
  }

  private save() {
    this.busySaving = true;

    useManagingStore().saveMetaDataComponent(this.component.id).then(() => {
      this.busySaving = false;
      this.$emit("saved");
    });
  }

  private remove() {
    onConfirmation(() => {
      this.busyDeleting = true;
      useManagingStore().deleteMetaDataComponent(this.component.id).then(() => {
        this.busyDeleting = false;
        this.$emit("deleted");
      }, () => {
        this.busyDeleting = false;
      });

    });


  }


  private sampledatachange(data: unknown) {
    useManagingStore().metaDataComponentEditorSampleData = data as MetaDataComponentUpdate;
  }


  beforeUnmount() {
    this.closeActivePanel();
    useManagingStore().metaDataComponentEditorSampleData = null;
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

  private get startCondition() {
    return jsonProxy<ConditionGroup>(this.component.startConditionsJson || "{}", (json) => {
      this.component.startConditionsJson = json;
    });
  }

  private get skipCondition() {
    return jsonProxy<ConditionGroup>(this.component.skipConditionsJson || "{}", (json) => {
      this.component.skipConditionsJson = json;
    });
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
    const isCurrentActivePanel = (this.activePanel.group === fromRef && this.activePanel.optionId === condition.id);
    this.closeActivePanel();

    if (isCurrentActivePanel) {
      return;
    }

    this.activePanel.group = fromRef;
    this.activePanel.optionId = condition.id;
    this.activePanel.panelId = this.openPanel(fromRef, { condition: condition });
  }

  private patchConditionGroup(condition: ConditionGroup) {
    if (this.startCondition.id == condition.id) {
      this.component.startConditionsJson = JSON.stringify(condition);
    }
    if (this.skipCondition.id == condition.id) {
      this.component.skipConditionsJson = JSON.stringify(condition);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openPanel(id: string, props?: Record<string, any>,) {
    // const control = getRefElement(this, id);
    // const rect = control.getBoundingClientRect();
    // const paddingTop = window.getComputedStyle(control).getPropertyValue('padding-top');

    return mount(ConditionEditorPanel, {
      props: {
        ...props,
        // position: {
        //   left: `${Math.ceil(rect.left)}px`,
        //   top: `${Math.floor(rect.top + parseInt(paddingTop) + rect.height) - 4}px`,// 4px because it looks better
        // }
      },
      events: {
        cancel: () => { this.closeActivePanel(); },
        // patch: (conditionGroup: ConditionGroup) => {

        //   this.patchConditionGroup(conditionGroup);
        // },
        exit: (conditionGroup: ConditionGroup) => {
          this.patchConditionGroup(conditionGroup);
          this.closeActivePanel();
        },

      },
      loadComponents: [TickConditionElement, TickCondition, TickConditionGroupEditor]

    });
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
