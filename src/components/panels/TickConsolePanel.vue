<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>Console</template>

    <template #actions></template>

    <div class="content">
      <TickOptionBar class="tab-bar" v-model="viewState" :buttons="tabButtons" :size="ButtonSize.regular" />

      <template v-if="viewState === ViewState.Checks">
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
              <tr style="width:50px">
                <td>
                  <TickIcon name="check" class="check" />
                </td>
                <td>Version: {{ appVersion }}</td>
              </tr>
              <tr style="width:50px">
                <td>
                  <TickIcon name="check" class="check" />
                </td>
                <td>Tenant: {{ tenantId }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <template v-else-if="viewState === ViewState.Controls">
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
            <TickButton :appearance="ButtonAppearance.transparent" :color="ButtonColor.contrast">Transparent</TickButton>
          </div>
          <div class="flex">
            <TickButton :appearance="ButtonAppearance.primary" :color="ButtonColor.affirm" :size="ButtonSize.mini">Affirm mini</TickButton>
            <TickButton :appearance="ButtonAppearance.primary" :color="ButtonColor.failure" :size="ButtonSize.regular">Failure</TickButton>
            <TickButton :appearance="ButtonAppearance.primary" :color="ButtonColor.tertiary" :size="ButtonSize.XXL">Tertiary XXL</TickButton>
          </div>
          <br /><br />
          <div class="flex">
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

      <template v-else-if="viewState === ViewState.Logs">
        <div class="section-wrapper">
          <table class="styled-table">
            <tbody>
              <tr v-for="(log, index) in logs" :key="index" class="log-row" :class="getColorName(log.color)">
                <td>{{ log.message }}</td>
                <td>{{ getDate(log.date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <template #footer>
      <TickButton class="action" @click="openCommunity" :appearance="ButtonAppearance.transparent" :color="ButtonColor.contrast">
        {{ $translate(LanguagePath.App_UserOnboardingPanel_AskCommunity_Title) }}
      </TickButton>
    </template>
  </TickDialogPanel>
</template>

<script setup lang="ts">
import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import TickAvatar from '@/components/atoms/TickAvatar.vue';
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize } from '@/components/atoms/TickButton.vue';
import TickCheckIndicator from '@/components/atoms/TickCheckIndicator.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickOptionBar, { OptionBarItem } from '@/components/atoms/TickOptionBar.vue';
import TickTextarea from '@/components/atoms/TickTextarea.vue';
import WizardOptionButton from '@/components/atoms/WizardOptionButton.vue';
import TickDialogPanel from '@/components/panels/TickDialogPanel.vue';
import TickIcon from '@/components/TickIcon.vue';
import { getColorName } from '@/helpers/colorsHelper';
import { displayDateWithFormat } from '@/helpers/dateHelper';
import { CachedLog, getLogs } from '@/log';
import { AppVersion, CommunityURL, openUrl } from '@/services/urls';
import useAppStore from '@/store/app';
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import useVoiceStore from '@/store/voice';
import { ColorsEnum, CommunicationType, LanguagePath } from '@/TickApi';
import { computed, onMounted, ref } from 'vue';
import { getVoiceDevice } from '../molecules/voice/TickVoiceCenter.vue';

enum ViewState {
  Checks,
  Controls,
  Logs,
}

const logs = ref<CachedLog[]>([]);
const viewState = ref<ViewState>(ViewState.Checks);
const sampleTabButtonIndex = ref(1);

const ButtonAppearanceConst = ButtonAppearance;
const ButtonSizeConst = ButtonSize;
const ButtonColorConst = ButtonColor;

const appStore = useAppStore();
const userStore = useUserStore();
const utilityStore = useUtilityDataStore();
const voiceStore = useVoiceStore();

onMounted(() => {
  logs.value = getLogs();
});

const tabButtons = computed<OptionBarItem[]>(() => {
  const o: OptionBarItem[] = [
    { id: ViewState.Checks, text: 'Connection' },
    { id: ViewState.Logs, text: 'Log' },
  ];
  if (appStore.inDeveloperMode) {
    o.push({ id: ViewState.Controls, text: 'Controls' });
  }
  return o;
});

const sampleTabButtons = computed<OptionBarItem[]>(() => [
  { id: 1, text: 'Tab 1' },
  { id: 2, text: 'Tab 2' },
  { id: 3, text: 'Tab 3' },
  { id: 4, text: 'Tab 4' },
]);

const logsRef = logs;

const getColorNameFn = (color: ColorsEnum) => getColorName(color);
const getDateFn = (date: Date) => displayDateWithFormat(date, 'HH:mm:ss');

const channels = computed(() => utilityStore.utilityData.communicationChannels || []);
const hasPhoneChannels = computed(() => channels.value.some(p => p.communicationType === CommunicationType.Phone));
const userName = computed(() => utilityStore.user(userStore.userId)?.name);
const appVersion = computed(() => AppVersion());
const tenantId = computed(() => userStore.tenantId);
const loggedIn = computed(() => appStore.authenticated);
const hasRealtimeConnection = computed(() => appStore.rtcConnected);

const voiceDevice = computed(() => getVoiceDevice());
const hasVoiceConnection = computed(() => voiceStore.connected && voiceDevice.value?.state === 'registered');
const voiceConnectionLabel = computed(() => voiceDevice.value?.state);

const openCommunity = () => openUrl(CommunityURL());
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
