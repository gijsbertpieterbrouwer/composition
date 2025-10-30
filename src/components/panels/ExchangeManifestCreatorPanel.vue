<template>
  <TickDialogPanel :no-close="true" class="panel" :type="step === ExchangeManifestCreatorStep.Entree ? PanelStyle.wizard : PanelStyle.normal" @close="close">
    <template #title>
      {{ $translate(LanguagePath.App_ExchangeManifestCreatorPanel_Title) }}
    </template>

    <div class="content">
      <!-- Entree -->
      <div v-if="step === ExchangeManifestCreatorStep.Entree" class="section_content">
        <div class="entree-wrapper">
          <div class="entree-title">
            {{ $translate(LanguagePath.App_ExchangeManifestCreatorPanel_Welcome_Title) }}
          </div>
          <div class="entree-explanation">
            {{ $translate(LanguagePath.App_ExchangeManifestCreatorPanel_Welcome_Explanation) }}
          </div>
        </div>
      </div>

      <!-- General -->
      <div v-else-if="step === ExchangeManifestCreatorStep.General" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_Editor_General) }}</TickHeading>
        <TickInput>{{ $translate(LanguagePath.App_Name) }}</TickInput>
        <TickTextarea>{{ $translate(LanguagePath.App_Description) }}</TickTextarea>
      </div>

      <!-- Collection Items -->
      <div v-else-if="step === ExchangeManifestCreatorStep.SelectItems" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_ExchangeManifestCreatorPanel_SelectItems_Title) }}</TickHeading>
        <div>{{ $translate(LanguagePath.App_ExchangeManifestCreatorPanel_SelectItems_Explanation) }}</div>

        <div class="collection-items-wrapper">
          <div class="collection-items-input">
            <CollectionsViewer :allow-collection-select="true" :collection="collections" :type-filters="objectTypeFilters" :disabled="true" @select="selectCollectionItem"
              @selectCollection="selectCollection" />
          </div>
          <div class="collection-items-selection">
            <CollectionsViewer :collection="outputCollection" :type-filters="objectTypeFilters" :disabled="true" @select="selectCollectionItem" />
          </div>
        </div>
      </div>

      <!-- Validate Manifest -->
      <div v-else-if="step === ExchangeManifestCreatorStep.ValidateManifest" class="section_content">
        <table class="styledTable">
          <tbody>
            <ExchangeManifestPointerRow v-for="pointer in manifestPointers" :key="pointer.id" :pointer="pointer" />
          </tbody>
        </table>
      </div>

      <!-- Finish -->
      <div v-else-if="step === ExchangeManifestCreatorStep.Finish" class="section_content">
        <HappyIndicator text="You are ready, click NEXT to start using Tick" />
      </div>
    </div>

    <template #footer>
      <div class="footer">
        <div class="secondaryActions">
          <TickButton class="action" :appearance="Appearance.transparent" :color="Color.contrast" @click="exit">
            {{ $translate(LanguagePath.App_Cancel) }}
          </TickButton>
        </div>
        <TickButton :busy="busyWithServer" :size="Size.XXL" @click="next">
          {{ $translate(LanguagePath.App_Next) }}
        </TickButton>
      </div>
    </template>
  </TickDialogPanel>
</template>

<script setup lang="ts">
import generateId from "@/helpers/guid";
import { onConfirmation } from "@/helpers/questionHelper";
import { notifyError } from "@/notify";
import { createUnsavedManifest, saveManifest } from "@/services/exchangeService";
import useCollectionsStore from "@/store/collections";
import useUtilityDataStore from "@/store/utilitydata";
import { computed, onBeforeMount, onMounted, ref } from "vue";

import {
  Collection,
  CollectionObject,
  CollectionObjectTypeEnum,
  CollectionsData,
  ExchangeManifestInstallPointerType,
  ExchangeManifestPointer,
  ExchangeSetupManifest,
  LanguagePath
} from "@/TickApi";

import HappyIndicator from "@/components/atoms/HappyIndicator.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import { PanelStyle } from "@/components/atoms/TickPanel.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import CollectionsViewer, { SelectedItem } from "@/components/molecules/collection/CollectionsViewer.vue";
import ExchangeManifestPointerRow from "@/components/molecules/exchange/ExchangeManifestPointerRow.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";

const emit = defineEmits<{
  (e: "close"): void
}>();

// ──────────────────────────────
// ENUM
// ──────────────────────────────
enum ExchangeManifestCreatorStep {
  Entree = 0,
  General = 1,
  SelectItems = 2,
  ValidateManifest = 3,
  Finish = 4,
}

// ──────────────────────────────
// REFS
// ──────────────────────────────
const step = ref<ExchangeManifestCreatorStep>(ExchangeManifestCreatorStep.Entree);
const busyWithServer = ref(false);
const selectedCollections = ref<Collection[]>([]);
const selectedCollectionItems = ref<CollectionObject[]>([]);
const manifest = ref<ExchangeSetupManifest | null>(null);

const objectTypeFilters = ref<CollectionObjectTypeEnum[]>([]);

// ──────────────────────────────
// STORES
// ──────────────────────────────
const collectionsStore = useCollectionsStore();
const utilityStore = useUtilityDataStore();

// ──────────────────────────────
// COMPUTED
// ──────────────────────────────
const prodExecutionEnvironment = computed(() =>
  utilityStore?.utilityData?.executionEnvironments?.find(p => p.isProduction)
);

const allCollectionItemPointers = computed<ExchangeManifestPointer[]>(() => {
  const result: ExchangeManifestPointer[] = [];

  // selected items
  selectedCollectionItems.value.forEach(item => {
    result.push({
      collectionObjectType: item.objectType,
      id: generateId(),
      objectId: item.id,
      name: item.name,
      objectVersionId: item.versions.find(v => v.executionEnvironmentId === prodExecutionEnvironment.value?.id)?.id,
      pointerType: ExchangeManifestInstallPointerType.CollectionItem,
    });
  });

  // selected collections recursively
  selectedCollections.value.forEach(col => {
    result.push(...recursivelyCalcReferencePointersFromSelection(col));
  });

  return result;
});

const manifestPointers = computed(() => manifest.value?.references || []);

const collections = computed(() => {
  const knownCollections = collectionsStore.collections;
  return {
    collections: knownCollections?.collections?.filter(p => !selectedCollections.value.some(s => s.id === p.id)),
    objectsOutsideCollection: knownCollections?.objectsOutsideCollection?.filter(p => !selectedCollectionItems.value.some(s => s.id === p.id)),
  };
});

const outputCollection = computed<CollectionsData>(() => ({
  collections: selectedCollections.value,
  objectsOutsideCollection: selectedCollectionItems.value,
}));

// ──────────────────────────────
// METHODS
// ──────────────────────────────
function selectCollection(item: Collection) {
  if (selectedCollections.value.some(p => p.id === item.id)) {
    notifyError("", LanguagePath.App_ExchangeManifestCreatorPanel_SelectItems_ItemAlreadyInOutput);
    return;
  }
  selectedCollections.value.push(item);
}

function selectCollectionItem(item: SelectedItem) {
  if (selectedCollections.value.some(p => p.id === item.id)) {
    notifyError("", LanguagePath.App_ExchangeManifestCreatorPanel_SelectItems_ItemAlreadyInOutput);
    return;
  }
  selectedCollectionItems.value.push(item.collectionObject);
}

function recursivelyCalcReferencePointersFromSelection(inputCollection: Collection): ExchangeManifestPointer[] {
  const result: ExchangeManifestPointer[] = [];

  inputCollection?.objects?.forEach(item => {
    result.push({
      collectionObjectType: item.objectType,
      id: generateId(),
      objectId: item.id,
      name: item.name,
      objectVersionId: item.versions.find(v => v.executionEnvironmentId === prodExecutionEnvironment.value?.id)?.id,
      pointerType: ExchangeManifestInstallPointerType.CollectionItem,
    });
  });

  inputCollection?.children?.forEach(col => {
    result.push(...recursivelyCalcReferencePointersFromSelection(col));
  });

  return result;
}

function getEmptyManifest() {
  busyWithServer.value = true;
  createUnsavedManifest({
    name: undefined,
    description: undefined,
    references: allCollectionItemPointers.value,
  }).then(m => {
    manifest.value = m;
    busyWithServer.value = false;
  });
}

function saveManifestFn() {
  if (!manifest.value) return;
  busyWithServer.value = true;
  saveManifest(manifest.value).then(m => {
    manifest.value = m;
    busyWithServer.value = false;
  });
}

function exit() {
  onConfirmation(() => {
    close();
  });
}

function goNext() {
  if (step.value === ExchangeManifestCreatorStep.Finish) {
    close();
  } else {
    step.value++;
  }
}

function next() {
  switch (step.value) {
    case ExchangeManifestCreatorStep.SelectItems:
      getEmptyManifest();
      break;
    case ExchangeManifestCreatorStep.ValidateManifest:
      saveManifestFn();
      break;
    case ExchangeManifestCreatorStep.Finish:
      close();
      break;
  }
  goNext();
}

function close() {
  emit("close");
}

// ──────────────────────────────
// LIFECYCLE
// ──────────────────────────────
onBeforeMount(() => {
  collectionsStore.use();
});

onMounted(() => {
  utilityStore.use();
});
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

/* existing CSS retained */
.content {
  width: clamp(200px, 1500px, 90dvw);
  min-height: 700px;

  .section_content {
    display: grid;
    gap: 20px;
    font-size: 14px;
    max-height: 70vh;
    overflow-y: scroll;
  }

  .entree-wrapper {
    height: 100%;
    display: grid;
    gap: 40px;
    justify-items: center;
    margin-top: 100px;

    .entree-title {
      @include font-outfit;
      font-size: 130px;
      line-height: 60px;
      font-weight: 600;
    }

    .entree-explanation {
      @include font-outfit;
      font-size: 30px;
      line-height: 60px;
      font-weight: 600;
    }
  }

  .collection-items-wrapper {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .collection-items-input,
    .collection-items-selection {
      width: 45%;
    }
  }
}

.footer {
  width: 100%;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: space-between;

  .secondaryActions {
    display: flex;
    gap: 5px;

    .action:hover {
      border-bottom: solid 1px var(--c-contrast);
    }
  }
}
</style>
