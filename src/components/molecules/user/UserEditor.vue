<template>
  <TickScreen :loaded="!this.loaded" :title="name">

    <template v-slot:actions>
      <TickButton @click="remove" v-if="deleteallowed" :busy="busyDeleting" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast"></TickButton>


      <TickButton @click="makeAdmin" v-if="canMakeAdmin" :busy="busySettingAdmin" :appearance="Appearance.secondary" :color="Color.contrast">{{
        $translate(LanguagePath.App_UserEditor_MakeAdmin) }} </TickButton>
      <TickButton @click="removeAsAdmin" v-if="canRemoveAsAdmin" :busy="busySettingAdmin">{{ $translate(LanguagePath.App_UserEditor_RemoveAsAdmin) }}</TickButton>
      <TickButton @click="save" v-if="editallowed" :disabled="!readyForSave" :busy="busySaving">{{ $translate(LanguagePath.App_Save) }}</TickButton>
    </template>

    <template v-slot:default>

      <TickEditorPanel v-if="isDeleted" :name="$translate(LanguagePath.App_Removed)">
        <template v-slot:explainer>{{ $translate(LanguagePath.App_UserEditor_Removed_Explainer) }}</template>

      </TickEditorPanel>


      <TickEditorPanel :name="$translate(LanguagePath.App_UserEditor_PublicInfo_Title)">
        <template v-slot:explainer>{{ $translate(LanguagePath.App_UserEditor_PublicInfo_Explainer) }}</template>

        <AvatarSelector :disabled="disabled" @select="setAvatarSelection" :fileId="fileId" :name="name" :color="color" :sizePx="80" :type="userType" />

        <TickInput v-model="publicName" :maxlength="20" :placeholder="$translate(LanguagePath.App_UserEditor_PublicInfo_Name_Placeholder)" :disabled="disabled">
          {{ $translate(LanguagePath.App_UserEditor_PublicInfo_Name_Title) }}</TickInput>
      </TickEditorPanel>

      <TickEditorPanel :name="$translate(LanguagePath.App_UserEditor_Internal_Title)">
        <TickInput v-model="name" :maxlength="20" :placeholder="$translate(LanguagePath.App_UserEditor_Internal_Name_Placeholder)" :disabled="disabled">
          {{ $translate(LanguagePath.App_UserEditor_Internal_Name_Title) }}</TickInput>
        <TickInput v-model="handle" :maxlength="20" :placeholder="$translate(LanguagePath.App_UserEditor_Internal_Handle_Placeholder)" :disabled="disabled">
          {{ $translate(LanguagePath.App_UserEditor_Internal_Handle_Title) }}</TickInput>
        <div class="info"> {{ $translate(LanguagePath.App_UserEditor_Internal_Handle_Explainer, [{ path: 'handle', value: handle }]) }}</div>


        <TickSelector v-model="gender" :options="genderOptions">{{ $translate(LanguagePath.App_UserEditor_Gender_Title) }}</TickSelector>
        <TickSelector v-model="voiceLang" :options="voiceLanguageOptions">{{ $translate(LanguagePath.App_UserEditor_VoiceLanguage_Title) }}</TickSelector>

        <TickPhoneNumberInput v-if="isUser" v-model="phoneNumber" :disabled="disabled" :objectId="activeId" :validationType="ValidationCodeTypeEnum.ValidateUserPhoneNumber" />
        <TickSelector v-if="isUser" v-model="phoneAuthorization" :options="phoneAuthorizationOptions">{{ $translate(LanguagePath.App_UserEditor_PhoneAuthorization_Title) }}</TickSelector>

      </TickEditorPanel>

      <TickEditorPanel :name="$translate(LanguagePath.App_UserEditor_Security_Title)" v-if="isUser">
        <template v-slot:explainer>
          {{ $translate(LanguagePath.App_UserEditor_Security_Explainer) }}
        </template>

        <TickInput v-model="user.username" :placeholder="$translate(LanguagePath.App_UserEditor_Security_Username_Placeholer)" :disabled="disabled">
          {{ $translate(LanguagePath.App_UserEditor_Security_Username_Title) }}
        </TickInput>
        <TickInput v-model="user.passwordRecoveryEmailAddress" :placeholder="$translate(LanguagePath.App_UserEditor_Security_Username_Placeholer)" :disabled="disabled">
          {{ $translate(LanguagePath.App_UserEditor_Security_Recovery_Email_Title) }}</TickInput>

        <TickButton @click="resetUserPassword" v-if="canResetPassword" :disabled="!readyForResetPassword" :busy="busyResettingUserPassword">
          {{ $translate(LanguagePath.App_UserEditor_Security_Reset_Password_Title) }}
        </TickButton>

      </TickEditorPanel>


      <Dashboard v-if="hasUserDashboard" :data="userDashboard" :dashboardId="userDashboardId" :showTitle="false" :disabled="true" />


    </template>
  </TickScreen>

</template>

<script lang="ts">

import ThenHr from "@/components/atoms/ThenHr.vue";
import TickAvatar from '@/components/atoms/TickAvatar.vue';
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickPhoneNumberInput from "@/components/atoms/TickPhoneNumberInput.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import UserIcon from '@/components/atoms/UserIcon.vue';
import { AvatarSelection } from '@/components/panels/AvatarSelectorPanel.vue';
import { getGenderOptions, getUserPhoneAuthorizationOptions, getVoiceLangOptions } from "@/helpers/enumsHelper";
import { onConfirmation } from '@/helpers/questionHelper';
import { notifyMessage } from '@/notify';
import { getUserDashboardSmall } from '@/services/TeamsService';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import { AuthorizationObjectType, ColorsEnum, FileSourceType, GenderEnum, LanguagePath, TickDashboard, TickManagerUserData, UserPhoneAuthorizationEnum, UserTypeEnum, ValidationCodeTypeEnum, VoiceLanguageEnum } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import Dashboard from '../dashboarding/Dashboard.vue';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import FileDataUploaderZone from '../files/FileDataUploaderZone.vue';
import AvatarSelector from '../Selectors/AvatarSelector.vue';
import TickColorSelector from '../Selectors/TickColorSelector.vue';

@Component({
  emits: ["deleted", "saved"],
  components: {
    TickInput, TickTextArea, TickButton, TickCheckbox, ThenHr, TickScreen, TickEditorPanel,
    TickDropdown, FileDataUploaderZone, UserIcon, TickAvatar, TickColorSelector, AvatarSelector, Dashboard, TickPhoneNumberInput, TickSelector
  },
})
export default class UserEditor extends Vue {
  LanguagePath = LanguagePath
  Appearance = Appearance
  Color = Color
  Size = Size
  ValidationCodeTypeEnum = ValidationCodeTypeEnum
  FileSourceType = FileSourceType;
  @Prop() private activeId!: string;
  private user: TickManagerUserData = null;
  private loaded = false;
  private busySaving = false;
  private busyDeleting = false;
  private busySettingAdmin = false;
  private busyResettingUserPassword = false;
  private userDashboard?: TickDashboard = null;
  private get disabled() {
    return !this.editallowed;
  }

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useManagingStore().getUser(id).then(user => {
      this.user = user;
      this.loaded = true;
    })
  }
  mounted() {
    this.activate(this.activeId);

    getUserDashboardSmall(this.activeId).then((d) => {
      this.userDashboard = d;
    })

  }

  private get genderOptions() {
    return getGenderOptions();
  }

  private get gender() {
    return this.user?.gender;
  }
  private set gender(to: GenderEnum) {
    this.user.gender = to;
  }

  private get voiceLang() {
    return this.user?.voiceLang;
  }
  private set voiceLang(to: VoiceLanguageEnum) {
    this.user.voiceLang = to;
  }


  private get voiceLanguageOptions() {
    return getVoiceLangOptions();
  }

  private get isUser() {
    return this.user?.userType == UserTypeEnum.User;
  }

  private get isDeleted() {
    return this.user?.deleted;
  }

  private get hasUserDashboard() {
    return this.userDashboard != null;
  }

  private get userDashboardId(): string {
    return this.userDashboard?.id;
  }


  private setAvatarSelection(to: AvatarSelection) {
    this.user.avatarFileId = to.fileId;
    this.user.color = to.color;
  }

  private get callerIsAdmin() {
    return useUserStore().isGlobalAdmin;
  }

  private get isMe() {
    return useUserStore().userId == this.activeId;
  }

  private get canRemoveAsAdmin() {
    return this.isUser && this.callerIsAdmin && this.isAdmin && !this.isMe
  }

  private get canMakeAdmin() {
    return this.isUser && this.callerIsAdmin && !this.isAdmin && !this.isDeleted
  }

  private get canResetPassword() {
    return (this.callerIsAdmin || this.isMe) && !this.isDeleted;
  }
  private get isAdmin(): boolean {
    return this.user.readOnlyData.isAdmin;
  }

  private makeAdmin() {
    if (!confirm("Are you sure? Admins can do everything without explicit authorizations.")) { return; }
    this.setAdmin(true);
  }


  private removeAsAdmin() {
    onConfirmation(() => {
      this.setAdmin(false);
    });

  }

  private setAdmin(setAdmin: boolean) {
    this.busySettingAdmin = true;
    useManagingStore().updateUserAdmin(this.activeId, setAdmin).then((user) => {
      this.user = user;
      this.busySettingAdmin = false;
    });
  }


  private get deleteallowed() {
    const allow = this.editallowed && !this.isDeleted && !useUserStore().isSelf(this.activeId);

    return allow;
  }


  private get editallowed() {
    return !this.isDeleted && useUserStore().allowedEdit(AuthorizationObjectType.Workspace)
  }

  private get userType() {
    return this.user?.userType;
  }

  private get color() {
    return this.user?.color;
  }
  private set color(to: ColorsEnum) {
    this.user.color = to;
  }

  private get phoneNumber() {
    return this.user?.phoneNumber;
  }
  private set phoneNumber(to: string) {
    this.user.phoneNumber = to;
  }
  private get phoneAuthorization() {
    return this.user?.phoneAuthorization;
  }
  private set phoneAuthorization(to: UserPhoneAuthorizationEnum) {
    this.user.phoneAuthorization = to;
  }

  private get phoneAuthorizationOptions() {
    return getUserPhoneAuthorizationOptions();
  }

  private get name() {
    return this.user?.name;
  }
  private set name(to: string) {
    this.user.name = to;
  }

  private get publicName() {
    return this.user?.publicName;
  }
  private set publicName(to: string) {
    this.user.publicName = to;
  }



  private get fileId(): string {
    return this.user?.avatarFileId;
  }
  private set fileId(to: string) {
    this.user.avatarFileId = to;
  }


  private get handle(): string {
    return this.user?.handle;
  }
  private set handle(to: string) {
    this.user.handle = to;
  }



  private get allTeamOptions() {
    const teams = useUtilityDataStore().utilityData.teams;
    const options = teams.map((item) => ({
      text: item.name,
      id: item.id,
    }));
    return options;
  }



  private get readyForResetPassword() {
    return this.IsValidateEmail(this.user?.passwordRecoveryEmailAddress)
  }

  private resetUserPassword() {
    this.busyResettingUserPassword = true;
    useManagingStore().resetUserPassword(this.user.username).then(() => {
      this.busyResettingUserPassword = false;
      notifyMessage("Success", "The user will receive a reset password e-mail shortly")
    });
  }

  private get readyForSave() {
    return true;
  }

  private save() {
    this.busySaving = true;
    useManagingStore().saveUser(this.user.id).then(() => {
      this.busySaving = false;
      this.$emit("saved");
    });

  }

  private remove() {
    onConfirmation(() => {
      this.busyDeleting = true;
      useManagingStore().deleteUser(this.user.id).then(() => {
        this.busyDeleting = false;
        this.$emit("deleted");
      }, () => {
        this.busyDeleting = false;
      });
    })
  }

  private IsValidateEmail(mail: string): boolean {
    // eslint-disable-next-line no-useless-escape
    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (regexp.test(mail)) {
      return (true);
    }
    return (false);
  }



  private openAvatarSelector() {
    //AvatarSelectorPanel
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.delete {
  float: right;
  margin-bottom: 5px;
}

.info {
  font-size: $text-size-regular;
}

.user-avatar-editor {
  display: flex;
}

.profile-picture {
  display: grid;

  .overlay {
    position: relative;
    bottom: -60%;

    &.has {
      bottom: -105%;
      opacity: 0.7;
    }

    background-color: var(--c-base-300);
    color: var(--c-contrast);

    width: 100px;
    height: 25px;
    text-align: center;
    font-size: $text-size-regular;
    font-weight: 600;

  }
}
</style>
