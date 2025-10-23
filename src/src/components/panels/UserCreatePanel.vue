<template>
  <TickDialogPanel class="panel" @close="close">
    <template #title>{{ this.panelTitle }}</template>

    <div class="content">
      <template v-if="bulk">
        <div class="explanation">
          {{ $translate(LanguagePath.App_UserCreatePanel_Bulk_Explanation) }}
          <br /> <br />
          {{ $translate(LanguagePath.App_UserCreatePanel_Bulk_Tip) }}
        </div>
        <TickTextarea v-model="bulkData" :minimumrows="15" placeholder="Einstein, relativity@yourcompany.com @einstein-handle(optional)">
          {{ $translate(LanguagePath.App_UserCreatePanel_Bulk_UserData_Title) }}
        </TickTextarea>

      </template>
      <template v-else>
        <UserCreator @saved="onCreated" @cancel="close" :userType="userType" />
      </template>
    </div>

    <template v-slot:footer v-if="bulk">
      <TickButton @click="close" :appearance="ButtonAppearance.transparent">{{ $translate(LanguagePath.App_Cancel) }}</TickButton>
      <TickButton @click="createBulk" :busy="busyCreatingBulk">{{ this.bulkAddTitle }}</TickButton>
    </template>

  </TickDialogPanel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import TickIcon from "@/components/TickIcon.vue";
import TickButton, { Appearance as ButtonAppearance, Size as ButtonSize, Color as ButtonColor, } from "@/components/atoms/TickButton.vue";
import { focus } from "@/directives";
import TickEditorPanel from "../molecules/editor/TickEditorPanel.vue";
import UserCreator from "../molecules/user/UserCreator.vue";
import { AddUserRequest, MetaDataItem, UserTypeEnum, LanguagePath } from "@/TickApi";
import { getUserTypeOptions } from "@/helpers/enumsHelper";
import { stringIsNullOrEmpty, stringIsValidEmail } from "@/helpers/stringHelper";
import useUserStore from "@/store/user";
import useManagingStore from "@/store/managingStore";
import { notifyError, notifyMessage, notifySaved } from "@/notify";
import { translate } from '@/plugins/translatePlugin';

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
    TickTextarea
  },
})
export default class UserCreatePanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath
  @Prop({ default: UserTypeEnum.User }) private userType!: UserTypeEnum;
  @Prop({ default: false }) private bulk: boolean;

  private bulkData = ""
  private busyCreatingBulk = false;


  private get bulkAddTitle(): string {
    const applicableAdds = this.applicableRequests.length;
    return applicableAdds > 1
      ? translate(LanguagePath.App_UserCreatePanel_Bulk_Multiple_AddButton_Title, { path: 'nr', value: applicableAdds.toString() })
      : translate(LanguagePath.App_UserCreatePanel_Bulk_Single_AddButton_Title);
  }

  private get applicableRequests() {
    return this.bulkUserRequests?.filter(p => p);
  }

  private async createBulk() {
    const savingErrors: AddUserRequest[] = [];
    const completedRequests: AddUserRequest[] = [];
    const requests = this.bulkUserRequests;

    if (requests.length == 0) {
      notifyMessage(translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_NoData_Title), translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_NoData_Explanation));
      return;
    }
    this.busyCreatingBulk = true;

    for (let index = 0; index < requests.length; index++) {
      const r = requests[index];
      if (!r) {
        savingErrors.push(r);
        continue;
      }
      try {
        await useManagingStore().addUser(r);
        completedRequests.push(r);
      } catch (error) {
        savingErrors.push(r);
      }
    }

    this.busyCreatingBulk = false;

    if (savingErrors.length) {
      notifyError(translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_IssuesDetected_Title, { path: 'nr', value: savingErrors.length.toString() }), translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_IssuesDetected_Explanation));
    }

    if (completedRequests.length) {
      notifySaved(translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_Finished_Title), translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_Finished_Explanation, { path: 'nr', value: `${completedRequests.length}/${requests.length}` }));
      this.bulkData = "";
    }
  }

  private splitString(input: string): string[] {
    return input.includes("\t") ? input.split("\t") : input.includes(",") ? input.split(",") : input.split(" ");
  }

  private get bulkUserRequests() {
    const splitUserLines = this.bulkData.trim().split(/\r?\n/);
    const createRequests: AddUserRequest[] = [];

    for (let index = 0; index < splitUserLines.length; index++) {
      const userLine = splitUserLines[index];


      // check if possible multiple users(emailaddresses) on same line
      var lineParts = this.splitString(userLine);
      const emailParts = lineParts?.filter(p => p && stringIsValidEmail(p.trim()));
      if (emailParts.length > 1) {
        // multiple email addresses on same line

        for (let emailIndex = 0; emailIndex < emailParts.length; emailIndex++) {
          const email = emailParts[emailIndex];
          let r = this.createUserRequestFromline(email);
          // ignore doubles
          if (r && createRequests.some(p => p?.name == r.name || p?.emailAddress == r.emailAddress)) {
            r = null;
          }
          createRequests.push(r);
        }

      } else {

        // skip empty lines
        if (!userLine) { continue; }
        let r = this.createUserRequestFromline(userLine);
        // ignore doubles
        if (r && createRequests.some(p => p?.name == r.name || p?.emailAddress == r.emailAddress)) {
          r = null;
        }

        createRequests.push(r);
      }
    }

    return createRequests;
  }

  private createUserRequestFromline(line: string): AddUserRequest {
    if (!line) { return null; }
    var lineParts = this.splitString(line);

    let handlePart: string = null;
    let emailPart: string = null;
    let namePart: string = null;

    for (let index = 0; index < lineParts.length; index++) {
      const p = lineParts[index];

      if (p?.startsWith("@")) {
        {
          handlePart = p;
          continue;
        }
      }

      if (p && stringIsValidEmail(p.trim())) {
        emailPart = p.trim();
        continue;
      }

      if (!stringIsNullOrEmpty(p) && p.length > 3) {
        namePart = p;
        continue;
      }
    }

    return this.createUserRequest(namePart, emailPart, handlePart);

  }

  private createUserRequest(name: string, email: string, handle?: string) {
    const calculatedName = name || email.trim().substring(0, email.indexOf("@"));
    const calculatedEmail = email?.trim() || "";
    const calculatedHandle = handle ? handle.trim() : `@${calculatedName?.trim().replace(' ', '').toLowerCase()}`;

    if (this.handleInUse(calculatedHandle)) { return null; }
    if (this.nameInUse(calculatedName)) { return null; }
    if (this.emailInUse(calculatedName)) { return null; }

    return {
      emailAddress: calculatedEmail,
      handle: calculatedHandle,
      name: calculatedName,
      userName: calculatedEmail,
      userType: this.userType,
      workspaceId: useUserStore().activeWorkspaceId,
    }
  }

  private emailInUse(email: string): boolean {
    if (!email) { return false; }
    return this.allUsers.some(p => p.emailAddress === email);
  }
  private handleInUse(handle: string): boolean {
    if (!handle) { return false; }
    return this.allUsers.some(p => p.handle === handle);
  }

  private nameInUse(name: string): boolean {
    if (!name) { return false; }
    return this.allUsers.some(p => p.name === name);
  }

  private get allUsers() {
    return useManagingStore().userSummaries;
  }

  private get panelTitle() {
    const t = getUserTypeOptions().find(p => p.id == this.userType);

    return this.bulk
      ? translate(LanguagePath.App_UserCreatePanel_AddButton_Bulk_Title, { path: 'name', value: t.text })
      : translate(LanguagePath.App_UserCreatePanel_AddButton_Single_Title, { path: 'name', value: t.text });//`Add a new ${t.text}`;
  }

  private onCreated(data: MetaDataItem) {
    this.$emit("close", data);
  }

  private close() {
    this.$emit("close");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 800px;
  display: grid;
  gap: 20px;

  .explanation {
    font-size: $text-size-regular;
    font-style: italic;

  }

}
</style>
