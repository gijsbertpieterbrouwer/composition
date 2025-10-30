<template>
  <template v-if="hasActiveItem">
    <!-- <FileEditor :activeId="selectedItemId" @deleted="onFileDeleted" @saved="onFileSaved" /> -->
    log here
  </template>

  <template v-else>
    <TickScreen :title="$translate(LanguagePath.WorkspaceLogs)">
      <template #actions>
        <!-- <TickButton @click="addFile" ref="addButton" v-if="createallowed">{{ $translate(LanguagePath.App_Add) }}</TickButton> -->
      </template>

      <template #default>
        <div class="content">
          <div class="navigator">
            <TickButton :disabled="disablePrevious" @click="prevPage">
              {{ $translate(LanguagePath.App_Previous) }}
            </TickButton>
            <span>{{ pageNr }}</span>
            <TickButton :disabled="disableNext" @click="nextPage">
              {{ $translate(LanguagePath.App_Next) }}
            </TickButton>
          </div>

          <table v-if="logs.length" class="styledTable">
            <tbody>
              <tr v-for="item in logs" :key="item.id">
                <td>
                  <TickIcon v-if="item.logType === LogTypeEnum.Warning" name="warning" />
                  <TickIcon v-else-if="item.logType === LogTypeEnum.Removal" name="delete" />
                  <TickIcon v-else-if="item.logType === LogTypeEnum.Update" name="message" />
                </td>
                <td class="numeric">
                  <UserIcon :size-px="24" :user-id="item?.initiator?.id" :disabled="true" />
                </td>
                <td style="width:100px" :title="getDisplayDate(item)">
                  {{ displayDistanceToNowDate(item) }}
                </td>
                <td :title="item.message">
                  {{ item.title }}<br>
                  {{ item.message }}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="navigator">
            <TickButton :disabled="disablePrevious" @click="prevPage">
              {{ $translate(LanguagePath.App_Previous) }}
            </TickButton>
            <span>{{ pageNr }}</span>
            <TickButton :disabled="disableNext" @click="nextPage">
              {{ $translate(LanguagePath.App_Next) }}
            </TickButton>
          </div>
        </div>
      </template>
    </TickScreen>
  </template>
</template>

<script setup lang="ts">
import TickButton from '@/components/atoms/TickButton.vue';
import UserIcon from '@/components/atoms/UserIcon.vue';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import TickIcon from '@/components/TickIcon.vue';
import { displayDate } from '@/helpers/dateHelper';
import { getWorkspaceLogs } from '@/services/WorkspaceService';
import useUserStore from '@/store/user';
import { LanguagePath, LogTypeEnum, TickWorkspaceLog } from '@/TickApi';
import { computed, onMounted, ref } from 'vue';

const LanguagePathConst = LanguagePath;
const LogTypeEnumConst = LogTypeEnum;

// --- State ---
const selectedItemId = ref<string | undefined>('');
const pageNr = ref(1);
const pageAmount = ref(20);
const logs = ref<TickWorkspaceLog[]>([]);

// --- Computed ---
const disablePrevious = computed(() => pageNr.value === 1);
const disableNext = computed(() => logs.value.length < pageAmount.value);
const hasActiveItem = computed(() => !!selectedItemId.value);

// --- Methods ---
function getDisplayDate(log: TickWorkspaceLog): string {
  return displayDate(log.creationDate);
}

function displayDistanceToNowDate(log: TickWorkspaceLog): string {
  return displayDate(log.creationDate, true);
}

function prevPage() {
  pageNr.value--;
  if (pageNr.value < 1) pageNr.value = 1;
  refresh();
}

function nextPage() {
  pageNr.value++;
  refresh();
}

async function refresh() {
  const workspaceId = useUserStore().activeWorkspaceId;
  const result = await getWorkspaceLogs(workspaceId, pageNr.value, pageAmount.value);
  logs.value = result || [];
}

// --- Lifecycle ---
onMounted(() => {
  refresh();
  // if (route.params.id) {
  //   selectedItemId.value = route.params.id.toString();
  // }
});
</script>

<style scoped lang="scss">
@import "@/styles/theme";

.content {
  display: grid;
  gap: 10px;

  .navigator {
    display: flex;
    gap: 10px;
    justify-content: center;
    align-content: center;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>
