<template>
  <div>
    <TickInput placeholder="Name" v-model="name">{{ $translate(LanguagePath.App_Name) }}</TickInput>
    <TickInput placeholder="@name" v-model="handle" v-if="userType == UserTypeEnum.User">{{ $translate(LanguagePath.App_Handle) }}</TickInput>
    <TickInput placeholder="Username" v-model="username" v-if="userType == UserTypeEnum.User">{{ $translate(LanguagePath.App_UserCreator_Username_Title) }}</TickInput>
    <TickInput placeholder="Verification email address" v-model="passwordRecoveryEmailAddress" v-if="userType == UserTypeEnum.User">{{ $translate(LanguagePath.App_UserCreator_Email_Title) }}
    </TickInput>

    <div>
      <EditorMessage v-if="handleInUse" title="Handle already used" message="The chosen handle is already occupied by another user. Please choose another" />
      <EditorMessage v-if="hasSavingError" title="Sorry" :message="savingError" />
    </div>

    <div class="actions">
      <TickButton class="button-item " @click="cancel" :appearance="Appearance.transparent">{{ $translate(LanguagePath.App_Cancel) }}</TickButton>
      <TickButton :disabled="!readyForSave" class="button" @click="create" :busy="busyCreating">{{ this.createTitle }}</TickButton>
    </div>

  </div>
</template>

<script lang="ts">

import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { stringIsNullOrEmpty } from '@/helpers/stringHelper';
import { translate } from '@/plugins/translatePlugin';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import { LanguagePath, UserTypeEnum } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import EditorMessage from '../EditorMessage.vue';

@Component({
  emits: ["cancel", "saved"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, ThenHr, TickScreen, TickEditorPanel, EditorMessage },
})
export default class UserCreator extends Vue {
  @Prop({ default: UserTypeEnum.User }) private userType!: UserTypeEnum;
  UserTypeEnum = UserTypeEnum;
  Appearance = Appearance
  LanguagePath = LanguagePath
  private busyCreating = false;

  private name = "";
  private username = "";
  private handle = "";
  private passwordRecoveryEmailAddress = process.env.VUE_APP_EMAIL || "";

  private get createTitle() {
    return this.userType == UserTypeEnum.User
      ? translate(LanguagePath.App_UserCreator_Create_Title)
      : translate(LanguagePath.App_Create)

  }
  // mounted() {
  //   //this.name = this.userType == UserTypeEnum.Bot ? "" : "";
  // }
  private get allUsers() {
    return useManagingStore().userSummaries;
  }

  private get handleInUse(): boolean {
    if (!this.handle) { return false; }
    return this.allUsers.some(p => p.handle === this.handle);
  }

  private get readyForSave() {

    let fieldsFilled = false;

    switch (this.userType) {
      case UserTypeEnum.Bot:
        fieldsFilled = !stringIsNullOrEmpty(this.name)
          && !stringIsNullOrEmpty(this.handle);
        break;
      case UserTypeEnum.User:
        fieldsFilled = !stringIsNullOrEmpty(this.name)
          && !stringIsNullOrEmpty(this.handle)
          && !stringIsNullOrEmpty(this.username)
          && !stringIsNullOrEmpty(this.passwordRecoveryEmailAddress);
        break;
    }




    return fieldsFilled && !this.handleInUse;
  }

  private cancel() {
    this.$emit("cancel");
  }

  @Watch("name")
  private nameChanged(to: string, from: string) {
    const fromHandle = from.split(/\W/s)[0];
    const toHandle = to.split(/\W/s)[0];

    if (!this.handle || this.handle == "@" || this.handle == `@${fromHandle}`) {
      this.handle = `@${toHandle}`
    }
  }


  private savingError: string = null;
  private get hasSavingError() {
    return !stringIsNullOrEmpty(this.savingError);
  }

  private create() {
    this.savingError = null;
    this.busyCreating = true;
    useManagingStore().addUser({
      emailAddress: this.passwordRecoveryEmailAddress,
      handle: this.handle,
      name: this.name,
      userName: this.username,
      workspaceId: useUserStore().activeWorkspaceId,
      userType: this.userType,

    }).then(data => {

      this.cancel;
      this.$emit("saved", data);
    }).catch(() => {
      this.savingError = "Could not add user, is the username already occupied?";
    }).finally(() => {
      this.busyCreating = false;
    });
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;


  .button-item {
    display: inline-flex;
  }
}
</style>
