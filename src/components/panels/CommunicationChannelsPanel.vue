<!-- Used for dropdown list selector -->
<template>
  <TickSettingsPanel :panelOptions="panelOptions" class="users-and-teams-panel" @close="emit('close')">
    <template #title>{{ titleText }}</template>

    <div class="content">
      <TickInput class="filter-input" v-model="filterText" v-focus :placeholder="$translate(LanguagePath.App_Search)" />

      <TickCommunicationChannelDisplay class="assignable" :class="{ highlighted: isHighlighted(index) }" :allowRemove="false" v-for="(channel, index) in reducedFilteredChannels" :key="channel.id"
        :selected="model.includes(channel.id)" :channel="channel" @toggle="toggleChannel" />

      <PanelReduceSwitch :reduce="reduceChannelResults" @toggle="toggleReduce" :nrHidden="nrOfHiddenChannels" :totalCount="filteredChannels.length" :maxNrOfItems="maxNrOfItems" />
    </div>
  </TickSettingsPanel>
</template>

<script setup lang="ts">
import { TickPanelOptions } from '@/components/atoms/TickPanel.vue';
import { focus } from '@/directives';
import { smartFilter } from '@/helpers/arrayHelper';
import keyboard from '@/helpers/keyboard';
import useUtilityDataStore from '@/store/utilitydata';
import {
  AssigneeTypeEnum,
  CommunicationType,
  LanguagePath,
} from '@/TickApi';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import TickInput from '@/components/atoms/TickInput.vue';
import TickSettingsPanel from '@/components/panels/TickSettingsPanel.vue';
import TickCommunicationChannelDisplay from '../molecules/TickCommunicationChannelDisplay.vue';
import PanelReduceSwitch from './PanelReduceSwitch.vue';

defineOptions({
  directives: { focus },
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
  (e: 'close'): void;
}>();

const props = defineProps<{
  title?: string;
  typeFilters?: AssigneeTypeEnum[];
  panelOptions: TickPanelOptions;
  modelValue: string[];
  closeAfterSelect?: boolean;
  availableCommunicationTypes?: CommunicationType[];
}>();

const filterText = ref('');
const maxNrOfItems = ref(5);
const reduceChannelResults = ref(true);
const highlightedIndex = ref(-1);
const keyboardId = ref<number>();

const store = useUtilityDataStore();

// --- Computed Properties ---
const titleText = computed(() => props.title || 'Channels');

const model = computed(() => props.modelValue || []);

const allChannels = computed(() => {
  const channels = store.utilityData.communicationChannels || [];
  if (props.availableCommunicationTypes?.length) {
    return channels.filter((p) =>
      props.availableCommunicationTypes!.includes(p.communicationType)
    );
  }
  return channels;
});

const filteredChannels = computed(() =>
  smartFilter(filterText.value, allChannels.value, {
    filterProps: ['name'],
  })
);

const reducedFilteredChannels = computed(() => {
  if (!reduceChannelResults.value) return filteredChannels.value;
  return filteredChannels.value.slice(0, maxNrOfItems.value);
});

const nrOfHiddenChannels = computed(
  () => filteredChannels.value.length - reducedFilteredChannels.value.length
);

// --- Methods ---
function isHighlighted(index: number) {
  return highlightedIndex.value === index;
}

function setHighlightIndex(newIndex: number) {
  highlightedIndex.value = newIndex;

  if (highlightedIndex.value < -1) {
    highlightedIndex.value = reducedFilteredChannels.value.length - 1;
  }
  if (highlightedIndex.value > reducedFilteredChannels.value.length - 1) {
    highlightedIndex.value = 0;
  }
}

function toggleReduce() {
  reduceChannelResults.value = !reduceChannelResults.value;
}

function toggleChannel(id: string) {
  const current = model.value.slice();
  const newValue = current.includes(id)
    ? current.filter((l) => l !== id)
    : [...current, id];

  emit('update:modelValue', newValue);

  if (newValue.length && props.closeAfterSelect) {
    emit('close');
  }
}

function close() {
  emit('close');
}

// --- Keyboard navigation ---
onMounted(() => {
  keyboardId.value = keyboard.on(
    'Down',
    () => setHighlightIndex(highlightedIndex.value + 1),
    { ignoreInputFieldEvents: false }
  );

  keyboard.on(
    'Up',
    () => setHighlightIndex(highlightedIndex.value - 1),
    { ignoreInputFieldEvents: false }
  );

  keyboard.on(
    'Enter',
    () => {
      let selectedIndex = highlightedIndex.value;
      if (selectedIndex === -1) selectedIndex = 0;
      const channel = reducedFilteredChannels.value[selectedIndex];
      if (channel) toggleChannel(channel.id);
    },
    { ignoreInputFieldEvents: false }
  );
});

onBeforeUnmount(() => {
  if (keyboardId.value) keyboard.off(keyboardId.value);
});
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.assignable {
  width: 100%;

  &.highlighted {
    background-color: var(--c-base-200);
  }
}

.moreitems-message {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  font-style: italic;
}

.title {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  letter-spacing: 0.04em;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
