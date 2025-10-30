<template>
  <TickDialogPanel :noClose="true" class="panel" @close="close" :type="step == ChannelCreatorPanelStep.Entree ? PanelStyle.wizard : PanelStyle.normal">
    <template #title>{{ $translate(LanguagePath.App_ChannelCreatorPanel_Title) }}</template>

    <div class="content">
      <!-- Entree -->
      <div v-if="step == ChannelCreatorPanelStep.Entree" class="section_content">

        <div class="entree-wrapper">
          <div class="entree-title">{{ $translate(LanguagePath.App_ChannelCreatorPanel_Entree_Title) }}</div>
          <div class="entree-explanation"> {{ $translate(LanguagePath.App_ChannelCreatorPanel_Entree_Explanation) }} </div>
        </div>
      </div>

      <!-- General -->
      <div v-else-if="step == ChannelCreatorPanelStep.General" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_ChannelCreatorPanel_General_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_ChannelCreatorPanel_General_Explanation) }} </div>

        <TickInput v-focus v-model="newName" :placeholder="$translate(LanguagePath.App_Name)" />

        <div class="options-group">
          <TickHeading>{{ $translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_Basics_Title) }}</TickHeading>

          <div class="options_wrapper left">

            <WizardOptionButton class="option" @select="selectedCommunicationType = CommunicationType.Email" :selected="selectedCommunicationType == CommunicationType.Email"
              :name="$translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_Email_Title)" :icon="getChannelIconName(CommunicationType.Email)">
              {{ $translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_Email_Explanation) }}
            </WizardOptionButton>

            <WizardOptionButton class="option" @select="selectedCommunicationType = CommunicationType.Phone" :selected="selectedCommunicationType == CommunicationType.Phone"
              :name="$translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_Phone_Title)" :icon="getChannelIconName(CommunicationType.Phone)">
              {{ $translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_Phone_Explanation) }}
            </WizardOptionButton>

          </div>
        </div>

        <div class="options-group">
          <TickHeading>{{ $translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_Realtime_Title) }}</TickHeading>

          <div class="options_wrapper left">

            <WizardOptionButton class="option" @select="selectedCommunicationType = CommunicationType.ChatWidget" :selected="selectedCommunicationType == CommunicationType.ChatWidget"
              :name="$translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_ChatWidget_Title)" :icon="getChannelIconName(CommunicationType.ChatWidget)">
              {{ $translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_ChatWidget_Explanation) }}
            </WizardOptionButton>

            <WizardOptionButton class="option" @select="selectedCommunicationType = CommunicationType.Telegram" :selected="selectedCommunicationType == CommunicationType.Telegram"
              :name="$translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_Telegram_Title)" :icon="getChannelIconName(CommunicationType.Telegram)">
              {{ $translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_Telegram_Explanation) }}
            </WizardOptionButton>

            <WizardOptionButton class="option" @select="selectedCommunicationType = CommunicationType.FacebookMessenger" :selected="selectedCommunicationType == CommunicationType.FacebookMessenger"
              :name="$translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_FacebookMessenger_Title)" :icon="getChannelIconName(CommunicationType.FacebookMessenger)">
              {{ $translate(LanguagePath.App_ChannelCreatorPanel_CommunicationType_FacebookMessenger_Explanation) }}
            </WizardOptionButton>
          </div>
        </div>

      </div>

      <!-- Phone -->
      <div v-else-if="step == ChannelCreatorPanelStep.PhoneChannel" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_ChannelCreatorPanel_Phone_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_ChannelCreatorPanel_Phone_Explanation) }} </div>

        <div class="phone-header">
          <TickSelector v-model="selectedPhoneNumberCountryCode" :options="phoneCountryOptions" />
          <TickButton :busy="busyFetchingAvailablePhoneNumbers" @click="fetchAvailablePhoneNumbers" icon="search">{{ $translate(LanguagePath.App_Search) }}</TickButton>
          <TickButton @click="selectEmptyPhoneChannel" :appearance="Appearance.secondary">{{ $translate(LanguagePath.App_ChannelCreatorPanel_Phone_TenantOwner_Title) }}</TickButton>
        </div>


        <div class="options_wrapper left">
          <WizardOptionButton v-for="(phone, index) in availablePhoneNumbers" :key="index" class="option" @select="selectPhoneNumber(phone)" :indicator="getIndicator(phone)"
            :selected="selectedPhoneNumber.phoneNumber == phone.phoneNumber" :name="phone.name">
            {{ phone.explanation }}
          </WizardOptionButton>
        </div>

      </div>

      <!-- FINISH -->
      <div v-else-if="step == ChannelCreatorPanelStep.Finish" class="section_content">
        <HappyIndicator text="Ready, click next to create the channel!" />
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
import { AvailablePhoneNumberData, ColorsEnum, CommunicationType, FlowTriggerEnum, LanguagePath, PhoneChannelAccountHolderType, PhoneChannelSettings, PhoneNumberData } from "@/TickApi";
import TickIcon from "@/components/TickIcon.vue";
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickHeading, { Size as HeadingSize } from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { focus } from "@/directives";
import { getChannelIconName } from "@/helpers/enumsHelper";
import { mount, unmount } from "@/helpers/mountHelper";
import { onConfirmation } from "@/helpers/questionHelper";
import { stringIsNullOrEmpty } from "@/helpers/stringHelper";
import { notifyError } from "@/notify";
import { RouterToView, ViewName } from "@/router";
import { getAvailablePhoneNumbers } from "@/services/ChannelsService";
import useChannelsStore from "@/store/channels";
import useCollectionsStore from "@/store/collections";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { Component, Vue } from "vue-facing-decorator";
import BusyIndicator from "../atoms/BusyIndicator.vue";
import HappyIndicator from "../atoms/HappyIndicator.vue";
import { TickIndicatorData } from "../atoms/TickIndicator.vue";
import { PanelStyle } from "../atoms/TickPanel.vue";
import TickSelector from "../atoms/TickSelector.vue";
import TickSwitch from "../atoms/TickSwitch.vue";
import WizardOptionButton from "../atoms/WizardOptionButton.vue";
import WizardOptionItem from "../atoms/WizardOptionItem.vue";
import EditorMessage, { EditorMessageType } from "../molecules/EditorMessage.vue";
import CommunicationChannelsSelector from "../molecules/Selectors/CommunicationChannelsSelector.vue";
import TickEditorPanel from "../molecules/editor/TickEditorPanel.vue";
import UserCreator from "../molecules/user/UserCreator.vue";

const panelId = "ChannelCreatorPanel";

export function removeChannelCreatorPanel() {
  unmount(panelId);
}

export function openChannelCreatorPanel() {
  mount(ChannelCreatorPanel, {
    props: {

    },
    events: {
      close: () => {
        removeChannelCreatorPanel();
      },
    },
  }, panelId);
}

enum ChannelCreatorPanelStep {
  Entree = 0,
  General = 1,
  PhoneChannel = 2,
  Finish = 3,
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
    EditorMessage,
    BusyIndicator,
    TickSelector
  },
})
export default class ChannelCreatorPanel extends Vue {
  FlowTriggerEnum = FlowTriggerEnum
  EditorMessageType = EditorMessageType
  Appearance = ButtonAppearance;
  Size = ButtonSize;
  Color = ButtonColor;
  ChannelCreatorPanelStep = ChannelCreatorPanelStep;
  HeadingSize = HeadingSize;
  LanguagePath = LanguagePath;
  PanelStyle = PanelStyle;
  CommunicationType = CommunicationType

  private step: ChannelCreatorPanelStep = ChannelCreatorPanelStep.Entree;
  private busyWithServer = false;

  private selectedCommunicationType: CommunicationType = CommunicationType.ChatWidget;
  private newName = ""

  //PHONE
  private selectedPhoneNumber: AvailablePhoneNumberData = {
    phoneNumber: null,
  };
  private selectedPhoneNumberCountryCode = "";
  private availablePhoneNumbers: AvailablePhoneNumberData[] = [];
  private busyFetchingAvailablePhoneNumbers = true;
  private selectedPhoneAccountHolder: PhoneChannelAccountHolderType = PhoneChannelAccountHolderType.Tick;

  //CHatWidget
  private chatwidget_color1 = "";


  private selectEmptyPhoneChannel() {
    this.selectedPhoneAccountHolder = PhoneChannelAccountHolderType.Tenant;
    this.next();
  }

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


    if (!stringIsNullOrEmpty(useUserStore().localeCode)) {
      this.selectedPhoneNumberCountryCode = useUserStore().localeCode.substring(0, 2).toUpperCase();
    }
  }

  private getChannelIconName(type: CommunicationType): string {
    return getChannelIconName(type);
  }

  private fetchAvailablePhoneNumbers() {

    this.busyFetchingAvailablePhoneNumbers = true;
    getAvailablePhoneNumbers(this.selectedPhoneNumberCountryCode).then((d) => {
      this.availablePhoneNumbers = d;
      this.busyFetchingAvailablePhoneNumbers = false;

      if (d && d.length) {
        this.selectedPhoneNumber = d[0];
      }
    })
  }


  private goNext() {
    if (this.step == ChannelCreatorPanelStep.Finish) {
      this.close();
    } else {
      this.step++;
    }

  }

  private next() {

    switch (this.step) {
      case ChannelCreatorPanelStep.General:
        if (this.selectedCommunicationType == CommunicationType.Phone) {
          this.step = ChannelCreatorPanelStep.PhoneChannel
          this.fetchAvailablePhoneNumbers();
        }
        else {
          this.step = ChannelCreatorPanelStep.Finish
        }

        return;
      case ChannelCreatorPanelStep.PhoneChannel:
        if (this.selectedPhoneAccountHolder == PhoneChannelAccountHolderType.Tick && stringIsNullOrEmpty(this.selectedPhoneNumber.phoneNumber)) {
          notifyError("Input required", "Please select a phone number to work with")
          return;
        }
        break;
      case ChannelCreatorPanelStep.Finish:
        this.createChannel();
        break;

    }
    this.goNext();
  }

  private close() {
    this.$emit("close");
  }

  private get getPhoneChannelSettings(): PhoneChannelSettings {

    const phoneNumber: PhoneNumberData = this.selectedPhoneAccountHolder == PhoneChannelAccountHolderType.Tick ?
      {
        phoneNumber: this.selectedPhoneNumber.phoneNumber,
        sId: null,

      } : null;

    return {
      accountHolder: this.selectedPhoneAccountHolder,
      phoneNumber: phoneNumber,
      recordPhoneCall: false,
    }

  }

  private async createChannel() {

    let settingsObjJson = "";
    switch (this.selectedCommunicationType) {
      case CommunicationType.Phone:
        settingsObjJson = JSON.stringify(this.getPhoneChannelSettings)
        this.newName = stringIsNullOrEmpty(this.newName) ? this.getPhoneChannelSettings?.phoneNumber?.phoneNumber : this.newName;
        break;
    }


    const id = await useChannelsStore().add(this.selectedCommunicationType, this.newName, settingsObjJson);
    //this.$router.push({ params: { ...this.$route.params, id } });

    RouterToView(ViewName.Channels, id);
  }


  private selectPhoneNumber(phone: AvailablePhoneNumberData) {
    this.selectedPhoneNumber = phone;
  }

  private getIndicator(phone: AvailablePhoneNumberData): TickIndicatorData {
    return {
      color: ColorsEnum.Lime,
      title: `${phone.monthlyCost},-`,
      tooltip: "",
    }

  }

  private get phoneCountryOptions() {
    return [
      {
        value: "NL",
        text: "Netherlands"
      },
      {
        value: "US",
        text: "United states"
      }
    ]
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: clamp(200px, 1200px, 90dvw);
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
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;

    &.left {
      justify-content: left;
    }


  }


}

.phone-header {
  display: flex;
  gap: 10px;
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
