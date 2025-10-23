<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>Console</template>

    <template #actions>

    </template>
    <div class="content">
      <TickOptionBar class="tab-bar" v-model="viewState" :buttons="tabButtons" :size="ButtonSize.regular" />

      <template v-if="viewState == ViewState.Checks">
        <div>

          <table class="styled-table odd-even">
            <tbody>

              <tr>
                <td>
                  <TickCheckIndicator :valid="loggedIn" />
                </td>
                <td>Logged in as: {{ userName }}</td>
              </tr>
              <tr>
                <td>
                  <TickCheckIndicator :valid="hasRealtimeConnection" />
                </td>
                <td>Realtime connection</td>
              </tr>
              <tr v-if="hasPhoneChannels">
                <td>
                  <TickCheckIndicator :valid="hasVoiceConnection" />
                </td>
                <td>Voice connection ({{ voiceConnectionLabel }})</td>
              </tr>
              <tr>
                <td style="width:50px">
                  <TickIcon name="check" class="check" />
                </td>
                <td>Version: {{ appVersion }}</td>
              </tr>
              <tr>
                <td style="width:50px">
                  <TickIcon name="check" class="check" />
                </td>
                <td>Tenant: {{ tenantId }}</td>
              </tr>

            </tbody>
          </table>

        </div>

      </template>


      <template v-else-if="viewState == ViewState.Controls">
        <SidebarPanel name="TickColors" id="tickColors">
          <div class="flex">

            <div class="color base">base</div>
            <div class="color base-100">100</div>
            <div class="color base-200">200</div>
            <div class="color base-300">300</div>
            <div class="color base-400">400</div>
            <div class="color base-500">500</div>

          </div>
        </SidebarPanel>


        <SidebarPanel name="TickAvatar" id="tickavatar">
          <div class="flex">
            <TickAvatar name="T D" :color="ColorsEnum.BoldLime" :online="true" />
            <TickAvatar name="B I G" :color="ColorsEnum.BoldPurple" :sizePx="80" />
            <TickAvatar name="B I G" :color="ColorsEnum.BoldYellow" :sizePx="160" />
          </div>
        </SidebarPanel>

        <SidebarPanel name="Inputs" id="inputs">
          <TickInput placeholder="placeholder" :disabled="true">Input (with label, disabled)</TickInput>
          <TickInput placeholder="type='number'" type="number" />

          <TickInput type="date" />
          <TickInput placeholder="type='color'" type="color" />
          <TickInput placeholder="type='range'" type="range" />

          <TickTextarea :minimumrows="3" placeholder="minimumrows='3'" :disabled="true">Text area(Disabled)</TickTextarea>
          <TickTextarea :minimumrows="3" placeholder="minimumrows='3'">Text area</TickTextarea>
        </SidebarPanel>

        <SidebarPanel name="Controls" id="controls">
          <div class="flex">
            <TickButton>Primary</TickButton>
            <TickButton :appearance="ButtonAppearance.secondary" :color="ButtonColor.contrast">Secondary</TickButton>
            <TickButton :appearance="ButtonAppearance.transparent" :color="ButtonColor.contrast">Transparant</TickButton>
          </div>
          <div class="flex">
            <TickButton :appearance="ButtonAppearance.primary" :color="ButtonColor.affirm" :size="ButtonSize.mini">Affirm mini</TickButton>
            <TickButton :appearance="ButtonAppearance.primary" :color="ButtonColor.failure" :size="ButtonSize.regular">Failure</TickButton>
            <TickButton :appearance="ButtonAppearance.primary" :color="ButtonColor.tertiary" :size="ButtonSize.XXL">Tertiary XXL</TickButton>
          </div>
          <br /> <br />
          <div class="flex">
            <br />
            <WizardOptionButton :selected="true" name="selected">Wizard option button</WizardOptionButton>
            <WizardOptionButton :selected="false" name="option 2">These are great</WizardOptionButton>
            <WizardOptionButton :selected="false" name="option 3">Yes, they are!</WizardOptionButton>

          </div>
          <br /><br />
          <TickOptionBar v-model="sampleTabButtonIndex" :buttons="sampleTabButtons" :size="ButtonSize.mini" />
          <TickOptionBar v-model="sampleTabButtonIndex" :buttons="sampleTabButtons" :size="ButtonSize.regular" />
          <TickOptionBar v-model="sampleTabButtonIndex" :buttons="sampleTabButtons" :size="ButtonSize.XXL" />
        </SidebarPanel>



      </template>
      <template v-else-if="viewState == ViewState.Logs">
        <div class="section-wrapper">
          <table class="styled-table">
            <tbody>
              <tr v-for="(log, index) in logs" :key="index" class="log-row" :class="getColorName(log.color)">
                <td>
                  {{ log.message }}
                </td>

                <td>{{ getDate(log.date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </template>


    </div>

    <template #footer>
      <TickButton class="action" @click="openCommunity" :appearance="ButtonAppearance.transparent" :color="ButtonColor.contrast">
        {{ $translate(LanguagePath.App_UserOnboardingPanel_AskCommunity_Title) }}</TickButton>
    </template>

  </TickDialogPanel>
</template>

<script lang="ts">
import TickAddCostItemButton from "@/components/atoms/TickAddCostItemButton.vue";
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import ChannelLabel, { ChannelLabelSize } from "@/components/molecules/channel/ChannelLabel.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import { getColorName } from "@/helpers/colorsHelper";
import { displayDateWithFormat } from "@/helpers/dateHelper";
import { mount, unmount } from "@/helpers/mountHelper";
import { CachedLog, getLogs } from "@/log";
import { AppVersion, CommunityURL, openUrl } from "@/services/urls";
import useAppStore from "@/store/app";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import useVoiceStore from "@/store/voice";
import { AuthorizationObjectType, ColorsEnum, CommunicationType, LanguagePath, SubscriptionCostItemType } from "@/TickApi";
import { Device } from "@twilio/voice-sdk";
import { Component, Vue } from "vue-facing-decorator";
import SidebarPanel from "../atoms/SidebarPanel.vue";
import TickAvatar from "../atoms/TickAvatar.vue";
import TickCheckIndicator from "../atoms/TickCheckIndicator.vue";
import TickOptionBar, { OptionBarItem } from "../atoms/TickOptionBar.vue";
import TickTextarea from "../atoms/TickTextarea.vue";
import WizardOptionButton from "../atoms/WizardOptionButton.vue";
import { getVoiceDevice } from "../molecules/voice/TickVoiceCenter.vue";


const panelName = "TickConsolePanel";

export function openTickConsole() {
  mount(TickConsolePanel, {
    props: {

    },
    events: {
      close: () => {
        unmount(panelName);
      },
    },
  }, panelName);
}

enum ViewState {
  Checks,
  Controls,
  Logs,

}

@Component({
  directives: { focus },
  emits: ["close", "select"],
  components: {
    TickOptionBar,
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    ChannelLabel,
    TickSwitch,
    TickAddCostItemButton, WizardOptionButton,
    TickAvatar,
    SidebarPanel,
    TickTextarea,
    TickCheckIndicator
  },
})
export default class TickConsolePanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath
  ChannelLabelSize = ChannelLabelSize
  AuthorizationObjectType = AuthorizationObjectType
  SubscriptionCostItemType = SubscriptionCostItemType
  ViewState = ViewState
  ColorsEnum = ColorsEnum;
  private viewState = ViewState.Checks;
  private logs: CachedLog[] = [];



  mounted() {
    this.logs = getLogs();
  }

  private getColorName(color: ColorsEnum) {
    return getColorName(color);
  }
  private getDate(date: Date) {
    return displayDateWithFormat(date, "HH:mm:ss");
  }



  private openCommunity() {
    openUrl(CommunityURL());
  }

  private get channels() {
    return useUtilityDataStore().utilityData.communicationChannels;
  }
  private get hasPhoneChannels() {
    return this.channels.some(p => p.communicationType == CommunicationType.Phone)
  }

  private get userName() {
    const user = useUtilityDataStore().user(useUserStore().userId);
    return user.name
  }

  private get appVersion() {
    return AppVersion();
  }
  private get tenantId() {
    return useUserStore().tenantId;
  }

  private get loggedIn() {
    return useAppStore().authenticated
  }

  private get hasRealtimeConnection() {
    return useAppStore().rtcConnected;
  }

  private get hasVoiceConnection() {
    const device = getVoiceDevice()
    return useVoiceStore().connected && device?.state == Device.State.Registered;
  }
  private get voiceConnectionLabel() {
    const device = getVoiceDevice()
    return device?.state;
  }


  private get tabButtons(): OptionBarItem[] {
    const o = [
      {
        id: ViewState.Checks,
        text: "Connection",
      },
      {
        id: ViewState.Logs,
        text: "Log",
      },
    ]

    if (useAppStore().inDeveloperMode) {

      o.push(
        {
          id: ViewState.Controls,
          text: "Controls",
        })
    }
    return o;

  }

  private sampleTabButtonIndex = 1;

  private get sampleTabButtons(): OptionBarItem[] {
    return [
      {
        id: 1,
        text: "Tab 1",
      },
      {
        id: 2,
        text: "Tab 2",
      },
      {
        id: 3,
        text: "Tab 3",
      },
      {
        id: 4,
        text: "Tab 4",
      },
    ]
  }


  private close() {
    this.$emit("close");
  }

}


</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.styled-table {
  td {
    padding-left: 20px;
    height: 40px;
  }


}

.check {
  width: 12px;
  height: 12px;
}

.content {
  width: clamp(400px, 80vw, 1000px);
  display: grid;
  gap: 10px;

  .explanation {
    font-size: $text-size-regular;
    font-style: italic;
  }


  .flex {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: left;
    align-content: flex-end;
    align-items: end;

  }

}

.footer {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
}

.log-row {
  @include neon-bg;
  @include font-inter;
}

.section-wrapper {
  max-height: 40vh;
  overflow: hidden;
  overflow-y: auto;
  border-radius: 8px;
}



.color {
  padding: 5px;
  border-radius: 8px;
  height: 30px;
  width: 80px;
  border: 2px solid var(--c-base-200);
}


.base {
  background-color: var(--c-base);
}

.base-100 {
  background-color: var(--c-base-100);
}

.base-200 {
  background-color: var(--c-base-200);
}

.base-300 {
  background-color: var(--c-base-300);
}

.base-400 {
  background-color: var(--c-base-400);
}

.base-500 {
  background-color: var(--c-base-500);
}
</style>
