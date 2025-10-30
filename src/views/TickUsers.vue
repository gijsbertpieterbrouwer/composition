<template>
  <template v-if="hasActiveItem">
    <UserEditor :active-id="selectedItemId" @deleted="userDeleted" @saved="userSaved" />
  </template>

  <template v-else>
    <TickScreen :title="$translate(LanguagePath.Users)">
      <template #actions>
        <TickAddCostItemDropdownButton :options="userOptions" :required-auth="AuthorizationObjectType.Workspace" :cost-item="SubscriptionCostItemType.User" :current-nr="currentNr"
          :title="LanguagePath.App_Add" @add="toggleCreateUser" />
      </template>

      <template #default>
        <TickEditorPanel :name="$translate(LanguagePath.Users)">
          <div class="list">
            <TickListItem v-for="user in users" :key="user.id" :no-b-g-color="true" :name="user.name" @select="selectItem(user)">
              <template #icon>
                <UserIcon :user-id="user.id" :disabled="true" />
              </template>

              <span class="handle">{{ user.handle }}</span>

              <span v-if="user.voiceAvailable" class="phone-indicator color-lime">
                <TickIcon name="phone" :title="$translate(LanguagePath.Voice_Enabled)" />
              </span>

              <template #actions>
                <div>
                  <span v-if="user.isAdmin" class="admin-indicator" :class="adminClass">
                    {{ $translate(LanguagePath.Admin) }}
                  </span>
                </div>

                <TickButton v-if="user.loggedIn" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast" @click="logoutUser(user)">
                  {{ $translate(LanguagePath.App_UserPanel_Logout) }}
                </TickButton>
              </template>
            </TickListItem>
          </div>
        </TickEditorPanel>

        <TickEditorPanel :name="$translate(LanguagePath.Bots)">
          <div class="list">
            <TickListItem v-for="user in bots" :key="user.id" :no-b-g-color="true" :name="user.name" @select="selectItem(user)">
              <template #icon>
                <UserIcon :user-id="user.id" :disabled="true" />
              </template>
            </TickListItem>
          </div>
        </TickEditorPanel>
      </template>
    </TickScreen>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import TickAddCostItemDropdownButton from '@/components/atoms/TickAddCostItemDropdownButton.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import UserIcon from '@/components/atoms/UserIcon.vue';
import TickEditorPanel from '@/components/molecules/editor/TickEditorPanel.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import UserEditor from '@/components/molecules/user/UserEditor.vue';
import TickIcon from '@/components/TickIcon.vue';

import {
  AuthorizationObjectType,
  ColorsEnum,
  LanguagePath,
  MetaDataItem,
  SubscriptionCostItemType,
  UserSummary,
  UserTypeEnum
} from '@/TickApi';

import { DropdownOption } from '@/components/atoms/TickDropdown.vue';
import UserCreatePanel from '@/components/panels/UserCreatePanel.vue';
import { getColorName } from '@/helpers/colorsHelper';
import { getUserTypeOptions } from '@/helpers/enumsHelper';
import { mount, unmount } from '@/helpers/mountHelper';
import { adminLogoutUser } from '@/services/TeamsService';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';

// --- Router & Stores ---
const route = useRoute();
const router = useRouter();
const managingStore = useManagingStore();
const userStore = useUserStore();

// --- State ---
const selectedItemId = ref<string | undefined>('');
const activePanel = ref('');
const allUsers = computed(() =>
  [...(managingStore.userSummaries ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  )
);
// --- Computed Properties ---
const users = computed(() => allUsers.value.filter(u => u.userType === UserTypeEnum.User));
const bots = computed(() => allUsers.value.filter(u => u.userType === UserTypeEnum.Bot));
const hasActiveItem = computed(() => !!selectedItemId.value);
const adminClass = computed(() => getColorName(ColorsEnum.BoldBlack));
const currentNr = computed(() => users.value.length);

const addAllowedInPlan = computed(() =>
  userStore.allowedAddInPlan(SubscriptionCostItemType.User, currentNr.value)
);

const createallowed = computed(() =>
  userStore.allowedEdit(AuthorizationObjectType.Workspace) && addAllowedInPlan.value
);

const userOptions = computed(() => {
  const options: DropdownOption[] = getUserTypeOptions();
  options.push({ id: 'bulk', text: 'Bulk create users' });
  return options;
});

// --- Methods ---
function logoutUser(user: UserSummary) {
  adminLogoutUser(user.id);
}

function userDeleted() {
  router.push({ name: 'Users' });
}

function userSaved() {
  // router.push({ name: 'Users' });
}

function selectItem(user: UserSummary) {
  selectId(user.id);
}

function selectId(id: string) {
  router.push({ params: { ...route.params, id } });
}

function closePanel() {
  if (!activePanel.value) return;
  unmount(activePanel.value);
  activePanel.value = '';
}

function mountUserCreatePanel(type: UserTypeEnum | string) {
  if (activePanel.value) return;

  const isBulk = type === 'bulk';
  const userType = isBulk ? UserTypeEnum.User : type;

  activePanel.value = mount(UserCreatePanel, {
    props: { userType, bulk: isBulk },
    events: {
      close: closePanel,
      created: (data: MetaDataItem) => {
        if (data) selectId(data.id);
        closePanel();
      }
    }
  });
}

function toggleCreateUser(type: UserTypeEnum | string) {
  if (activePanel.value) {
    closePanel();
  } else {
    mountUserCreatePanel(type);
  }
}

// --- Lifecycle ---
onMounted(() => {
  managingStore.useUsers();
  if (route.params.id) {
    selectedItemId.value = route.params.id.toString();
  }
});

watch(
  () => route.params,
  (to) => {
    selectedItemId.value = (to as any).id || undefined;
  }
);
</script>

<style scoped lang="scss">
@import "@/styles/theme";

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.handle {
  font-size: 0.8em;
}

.admin-indicator {
  display: inline-block;
  padding: 2px 4px;
  background-color: $grey400;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  white-space: nowrap;
  border-radius: 2px;
  color: #fff;
  margin: 0 5px;
  text-transform: uppercase;
  @include neon-bg;
}

.phone-indicator {
  @include neon-bg;
  display: inline-block;
  padding: 0px 15px;
  border-radius: 99px;

  svg {
    height: 10px;
    width: 10px;
  }
}
</style>
