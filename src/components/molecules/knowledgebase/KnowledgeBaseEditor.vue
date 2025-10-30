<template>
  <TickScreen :loading="!loaded" :title="name">
    <template v-slot:actions>
      <TickButton v-if="allowEdit" @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
      <TickButton v-if="allowEdit" @click="save" :disabled="!readyForSave">{{ $translate(LanguagePath.App_Save) }}</TickButton>
    </template>

    <template v-slot:default>
      <TickEditorPanel>

        <TickDropdown @select="setType" :options="typeOptions" :placeholder="currentTypeOptionName" :appearance="Appearance.primary" :color="Color.secondary" />
        <TickInput v-model="name" :disabled="disabled">{{ $translate(LanguagePath.App_Name) }}</TickInput>

        <TickTextArea v-model="description" :disabled="disabled">{{ $translate(LanguagePath.App_Description) }}</TickTextArea>
      </TickEditorPanel>

      <TickEditorPanel :name="$translate(LanguagePath.KnowledgeBase_Articles)">
        <template v-slot:explainer>
          <!-- <TickButton v-if="allowEdit" @click="addEmptyArticle">{{ $translate(LanguagePath.App_Add) }}</TickButton> -->
        </template>

        <div class="directories">

          <!-- <VueDraggable :disabled="disabled" group="nested" :fallbackOnBody="true" :invertSwap="true" :sort="false" :list="rootObjects" item-key="id"
            :component-data="{ name: 'fade', class: 'directories-list' }" ghost-class="ghost" @end="onEndDragDirectoryObject">
            <template #item="{ element }">
              <DirectoryObject :item="element" />
            </template>
          </VueDraggable> -->

          <!-- 
          <VueDraggable :disabled="true" group="nested" :fallbackOnBody="true" :invertSwap="true" :sort="false" :list="directories" item-key="id"
            :component-data="{ name: 'fade', class: 'directories-list' }" ghost-class="ghost" @end="onEndDragDirectory">
            <template #item="{ element }"> -->
          <!-- <DirectoryNode :directory="rootDirectory" /> -->
          <!-- </template>
          </VueDraggable> -->



        </div>

      </TickEditorPanel>

      <TickEditorPanel :name="$translate(LanguagePath.KnowledgeBase_Articles)">
        <template v-slot:explainer>
          <TickButton v-if="allowEdit" @click="addEmptyArticle">{{ $translate(LanguagePath.App_Add) }}</TickButton>
        </template>

        <div class="list">
          <TickListItem icon="knowledgebase" :name="article.name" @select="selectArticle(article)" v-for="article in articles" :key="article.id">
            <span class="active-indicator" :class="subClass(article)"> {{ getSubtitle(article) }}</span>
          </TickListItem>
        </div>
      </TickEditorPanel>
    </template>
  </TickScreen>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickListItem from '@/components/atoms/TickListItem.vue';
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { showObjectRemovalProgressPanel } from '@/components/panels/ObjectRemovalProgressPanel.vue';
import { getKnowledgeBaseTypeOptions } from '@/helpers/enumsHelper';
import { translate } from '@/plugins/translatePlugin';
import { ViewName } from '@/router';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, KnowledgeBaseTypeEnum, LanguagePath, RemovalStatus, TickKnowledgeBase, TickKnowledgeBaseArticleSummary, } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import * as VueDraggable from "vuedraggable";
//import DirectoryNode from "../directories/DirectoryNode.vue";
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';

@Component({
  emits: ["deleted", "saved"],
  components: {
    TickInput, TickTextArea, TickButton,
    TickCheckbox, TickScreen, TickEditorPanel, TickDropdown,
    TickListItem, VueDraggable
  },
})
export default class KnowledgeBaseEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop() private activeId!: string;
  private data: TickKnowledgeBase = null;
  private loaded = false;

  private articles: TickKnowledgeBaseArticleSummary[] = [];

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useManagingStore().getKnowledgeBase(id).then((data: TickKnowledgeBase) => {
      this.data = data;
      this.loaded = true;
    })

    useManagingStore().getKnowledgeBaseArticles(id).then((data: TickKnowledgeBaseArticleSummary[]) => {
      this.articles = data;
    })
  }


  private get rootDirectory() {
    return this.data?.settings?.rootDirectory
  }



  private get disabled() {
    return !this.allowEdit;
  }
  private get allowEdit() {
    return useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration)
  }

  mounted() {
    this.activate(this.activeId);
  }

  private get name() {
    return this.data?.name;
  }

  private set name(to: string) {
    this.data.name = to;
  }

  private get description() {
    return this.data?.description;
  }

  private set description(to: string) {
    this.data.description = to;
  }

  private get readyForSave() {
    return true;
  }


  private get typeOptions() {
    return getKnowledgeBaseTypeOptions();
  }

  private get currentTypeOptionName() {
    const o = this.typeOptions.find(p => p.id == this.data?.type);
    return o?.text;
  }

  private setType(to: KnowledgeBaseTypeEnum) {
    this.data.type = to;
  }

  private save() {
    useManagingStore().saveKnowledgeBase(this.data.id);
    this.$emit("saved");
  }
  private remove() {
    useManagingStore().deleteKnowledgeBase(this.data.id).then(progress => {
      if (progress.removalStatus != RemovalStatus.Failed) {
        this.$emit("deleted");
      } else {
        showObjectRemovalProgressPanel(progress)
      }
    });
  }

  //ARTICLE EDIT
  private selectArticle(article: TickKnowledgeBaseArticleSummary) {
    this.$router.push({ name: ViewName.KnowledgeBaseArticle, params: { id: article.id, workspaceName: useUserStore().activeWorkspace.urlName } });
  }


  private addEmptyArticle() {
    useManagingStore().addKnowledgeBaseArticle(this.data.id).then((a: TickKnowledgeBaseArticleSummary) => {
      this.selectArticle(a);
    });
  }

  private subClass(article: TickKnowledgeBaseArticleSummary) {
    if (article.published) {
      return "active"
    }

    return "inactive"
  }

  private getSubtitle(article: TickKnowledgeBaseArticleSummary) {
    if (article.published) {
      return translate(LanguagePath.App_KnowledgebaseEditor_PublishedArticle_Title);
    }
    return translate(LanguagePath.App_KnowledgebaseEditor_NotPublishedArticle_Title);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
}

.inputRow {
  margin-bottom: 10px;
}



.active-indicator {
  display: inline-block;
  padding: 2px;
  background-color: $grey400;
  padding: 0 4px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 16px;
  white-space: nowrap;
  border-radius: 2px;
  color: #fff;
  margin-right: 5px;
  margin-left: 5px;

}

.active {
  background-color: $success;
}

.inactive {
  background-color: $grey400;
}

.partial {
  background-color: $grey800;
}
</style>
