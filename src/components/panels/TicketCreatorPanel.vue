<template>
  <TickDialogPanel class="panel" @close="emitClose">
    <template #title>
      {{ $translate(LanguagePath.App_Add) }}
    </template>

    <template #actions />

    <div class="content">
      <CommunicatorSelector :allow-as-sub-dialog="true" :starting-address="address" :available-communication-types="availableCommunicationTypes" @select="onSelectAddress" />

      <TickInput v-model="subject" :placeholder="$translate(LanguagePath.App_Ticket_CreatePanel_Subject_Placeholder)">
        {{ $translate(LanguagePath.App_Ticket_CreatePanel_Subject_Title) }}
      </TickInput>

      <TickTextarea v-model="note" :placeholder="$translate(LanguagePath.App_Ticket_CreatePanel_Note_Placeholder)" :minimumrows="5">
        {{ $translate(LanguagePath.App_Ticket_CreatePanel_Note_Title) }}
      </TickTextarea>

      <div class="flex-row">
        <LabelsSelector v-model="labelIds" :allow-as-sub-dialog="true" />
        <UsersAndTeamsSelector v-model="assignments" :allow-as-sub-dialog="true">
          {{ $translate(LanguagePath.App_Ticket_CreatePanel_Assignment_Title) }}
        </UsersAndTeamsSelector>
      </div>

      <TickSwitch v-model="allowStartFlows">
        {{ $translate(LanguagePath.App_Ticket_CreatePanel_Flows_AllowStart) }}
      </TickSwitch>
    </div>

    <template #footer>
      <TickButton :busy="busyAdding" @click="createTicket">
        {{ $translate(LanguagePath.App_Ticket_CreatePanel_CreateButton) }}
      </TickButton>
    </template>
  </TickDialogPanel>
</template>

<script setup lang="ts">
import TickButton from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import LabelsSelector from "@/components/molecules/Selectors/LabelsSelector.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { stringIsNullOrEmpty, stringIsValidEmail } from "@/helpers/stringHelper";
import { checkIsAssignedToMe } from "@/helpers/ticketHelper";
import { debug } from "@/log";
import { notifyMessage } from "@/notify";
import useTicketsStore from "@/store/tickets";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import {
  AddTicketRequest,
  CommunicationType,
  LanguagePath,
} from "@/TickApi";
import { computed, onMounted, ref } from "vue";
import TickSwitch from "../atoms/TickSwitch.vue";
import TickTextarea from "../atoms/TickTextarea.vue";
import CommunicatorSelector, {
  CommunicatorAddressOption,
} from "../molecules/Selectors/CommunicatorSelector.vue";
import UsersAndTeamsSelector, {
  UsersAndTeamsSelection,
} from "../molecules/Selectors/UsersAndTeamsSelector.vue";

const props = defineProps<{
  communicatorId?: string;
  address?: string;
}>();

const emit = defineEmits<{
  (e: "close", ticketId?: string): void;
}>();

// Enums and constants
const LanguagePathRef = LanguagePath;
const busyAdding = ref(false);
const note = ref("");
const subject = ref("");
const labelIds = ref<string[]>([]);
const assignUserIds = ref<string[]>([]);
const assignTeamIds = ref<string[]>([]);
const communicationChannelId = ref<string | null>(null);

const selectedCommunicatorId = ref("");
const communicatorAddressId = ref("");
const communicatorName = ref("");
const communicatorAddress = ref("");
const ignoreStartFlows = ref(true);
const forceNew = ref(true);

// Computed
const allowStartFlows = computed({
  get: () => !ignoreStartFlows.value,
  set: (to: boolean) => (ignoreStartFlows.value = !to),
});

const availableCommunicationTypes = computed<CommunicationType[]>(() => [
  CommunicationType.Email,
  CommunicationType.Phone,
]);

const assignments = computed<UsersAndTeamsSelection>({
  get: () => ({
    userIds: assignUserIds.value,
    teamIds: assignTeamIds.value,
  }),
  set: (to) => {
    assignUserIds.value = to.userIds ?? [];
    assignTeamIds.value = to.teamIds ?? [];
  },
});

// Methods
function onSelectAddress(to: CommunicatorAddressOption) {
  selectedCommunicatorId.value = to.communicator?.id ?? "";
  communicatorAddressId.value = to.communicatorAddressId ?? "";
  communicatorName.value = to.communicator?.name ?? "";
  communicatorAddress.value = to.communicatorAddress ?? "";
  communicationChannelId.value = to.communicationChannelId ?? null;
}

onMounted(() => {
  const userStore = useUserStore();
  assignUserIds.value.push(userStore.userId);
  selectedCommunicatorId.value = props.communicatorId ?? "";
});

function readyForSave(): boolean {
  if (stringIsNullOrEmpty(subject.value)) {
    notifyMessage("Not saved", "Type a subject");
    return false;
  }
  if (stringIsNullOrEmpty(note.value)) {
    notifyMessage("Not saved", "Type a note");
    return false;
  }
  if (stringIsNullOrEmpty(communicationChannelId.value)) {
    notifyMessage("Not saved", "Select a channel first");
    return false;
  }
  return true;
}

function createTicket() {
  if (!readyForSave()) return;

  if (!communicatorAddressId.value) {
    const channel = useUtilityDataStore().communicationChannel(
      communicationChannelId.value ?? ""
    );
    let isValidAddress = true;
    if (channel?.communicationType === CommunicationType.Email) {
      isValidAddress = stringIsValidEmail(communicatorAddress.value);
    }
    if (!isValidAddress) {
      notifyMessage("Not saved", "Please provide a valid address");
      return;
    }
  }

  busyAdding.value = true;

  const ticketRequest: AddTicketRequest = {
    communicatorName: communicatorName.value,
    communicatorAddress: communicatorAddress.value,
    communicatorId: selectedCommunicatorId.value,
    communicatorAddressId: communicatorAddressId.value,
    communicationChannelId: communicationChannelId.value!,
    labelDefinitionIds: labelIds.value,
    assignmentUserIds: assignUserIds.value,
    assignmentTeamIds: assignTeamIds.value,
    noteAsMarkdown: note.value,
    ignoreAutoStartingFlows: ignoreStartFlows.value,
    subject: subject.value,
    workspaceId: useUserStore().activeWorkspaceId ?? "",
    forceNew: forceNew.value,
  };

  useTicketsStore()
    .addTicket(ticketRequest)
    .then((newTicketId) => {
      if (!newTicketId) {
        busyAdding.value = false;
        return;
      }
      if (
        checkIsAssignedToMe(
          ticketRequest.assignmentTeamIds ?? [],
          ticketRequest.assignmentUserIds ?? []
        )
      ) {
        debug(`[Ticket:CREATE] For me, wait until created`);
        waitForTicket(newTicketId);
      } else {
        debug(`[Ticket:CREATE] not for me, close panel`);
        busyAdding.value = false;
        emitClose();
      }
    });
}

const waitingTime = 100;
const totalWaitingTimeAllowed = 10000;
let totalWaitingTimePassed = 0;
let waitTimer: ReturnType<typeof setTimeout> | null = null;

function waitForTicket(newTicketId: string) {
  waitTimer = setTimeout(() => {
    const summary = useTicketsStore().ticketSummary(newTicketId);
    if (summary) {
      busyAdding.value = false;
      emitClose(newTicketId);
    } else {
      totalWaitingTimePassed += waitingTime;
      if (totalWaitingTimePassed > totalWaitingTimeAllowed) {
        emitClose();
      } else {
        waitForTicket(newTicketId);
      }
    }
  }, waitingTime);
}

function emitClose(ticketId?: string) {
  emit("close", ticketId);
}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 700px;
  display: grid;
  gap: 10px;
}

.flex-row {
  display: flex;
  gap: 10px;
}
</style>
