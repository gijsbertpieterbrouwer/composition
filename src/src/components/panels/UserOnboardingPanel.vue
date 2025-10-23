<template>
  <TickDialogPanel :noClose="true" class="panel" @close="close" :type="dialogType">
    <template #title>{{ $translate(LanguagePath.App_UserOnboardingPanel_Title) }}</template>

    <div class="content">
      <!-- Entree -->
      <div v-if="step == OnboardingStep.Entree" class="section_content">

        <div class="entree-wrapper">
          <div class="entree-title">{{ $translate(LanguagePath.App_UserOnboardingPanel_Welcome_Title) }}</div>
          <div class="entree-explanation"> {{ $translate(LanguagePath.App_UserOnboardingPanel_Welcome_Explanation) }} </div>
        </div>
      </div>

      <!-- Language -->
      <div v-else-if="step == OnboardingStep.Language" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_UserOnboardingPanel_Language_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_UserOnboardingPanel_Language_Explanation) }} </div>

        <LanguageSelector @select="selectLanguage" :languageCode="userLanguageCode" :size="Size.regular" :appearance="Appearance.primary" :color="Color.contrast" />

      </div>

      <!-- Theme -->
      <div v-else-if="step == OnboardingStep.Theme" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_UserOnboardingPanel_Theme_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_UserOnboardingPanel_Theme_Explanation) }} </div>

        <!-- <TickSwitch v-model="personalTheme"> {{ $translate(LanguagePath.App_UserPanel_Theme) }}</TickSwitch> -->

        <div class="themes_wrapper">
          <WizardOptionButton class="theme-option" @select="personalTheme = true" :selected="personalTheme" :name="$translate(LanguagePath.App_UserOnboardingPanel_Theme_Light_Title)">
            {{ $translate(LanguagePath.App_UserOnboardingPanel_Theme_Light_Explanation) }}
          </WizardOptionButton>

          <WizardOptionButton class="theme-option" @select="personalTheme = false" :selected="!personalTheme" :name="$translate(LanguagePath.App_UserOnboardingPanel_Theme_Dark_Title)">
            {{ $translate(LanguagePath.App_UserOnboardingPanel_Theme_Dark_Explanation) }}
          </WizardOptionButton>
        </div>



      </div>


      <!-- User -->
      <div v-if="step == OnboardingStep.User" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_UserOnboardingPanel_User_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_UserOnboardingPanel_User_Explanation) }} </div>

        <!-- <TickHeading :size="HeadingSize.small">How may we call you? </TickHeading> -->
        <TickInput class="input" v-model.lazy="editableName" :maxlength="20" :placeholder="$translate(LanguagePath.App_Name)" />

        <AvatarSelector @select="setAvatarSelection" :fileId="userAvatarFileId" :name="editableName" :color="userColor" :sizePx="80" :type="userType" />


        <div class="explanation">
          {{ $translate(LanguagePath.App_UserOnboardingPanel_Welcome_Onboarding_UserPanel_Title) }}
        </div>
      </div>

      <!-- SetupItems -->
      <div v-else-if="step == OnboardingStep.SetupItems" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_UserOnboardingPanel_Setup_Title) }}</TickHeading>

        <div class="create_actions">
          <WizardOptionButton class="create_action" @select="createSetupItems = false" :selected="!createSetupItems" :name="$translate(LanguagePath.App_UserOnboardingPanel_Setup_Empty_Title)">
            {{ $translate(LanguagePath.App_UserOnboardingPanel_Setup_Empty_Container_Title) }}
            <br /><br />
            {{ $translate(LanguagePath.App_UserOnboardingPanel_Setup_Empty_Container_Explanation) }}
          </WizardOptionButton>

          <WizardOptionButton class="create_action" @select="createSetupItems = true" :selected="createSetupItems" :name="$translate(LanguagePath.App_UserOnboardingPanel_Setup_Filled_Title)">
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
      <div v-else-if="step == OnboardingStep.Finish" class="section_content">
        <HappyIndicator text="You are ready, click NEXT to start using Tick" />
      </div>


    </div>

    <template #footer>
      <div class="footer">
        <div class="secondaryActions">
          <TickButton class="action" :appearance="Appearance.transparent" @click="exitOnboarding" :color="Color.contrast">{{ $translate(LanguagePath.App_UserOnboardingPanel_Exit_Title) }}
          </TickButton>
          <TickButton class="action" @click="openCommunity" v-if="communityUrl" :appearance="Appearance.transparent" :color="Color.contrast">
            {{ $translate(LanguagePath.App_UserOnboardingPanel_AskCommunity_Title) }}</TickButton>
        </div>

        <TickButton :busy="busyWithServer" @click="next" :size="Size.XXL"> {{ $translate(LanguagePath.App_Next) }}</TickButton>
      </div>
    </template>
  </TickDialogPanel>
</template>

<script lang="ts">
import { FileSourceType, LanguagePath, MetaDataItem } from "@/TickApi";
import TickIcon from "@/components/TickIcon.vue";
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickHeading, { Size as HeadingSize } from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { focus } from "@/directives";
import { getLanguageByLocaleCode, getLanguageOptions } from "@/helpers/enumsHelper";
import { mount, unmount } from "@/helpers/mountHelper";
import { onConfirmation } from "@/helpers/questionHelper";
import { updateMyUser } from "@/services/TeamsService";
import { setupWorkspace } from "@/services/WorkspaceService";
import { CommunityURL, openUrl } from "@/services/urls";
import useAppStore from "@/store/app";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import useViewstateStore, { ThemeEnum } from "@/store/viewstate";
import { Component, Vue } from "vue-facing-decorator";
import HappyIndicator from "../atoms/HappyIndicator.vue";
import { PanelStyle } from "../atoms/TickPanel.vue";
import TickSwitch from "../atoms/TickSwitch.vue";
import WizardOptionButton from "../atoms/WizardOptionButton.vue";
import WizardOptionItem from "../atoms/WizardOptionItem.vue";
import AvatarSelector from "../molecules/Selectors/AvatarSelector.vue";
import LanguageSelector from "../molecules/Selectors/LanguageSelector.vue";
import TickEditorPanel from "../molecules/editor/TickEditorPanel.vue";
import UserCreator from "../molecules/user/UserCreator.vue";
import { AvatarSelection } from "./AvatarSelectorPanel.vue";

const onboardingPanelId = "onboardingPanel";

export function removeOnboardingPanel() {
  unmount(onboardingPanelId);
}

export function openOnboardingPanel() {
  mount(UserOnboardingPanel, {
    props: {

    },
    events: {
      close: () => {
        removeOnboardingPanel();
      },
    },
  }, onboardingPanelId);
}

enum OnboardingStep {
  Entree = 0,
  Language = 1,
  Theme = 2,
  User = 3,
  SetupItems = 4,
  Finish = 5,
}

@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickDialogPanel,
    LanguageSelector,
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
    AvatarSelector
  },
})
export default class UserOnboardingPanel extends Vue {
  Appearance = ButtonAppearance;
  Size = ButtonSize;
  Color = ButtonColor;
  OnboardingStep = OnboardingStep;
  FileSourceType = FileSourceType;
  HeadingSize = HeadingSize;
  LanguagePath = LanguagePath;
  PanelStyle = PanelStyle;
  ThemeEnum = ThemeEnum;

  private step: OnboardingStep = OnboardingStep.Entree;
  private busyWithServer = false;
  private editableName?: string = "";
  private createSetupItems = true;
  private communityUrl = CommunityURL();


  private get userAvatarFileId() {
    return this.user?.avatarFileId;
  }
  private get userColor() {
    return this.user?.color;
  }
  private get userType() {
    return this.user?.userType;
  }

  private setAvatarSelection(to: AvatarSelection) {
    this.user.avatarFileId = to.fileId;
    this.user.color = to.color;
  }

  private get personalTheme() {
    return useViewstateStore().theme == ThemeEnum.Daylight;
  }

  private set personalTheme(to: boolean) {
    useViewstateStore().theme = to ? ThemeEnum.Daylight : ThemeEnum.Midnight;
  }

  private get dialogType() {
    return this.step == OnboardingStep.Entree ? PanelStyle.wizard : PanelStyle.normal
    // if (this.step == OnboardingStep.Entree) { return PanelStyle.funky; }

    // return null;
  }

  private get languageOptions() {
    return getLanguageOptions();
  }

  private get userLanguageCode() {
    return useUserStore().localeCode;
  }

  private selectLanguage(to: string) {
    useAppStore().useLanguage(getLanguageByLocaleCode(to), true).then(() => {
      useUserStore().localeCode = to as string;
    });
  }

  private openCommunity() {
    openUrl(this.communityUrl);
  }

  private exitOnboarding() {
    onConfirmation(() => {
      this.close();
    })

  }

  private get hasItems(): boolean {
    const u = useUtilityDataStore().utilityData;

    const total = u.adapterDefinitions.length + u.cannedResponseDefinitions.length + u.flowDefinitions.length + u.labelDefinitions.length;

    return total > 0;
  }


  mounted() {
    this.editableName = this.user.name;
    useUtilityDataStore().use();
  }

  private get user() {
    const id = useUserStore().userId;
    const user = useUtilityDataStore().user(id);
    return user;
  }

  private onCreated(data: MetaDataItem) {
    this.$emit("close", data);
  }


  private updateUser() {
    this.busyWithServer = true;
    updateMyUser({
      name: this.editableName,
      localeCode: this.userLanguageCode,
      avatarFileId: this.userAvatarFileId,
      color: this.userColor,
      workspaceId: useUserStore().activeWorkspaceId,
    }).then(() => {
      this.busyWithServer = false;
    })
  }

  private setupItems() {
    this.busyWithServer = true;
    setupWorkspace({
      workspaceId: useUserStore().activeWorkspaceId,
      createItems: this.createSetupItems,
    }).then(() => {
      this.busyWithServer = false;
    })
  }


  private goNext() {

    if (this.step == OnboardingStep.Finish) {
      this.close();
    } else {
      this.step++;
    }
    const isAdmin = this.user.isAdmin
    const alreadyHasItems = this.hasItems;

    // skip step if not admin
    const adminSteps = [OnboardingStep.SetupItems];
    if (adminSteps.some(p => p == this.step)) {
      if (!isAdmin || alreadyHasItems) {
        this.goNext();
      }
    }

  }

  private next() {
    switch (this.step) {
      case OnboardingStep.User:
        this.updateUser();
        break;
      case OnboardingStep.SetupItems:
        this.setupItems();
        break;

    }
    this.goNext();
  }

  private close() {
    this.$emit("close");
  }

}
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

      // &.selected {}
    }
  }

  .create_actions {
    display: flex;
    gap: 20px;
    justify-content: center;

    .create_action {
      width: 40%;
      height: 200px;

      // &.selected {}
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
