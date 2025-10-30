<template>
  <TickDialogPanel :noClose="true" class="panel" @close="close" :type="dialogType">
    <template #title>{{ $translate(LanguagePath.App_UserOnboardingPanel_Title) }}</template>

    <div class="content">
      <!-- Entree -->
      <div v-if="step === OnboardingStep.Entree" class="section_content">
        <div class="entree-wrapper">
          <div class="entree-title">{{ $translate(LanguagePath.App_UserOnboardingPanel_Welcome_Title) }}</div>
          <div class="entree-explanation"> {{ $translate(LanguagePath.App_UserOnboardingPanel_Welcome_Explanation) }} </div>
        </div>
      </div>

      <!-- Language -->
      <div v-else-if="step === OnboardingStep.Language" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_UserOnboardingPanel_Language_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_UserOnboardingPanel_Language_Explanation) }} </div>

        <LanguageSelector @select="selectLanguage" :languageCode="userLanguageCode" :size="Size.regular" :appearance="Appearance.primary" :color="Color.contrast" />
      </div>

      <!-- Theme -->
      <div v-else-if="step === OnboardingStep.Theme" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_UserOnboardingPanel_Theme_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_UserOnboardingPanel_Theme_Explanation) }} </div>

        <div class="themes_wrapper">
          <WizardOptionButton class="theme-option" @select="() => (personalTheme = true)" :selected="personalTheme" :name="$translate(LanguagePath.App_UserOnboardingPanel_Theme_Light_Title)">
            {{ $translate(LanguagePath.App_UserOnboardingPanel_Theme_Light_Explanation) }}
          </WizardOptionButton>

          <WizardOptionButton class="theme-option" @select="() => (personalTheme = false)" :selected="!personalTheme" :name="$translate(LanguagePath.App_UserOnboardingPanel_Theme_Dark_Title)">
            {{ $translate(LanguagePath.App_UserOnboardingPanel_Theme_Dark_Explanation) }}
          </WizardOptionButton>
        </div>
      </div>

      <!-- User -->
      <div v-if="step === OnboardingStep.User" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_UserOnboardingPanel_User_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_UserOnboardingPanel_User_Explanation) }} </div>

        <TickInput class="input" v-model.lazy="editableName" :maxlength="20" :placeholder="$translate(LanguagePath.App_Name)" />

        <AvatarSelector @select="setAvatarSelection" :fileId="userAvatarFileId" :name="editableName" :color="userColor" :sizePx="80" :type="userType" />

        <div class="explanation">
          {{ $translate(LanguagePath.App_UserOnboardingPanel_Welcome_Onboarding_UserPanel_Title) }}
        </div>
      </div>

      <!-- SetupItems -->
      <div v-else-if="step === OnboardingStep.SetupItems" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_UserOnboardingPanel_Setup_Title) }}</TickHeading>

        <div class="create_actions">
          <WizardOptionButton class="create_action" @select="() => (createSetupItems = false)" :selected="!createSetupItems" :name="$translate(LanguagePath.App_UserOnboardingPanel_Setup_Empty_Title)">
            {{ $translate(LanguagePath.App_UserOnboardingPanel_Setup_Empty_Container_Title) }}
            <br /><br />
            {{ $translate(LanguagePath.App_UserOnboardingPanel_Setup_Empty_Container_Explanation) }}
          </WizardOptionButton>

          <WizardOptionButton class="create_action" @select="() => (createSetupItems = true)" :selected="createSetupItems" :name="$translate(LanguagePath.App_UserOnboardingPanel_Setup_Filled_Title)">
            {{ $translate(LanguagePath.App_UserOnboardingPanel_Setup_Filled_Container_Title) }}
            <br /><br />
            {{ $translate(LanguagePath.App_UserOnboardingPanel_Setup_Filled_Container_Explanation) }}
          </WizardOptionButton>
        </div>

        <div class=" explanation center">
          {{ $translate(LanguagePath.App_UserOnboardingPanel_Setup_Explanation) }}
        </div>
      </div>

      <!-- FINISH -->
      <div v-else-if="step === OnboardingStep.Finish" class="section_content">
        <HappyIndicator text="You are ready, click NEXT to start using Tick" />
      </div>
    </div>

    <template #footer>
      <div class="footer">
        <div class="secondaryActions">
          <TickButton class="action" :appearance="Appearance.transparent" @click="exitOnboarding" :color="Color.contrast">
            {{ $translate(LanguagePath.App_UserOnboardingPanel_Exit_Title) }}
          </TickButton>

          <TickButton class="action" @click="openCommunity" v-if="communityUrl" :appearance="Appearance.transparent" :color="Color.contrast">
            {{ $translate(LanguagePath.App_UserOnboardingPanel_AskCommunity_Title) }}
          </TickButton>
        </div>

        <TickButton :busy="busyWithServer" @click="next" :size="Size.XXL"> {{ $translate(LanguagePath.App_Next) }}</TickButton>
      </div>
    </template>
  </TickDialogPanel>
</template>

<script setup lang="ts">
/* Composition API rewrite of UserOnboardingPanel.vue */

import { computed, onMounted, ref } from "vue";

import HappyIndicator from "@/components/atoms/HappyIndicator.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import { PanelStyle } from "@/components/atoms/TickPanel.vue";
import WizardOptionButton from "@/components/atoms/WizardOptionButton.vue";
import AvatarSelector from "@/components/molecules/Selectors/AvatarSelector.vue";
import LanguageSelector from "@/components/molecules/Selectors/LanguageSelector.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { onConfirmation } from "@/helpers/questionHelper";
import { updateMyUser } from "@/services/TeamsService";
import { setupWorkspace } from "@/services/WorkspaceService";
import { CommunityURL, openUrl } from "@/services/urls";

import useAppStore from "@/store/app";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import useViewstateStore, { ThemeEnum } from "@/store/viewstate";

import {
  ColorsEnum,
  LanguagePath,
  MetaDataItem
} from "@/TickApi";

/* Emits */
const emit = defineEmits<{
  (e: "close", payload?: MetaDataItem): void;
}>();

/* ENUM for steps */
enum OnboardingStep {
  Entree = 0,
  Language = 1,
  Theme = 2,
  User = 3,
  SetupItems = 4,
  Finish = 5,
}

/* local state */
const step = ref<OnboardingStep>(OnboardingStep.Entree);
const busyWithServer = ref(false);
const editableName = ref<string>("");
const createSetupItems = ref<boolean>(true);
const communityUrl = ref<string | null>(CommunityURL());

/* stores */
const appStore = useAppStore();
const userStore = useUserStore();
const utilityStore = useUtilityDataStore();
const viewstateStore = useViewstateStore();

/* derived/computed values */
const user = computed(() => {
  const id = userStore.userId;
  return utilityStore.user(id);
});

const userAvatarFileId = computed(() => user.value?.avatarFileId);
const userColor = computed(() => user.value?.color);
const userType = computed(() => user.value?.userType);
const userLanguageCode = computed(() => userStore.localeCode);

/* theme binding (reactive primitive that templates unwrap automatically) */
let personalTheme = computed<boolean>({
  get: () => viewstateStore.theme === ThemeEnum.Daylight,
  set: (v: boolean) => {
    viewstateStore.theme = v ? ThemeEnum.Daylight : ThemeEnum.Midnight;
  },
});

/* dialog type */
const dialogType = computed(() => (step.value === OnboardingStep.Entree ? PanelStyle.wizard : PanelStyle.normal));

/* helpers */
function setAvatarSelection(to: { fileId: string; color: ColorsEnum }) {
  if (user.value) {
    user.value.avatarFileId = to.fileId;
    user.value.color = to.color;
  }
}

function selectLanguage(code: string) {
  appStore.useLanguage(getLanguageByLocaleCode(code), true).then(() => {
    userStore.localeCode = code as string;
  });
}

/* external helpers used inside component */
import { getLanguageByLocaleCode } from "@/helpers/enumsHelper";

/* lifecycle */
onMounted(() => {
  editableName.value = user.value?.name || "";
  // ensure utility data is present
  utilityStore.use();
});

/* business actions */
function exitOnboarding() {
  onConfirmation(() => {
    close();
  });
}

function openCommunity() {
  if (communityUrl.value) {
    openUrl(communityUrl.value);
  }
}

function updateUser() {
  if (!user.value) return;

  busyWithServer.value = true;
  updateMyUser({
    name: editableName.value,
    localeCode: userLanguageCode.value,
    avatarFileId: userAvatarFileId.value,
    color: userColor.value,
    workspaceId: userStore.activeWorkspaceId ?? "",
  })
    .finally(() => (busyWithServer.value = false));
}

function setupItems() {
  busyWithServer.value = true;
  setupWorkspace({
    workspaceId: userStore.activeWorkspaceId ?? "",
    createItems: createSetupItems.value,
  })
    .finally(() => (busyWithServer.value = false));
}

function goNext() {
  if (step.value === OnboardingStep.Finish) {
    close();
    return;
  }

  step.value++;

  // skip admin-only steps if not admin or already has items
  const isAdmin = user.value?.isAdmin;
  const alreadyHasItems = hasItems.value;

  const adminSteps = [OnboardingStep.SetupItems];
  if (adminSteps.includes(step.value)) {
    if (!isAdmin || alreadyHasItems) {
      // advance again
      step.value++;
    }
  }
}

function next() {
  switch (step.value) {
    case OnboardingStep.User:
      updateUser();
      break;
    case OnboardingStep.SetupItems:
      setupItems();
      break;
    default:
      break;
  }
  goNext();
}

function close() {
  emit("close");
}

/* small computed: whether workspace already contains items (used to skip step) */
const hasItems = computed(() => {
  const u = utilityStore.utilityData;
  if (!u) return false;
  const total =
    (u.adapterDefinitions?.length || 0) +
    (u.cannedResponseDefinitions?.length || 0) +
    (u.flowDefinitions?.length || 0) +
    (u.labelDefinitions?.length || 0);
  return total > 0;
});

/* expose constants for template usage */
const AppearanceConst = Appearance;
const SizeConst = Size;
const ColorConst = Color;
const LanguagePathConst = LanguagePath;
const OnboardingStepConst = OnboardingStep;

/* return for script-setup is implicit; expose local names to template by declaring them */
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: clamp(200px, 1000px, 90dvw);
  min-height: 400px;

  .section_content {
    height: 100%;
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

  .language-options-wrapper {
    display: flex;
    gap: 20px;
    justify-content: center;
  }

  .themes_wrapper {
    display: flex;
    gap: 20px;
    justify-content: center;

    .theme-option {
      width: 40%;
      height: 200px;
    }
  }

  .create_actions {
    display: flex;
    gap: 20px;
    justify-content: center;

    .create_action {
      width: 40%;
      height: 200px;
    }
  }

  .create_items {
    background-color: var(--c-base-100);
    border-radius: 8px;
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
