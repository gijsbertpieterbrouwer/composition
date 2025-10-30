<template>
  <TickFocusScreen>
    <template #list>
      <TickOptionsList class="filter-options" :options="opts" v-model="selectedOpt" :title="'Type'">
        <template v-slot:default="{ option }">
          {{ option.label }}
        </template>
      </TickOptionsList>
    </template>
    <div class="collections-panel">
      <div class="header">
        <TickHeading :size="headingSize">{{ $translate(LanguagePath.Collections) }}</TickHeading>

        <TickDropdown ref="addButton" @select="addEmptyDefinition" :options="collectionObjectTypeOptions" :placeholder="$translate(LanguagePath.App_Add)" />
      </div>
      <CollectionsViewer @select="selectItem" :collection="collections" :typeFilters="objectTypeFilters" />
    </div>
    <template #sidebar>
      <DocuHolder class="docuHolder" :group="DocumentationGroup.Collections" />
    </template>
  </TickFocusScreen>
</template>

<script setup lang="ts">
import { CollectionObjectTypeEnum, DocumentationGroup, LanguagePath } from '@/TickApi';
import { RouterToItem } from '@/router';
import useCollectionsStore from "@/store/collections";
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';

import TickDropdown, { DropdownOption } from '@/components/atoms/TickDropdown.vue';
import TickFocusScreen from "@/components/atoms/TickFocusScreen.vue";
import TickHeading, { Size as HeadingSize } from "@/components/atoms/TickHeading.vue";
import TickOptionsList from '@/components/molecules/TickOptionsList.vue';
import CollectionsViewer, { SelectedItem } from '@/components/molecules/collection/CollectionsViewer.vue';
import DocuHolder from '@/components/molecules/docublocks/DocuHolder.vue';
import FilesUploadPanel from '@/components/molecules/files/FilesUploadPanel.vue';
import { addAndNavToEmptyFlow, addAndNavToEmptyKnowledgeBase, addAndNavToEmptyMetaDataComponentDefinition, addAndNavToEmptyTaskDefinition, addAndNavToNewDataAdapter } from '@/helpers/collectionObjectHelper';
import { getComponentDataSourceOptions, MetaDataComponentOption } from '@/helpers/enumsHelper';
import { mount, unmount } from '@/helpers/mountHelper';
import { translate } from '@/plugins/translatePlugin';

const router = useRouter();
const collectionsStore = useCollectionsStore();
const addButton = ref<HTMLElement | null>(null);

const headingSize = HeadingSize.large;
const objectTypeFilters = ref<CollectionObjectTypeEnum[]>([]);
const allIdentifier = 'all';
const activePanel = ref({
  group: "",
  panelId: "",
  conditionId: "",
});

const selectedOpt = computed({
  get() {
    if (!objectTypeFilters.value.length) {
      return "all";
    } else {
      return objectTypeFilters.value[0];
    }
  },
  set(to: string | CollectionObjectTypeEnum) {
    if (to === "all") {
      objectTypeFilters.value = [];
    } else {
      objectTypeFilters.value = [to as CollectionObjectTypeEnum];
    }
  }
});

const opts = computed(() => [
  {
    id: allIdentifier,
    label: translate(LanguagePath.App_CollectionsViewer_Everything)
  },
  {
    id: CollectionObjectTypeEnum.DataAdapter,
    label: translate(LanguagePath.DataAdapters)
  },
  {
    id: CollectionObjectTypeEnum.File,
    label: translate(LanguagePath.Files)
  },
  {
    id: CollectionObjectTypeEnum.Flow,
    label: translate(LanguagePath.Flows)
  },
  {
    id: CollectionObjectTypeEnum.MetaDataComponent,
    label: translate(LanguagePath.MetadataComponents)
  },
  {
    id: CollectionObjectTypeEnum.Task,
    label: translate(LanguagePath.TaskDefinitions)
  },
  {
    id: CollectionObjectTypeEnum.KnowledgeBase,
    label: translate(LanguagePath.KnowledgeBases)
  },
]);

const collectionObjectTypeOptions = computed<DropdownOption[]>(() => {
  let opts: DropdownOption[] = [
    {
      id: CollectionObjectTypeEnum.DataAdapter.toString(),
      text: translate(LanguagePath.DataAdapter)
    },
    {
      id: CollectionObjectTypeEnum.File.toString(),
      text: translate(LanguagePath.File)
    },
    {
      id: CollectionObjectTypeEnum.Flow.toString(),
      text: translate(LanguagePath.Flow)
    },
    {
      id: CollectionObjectTypeEnum.Task.toString(),
      text: translate(LanguagePath.TaskDefinition)
    },
    {
      id: CollectionObjectTypeEnum.KnowledgeBase.toString(),
      text: translate(LanguagePath.KnowledgeBase)
    },
  ];

  const metaDataOptions = getComponentDataSourceOptions().map((t) => ({
    id: "MDC:" + t.id.toString(),
    text: "Metadata component: " + t.text,
  }));

  return opts.concat(metaDataOptions);
});

const collections = computed(() => collectionsStore.collections);

const addEmptyDefinition = (id: string) => {
  if (id.startsWith("MDC:")) {
    const metadataOption = getComponentDataSourceOptions().find(p => id.endsWith(p.id.toString()));

    addAndNavToEmptyMetaDataComponentDefinition(metadataOption?.id as MetaDataComponentOption);
    return;
  }

  const type = Number(id) as CollectionObjectTypeEnum;
  switch (type) {
    case CollectionObjectTypeEnum.Flow:
      addAndNavToEmptyFlow();
      break;
    case CollectionObjectTypeEnum.DataAdapter:
      addAndNavToNewDataAdapter();
      break;
    case CollectionObjectTypeEnum.MetaDataComponent:
      // handled above
      break;
    case CollectionObjectTypeEnum.File:
      togglePanelFor("addButton");
      break;
    case CollectionObjectTypeEnum.Task:
      addAndNavToEmptyTaskDefinition();
      break;
    case CollectionObjectTypeEnum.KnowledgeBase:
      addAndNavToEmptyKnowledgeBase();
      break;

    default:
      console.warn(`Adding type ${type} not yet implemented`);
      break;
  }
};

const selectItem = (item: SelectedItem) => {
  RouterToItem(item.objectType, item.id, item.versionId);
};

const togglePanelFor = (fromRef: string) => {
  const isCurrentActivePanel = (activePanel.value.group === fromRef);
  closeActivePanel();

  if (isCurrentActivePanel) {
    return;
  }

  activePanel.value.group = fromRef;
  activePanel.value.panelId = openPanel(fromRef, {});
};

const closeActivePanel = () => {
  if (activePanel.value.panelId) {
    unmount(activePanel.value.panelId);
  }

  activePanel.value.group = "";
  activePanel.value.panelId = "";
};

const openPanel = (id: string, props?: Record<string, any>) => {
  const control = addButton.value;  // Use the ref
  if (!control) return "";

  const rect = control.getBoundingClientRect();
  const paddingTop = window.getComputedStyle(control).getPropertyValue('padding-top');

  return mount(FilesUploadPanel, {
    props: {
      ...props,
      position: {
        right: `${window.innerWidth - Math.ceil(rect.left + rect.width)}px`, // 4px because it looks better
        top: `${Math.floor(rect.height) + Math.floor(rect.top) + parseInt(paddingTop) - 4}px`,
      }
    },
    events: {
      exit: () => {
        closeActivePanel();
        useCollectionsStore().use();
      },
    }
  });
};

onBeforeMount(() => {
  useCollectionsStore().use();
});

onBeforeUnmount(() => {
  closeActivePanel();
});
</script>

<style lang="scss" scoped>
.collections-panel {
  padding: 104px
}

.header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 24px;
}

.filter-options {
  padding: 88px 24px 0 24px;
}

.docuHolder {
  margin-top: 58px;
}
</style>