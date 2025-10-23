<template>
  <TickDialogPanel :noClose="true" class="panel" @close="close" :type="PanelStyle.wizard">
    <template #title>{{ $translate(LanguagePath.App_FlowCreatorPanel_Title) }}</template>

    <div class="content">
      <!-- Entree -->
      <div v-if="step == FlowCreatorPanelStep.Entree" class="section_content">

        <div class="entree-wrapper">
          <div class="entree-title">{{ $translate(LanguagePath.App_FlowCreatorPanel_Entree_Title) }}</div>
          <div class="entree-explanation"> {{ $translate(LanguagePath.App_FlowCreatorPanel_Entree_Explanation) }} </div>
        </div>
      </div>

      <!-- Name -->
      <div v-else-if="step == FlowCreatorPanelStep.General" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_FlowCreatorPanel_General_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_FlowCreatorPanel_General_Explanation) }} </div>

        <TickInput v-model="flowName" :placeholder="$translate(LanguagePath.App_Name)"></TickInput>

      </div>

      <!-- Trigger -->
      <div v-else-if="step == FlowCreatorPanelStep.TriggerType" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_FlowCreatorPanel_Trigger_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_FlowCreatorPanel_Trigger_Explanation) }} </div>

        <div class="options_wrapper">
          <WizardOptionButton class="trigger-option" @select="selectedTriggerType = FlowTriggerEnum.Manual" :selected="selectedTriggerType == FlowTriggerEnum.Manual"
            :name="$translate(LanguagePath.App_FlowCreatorPanel_Trigger_Manual_Title)">
            {{ $translate(LanguagePath.App_FlowCreatorPanel_Trigger_Manual_Explanation) }}
          </WizardOptionButton>

          <WizardOptionButton class="trigger-option" @select="selectedTriggerType = FlowTriggerEnum.Auto" :selected="selectedTriggerType == FlowTriggerEnum.Auto"
            :name="$translate(LanguagePath.App_FlowCreatorPanel_Trigger_Auto_Title)">
            {{ $translate(LanguagePath.App_FlowCreatorPanel_Trigger_Auto_Explanation) }}
          </WizardOptionButton>
        </div>
      </div>



      <!-- Channels -->
      <div v-else-if="step == FlowCreatorPanelStep.SelectChannels" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_FlowCreatorPanel_Channels_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_FlowCreatorPanel_Channels_Explanation) }} </div>

        <CommunicationChannelsSelector :emptyLabel="$translate(LanguagePath.Channels)" v-model="startOnCommunicationChannelIds" :size="ChannelLabelSize.Large" />

        <EditorMessage v-if="channelsWarningMessage" :type="EditorMessageType.Message" title="" :message="channelsWarningMessage" />
      </div>



      <!-- FINISH -->
      <div v-else-if="step == FlowCreatorPanelStep.Finish" class="section_content">
        <HappyIndicator text="Ready, click next to start editing!" />
      </div>

    </div>

    <template #footer>
      <div class="footer">
        <div class="secondaryActions">
          <TickButton class="action" :appearance="Appearance.transparent" @click="exit" :color="Color.contrast">{{ $translate(LanguagePath.App_Cancel) }}
          </TickButton>
        </div>

        <TickButton :busy="busyWithServer" @click="next" :size="Size.XXL"> {{ $translate(LanguagePath.App_Next) }}</TickButton>
      </div>
    </template>
  </TickDialogPanel>
</template>

<script lang="ts">
import { CollectionObjectTypeEnum, CommunicationType, FlowTriggerEnum, LanguagePath } from "@/TickApi";
import TickIcon from "@/components/TickIcon.vue";
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickHeading, { Size as HeadingSize } from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { focus } from "@/directives";
import { isChatCommunicationType } from "@/helpers/enumsHelper";
import { mount, unmount } from "@/helpers/mountHelper";
import { onConfirmation } from "@/helpers/questionHelper";
import { RouterToItem } from "@/router";
import useCollectionsStore from "@/store/collections";
import useFlowStore from "@/store/flows";
import useUtilityDataStore from "@/store/utilitydata";
import { Component, Vue } from "vue-facing-decorator";
import HappyIndicator from "../atoms/HappyIndicator.vue";
import { PanelStyle } from "../atoms/TickPanel.vue";
import TickSwitch from "../atoms/TickSwitch.vue";
import WizardOptionButton from "../atoms/WizardOptionButton.vue";
import WizardOptionItem from "../atoms/WizardOptionItem.vue";
import EditorMessage, { EditorMessageType } from "../molecules/EditorMessage.vue";
import CommunicationChannelsSelector from "../molecules/Selectors/CommunicationChannelsSelector.vue";
import { ChannelLabelSize } from "../molecules/channel/ChannelLabel.vue";
import TickEditorPanel from "../molecules/editor/TickEditorPanel.vue";
import UserCreator from "../molecules/user/UserCreator.vue";

const panelId = "FlowCreatorPanel";

export function removeFlowCreatorPanelPanel() {
  unmount(panelId);
}

export function openFlowCreatorPanel() {
  mount(FlowCreatorPanel, {
    props: {

    },
    events: {
      close: () => {
        removeFlowCreatorPanelPanel();
      },
    },
  }, panelId);
}

enum FlowCreatorPanelStep {
  Entree = 0,
  General = 1,
  TriggerType = 2,
  SelectChannels = 3,
  Finish = 4,
}

@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    TickEditorPanel,
    UserCreator,
    TickHeading,
    WizardOptionButton,
    HappyIndicator,
    WizardOptionItem,
    TickSwitch,
    CommunicationChannelsSelector,
    EditorMessage
  },
})
export default class FlowCreatorPanel extends Vue {
  FlowTriggerEnum = FlowTriggerEnum
  EditorMessageType = EditorMessageType

  ChannelLabelSize = ChannelLabelSize
  private objectTypeFilters: CollectionObjectTypeEnum[] = [];

  Appearance = ButtonAppearance;
  Size = ButtonSize;
  Color = ButtonColor;
  FlowCreatorPanelStep = FlowCreatorPanelStep;

  HeadingSize = HeadingSize;
  LanguagePath = LanguagePath;
  PanelStyle = PanelStyle;


  private step: FlowCreatorPanelStep = FlowCreatorPanelStep.Entree;
  private busyWithServer = false;

  private selectedTriggerType: FlowTriggerEnum = FlowTriggerEnum.Manual
  private startOnCommunicationChannelIds: string[] = [];
  private flowName = "";

  private exit() {
    onConfirmation(() => {
      this.close();
    })
  }

  beforeMount() {
    useCollectionsStore().use();
  }
  mounted() {
    useUtilityDataStore().use();
  }


  private goNext() {
    if (this.step == FlowCreatorPanelStep.Finish) {
      this.close();
    } else {
      this.step++;
    }

  }

  private next() {
    switch (this.step) {
      case FlowCreatorPanelStep.TriggerType:
        if (this.selectedTriggerType == FlowTriggerEnum.Manual)
          this.goNext();
        break;
      case FlowCreatorPanelStep.Finish:
        this.createFlow();
        break;

    }
    this.goNext();
  }

  private close() {
    this.$emit("close");
  }

  private createFlow() {
    useFlowStore().add(null, this.flowName, this.selectedTriggerType, this.startOnCommunicationChannelIds).then((flow) => {
      RouterToItem(CollectionObjectTypeEnum.Flow, flow.id, flow.versionId);
    })
  }


  private get channelsWarningMessage(): string {
    const channels = useUtilityDataStore().utilityData.communicationChannels || []
    const chosenChannels = channels.filter(p => this.startOnCommunicationChannelIds.some(a => a == p.id));

    const hasEmail = chosenChannels.some(p => p.communicationType == CommunicationType.Email)
    const hasChat = chosenChannels.some(p => isChatCommunicationType(p.communicationType));
    const hasPhone = chosenChannels.some(p => p.communicationType == CommunicationType.Phone)

    const typeValues = [hasEmail, hasChat, hasPhone];

    const hasMix = typeValues.filter(p => p == true).length > 1;
    if (!hasMix) { return ""; }

    if (hasEmail) {
      return "You are using a e-mail based channel combined with one ore more realtime channels like chat or phone. While this works it can lead to unwanted behavior such as asking short questions via e-mail."
    }
    if (hasPhone) {
      return "You are using a phone based channel combined with one ore more other types of channels like chat or e-mail. Be aware of this combination."
    }
    return "";


  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: clamp(200px, 1000px, 90dvw);
  min-height: 400px;


  .section_content {
    display: grid;
    gap: 20px;
    font-size: 14px;

    .explanation {
      font-size: 14px;
      line-height: 25px;

      .important {
        font-weight: 600;
      }

      &.center {
        text-align: center;
      }
    }
  }

  .entree-wrapper {
    height: 100%;
    display: grid;
    gap: 40px;
    justify-items: center;
    margin-top: 100px;

    .entree-title {
      @include font-outfit;
      font-size: 130px;
      line-height: 60px;
      font-weight: 600;
    }

    .entree-explanation {
      @include font-outfit;
      font-size: 30px;
      line-height: 60px;
      font-weight: 600;
    }
  }

  .options_wrapper {
    display: flex;
    gap: 20px;
    justify-content: center;

    .theme-option {
      width: 40%;
      height: 200px;

      // &.selected {}
    }
  }


}

.footer {
  width: 100%;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: space-between;

  .secondaryActions {
    display: flex;
    gap: 5px;

    .action:hover {
      border-bottom: solid 1px var(--c-contrast);
    }
  }

}
</style>
