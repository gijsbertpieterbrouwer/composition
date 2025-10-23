<template>
  <div class="databag-editor">
    <!-- <template v-if="loaded && this.team"> -->
    <TickScreen :loading="!loaded" :title="screenTitle">
      <template v-slot:actions>
        <TickButton @click="remove" v-if="deleteallowed" :busy="busyDeleting" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
        <TickButton @click="save" v-if="editallowed" :disabled="!readyForSave" :busy="busySaving">{{ $translate(LanguagePath.App_Save) }}</TickButton>
      </template>

      <template v-slot:default>
        <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)">
          <TickInput v-model="teamName" :placeholder="$translate(LanguagePath.App_Name)" :disabled="disabled">{{ $translate(LanguagePath.App_Name) }}</TickInput>
          <TickInput v-model="teamHandle" :placeholder="$translate(LanguagePath.Handle)" :disabled="disabled">{{ $translate(LanguagePath.Handle) }}</TickInput>
          <TickColorSelector class="color" v-model="teamColor">{{ $translate(LanguagePath.Color) }}</TickColorSelector>

          <TickPhoneNumberInput v-model="phoneNumber" :disabled="disabled" :objectId="activeId" :validationType="ValidationCodeTypeEnum.ValidateTeamPhoneNumber" />
          <TickSelector v-model="phoneAuthorization" :options="phoneAuthorizationOptions">{{ $translate(LanguagePath.App_TeamEditor_PhoneAuthorization_Title) }}</TickSelector>
        </TickEditorPanel>

        <TickEditorPanel :name="$translate(LanguagePath.App_TeamEditor_Members_Title)">
          <template v-slot:explainer v-if="!hasMemberUsers">
            {{ $translate(LanguagePath.App_TeamEditor_Members_NoData) }}
          </template>
          <TickDropdown @select="addMemberUser" :options="nonMemberUserOptions" :placeholder="$translate(LanguagePath.App_TeamEditor_Members_Add)" v-if="!disabled" />

          <div class="list" v-if="hasMemberUsers">
            <TickListItem :noBGColor="true" :name="user.name" @select="selectUser(user.id)" v-for="user in this.memberUsers" :key="user.id">
              <template v-slot:icon>
                <UserIcon :userId="user.id" />
              </template>
              <template v-slot:actions>
                <TickButton @click.stop="removeTeamUser(user)" :appearance="Appearance.secondary" :color="Color.contrast" v-if="!disabled" icon="delete" />
              </template>
              {{ $translate(LanguagePath.App_TeamEditor_Members_Member) }}
            </TickListItem>
          </div>

        </TickEditorPanel>
      </template>
    </TickScreen>
    <!-- </template>
    <template v-else> loading... </template> -->
  </div>
</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown, { DropdownOption } from "@/components/atoms/TickDropdown.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickPhoneNumberInput from "@/components/atoms/TickPhoneNumberInput.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import UserIcon from "@/components/atoms/UserIcon.vue";
import TickColorSelector from "@/components/molecules/Selectors/TickColorSelector.vue";
import { getTeamPhoneAuthorizationOptions } from "@/helpers/enumsHelper";
import { onConfirmation } from "@/helpers/questionHelper";
import { translate } from "@/plugins/translatePlugin";
import { RouterToUser } from "@/router";
import useManagingStore from "@/store/managingStore";
import useUserStore from "@/store/user";
import {
  AuthorizationObjectType, ColorsEnum, LanguagePath,
  TeamPhoneAuthorizationEnum, TickManagerTeamData,
  UserSummary,
  UserTypeEnum,
  ValidationCodeTypeEnum
} from "@/TickApi";
import { Component, Prop, Vue, Watch } from "vue-facing-decorator";
import TickEditorPanel from "../editor/TickEditorPanel.vue";
import TickScreen from "../editor/TickScreen.vue";

@Component({
  emits: ["deleted", "saved"],
  components: {
    TickInput,
    TickTextArea,
    TickButton,
    TickCheckbox,
    ThenHr,
    TickScreen,
    TickEditorPanel,
    TickSelector,
    TickListItem,
    UserIcon,
    TickDropdown,
    TickColorSelector,
    TickPhoneNumberInput
  },
})
export default class TeamEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  ValidationCodeTypeEnum = ValidationCodeTypeEnum
  @Prop() private activeId!: string;
  private team: TickManagerTeamData = null;
  private loaded = false;

  private busySaving = false;
  private busyDeleting = false;

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useManagingStore()
      .getTeam(id)
      .then((team) => {
        this.team = team;
        this.loaded = true;
      });
  }
  mounted() {
    this.activate(this.activeId);
    useManagingStore().useUsers();
  }

  private get phoneNumber() {
    return this.team?.phoneNumber;
  }
  private set phoneNumber(to: string) {
    this.team.phoneNumber = to;
  }

  private get phoneAuthorization() {
    return this.team?.phoneAuthorization;
  }
  private set phoneAuthorization(to: TeamPhoneAuthorizationEnum) {
    this.team.phoneAuthorization = to;
  }


  private get phoneAuthorizationOptions() {
    return getTeamPhoneAuthorizationOptions();
  }

  private selectUser(userId: string) {
    RouterToUser(userId);
  }

  private get teamName() {
    return this.team?.name;
  }

  private set teamName(to: string) {
    if (!this.loaded) { return; }
    this.team.name = to;
  }

  private get teamHandle() {
    return this.team?.handle;
  }

  private set teamHandle(to: string) {
    if (!this.loaded) { return; }
    this.team.handle = to;
  }

  private get teamColor() {
    return this.team?.color ?? ColorsEnum.Grey;
  }

  private set teamColor(to: ColorsEnum) {
    if (!this.loaded) { return; }
    this.team.color = to;
  }


  private addMemberUser(id: string) {
    this.team.memberUserIds.push(id);
  }

  private removeTeamUser(user: UserSummary) {
    this.team.memberUserIds = this.team.memberUserIds.filter(p => p != user.id);
  }

  private get hasMemberUsers() {
    return this.team?.memberUserIds.length || false;
  }

  private get allUsers() {
    return useManagingStore().userSummaries;
  }

  private get nonMemberUserOptions(): DropdownOption[] {

    const nonMembers = this.allUsers.filter(p => p.userType == UserTypeEnum.User && !this.team?.memberUserIds.some(a => a == p.id));

    const options: DropdownOption[] = nonMembers.map((p) => ({
      id: p.id,
      text: p.name,
    }));

    return options;
  }

  private get memberUsers() {
    return this.allUsers.filter(p => this.team.memberUserIds.some(a => a == p.id));
  }



  private get deleteallowed() {
    const allow = this.editallowed;
    return allow;
  }

  private get disabled() {
    return !this.editallowed;
  }

  private get editallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace);
  }



  private get screenTitle() {
    return this.team?.name || translate(LanguagePath.Team);
  }



  private get readyForSave() {
    return true;
  }

  private save() {
    this.busySaving = true;
    useManagingStore()
      .saveTeam(this.team.id)
      .then(() => {
        this.busySaving = false;
        this.$emit("saved");
      });
  }

  private remove() {

    onConfirmation(() => {
      this.busyDeleting = true;
      useManagingStore()
        .deleteTeam(this.team.id)
        .then(
          () => {
            this.busyDeleting = false;
            this.$emit("deleted");
          },
          () => {
            this.busyDeleting = false;
          }
        );
    }, translate(LanguagePath.App_TeamEditor_Delete_Question))


  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  margin-top: 10px;

}

.delete {
  float: right;
  margin-bottom: 5px;
}

.no-members {
  font-size: 0.7em;
  font-style: italic;
}
</style>
