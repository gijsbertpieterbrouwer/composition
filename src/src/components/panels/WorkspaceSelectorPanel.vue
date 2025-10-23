<template>
  <TickSettingsPanel :panelOptions="panelOptions" class="flows-panel" @close="close">
    <template #title> {{ $translate(LanguagePath.Workspaces) }} </template>

    <div class="content">

      <div class="list">
        <TickListItem :noBGColor="true" :name="ws.name" @select="selectItem(ws)" v-for="(ws, index) in workspaces" :key="ws.id">
          <template v-slot:icon>
            <div class="list-icon">
              <WorkspaceIcon :name="ws.name" :workspaceId="ws.id" :sizePx="48" />
            </div>
          </template>

          <span class="info">(Ctrl + Shift + {{ (index + 1) }})</span>
        </TickListItem>

        <TickListItem v-if="allowCreate" :noBGColor="true" :name="''" @select="startAddWorkspace">
          <template v-slot:icon>
            <div class="list-icon">
              <TickIcon class="logo" name="plus" />
            </div>
          </template>

          <TickAddCostItemButton v-if="isGlobalAdmin" @add="startAddWorkspace" :requiredAuth="null" :costItem="SubscriptionCostItemType.Workspaces" :currentNr="currentNr" :title="LanguagePath.App_Add"
            :appearance="Appearance.transparent" :color="Color.contrast" />
        </TickListItem>
      </div>

    </div>

  </TickSettingsPanel>
</template>

<script setup lang="ts">
import TickListItem from '@/components/atoms/TickListItem.vue';
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { unlimited } from "@/helpers/guid";
import useUserStore from "@/store/user";
import { LanguagePath, SubscriptionCostItemType, TickWorkspace } from "@/TickApi";
import { computed, defineEmits, defineProps } from 'vue';
import { askNewName } from '../../helpers/questionHelper';
import { RouterToHome } from '../../router';
import useWorkspacesStore from '../../store/workspacesStore';
import TickAddCostItemButton from '../atoms/TickAddCostItemButton.vue';
import { Appearance, Color } from '../atoms/TickButton.vue';
import WorkspaceIcon from "../atoms/WorkspaceIcon.vue";
import TickIcon from '../TickIcon.vue';

// Props
const props = defineProps<{
  panelOptions: TickPanelOptions;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue'): void;
  (e: 'close'): void;
}>();


// Computed properties
const userStore = useUserStore();
const workspacesStore = useWorkspacesStore();

const isGlobalAdmin = computed(() => userStore.isGlobalAdmin);

const workspaces = computed(() => userStore.workspaces);

const maxInPlan = computed(() => userStore.maxAllowedInPlan(SubscriptionCostItemType.Workspaces));

const currentNr = computed(() => workspaces.value.length);

const hasRoomToAdd = computed(() => maxInPlan.value === unlimited || maxInPlan.value > currentNr.value);

const allowCreate = computed(() => hasRoomToAdd.value && isGlobalAdmin.value);

// Methods
const startAddWorkspace = () => {
  if (!allowCreate.value) return;

  askNewName((to) => {
    if (to) {
      workspacesStore.createWorkspace(to);
    }
  }, "");
};

const selectItem = (item: TickWorkspace) => {
  userStore.activateWorkspace(item);
  RouterToHome();
  close();
};

const close = () => {
  emit('close');
};
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.content {
  min-width: 400px;
  //display: grid;
  //gap: 8px;
}

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.list-icon {
  padding: 5px;
  min-height: 50px;
  display: grid;
  align-content: center;
}

.info {
  font-style: italic;
  opacity: 0.7;
}
</style>