<template>
  <TickDialogPanel class="panel" @close="close">
    <template #title>{{ panelTitle }}</template>

    <div class="content">
      <template v-if="bulk">
        <div class="explanation">
          {{ $translate(LanguagePath.App_UserCreatePanel_Bulk_Explanation) }}
          <br /><br />
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
      <TickButton @click="close" :appearance="ButtonAppearance.transparent">
        {{ $translate(LanguagePath.App_Cancel) }}
      </TickButton>

      <TickButton @click="createBulk" :busy="busyCreatingBulk">
        {{ bulkAddTitle }}
      </TickButton>
    </template>
  </TickDialogPanel>
</template>

<script setup lang="ts">
import TickButton, {
  Appearance as ButtonAppearance,
  Color as ButtonColor,
  Size as ButtonSize,
} from "@/components/atoms/TickButton.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { focus } from "@/directives";
import { getUserTypeOptions } from "@/helpers/enumsHelper";
import { stringIsNullOrEmpty, stringIsValidEmail } from "@/helpers/stringHelper";
import { notifyError, notifyMessage, notifySaved } from "@/notify";
import { translate } from "@/plugins/translatePlugin";
import useManagingStore from "@/store/managingStore";
import useUserStore from "@/store/user";
import { AddUserRequest, LanguagePath, MetaDataItem, UserTypeEnum } from "@/TickApi";
import { computed, ref } from "vue";
import UserCreator from "../molecules/user/UserCreator.vue";

defineOptions({
  directives: { focus },
});

const emit = defineEmits(["close"]);

const props = defineProps({
  userType: { type: Number, default: UserTypeEnum.User },
  bulk: { type: Boolean, default: false },
});

const ButtonAppearanceConst = ButtonAppearance;
const ButtonSizeConst = ButtonSize;
const ButtonColorConst = ButtonColor;
const LanguagePathConst = LanguagePath;

const bulkData = ref("");
const busyCreatingBulk = ref(false);

// ----------------------
// Computed Properties
// ----------------------

const allUsers = computed(() => useManagingStore().userSummaries);

const bulkUserRequests = computed<AddUserRequest[]>(() => {
  const splitUserLines = bulkData.value.trim().split(/\r?\n/);
  const createRequests: AddUserRequest[] = [];

  for (const userLine of splitUserLines) {
    if (!userLine) continue;
    const lineParts = splitString(userLine);
    const emailParts = lineParts.filter((p) => p && stringIsValidEmail(p.trim()));

    const addUniqueRequest = (req: AddUserRequest | null) => {
      if (req && !createRequests.some((p) => p?.name === req.name || p?.emailAddress === req.emailAddress)) {
        createRequests.push(req);
      }
    };

    if (emailParts.length > 1) {
      for (const email of emailParts) {
        addUniqueRequest(createUserRequestFromLine(email));
      }
    } else {
      addUniqueRequest(createUserRequestFromLine(userLine));
    }
  }

  return createRequests;
});

const applicableRequests = computed(() => bulkUserRequests.value.filter((p) => p));

const bulkAddTitle = computed(() => {
  const applicableAdds = applicableRequests.value.length;
  return applicableAdds > 1
    ? translate(LanguagePath.App_UserCreatePanel_Bulk_Multiple_AddButton_Title, {
      path: "nr",
      value: applicableAdds.toString(),
    })
    : translate(LanguagePath.App_UserCreatePanel_Bulk_Single_AddButton_Title);
});

const panelTitle = computed(() => {
  const t = getUserTypeOptions().find((p) => p.id == props.userType);
  return props.bulk
    ? translate(LanguagePath.App_UserCreatePanel_AddButton_Bulk_Title, {
      path: "name",
      value: t?.text ?? "",
    })
    : translate(LanguagePath.App_UserCreatePanel_AddButton_Single_Title, {
      path: "name",
      value: t?.text ?? "",
    });
});

// ----------------------
// Methods
// ----------------------

function splitString(input: string): string[] {
  if (input.includes("\t")) return input.split("\t");
  if (input.includes(",")) return input.split(",");
  return input.split(" ");
}

function createUserRequestFromLine(line: string): AddUserRequest | null {
  if (!line) return null;
  const lineParts = splitString(line);

  let handlePart: string | null = null;
  let emailPart: string | null = null;
  let namePart: string | null = null;

  for (const p of lineParts) {
    if (p?.startsWith("@")) {
      handlePart = p;
      continue;
    }
    if (p && stringIsValidEmail(p.trim())) {
      emailPart = p.trim();
      continue;
    }
    if (!stringIsNullOrEmpty(p) && p.length > 3) {
      namePart = p;
    }
  }

  return createUserRequest(namePart, emailPart, handlePart);
}

function createUserRequest(name: string | null, email: string | null, handle?: string | null): AddUserRequest | null {
  const calculatedEmail = email ? email.trim() : "";
  const calculatedName = name ?? calculatedEmail.substring(0, calculatedEmail.indexOf("@"));
  const calculatedHandle = handle ? handle.trim() : `@${calculatedName?.trim().replace(" ", "").toLowerCase()}`;

  if (handleInUse(calculatedHandle)) return null;
  if (nameInUse(calculatedName)) return null;
  if (emailInUse(calculatedEmail)) return null;

  return {
    emailAddress: calculatedEmail,
    handle: calculatedHandle,
    name: calculatedName,
    userName: calculatedEmail,
    userType: props.userType,
    workspaceId: useUserStore().activeWorkspaceId ?? "",
  };
}

function emailInUse(email: string): boolean {
  return !!email && allUsers.value.some((p) => p.emailAddress === email);
}

function handleInUse(handle: string): boolean {
  return !!handle && allUsers.value.some((p) => p.handle === handle);
}

function nameInUse(name: string): boolean {
  return !!name && allUsers.value.some((p) => p.name === name);
}

async function createBulk() {
  const savingErrors: AddUserRequest[] = [];
  const completedRequests: AddUserRequest[] = [];
  const requests = bulkUserRequests.value;

  if (requests.length === 0) {
    notifyMessage(
      translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_NoData_Title),
      translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_NoData_Explanation)
    );
    return;
  }

  busyCreatingBulk.value = true;

  for (const r of requests) {
    if (!r) {
      savingErrors.push(r);
      continue;
    }
    try {
      await useManagingStore().addUser(r);
      completedRequests.push(r);
    } catch {
      savingErrors.push(r);
    }
  }

  busyCreatingBulk.value = false;

  if (savingErrors.length) {
    notifyError(
      translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_IssuesDetected_Title, {
        path: "nr",
        value: savingErrors.length.toString(),
      }),
      translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_IssuesDetected_Explanation)
    );
  }

  if (completedRequests.length) {
    notifySaved(
      translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_Finished_Title),
      translate(LanguagePath.App_UserCreatePanel_Bulk_TryAdd_Finished_Explanation, {
        path: "nr",
        value: `${completedRequests.length}/${requests.length}`,
      })
    );
    bulkData.value = "";
  }
}

function onCreated(data: MetaDataItem) {
  emit("close", data);
}

function close() {
  emit("close");
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
