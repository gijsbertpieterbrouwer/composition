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

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';

import { CollectionObjectTypeEnum, DocumentationGroup, LanguagePath } from '@/TickApi';
import { RouterToItem } from '@/router';
import useCollectionsStore from "@/store/collections";

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
import getRefElement from '@/helpers/refHelpers';
import { translate } from '@/plugins/translatePlugin';

@Component({
  components: {
    CollectionsViewer,
    TickFocusScreen,
    TickHeading,
    TickOptionsList,
    DocuHolder,
    TickDropdown,
    FilesUploadPanel
  }
})
export default class TickCollections extends Vue {
  LanguagePath = LanguagePath
  private headingSize = HeadingSize.large;
  DocumentationGroup = DocumentationGroup;

  private objectTypeFilters: CollectionObjectTypeEnum[] = [];

  private get selectedOpt() {
    if (!this.objectTypeFilters.length) {
      return "all";
    } else {
      return this.objectTypeFilters[0];
    }
  }

  private set selectedOpt(to) {
    if (to === "all") {
      this.objectTypeFilters = [];
    } else {
      this.objectTypeFilters = [to];
    }
  }

  private allIdentifier = 'all';

  private addEmptyDefinition(id: string) {
    if (id.startsWith("MDC:")) {
      const metadataOption = getComponentDataSourceOptions().find(p => id.endsWith(p.id.toString()));

      addAndNavToEmptyMetaDataComponentDefinition(metadataOption.id as MetaDataComponentOption);
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
        this.togglePanelFor("addButton")

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
  }

  private get collectionObjectTypeOptions(): DropdownOption[] {

    let opts = [
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

    opts = opts.concat(metaDataOptions);

    return opts;
  }


  private opts = [
    {
      id: this.allIdentifier,
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
  ];

  private get collections() {
    return useCollectionsStore().collections;
  }

  private beforeMount() {
    useCollectionsStore().use();
  }

  private selectItem(item: SelectedItem) {
    RouterToItem(item.objectType, item.id, item.versionId);
  }



  private activePanel = {
    group: "",
    panelId: "",
    conditionId: "",
  }

  private togglePanelFor(fromRef: string) {
    const isCurrentActivePanel = (this.activePanel.group === fromRef);
    this.closeActivePanel();

    if (isCurrentActivePanel) {
      return;
    }

    this.activePanel.group = fromRef;
    this.activePanel.panelId = this.openPanel(fromRef, {});
  }


  beforeUnmount() {
    this.closeActivePanel();
  }

  private closeActivePanel() {
    if (this.activePanel.panelId) {
      unmount(this.activePanel.panelId);
    }

    this.activePanel.group = "";
    this.activePanel.panelId = "";

  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openPanel(id: string, props?: Record<string, any>) {
    const control = getRefElement(this, id);
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
          this.closeActivePanel();
          useCollectionsStore().use();

        },

      }
    });
  }


}
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
